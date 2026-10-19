"""Enquiries (contact form, quote requests) and newsletter sign-ups."""
import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

EnquiryType = Literal["contact", "quote"]
EnquiryStatus = Literal["new", "in_progress", "closed"]
SubscriberStatus = Literal["subscribed", "unsubscribed"]


def normalize_phone(value: str | None) -> str | None:
    """'98250 12345', '09825012345', '+91 98250-12345' -> '+91 98250 12345'; other countries keep their code.

    Indian numbers must have exactly 10 digits, others 7-15, so '123' or '8555' are rejected.
    """
    raw = (value or "").strip()
    if not raw:
        return None
    digits = re.sub(r"\D", "", raw)
    if raw.startswith("+") and not raw.startswith("+91"):
        if not 7 <= len(digits) <= 15:
            raise ValueError("Enter a valid phone number")
        return "+" + digits
    if raw.startswith("+91") or (len(digits) == 12 and digits.startswith("91")):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if len(digits) != 10:
        raise ValueError("Phone number must have 10 digits")
    return f"+91 {digits[:5]} {digits[5:]}"


class EnquiryCreate(BaseModel):
    type: EnquiryType = "contact"
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40, pattern=r"^[0-9+()\-.\s]*$")

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str | None) -> str | None:
        return normalize_phone(v)

    service_id: int | None = None
    message: str | None = Field(default=None, max_length=5000)
    source_page: str | None = Field(default=None, max_length=300)
    # Honeypots & spam detection metadata: bots that fill honeypots or submit instantaneously are dropped
    website: str | None = Field(default=None, max_length=200)
    user_company_url: str | None = Field(default=None, max_length=200)
    elapsed_ms: int | None = Field(default=None, ge=0)


class Accepted(BaseModel):
    ok: bool = True
    message: str


class EnquiryAdmin(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    status: str
    name: str
    email: str
    phone: str | None
    message: str | None
    service_id: int | None
    service_name: str | None
    notes: str | None
    source_page: str | None
    ip_address: str | None
    created_at: datetime
    updated_at: datetime


class EnquiryUpdate(BaseModel):
    status: EnquiryStatus | None = None
    notes: str | None = Field(default=None, max_length=5000)


class NewsletterCreate(BaseModel):
    email: EmailStr
    source_page: str | None = Field(default=None, max_length=300)
    website: str | None = Field(default=None, max_length=200)  # honeypot
    user_company_url: str | None = Field(default=None, max_length=200)  # honeypot 2


class SubscriberAdmin(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    status: str
    source_page: str | None
    created_at: datetime
    updated_at: datetime


class SubscriberUpdate(BaseModel):
    status: SubscriberStatus
