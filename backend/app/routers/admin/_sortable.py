"""CRUD + drag-sort routes for simple ordered lists (services, clients, FAQs)."""
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_admin
from app.models import AdminUser
from app.routers.admin._helpers import apply_update, get_or_404, next_sequence, reorder
from app.schemas.common import ReorderIn
from app.services import audit
from app.services.revalidate import revalidate_site


def sortable_router(
    *,
    model: Any,
    prefix: str,
    entity: str,
    label_attr: str,
    create_schema: type[BaseModel],
    update_schema: type[BaseModel],
    out_schema: type[BaseModel],
    cache_tag: str,
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=[prefix.strip("/")])
    noun = entity.replace("_", " ")

    def label(obj: Any) -> str:
        return str(getattr(obj, label_attr))[:120]

    @router.get("", response_model=list[out_schema])
    def list_items(db: Session = Depends(get_db)):
        return db.scalars(select(model).order_by(model.sequence, model.id)).all()

    @router.get("/{item_id}", response_model=out_schema)
    def get_item(item_id: int, db: Session = Depends(get_db)):
        return get_or_404(db, model, item_id, noun.capitalize())

    @router.post("", response_model=out_schema, status_code=201)
    def create_item(
        payload: create_schema,  # type: ignore[valid-type]
        request: Request,
        background: BackgroundTasks,
        db: Session = Depends(get_db),
        admin: AdminUser = Depends(get_current_admin),
    ):
        obj = model(**payload.model_dump(), sequence=next_sequence(db, model))
        db.add(obj)
        db.flush()
        audit.record(db, admin, "create", entity, f"Created {noun} {label(obj)}", obj.id, request=request)
        db.commit()
        background.add_task(revalidate_site, cache_tag)
        return obj

    @router.patch("/{item_id}", response_model=out_schema)
    def update_item(
        item_id: int,
        payload: update_schema,  # type: ignore[valid-type]
        request: Request,
        background: BackgroundTasks,
        db: Session = Depends(get_db),
        admin: AdminUser = Depends(get_current_admin),
    ):
        obj = get_or_404(db, model, item_id, noun.capitalize())
        changes = apply_update(obj, payload)
        if changes:
            audit.record(db, admin, "update", entity, f"Updated {noun} {label(obj)}", obj.id, changes, request)
            db.commit()
            background.add_task(revalidate_site, cache_tag)
        return obj

    @router.delete("/{item_id}", status_code=204)
    def delete_item(
        item_id: int,
        request: Request,
        background: BackgroundTasks,
        db: Session = Depends(get_db),
        admin: AdminUser = Depends(get_current_admin),
    ):
        obj = get_or_404(db, model, item_id, noun.capitalize())
        audit.record(db, admin, "delete", entity, f"Deleted {noun} {label(obj)}", obj.id, request=request)
        db.delete(obj)
        db.commit()
        background.add_task(revalidate_site, cache_tag)

    @router.put("/reorder", status_code=204)
    def reorder_items(
        payload: ReorderIn,
        request: Request,
        background: BackgroundTasks,
        db: Session = Depends(get_db),
        admin: AdminUser = Depends(get_current_admin),
    ):
        reorder(db, model, payload.ids)
        audit.record(db, admin, "reorder", entity, f"Reordered {noun}s", changes={"ids": payload.ids}, request=request)
        db.commit()
        background.add_task(revalidate_site, cache_tag)

    return router
