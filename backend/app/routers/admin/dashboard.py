from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Client, Enquiry, Media, NewsletterSubscriber, Project, Service, WorkCategory
from app.schemas.admin import DashboardOut

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _count(db: Session, model, *where) -> int:
    return db.scalar(select(func.count()).select_from(model).where(*where)) or 0


@router.get("", response_model=DashboardOut)
def dashboard(db: Session = Depends(get_db)):
    latest = db.scalars(select(Enquiry).order_by(Enquiry.created_at.desc(), Enquiry.id.desc()).limit(5))
    return DashboardOut(
        work_categories=_count(db, WorkCategory),
        projects=_count(db, Project),
        services=_count(db, Service),
        clients=_count(db, Client),
        media=_count(db, Media),
        enquiries_total=_count(db, Enquiry),
        enquiries_new=_count(db, Enquiry, Enquiry.status == "new"),
        subscribers=_count(db, NewsletterSubscriber, NewsletterSubscriber.status == "subscribed"),
        latest_enquiries=[
            {"id": e.id, "name": e.name, "type": e.type, "status": e.status, "service": e.service_name,
             "created_at": e.created_at.isoformat()}
            for e in latest
        ],
    )
