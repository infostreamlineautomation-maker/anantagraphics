"""Our Work: categories ("Packaging") and their projects."""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.deps import get_current_admin
from app.models import AdminUser, Project, WorkCategory
from app.routers.admin._helpers import apply_update, get_or_404, next_sequence, reorder
from app.schemas.common import Page, ReorderIn
from app.schemas.content import (
    ProjectAdmin,
    ProjectCreate,
    ProjectUpdate,
    WorkCategoryAdmin,
    WorkCategoryCreate,
    WorkCategoryUpdate,
)
from app.services import audit
from app.services.revalidate import revalidate_site
from app.services.slug import unique_slug

categories = APIRouter(prefix="/work-categories", tags=["work-categories"])
projects = APIRouter(prefix="/projects", tags=["projects"])


def _check_slug(db: Session, model, slug: str, exclude_id: int | None = None) -> None:
    stmt = select(model.id).where(model.slug == slug)
    if exclude_id:
        stmt = stmt.where(model.id != exclude_id)
    if db.scalar(stmt):
        raise HTTPException(409, f"Slug '{slug}' is already in use")


# ---------------------------------------------------------------- categories


def _category_out(c: WorkCategory, count: int) -> WorkCategoryAdmin:
    out = WorkCategoryAdmin.model_validate(c)
    out.project_count = count
    return out


def _project_count(db: Session, category_id: int) -> int:
    return db.scalar(select(func.count()).where(Project.category_id == category_id)) or 0


@categories.get("", response_model=list[WorkCategoryAdmin])
def list_categories(db: Session = Depends(get_db)):
    counts = dict(db.execute(select(Project.category_id, func.count()).group_by(Project.category_id)).all())
    rows = db.scalars(select(WorkCategory).order_by(WorkCategory.sequence, WorkCategory.id))
    return [_category_out(c, counts.get(c.id, 0)) for c in rows]


@categories.get("/{category_id}", response_model=WorkCategoryAdmin)
def get_category(category_id: int, db: Session = Depends(get_db)):
    c = get_or_404(db, WorkCategory, category_id, "Category")
    return _category_out(c, _project_count(db, c.id))


