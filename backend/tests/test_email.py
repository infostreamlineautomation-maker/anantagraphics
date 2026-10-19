"""Enquiry alert emails and the CMS "send test email", against a fake SMTP server (nothing is sent)."""
import smtplib

import pytest

from app.core.config import settings

SENT: list = []


class FakeSMTP:
    """Stands in for smtplib.SMTP_SSL / SMTP; records logins and messages."""

    fail_login = False

    def __init__(self, host, port, **kwargs):
        self.host, self.port = host, port

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    def starttls(self, **kwargs):
        pass

    def login(self, user, password):
        if FakeSMTP.fail_login:
            raise smtplib.SMTPAuthenticationError(535, b"bad credentials")

    def send_message(self, msg):
        SENT.append(msg)


@pytest.fixture
def smtp(monkeypatch):
    SENT.clear()
    FakeSMTP.fail_login = False
    monkeypatch.setattr(smtplib, "SMTP_SSL", FakeSMTP)
    monkeypatch.setattr(smtplib, "SMTP", FakeSMTP)
    for key, value in {
        "SMTP_HOST": "smtp.example.com", "SMTP_PORT": 465, "SMTP_SSL": True, "SMTP_USER": "alerts@example.com",
        "SMTP_PASSWORD": "secret-pass", "SMTP_FROM": "Ananta Graphics <alerts@example.com>",
        "ENQUIRY_NOTIFY_TO": "office@example.com, sales@example.com",
    }.items():
        monkeypatch.setattr(settings, key, value)
    return SENT


def test_enquiry_alert_goes_to_the_team_with_reply_to_the_visitor(public_client, smtp, seeded):
    service = public_client.get("/services").json()[0]
    res = public_client.post("/enquiries", json={
        "type": "quote", "name": "Riya\r\nBcc: attacker@example.com", "email": "riya@example.com",
        "phone": "+91 98250 00000", "service_id": service["id"], "message": "500 boxes please",
    })
    assert res.status_code == 201
    assert len(smtp) == 1
    msg = smtp[0]
    assert msg["To"] == "office@example.com, sales@example.com"
    assert msg["Reply-To"] == "riya@example.com"
    # A line break in the visitor's name can't add headers
    assert "\n" not in msg["Subject"] and msg["Bcc"] is None
    assert msg["Subject"].startswith("Quote request: Riya")
    body = msg.get_content()
    assert service["title"] in body and "500 boxes please" in body and "/enquiries/" in body


def test_no_email_without_smtp_settings(public_client, monkeypatch):
    SENT.clear()
    monkeypatch.setattr(smtplib, "SMTP_SSL", FakeSMTP)
    monkeypatch.setattr(settings, "SMTP_HOST", "")
    res = public_client.post("/enquiries", json={"name": "Ann", "email": "ann@example.com"})
    assert res.status_code == 201 and SENT == []


def test_email_failure_never_breaks_the_form(public_client, smtp):
    FakeSMTP.fail_login = True
    res = public_client.post("/enquiries", json={"name": "Ann", "email": "ann@example.com"})
    assert res.status_code == 201 and smtp == []


def test_cms_email_status_hides_the_password(admin_client, smtp):
    s = admin_client.get("/settings/email").json()
    assert s["configured"] is True and s["recipients"] == ["office@example.com", "sales@example.com"]
    assert "secret-pass" not in str(s)


def test_cms_test_email(admin_client, smtp):
    res = admin_client.post("/settings/email/test", json={})
    assert res.status_code == 200 and res.json()["to"] == "super@example.com"
    assert smtp[0]["To"] == "super@example.com"

    FakeSMTP.fail_login = True
    res = admin_client.post("/settings/email/test", json={"to": "other@example.com"})
    assert res.status_code == 400 and "rejected the login" in res.json()["detail"]


def test_cms_test_email_explains_missing_setup(admin_client, monkeypatch):
    monkeypatch.setattr(settings, "SMTP_HOST", "")
    res = admin_client.post("/settings/email/test", json={})
    assert res.status_code == 400 and "SMTP_HOST" in res.json()["detail"]


def test_cms_saves_smtp_settings(admin_client):
    # Used to hit the generic PUT /settings/{key} route and fail with 422
    body = {"host": "smtp.example.com", "port": 587, "ssl": False, "user": "alerts@example.com",
            "password": "app-password", "from_email": "Ananta <alerts@example.com>", "notify_to": "team@example.com"}
    res = admin_client.put("/settings/email", json=body)
    assert res.status_code == 200, res.text
    status = admin_client.get("/settings/email").json()
    assert status["host"] == "smtp.example.com" and status["port"] == 587 and status["has_password"]
    assert "password" not in status or status.get("password") in (None, "")

    # Leaving the password empty keeps the saved one
    assert admin_client.put("/settings/email", json={**body, "password": None}).status_code == 200
    assert admin_client.get("/settings/email").json()["has_password"]
