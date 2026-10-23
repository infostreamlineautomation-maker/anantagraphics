"""Schemas for work categories, projects, services, clients, FAQs, page sections and settings."""
import json
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import Link, MediaPath, MediaPathList, SeoFields, Slug, clean_tags

ORM = ConfigDict(from_attributes=True)

# ---------------------------------------------------------------- public


class FaqOut(BaseModel):
    model_config = ORM
    id: int
    question: str
    answer: str


class ServiceOut(BaseModel):
    model_config = ORM
    id: int
    title: str
    client_name: str | None = None
    description: str | None
    image: str | None
    link: str | None


class ClientOut(BaseModel):
    model_config = ORM
    id: int
    name: str
    logo: str
    website: str | None


class WorkCategoryCard(BaseModel):
    model_config = ORM
    id: int
    name: str
    slug: str
    short_description: str | None
    card_image: str | None
    secondary_image: str | None = None
    craft_tags: list[str] = []
    color_palette: list[str] = []


class ProjectCard(BaseModel):
    model_config = ORM
    id: int
    title: str
    slug: str
    short_description: str | None
    cover_image: str | None
    secondary_image: str | None = None
    craft_tags: list[str] = []
    color_palette: list[str] = []


class WorkCategoryDetail(WorkCategoryCard, SeoFields):
    heading: str | None
    intro: str | None
    projects: list[ProjectCard] = []


class ExploreCard(ProjectCard):
    category_slug: str
    category_name: str


class ProjectDetail(ProjectCard, SeoFields):
    description: str | None
    intro_image: str | None
    client: str | None
    project_type: str | None
    services: list[str]
    gallery: list[str]
    category: WorkCategoryCard
    explore: list[ExploreCard] = []


class PageOut(BaseModel):
    page: str
    sections: dict[str, dict[str, Any]]


# ---------------------------------------------------------------- admin: work categories


class WorkCategoryBase(SeoFields):
    short_description: str | None = Field(default=None, max_length=300)
    card_image: MediaPath = None
    secondary_image: MediaPath = None
    heading: str | None = Field(default=None, max_length=200)
    intro: str | None = None
    craft_tags: list[str] = []
    color_palette: list[str] = []
    is_active: bool = True

    @field_validator("craft_tags", "color_palette")
    @classmethod
    def _clean_category_tags(cls, v: list[str] | None) -> list[str] | None:
        return clean_tags(v)


class WorkCategoryCreate(WorkCategoryBase):
    name: str = Field(min_length=1, max_length=120)
    slug: Slug | None = None  # generated from the name when omitted


class WorkCategoryUpdate(WorkCategoryBase):
    # All optional; only the fields the client sends are applied (exclude_unset)
    name: str | None = Field(default=None, min_length=1, max_length=120)
    slug: Slug | None = None
    is_active: bool | None = None


class WorkCategoryAdmin(WorkCategoryBase):
    model_config = ORM
    id: int
    name: str
    slug: str
    sequence: int
    project_count: int = 0
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------- admin: projects


class ProjectBase(SeoFields):
    short_description: str | None = Field(default=None, max_length=300)
    cover_image: MediaPath = None
    secondary_image: MediaPath = None
    description: str | None = None
    intro_image: MediaPath = None
    client: str | None = Field(default=None, max_length=160)
    project_type: str | None = Field(default=None, max_length=160)
    services: list[str] = []
    craft_tags: list[str] = []
    color_palette: list[str] = []
    gallery: MediaPathList = []
    is_featured: bool = False
    is_active: bool = True

    @field_validator("services", "craft_tags", "color_palette")
    @classmethod
    def _clean_services(cls, v: list[str] | None) -> list[str] | None:
        return clean_tags(v)


class ProjectCreate(ProjectBase):
    category_id: int
    title: str = Field(min_length=1, max_length=160)
    slug: Slug | None = None


class ProjectUpdate(ProjectBase):
    category_id: int | None = None
    title: str | None = Field(default=None, min_length=1, max_length=160)
    slug: Slug | None = None
    services: list[str] | None = None
    gallery: MediaPathList | None = None
    is_featured: bool | None = None
    is_active: bool | None = None


class ProjectAdmin(ProjectBase):
    model_config = ORM
    id: int
    category_id: int
    category_name: str = ""
    title: str
    slug: str
    sequence: int
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------- admin: services & clients


class ServiceCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    client_name: str | None = Field(default=None, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    image: MediaPath = None
    link: Link = None
    is_active: bool = True


class ServiceUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    client_name: str | None = Field(default=None, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    image: MediaPath = None
    link: Link = None
    is_active: bool | None = None


class ServiceAdmin(ServiceOut):
    sequence: int
    is_active: bool
    updated_at: datetime


class ClientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    logo: MediaPath = Field(...)
    website: Link = None
    is_active: bool = True

    @field_validator("logo")
    @classmethod
    def _logo_required(cls, v: str | None) -> str:
        if not v:
            raise ValueError("a logo is required")
        return v


class ClientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    logo: MediaPath = None
    website: Link = None
    is_active: bool | None = None

    @field_validator("logo")
    @classmethod
    def _logo_not_blank(cls, v: str | None) -> str | None:
        # Sent but empty would leave the client without a logo
        if v is None:
            raise ValueError("a logo is required")
        return v


class ClientAdmin(ClientOut):
    sequence: int
    is_active: bool
    updated_at: datetime


# ---------------------------------------------------------------- admin: FAQs


class FaqCreate(BaseModel):
    question: str = Field(min_length=3, max_length=300)
    answer: str = Field(min_length=1, max_length=5000)
    is_active: bool = True


class FaqUpdate(BaseModel):
    question: str | None = Field(default=None, min_length=3, max_length=300)
    answer: str | None = Field(default=None, min_length=1, max_length=5000)
    is_active: bool | None = None


class FaqAdmin(FaqOut):
    sequence: int
    is_active: bool
    updated_at: datetime


# ---------------------------------------------------------------- admin: pages & settings

MAX_JSON_BYTES = 200_000


def _limit_json(value: dict[str, Any]) -> dict[str, Any]:
    if len(json.dumps(value)) > MAX_JSON_BYTES:
        raise ValueError("content is too large")
    return value


class PageSectionAdmin(BaseModel):
    model_config = ORM
    id: int
    page: str
    key: str
    label: str
    content: dict[str, Any]
    sequence: int
    is_active: bool
    updated_at: datetime


class PageSectionUpdate(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=120)
    content: dict[str, Any] | None = None
    is_active: bool | None = None

    @field_validator("content")
    @classmethod
    def _content_size(cls, v: dict[str, Any] | None) -> dict[str, Any] | None:
        return v if v is None else _limit_json(v)


SETTING_KEYS = ("brand", "contact", "socials", "footer", "seo")


class SettingUpdate(BaseModel):
    value: dict[str, Any]

    @field_validator("value")
    @classmethod
    def _value_size(cls, v: dict[str, Any]) -> dict[str, Any]:
        return _limit_json(v)
