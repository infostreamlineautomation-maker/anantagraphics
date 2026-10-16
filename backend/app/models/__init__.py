# Import every model here so Alembic autogenerate can see it.
from app.models.admin_user import AdminUser
from app.models.base import Base
from app.models.content import Faq, PageSection, SiteSetting
from app.models.inbox import ENQUIRY_STATUSES, ENQUIRY_TYPES, SUBSCRIBER_STATUSES, Enquiry, NewsletterSubscriber
from app.models.service import Client, Service
from app.models.system import AuditLog, Media
from app.models.work import Project, WorkCategory

__all__ = [
    "Base",
    "AdminUser",
    "AuditLog",
    "Client",
    "ENQUIRY_STATUSES",
    "ENQUIRY_TYPES",
    "Enquiry",
    "Faq",
    "Media",
    "NewsletterSubscriber",
    "PageSection",
    "Project",
    "SUBSCRIBER_STATUSES",
    "Service",
    "SiteSetting",
    "WorkCategory",
]
