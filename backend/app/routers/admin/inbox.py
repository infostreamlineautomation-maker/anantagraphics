"""Enquiries and newsletter subscribers: list, filter, update, CSV export."""
import csv
import io
from datetime import date, datetime, time, timezone

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_admin
from app.models import AdminUser, Enquiry, NewsletterSubscriber
from app.routers.admin._helpers import apply_update, get_or_404
from app.schemas.common import Page
from app.schemas.inbox import (
    EnquiryAdmin,
    EnquiryStatus,
    EnquiryType,
    EnquiryUpdate,
    SubscriberAdmin,
    SubscriberStatus,
    SubscriberUpdate,
)
from app.services import audit

enquiries = APIRouter(prefix="/enquiries", tags=["enquiries"])
newsletter = APIRouter(prefix="/newsletter", tags=["newsletter"])


def _csv_response(header: list[str], rows: list[list], name: str) -> StreamingResponse:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(header)
    for row in rows:
        # Neutralise spreadsheet formula injection (=, +, -, @ at the start of a cell)
        writer.writerow([f"'{v}" if isinstance(v, str) and v[:1] in ("=", "+", "-", "@") else v for v in row])
    return StreamingResponse(
        iter(["﻿" + buf.getvalue()]),  # BOM so Excel reads UTF-8
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{name}-{date.today().isoformat()}.csv"'},
    )


def _date_range(stmt, column, date_from: date | None, date_to: date | None):
    if date_from:
        stmt = stmt.where(column >= datetime.combine(date_from, time.min, timezone.utc))
    if date_to:
        stmt = stmt.where(column <= datetime.combine(date_to, time.max, timezone.utc))
    return stmt


def _paged(db: Session, stmt, order, page: int, page_size: int):
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    items = db.scalars(stmt.order_by(*order).offset((page - 1) * page_size).limit(page_size)).all()
    return Page(items=items, total=total, page=page, page_size=page_size)


# ---------------------------------------------------------------- enquiries


def _enquiries(type_: str | None, status: str | None, q: str | None, date_from: date | None, date_to: date | None):
    stmt = select(Enquiry)
    if type_:
        stmt = stmt.where(Enquiry.type == type_)
    if status:
        stmt = stmt.where(Enquiry.status == status)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(Enquiry.name.ilike(like), Enquiry.email.ilike(like), Enquiry.phone.ilike(like)))
    return _date_range(stmt, Enquiry.created_at, date_from, date_to)


@enquiries.get("", response_model=Page[EnquiryAdmin])
def list_enquiries(
    type: EnquiryType | None = None,
    status: EnquiryStatus | None = None,
    q: str | None = Query(default=None, max_length=100),
    date_from: date | None = None,
    date_to: date | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=200),
    db: Session = Depends(get_db),
):
    stmt = _enquiries(type, status, q, date_from, date_to)
    return _paged(db, stmt, (Enquiry.created_at.desc(), Enquiry.id.desc()), page, page_size)


@enquiries.get("/export.csv")
def export_enquiries(
    type: EnquiryType | None = None,
    status: EnquiryStatus | None = None,
    q: str | None = Query(default=None, max_length=100),
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
):
    rows = [
        [e.id, e.created_at.strftime("%Y-%m-%d %H:%M"), e.type, e.status, e.name, e.email, e.phone or "",
         e.service_name or "", e.message or "", e.notes or ""]
        for e in db.scalars(_enquiries(type, status, q, date_from, date_to).order_by(Enquiry.created_at.desc()))
    ]
    header = ["ID", "Date", "Type", "Status", "Name", "Email", "Phone", "Service", "Message", "Notes"]
    return _csv_response(header, rows, "enquiries")


@enquiries.get("/{enquiry_id}", response_model=EnquiryAdmin)
def get_enquiry(enquiry_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, Enquiry, enquiry_id, "Enquiry")


@enquiries.patch("/{enquiry_id}", response_model=EnquiryAdmin)
def update_enquiry(
    enquiry_id: int,
    payload: EnquiryUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    enquiry = get_or_404(db, Enquiry, enquiry_id, "Enquiry")
    changes = apply_update(enquiry, payload)
    if changes:
        audit.record(db, admin, "update", "enquiry", f"Updated enquiry from {enquiry.name}", enquiry.id, changes, request)
        db.commit()
    return enquiry


@enquiries.delete("/{enquiry_id}", status_code=204)
def delete_enquiry(
    enquiry_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    enquiry = get_or_404(db, Enquiry, enquiry_id, "Enquiry")
    audit.record(db, admin, "delete", "enquiry", f"Deleted enquiry from {enquiry.name}", enquiry.id, request=request)
    db.delete(enquiry)
    db.commit()


# ---------------------------------------------------------------- newsletter


def _subscribers(status: str | None, q: str | None):
    stmt = select(NewsletterSubscriber)
    if status:
        stmt = stmt.where(NewsletterSubscriber.status == status)
    if q:
        stmt = stmt.where(NewsletterSubscriber.email.ilike(f"%{q}%"))
    return stmt


@newsletter.get("", response_model=Page[SubscriberAdmin])
def list_subscribers(
    status: SubscriberStatus | None = None,
    q: str | None = Query(default=None, max_length=100),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    order = (NewsletterSubscriber.created_at.desc(), NewsletterSubscriber.id.desc())
    return _paged(db, _subscribers(status, q), order, page, page_size)


@newsletter.get("/export.csv")
def export_subscribers(
    status: SubscriberStatus | None = None,
    q: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
):
    rows = [
        [s.email, s.status, s.created_at.strftime("%Y-%m-%d %H:%M"), s.source_page or ""]
        for s in db.scalars(_subscribers(status, q).order_by(NewsletterSubscriber.created_at.desc()))
    ]
    return _csv_response(["Email", "Status", "Joined", "Signed up on"], rows, "newsletter")


@newsletter.patch("/{subscriber_id}", response_model=SubscriberAdmin)
def update_subscriber(
    subscriber_id: int,
    payload: SubscriberUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    sub = get_or_404(db, NewsletterSubscriber, subscriber_id, "Subscriber")
    changes = apply_update(sub, payload)
    if changes:
        audit.record(db, admin, "update", "subscriber", f"Marked {sub.email} {sub.status}", sub.id, changes, request)
        db.commit()
    return sub


@newsletter.delete("/{subscriber_id}", status_code=204)
def delete_subscriber(
    subscriber_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    sub = get_or_404(db, NewsletterSubscriber, subscriber_id, "Subscriber")
    audit.record(db, admin, "delete", "subscriber", f"Removed subscriber {sub.email}", sub.id, request=request)
    db.delete(sub)
    db.commit()
