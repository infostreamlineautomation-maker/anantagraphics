"""Enquiries (contact form, quote requests) and newsletter sign-ups."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

EnquiryType = Literal["contact", "quote"]
EnquiryStatus = Literal["new", "in_progress", "closed"]
SubscriberStatus = Literal["subscribed", "unsubscribed"]


class EnquiryCreate(BaseModel):
    type: EnquiryType = "contact"
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40, pattern=r"^[0-9+()\-.\s]*$")
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
