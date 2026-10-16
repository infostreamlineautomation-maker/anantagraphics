from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.deps import get_current_admin
from app.models import AdminUser, SiteSetting
from app.schemas.content import SETTING_KEYS, SettingUpdate
from app.services import audit, mailer
from app.services.audit import diff
from app.services.revalidate import revalidate_site

router = APIRouter(prefix="/settings", tags=["settings"])

# Every cache tag the website uses (frontend/src/lib/api.ts)
ALL_TAGS = (
    "settings", "work", "projects", "services", "clients", "faqs",
    "page:home", "page:about", "page:contact", "page:our-work",
)


@router.get("")
def get_settings(db: Session = Depends(get_db)) -> dict[str, dict]:
    stored = {s.key: s.value for s in db.scalars(select(SiteSetting))}
    return {key: stored.get(key, {}) for key in SETTING_KEYS}


@router.put("/{key}")
def update_setting(
    key: str,
    payload: SettingUpdate,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
) -> dict:
    if key not in SETTING_KEYS:
        raise HTTPException(404, f"Unknown setting '{key}'")
    setting = db.get(SiteSetting, key)
    before = dict(setting.value) if setting else {}
    if setting is None:
        setting = SiteSetting(key=key, value=payload.value)
        db.add(setting)
    else:
        setting.value = payload.value
    changes = diff(before, payload.value)
    if changes:
        audit.record(db, admin, "update", "settings", f"Updated {key} settings", key, changes, request)
    db.commit()
    background.add_task(revalidate_site, "settings")
    return setting.value


class TestEmail(BaseModel):
    to: EmailStr | None = None  # defaults to the signed-in admin's address


@router.get("/email")
def email_status() -> dict:
    """Whether enquiry alerts can be sent, and to whom (configured in backend/.env)."""
    return mailer.status()


@router.post("/email/test")
@limiter.limit("5/minute")
def send_test_email(
    request: Request,
    payload: TestEmail,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
) -> dict:
    to = str(payload.to or admin.email)
    text = (
        f"This is a test email from the {settings.APP_NAME} CMS, sent by {admin.email}.\n\n"
        "If you can read this, enquiry alerts are set up correctly.\n"
        f"New enquiries are sent to: {', '.join(mailer.notify_recipients()) or '(nobody yet — set ENQUIRY_NOTIFY_TO)'}"
    )
    try:
        mailer.deliver([to], f"{settings.APP_NAME}: test email", text)
    except mailer.EmailError as exc:
        raise HTTPException(400, str(exc)) from None
    audit.record(db, admin, "update", "settings", f"Sent a test email to {to}", "email", request=request)
    db.commit()
    return {"ok": True, "to": to}


@router.post("/publish")
def publish_all(
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
) -> dict:
    """Refresh every cached page on the website (edits normally refresh their own pages)."""
    audit.record(db, admin, "publish", "site", "Refreshed the whole website", "all", request=request)
    db.commit()
    background.add_task(revalidate_site, *ALL_TAGS)
    return {"ok": True}
