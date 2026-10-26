from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Client, Faq, PageSection, Project, Service, SiteSetting, WorkCategory
from app.schemas.content import (
    SETTING_KEYS,
    ClientOut,
    ExploreCard,
    FaqOut,
    PageOut,
    ProjectCard,
    ProjectDetail,
    ServiceOut,
    WorkCategoryCard,
    WorkCategoryDetail,
)

router = APIRouter(tags=["content"])

PAGES = ("home", "about", "contact", "our-work")
EXPLORE_COUNT = 3


@router.get("/settings")
def get_settings(db: Session = Depends(get_db)) -> dict[str, dict]:
    """Brand, contact details, socials, footer and SEO defaults."""
    return {s.key: s.value for s in db.scalars(select(SiteSetting).where(SiteSetting.key.in_(SETTING_KEYS)))}


@router.get("/pages/{page}", response_model=PageOut)
def get_page(page: str, db: Session = Depends(get_db)):
    if page not in PAGES:
        raise HTTPException(404, "Page not found")
    sections = db.scalars(
        select(PageSection).where(PageSection.page == page, PageSection.is_active).order_by(PageSection.sequence)
    )
    return PageOut(page=page, sections={s.key: s.content for s in sections})


@router.get("/work-categories", response_model=list[WorkCategoryCard])
def list_work_categories(db: Session = Depends(get_db)):
    return db.scalars(
        select(WorkCategory).where(WorkCategory.is_active).order_by(WorkCategory.sequence, WorkCategory.id)
    ).all()


@router.get("/work-categories/{slug}", response_model=WorkCategoryDetail)
def get_work_category(slug: str, db: Session = Depends(get_db)):
    category = db.scalar(select(WorkCategory).where(WorkCategory.slug == slug, WorkCategory.is_active))
    if category is None:
        raise HTTPException(404, "Category not found")
    detail = WorkCategoryDetail.model_validate(category)
    detail.projects = [ProjectCard.model_validate(p) for p in category.projects if p.is_active]
    return detail


def _visible_projects():
    return (
        select(Project)
        .join(Project.category)
        .where(Project.is_active, WorkCategory.is_active)
        .options(selectinload(Project.category))
    )


@router.get("/projects", response_model=list[ExploreCard])
def list_projects(db: Session = Depends(get_db)):
    """List all active portfolio projects across all active categories."""
    projects = db.scalars(
        _visible_projects().order_by(WorkCategory.sequence, Project.sequence, Project.id)
    ).all()
    return [
        ExploreCard(
            **ProjectCard.model_validate(p).model_dump(),
            category_slug=p.category.slug,
            category_name=p.category.name,
        )
        for p in projects
    ]


@router.get("/projects/{slug}", response_model=ProjectDetail)
def get_project(slug: str, db: Session = Depends(get_db)):
    project = db.scalar(_visible_projects().where(Project.slug == slug))
    if project is None:
        raise HTTPException(404, "Project not found")

    # "Explore more projects": featured ones first, then the rest of the same category, then anything
    others = db.scalars(
        _visible_projects()
        .where(Project.id != project.id)
        .order_by(
            Project.is_featured.desc(),
            (Project.category_id == project.category_id).desc(),
            WorkCategory.sequence,
            Project.sequence,
        )
        .limit(EXPLORE_COUNT)
    )
    detail = ProjectDetail.model_validate(project)
    detail.explore = [
        ExploreCard(
            **ProjectCard.model_validate(p).model_dump(),
            category_slug=p.category.slug,
            category_name=p.category.name,
        )
        for p in others
    ]
    return detail


@router.get("/featured-projects", response_model=list[ExploreCard])
def list_featured_projects(db: Session = Depends(get_db)):
    """Featured portfolio projects displayed on the homepage carousel."""
    featured = list(
        db.scalars(
            _visible_projects()
            .where(Project.is_featured)
            .order_by(WorkCategory.sequence, Project.sequence, Project.id)
        ).all()
    )

    if len(featured) < 4:
        featured_ids = {p.id for p in featured}
        seen_cats = {p.category_id for p in featured}
        all_visible = db.scalars(
            _visible_projects().order_by(WorkCategory.sequence, Project.sequence, Project.id)
        ).all()
        for p in all_visible:
            if p.id not in featured_ids and p.category_id not in seen_cats:
                featured.append(p)
                featured_ids.add(p.id)
                seen_cats.add(p.category_id)
                if len(featured) >= 5:
                    break
        if len(featured) < 4:
            for p in all_visible:
                if p.id not in featured_ids:
                    featured.append(p)
                    featured_ids.add(p.id)
                    if len(featured) >= 4:
                        break

    return [
        ExploreCard(
            **ProjectCard.model_validate(p).model_dump(),
            category_slug=p.category.slug,
            category_name=p.category.name,
        )
        for p in featured
    ]


@router.get("/services", response_model=list[ServiceOut])
def list_services(db: Session = Depends(get_db)):
    return db.scalars(select(Service).where(Service.is_active).order_by(Service.sequence, Service.id)).all()


@router.get("/clients", response_model=list[ClientOut])
def list_clients(db: Session = Depends(get_db)):
    return db.scalars(select(Client).where(Client.is_active).order_by(Client.sequence, Client.id)).all()


@router.get("/faqs", response_model=list[FaqOut])
def list_faqs(db: Session = Depends(get_db)):
    return db.scalars(select(Faq).where(Faq.is_active).order_by(Faq.sequence, Faq.id)).all()
