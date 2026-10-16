from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

ENQUIRY_TYPES = ("contact", "quote")
ENQUIRY_STATUSES = ("new", "in_progress", "closed")
SUBSCRIBER_STATUSES = ("subscribed", "unsubscribed")


class Enquiry(TimestampMixin, Base):
    """Contact form ("Tell us about your project") and "Request Quote" submissions."""

    __tablename__ = "enquiries"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(20), default="contact", index=True)
    status: Mapped[str] = mapped_column(String(20), default="new", index=True)

    name: Mapped[str] = mapped_column(String(150))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(40))
    message: Mapped[str | None] = mapped_column(Text)
    service_id: Mapped[int | None] = mapped_column(ForeignKey("services.id", ondelete="SET NULL"))
    # Kept as text too, so the enquiry still reads correctly if the service is renamed or deleted
    service_name: Mapped[str | None] = mapped_column(String(120))

    notes: Mapped[str | None] = mapped_column(Text)  # internal, CMS only
    source_page: Mapped[str | None] = mapped_column(String(300))
    ip_address: Mapped[str | None] = mapped_column(String(64))
    user_agent: Mapped[str | None] = mapped_column(String(300))

    service: Mapped["Service | None"] = relationship()  # noqa: F821


class NewsletterSubscriber(TimestampMixin, Base):
    """Footer "Email | Join" sign-ups."""

    __tablename__ = "newsletter_subscribers"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(20), default="subscribed", index=True)
    source_page: Mapped[str | None] = mapped_column(String(300))
    ip_address: Mapped[str | None] = mapped_column(String(64))
