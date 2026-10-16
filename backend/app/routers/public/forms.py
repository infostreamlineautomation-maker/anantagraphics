import logging

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.models import Enquiry, NewsletterSubscriber, Service
from app.schemas.inbox import Accepted, EnquiryCreate, NewsletterCreate
from app.services.audit import client_ip
from app.services.mailer import notify_recipients, send_email

router = APIRouter(tags=["forms"])
log = logging.getLogger(__name__)

TYPE_LABELS = {"contact": "Project enquiry", "quote": "Quote request"}
ENQUIRY_THANKS = "Thank you! We'll get back to you within 24 hours."
NEWSLETTER_THANKS = "Thanks — you're on the list."


def _notification_text(e: Enquiry) -> str:
    lines = [
        f"New {TYPE_LABELS[e.type].lower()} from the website.",
        "",
        f"Name:     {e.name}",
        f"Email:    {e.email}",
        f"Phone:    {e.phone or '-'}",
        f"Service:  {e.service_name or '-'}",
        "",
        "Message:",
        e.message or "-",
        "",
        f"Sent from: {e.source_page or '-'}",
        f"Open in CMS: {settings.CMS_URL.rstrip('/')}/enquiries/{e.id}",
    ]
    return "\n".join(lines)


def _notify(enquiry_id: int) -> None:
    from app.core.database import SessionLocal

    with SessionLocal() as db:
        e = db.get(Enquiry, enquiry_id)
        if e is not None:
            send_email(notify_recipients(db), f"{TYPE_LABELS[e.type]}: {e.name}", _notification_text(e), reply_to=e.email, db=db)


@router.post("/enquiries", response_model=Accepted, status_code=201)
@limiter.limit("5/minute;30/day")
def create_enquiry(request: Request, payload: EnquiryCreate, background: BackgroundTasks, db: Session = Depends(get_db)):
    if payload.website:
        # Honeypot filled: pretend success so bots learn nothing
        log.info("Dropped enquiry from %s (honeypot)", client_ip(request))
        return Accepted(message=ENQUIRY_THANKS)

    service = db.scalar(select(Service).where(Service.id == payload.service_id)) if payload.service_id else None
    enquiry = Enquiry(
        type=payload.type,
        name=payload.name.strip(),
        email=payload.email.lower(),
        phone=payload.phone,
        message=payload.message,
        service_id=service.id if service else None,
        service_name=service.title if service else None,
        source_page=payload.source_page,
        ip_address=client_ip(request),
        user_agent=(request.headers.get("user-agent") or "")[:300],
    )
    db.add(enquiry)
    db.commit()
    background.add_task(_notify, enquiry.id)
    return Accepted(message=ENQUIRY_THANKS)


@router.post("/newsletter", response_model=Accepted, status_code=201)
@limiter.limit("5/minute;20/day")
def subscribe(request: Request, payload: NewsletterCreate, db: Session = Depends(get_db)):
    if payload.website:
        return Accepted(message=NEWSLETTER_THANKS)
    email = payload.email.lower()
    existing = db.scalar(select(NewsletterSubscriber).where(NewsletterSubscriber.email == email))
    if existing is None:
        db.add(NewsletterSubscriber(email=email, source_page=payload.source_page, ip_address=client_ip(request)))
    elif existing.status != "subscribed":
        existing.status = "subscribed"
    try:
        db.commit()
    except IntegrityError:
        db.rollback()  # the same address was added by a parallel request: it's on the list either way
    # Same answer whether or not the address was already on the list, so the form can't be used to probe emails
    return Accepted(message=NEWSLETTER_THANKS)
