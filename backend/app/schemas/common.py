from typing import Annotated, Generic, TypeVar

from pydantic import AfterValidator, BaseModel, Field

T = TypeVar("T")


def _check_media_path(value: str | None) -> str | None:
    if value in (None, ""):
        return None
    if not value.startswith(("/uploads/", "https://")) or ".." in value or "\\" in value or any(c.isspace() for c in value):
        raise ValueError("must be a media path starting with /uploads/ or https:// (pick it from the Media Library)")
    return value


def _check_link(value: str | None) -> str | None:
    """A site path ("/our-work/packaging") or an external https:// URL. Blocks javascript: etc."""
    if value in (None, ""):
        return None
    is_path = value.startswith("/") and not value.startswith("//")
    if not (is_path or value.startswith("https://")) or any(c.isspace() for c in value):
        raise ValueError("must be a site path like /our-work or an https:// link")
    return value


# Image fields store paths into backend/uploads, never arbitrary schemes
MediaPath = Annotated[str | None, AfterValidator(_check_media_path)]
MediaPathList = list[Annotated[str, AfterValidator(_check_media_path)]]
Link = Annotated[str | None, AfterValidator(_check_link)]

Slug = Annotated[str, Field(min_length=1, max_length=180, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")]


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int


class ReorderIn(BaseModel):
    ids: list[int] = Field(min_length=1, description="IDs in their new display order")


class SeoFields(BaseModel):
    meta_title: str | None = Field(default=None, max_length=160)
    meta_description: str | None = Field(default=None, max_length=320)
    og_image: MediaPath = None


def clean_tags(values: list[str] | None, max_items: int = 20, max_len: int = 60) -> list[str] | None:
    if values is None:
        return None
    return [t.strip()[:max_len] for t in values if t and t.strip()][:max_items]