@categories.post("", response_model=WorkCategoryAdmin, status_code=201)
def create_category(
    payload: WorkCategoryCreate,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    data = payload.model_dump()
    if data["slug"]:
        _check_slug(db, WorkCategory, data["slug"])
    else:
        data["slug"] = unique_slug(db, WorkCategory, payload.name)
    category = WorkCategory(**data, sequence=next_sequence(db, WorkCategory))
    db.add(category)
    db.flush()
    audit.record(db, admin, "create", "work_category", f"Created category {category.name}", category.id, request=request)
    db.commit()
    background.add_task(revalidate_site, "work", f"work-category:{category.slug}")
    return _category_out(category, 0)


@categories.patch("/{category_id}", response_model=WorkCategoryAdmin)
def update_category(
    category_id: int,
    payload: WorkCategoryUpdate,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    category = get_or_404(db, WorkCategory, category_id, "Category")
    old_slug = category.slug
    if payload.slug and payload.slug != category.slug:
        _check_slug(db, WorkCategory, payload.slug, category.id)
    changes = apply_update(category, payload)
    if changes:
        audit.record(db, admin, "update", "work_category", f"Updated category {category.name}", category.id, changes, request)
        db.commit()
        # Project pages show their category, so they refresh too
        background.add_task(revalidate_site, "work", "projects", f"work-category:{old_slug}", f"work-category:{category.slug}")
    return _category_out(category, _project_count(db, category.id))


@categories.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    category = get_or_404(db, WorkCategory, category_id, "Category")
    count = _project_count(db, category.id)
    if count:
        raise HTTPException(409, f"Move or delete its {count} project(s) first")
    audit.record(db, admin, "delete", "work_category", f"Deleted category {category.name}", category.id, request=request)
    db.delete(category)
    db.commit()
    background.add_task(revalidate_site, "work", f"work-category:{category.slug}")


@categories.put("/reorder", status_code=204)
def reorder_categories(
    payload: ReorderIn,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    reorder(db, WorkCategory, payload.ids)
    audit.record(db, admin, "reorder", "work_category", "Reordered categories", changes={"ids": payload.ids}, request=request)
    db.commit()
    background.add_task(revalidate_site, "work", "projects")


# ---------------------------------------------------------------- projects


def _project_out(p: Project) -> ProjectAdmin:
    out = ProjectAdmin.model_validate(p)
    out.category_name = p.category.name if p.category else ""
    return out


def _project_tags(p: Project) -> list[str]:
    # "home" covers the homepage carousel which displays featured projects
    return ["home", "work", "projects", f"work-category:{p.category.slug}", f"project:{p.slug}"]


@projects.get("", response_model=Page[ProjectAdmin])
def list_projects(
    category_id: int | None = None,
    q: str | None = Query(default=None, max_length=100),
    active: bool | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    stmt = select(Project)
    if category_id is not None:
        stmt = stmt.where(Project.category_id == category_id)
    if active is not None:
        stmt = stmt.where(Project.is_active == active)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Project.title.ilike(like), Project.slug.ilike(like), Project.client.ilike(like)))
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(
        stmt.options(selectinload(Project.category))
        .order_by(Project.category_id, Project.sequence, Project.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return Page(items=[_project_out(p) for p in rows], total=total, page=page, page_size=page_size)


@projects.get("/{project_id}", response_model=ProjectAdmin)
def get_project(project_id: int, db: Session = Depends(get_db)):
    return _project_out(get_or_404(db, Project, project_id, "Project"))


@projects.post("", response_model=ProjectAdmin, status_code=201)
def create_project(
    payload: ProjectCreate,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    get_or_404(db, WorkCategory, payload.category_id, "Category")
    data = payload.model_dump()
    if data["slug"]:
        _check_slug(db, Project, data["slug"])
    else:
        data["slug"] = unique_slug(db, Project, payload.title)
    project = Project(**data, sequence=next_sequence(db, Project, Project.category_id == payload.category_id))
    db.add(project)
    db.flush()
    db.refresh(project)
    audit.record(db, admin, "create", "project", f"Created project {project.title}", project.id, request=request)
    db.commit()
    background.add_task(revalidate_site, *_project_tags(project))
    return _project_out(project)


@projects.patch("/{project_id}", response_model=ProjectAdmin)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    project = get_or_404(db, Project, project_id, "Project")
    old_tags = _project_tags(project)
    if payload.category_id is not None and payload.category_id != project.category_id:
        get_or_404(db, WorkCategory, payload.category_id, "Category")
    if payload.slug and payload.slug != project.slug:
        _check_slug(db, Project, payload.slug, project.id)
    changes = apply_update(project, payload)
    if changes:
        if "category_id" in changes:
            project.sequence = next_sequence(db, Project, Project.category_id == project.category_id)
        audit.record(db, admin, "update", "project", f"Updated project {project.title}", project.id, changes, request)
        db.commit()
        db.refresh(project)
        background.add_task(revalidate_site, *_project_tags(project), *old_tags)
    return _project_out(project)


@projects.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    project = get_or_404(db, Project, project_id, "Project")
    tags = _project_tags(project)
    audit.record(db, admin, "delete", "project", f"Deleted project {project.title}", project.id, request=request)
    db.delete(project)
    db.commit()
    background.add_task(revalidate_site, *tags)


@projects.put("/reorder", status_code=204)
def reorder_projects(
    payload: ReorderIn,
    request: Request,
    background: BackgroundTasks,
    category_id: int = Query(description="Projects are ordered within one category"),
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    category = get_or_404(db, WorkCategory, category_id, "Category")
    reorder(db, Project, payload.ids, Project.category_id == category_id)
    audit.record(db, admin, "reorder", "project", f"Reordered projects in {category.name}", changes={"ids": payload.ids}, request=request)
    db.commit()
    background.add_task(revalidate_site, "work", "projects", f"work-category:{category.slug}")
