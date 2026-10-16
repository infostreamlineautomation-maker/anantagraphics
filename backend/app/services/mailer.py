"""Outgoing email over SMTP (enquiry alerts, test emails).
Supports dynamic configuration saved via CMS Settings, with fallback to backend/.env.
"""
import logging
import re
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
from typing import Any

from app.core.config import settings

log = logging.getLogger(__name__)


class EmailError(Exception):
    """Sending failed; the message is safe to show an admin (no passwords)."""


def _env_config() -> dict[str, Any]:
    return {
        "host": settings.SMTP_HOST.strip(),
        "port": settings.SMTP_PORT,
        "ssl": settings.SMTP_SSL,
        "user": settings.SMTP_USER.strip(),
        "password": settings.SMTP_PASSWORD,
        "from_email": settings.SMTP_FROM.strip(),
        "notify_to": settings.ENQUIRY_NOTIFY_TO.strip(),
    }


def _load_config_from_session(db) -> dict[str, Any]:
    try:
        from app.models import SiteSetting

        s = db.get(SiteSetting, "smtp_config")
        if s and isinstance(s.value, dict) and s.value.get("host"):
            v = s.value
            return {
                "host": str(v.get("host") or "").strip(),
                "port": int(v.get("port") or 465),
                "ssl": bool(v.get("ssl", True)),
                "user": str(v.get("user") or "").strip(),
                "password": str(v.get("password") or ""),
                "from_email": str(v.get("from_email") or "").strip(),
                "notify_to": str(v.get("notify_to") or "").strip(),
            }
    except Exception as exc:
        log.debug("Could not read smtp_config from database: %s", exc)
    return _env_config()


def get_config(db=None) -> dict[str, Any]:
    """Get active SMTP configuration (database takes priority if configured, else .env)."""
    if db is not None:
        return _load_config_from_session(db)
    try:
        from app.core.database import SessionLocal

        with SessionLocal() as session:
            return _load_config_from_session(session)
    except Exception:
        return _env_config()


def sender(db=None) -> str:
    cfg = get_config(db)
    return cfg["from_email"] or cfg["user"]


def smtp_enabled(db=None) -> bool:
    cfg = get_config(db)
    sndr = cfg["from_email"] or cfg["user"]
    return bool(cfg["host"] and sndr)


def notify_recipients(db=None) -> list[str]:
    cfg = get_config(db)
    raw = cfg["notify_to"] or ""
    return [a.strip() for a in raw.split(",") if a.strip()]


def header(value: str, limit: int = 200) -> str:
    """Visitor text used in a header (e.g. their name in the subject): no line breaks, bounded length."""
    return re.sub(r"[\r\n\t]+", " ", value).strip()[:limit]


def _build(to: list[str], subject: str, text: str, reply_to: str | None, cfg: dict[str, Any]) -> EmailMessage:
    sndr = cfg["from_email"] or cfg["user"]
    msg = EmailMessage()
    msg["From"] = sndr
    msg["To"] = ", ".join(to)
    msg["Subject"] = header(subject)
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain=sndr.rpartition("@")[2] or None)
    if reply_to:
        msg["Reply-To"] = header(reply_to)
    msg.set_content(text)
    return msg


def deliver(to: list[str], subject: str, text: str, reply_to: str | None = None, db=None) -> None:
    """Send now, raising EmailError with a readable reason (used by the CMS "send test email")."""
    cfg = get_config(db)
    sndr = cfg["from_email"] or cfg["user"]
    if not (cfg["host"] and sndr):
        raise EmailError("Email isn't set up: add SMTP_HOST and SMTP_FROM in CMS Settings or backend/.env.")
    if not to:
        raise EmailError("No recipient address.")
    try:
        msg = _build(to, subject, text, reply_to, cfg)
        context = ssl.create_default_context()
        if cfg["ssl"]:
            with smtplib.SMTP_SSL(cfg["host"], cfg["port"], context=context, timeout=20) as smtp:
                if cfg["user"]:
                    smtp.login(cfg["user"], cfg["password"])
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(cfg["host"], cfg["port"], timeout=20) as smtp:
                smtp.starttls(context=context)
                if cfg["user"]:
                    smtp.login(cfg["user"], cfg["password"])
                smtp.send_message(msg)
    except smtplib.SMTPAuthenticationError:
        raise EmailError("The mail server rejected the login — check your SMTP username and password.") from None
    except smtplib.SMTPRecipientsRefused:
        raise EmailError("The mail server refused the recipient address.") from None
    except smtplib.SMTPException as exc:
        raise EmailError(f"The mail server returned an error: {exc.__class__.__name__}.") from None
    except (OSError, TimeoutError) as exc:
        raise EmailError(
            f"Couldn't connect to {cfg['host']}:{cfg['port']} ({exc.__class__.__name__}). "
            "Check SMTP host, port and SSL/TLS settings."
        ) from None
    except ValueError as exc:  # malformed address etc.
        raise EmailError(f"Invalid email header: {exc}") from None


def send_email(to: list[str], subject: str, text: str, reply_to: str | None = None, db=None) -> bool:
    """Best-effort send for background alerts. Never raises: a form submit must not break on email."""
    if not smtp_enabled(db) or not to:
        log.info("SMTP not configured; skipped email %r", header(subject))
        return False
    try:
        deliver(to, subject, text, reply_to, db=db)
        return True
    except EmailError as exc:
        log.warning("Email %r not sent: %s", header(subject), exc)
        return False


def status(db=None) -> dict[str, Any]:
    """What the CMS shows about email setup. Never includes the raw password."""
    cfg = get_config(db)
    is_configured = bool(cfg["host"] and (cfg["from_email"] or cfg["user"]))
    return {
        "configured": is_configured,
        "host": cfg["host"] or "",
        "port": cfg["port"],
        "ssl": cfg["ssl"],
        "user": cfg["user"] or "",
        "has_password": bool(cfg["password"]),
        "from_email": cfg["from_email"] or "",
        "notify_to": cfg["notify_to"] or "",
        "sender": cfg["from_email"] or cfg["user"] or None,
        "recipients": [a.strip() for a in (cfg["notify_to"] or "").split(",") if a.strip()],
    }
