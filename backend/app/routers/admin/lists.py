"""Services, clients and FAQs: simple ordered lists edited in the CMS."""
from app.models import Client, Faq, Service
from app.routers.admin._sortable import sortable_router
from app.schemas.content import (
    ClientAdmin,
    ClientCreate,
    ClientUpdate,
    FaqAdmin,
    FaqCreate,
    FaqUpdate,
    ServiceAdmin,
    ServiceCreate,
    ServiceUpdate,
)

services = sortable_router(
    model=Service, prefix="/services", entity="service", label_attr="title",
    create_schema=ServiceCreate, update_schema=ServiceUpdate, out_schema=ServiceAdmin, cache_tag="services",
)
clients = sortable_router(
    model=Client, prefix="/clients", entity="client", label_attr="name",
    create_schema=ClientCreate, update_schema=ClientUpdate, out_schema=ClientAdmin, cache_tag="clients",
)
faqs = sortable_router(
    model=Faq, prefix="/faqs", entity="faq", label_attr="question",
    create_schema=FaqCreate, update_schema=FaqUpdate, out_schema=FaqAdmin, cache_tag="faqs",
)
