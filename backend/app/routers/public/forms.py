import logging
import re

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

# Disposable / burner email domains commonly used by spam bots
DISPOSABLE_EMAIL_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "tempmail.com", "temp-mail.org",
    "10minutemail.com", "throwawaymail.com", "yopmail.com", "sharklasers.com",
    "getairmail.com", "dispostable.com", "trashmail.com", "mytempemail.com",
    "maildrop.cc", "mohmal.com", "emailondeck.com", "crazymailing.com",
}

# Commercial spam keywords used by bulk contact-form blast scripts
SPAM_KEYWORDS = (
    "casino", "viagra", "cialis", "poker", "cryptocurrency", "crypto investment",
    "seo ranking", "backlink service", "guest post", "da90", "dr80",
    "whatsapp at +", "t.me/", "telegram:", "buy backlinks", "search engine ranking",
    "porn", "adult dating", "loan offer", "investment profit"
)

CYRILLIC_PATTERN = re.compile(r"[\u0400-\u04FF]")
URL_PATTERN = re.compile(r"https?://|www\.", re.IGNORECASE)


def _is_spam(payload: EnquiryCreate, request: Request) -> tuple[bool, str]:
    """Inspect submission for automated bot, honeypot, velocity, and spambot patterns."""
    # 1. Multi-field honeypot traps
    if payload.website:
        return True, "honeypot 'website' filled"
    if payload.user_company_url:
        return True, "honeypot 'user_company_url' filled"

    # 2. Timing check: bots submit in under 1800ms
    if payload.elapsed_ms is not None and payload.elapsed_ms < 1800:
        return True, f"submitted too fast ({payload.elapsed_ms}ms)"

    # 3. Disposable/burner email check
    email_domain = payload.email.split("@")[-1].lower()
    if email_domain in DISPOSABLE_EMAIL_DOMAINS:
        return True, f"disposable email domain ({email_domain})"

    # 4. Cyrillic script blast check (> 5 characters in English/Indian contact form)
    text_to_check = f"{payload.name} {payload.message or ''}"
    cyrillic_chars = CYRILLIC_PATTERN.findall(text_to_check)
    if len(cyrillic_chars) > 5:
        return True, f"excessive cyrillic script ({len(cyrillic_chars)} chars)"

    # 5. Link stuffing and spam keywords
    if payload.message:
        urls = URL_PATTERN.findall(payload.message)
        if len(urls) > 2:
            return True, f"excessive URLs in message ({len(urls)})"

        lower_msg = payload.message.lower()
        for kw in SPAM_KEYWORDS:
            if kw in lower_msg:
                return True, f"spam keyword '{kw}' detected"

    # 6. Automated scraping / script bot user agents
    ua = (request.headers.get("user-agent") or "").lower()
    if any(sig in ua for sig in ("scrapy", "python-requests", "aiohttp", "headlesschrome", "phantomjs")):
        return True, f"bot user agent ({ua[:40]})"

    return False, ""


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
    is_spam, reason = _is_spam(payload, request)
    if is_spam:
        # Silent tarpit: pretend success so bots learn nothing and do not mutate/retry
        log.warning("Dropped spam enquiry from %s: %s", client_ip(request), reason)
        return Accepted(message=ENQUIRY_THANKS)

    service = db.scalar(select(Service).where(Service.id == payload.service_id)) if payload.service_id else None

    # Normalize phone: ensure +91 prefix if not present and non-empty
    phone_clean = (payload.phone or "").strip() or None
    if phone_clean and not phone_clean.startswith("+"):
        phone_clean = f"+91 {phone_clean.lstrip('0')}"

    enquiry = Enquiry(
        type=payload.type,
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        phone=phone_clean,
        message=payload.message.strip() if payload.message else None,
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
    if payload.website or payload.user_company_url:
        return Accepted(message=NEWSLETTER_THANKS)

    email = payload.email.lower().strip()
    email_domain = email.split("@")[-1].lower()
    if email_domain in DISPOSABLE_EMAIL_DOMAINS:
        log.info("Dropped disposable email newsletter subscription from %s (%s)", client_ip(request), email_domain)
        return Accepted(message=NEWSLETTER_THANKS)

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
