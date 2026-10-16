"""Outgoing email over SMTP (enquiry alerts, test emails). Configured by SMTP_* in backend/.env."""
import logging
import re
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formatdate, make_msgid

from app.core.config import settings

log = logging.getLogger(__name__)


class EmailError(Exception):
    """Sending failed; the message is safe to show an admin (no passwords)."""


def sender() -> str:
    return settings.SMTP_FROM or settings.SMTP_USER


def smtp_enabled() -> bool:
    return bool(settings.SMTP_HOST and sender())


def notify_recipients() -> list[str]:
    return [a.strip() for a in settings.ENQUIRY_NOTIFY_TO.split(",") if a.strip()]


def header(value: str, limit: int = 200) -> str:
    """Visitor text used in a header (e.g. their name in the subject): no line breaks, bounded length."""
    return re.sub(r"[\r\n\t]+", " ", value).strip()[:limit]


def _build(to: list[str], subject: str, text: str, reply_to: str | None) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = sender()
    msg["To"] = ", ".join(to)
    msg["Subject"] = header(subject)
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain=sender().rpartition("@")[2] or None)
    if reply_to:
        msg["Reply-To"] = header(reply_to)
    msg.set_content(text)
    return msg


def deliver(to: list[str], subject: str, text: str, reply_to: str | None = None) -> None:
    """Send now, raising EmailError with a readable reason (used by the CMS "send test email")."""
    if not smtp_enabled():
        raise EmailError("Email isn't set up: add SMTP_HOST and SMTP_FROM to backend/.env, then restart the APIs.")
    if not to:
        raise EmailError("No recipient address.")
    try:
        msg = _build(to, subject, text, reply_to)
        context = ssl.create_default_context()
        if settings.SMTP_SSL:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context, timeout=20) as smtp:
                _login_and_send(smtp, msg)
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as smtp:
                smtp.starttls(context=context)
                _login_and_send(smtp, msg)
    except smtplib.SMTPAuthenticationError:
        raise EmailError("The mail server rejected the login — check SMTP_USER and SMTP_PASSWORD.") from None
    except smtplib.SMTPRecipientsRefused:
        raise EmailError("The mail server refused the recipient address.") from None
    except smtplib.SMTPException as exc:
        raise EmailError(f"The mail server returned an error: {exc.__class__.__name__}.") from None
    except (OSError, TimeoutError) as exc:
        raise EmailError(
            f"Couldn't connect to {settings.SMTP_HOST}:{settings.SMTP_PORT} ({exc.__class__.__name__}). "
            "Check SMTP_HOST, SMTP_PORT and SMTP_SSL (465 = SSL on, 587 = SSL off)."
        ) from None
    except ValueError as exc:  # malformed address etc.
        raise EmailError(f"Invalid email header: {exc}") from None


def send_email(to: list[str], subject: str, text: str, reply_to: str | None = None) -> bool:
    """Best-effort send for background alerts. Never raises: a form submit must not break on email."""
    if not smtp_enabled() or not to:
        log.info("SMTP not configured; skipped email %r", header(subject))
        return False
    try:
        deliver(to, subject, text, reply_to)
        return True
    except EmailError as exc:
        log.warning("Email %r not sent: %s", header(subject), exc)
        return False


def _login_and_send(smtp: smtplib.SMTP, msg: EmailMessage) -> None:
    if settings.SMTP_USER:
        smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
    smtp.send_message(msg)


def status() -> dict:
    """What the CMS shows about email setup. Never includes the password."""
    return {
        "configured": smtp_enabled(),
        "host": settings.SMTP_HOST or None,
        "port": settings.SMTP_PORT,
        "ssl": settings.SMTP_SSL,
        "sender": sender() or None,
        "recipients": notify_recipients(),
    }
