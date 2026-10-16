from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SeoMixin, TimestampMixin


class WorkCategory(TimestampMixin, SeoMixin, Base):
    """A card on Our Work ("01 — Printed Materials") and its page listing projects ("Packaging Solutions")."""

    __tablename__ = "work_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    short_description: Mapped[str | None] = mapped_column(String(300))  # card text
    card_image: Mapped[str | None] = mapped_column(String(500))
    secondary_image: Mapped[str | None] = mapped_column(String(500), nullable=True)  # back of card flip

    # Category page header
    heading: Mapped[str | None] = mapped_column(String(200))  # "Packaging Solutions"
    intro: Mapped[str | None] = mapped_column(Text)

    # Work card specs (back of card flip)
    craft_tags: Mapped[list[str]] = mapped_column(JSONB, default=list, server_default="[]")
    color_palette: Mapped[list[str]] = mapped_column(JSONB, default=list, server_default="[]")

    sequence: Mapped[int] = mapped_column(Integer, default=0, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    projects: Mapped[list["Project"]] = relationship(
        back_populates="category", order_by="Project.sequence", cascade="all, delete-orphan"
    )


class Project(TimestampMixin, SeoMixin, Base):
    """A portfolio project: card on its category page + its own detail page."""

    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("work_categories.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(160))
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    short_description: Mapped[str | None] = mapped_column(String(300))  # card text
    cover_image: Mapped[str | None] = mapped_column(String(500))  # card image
    secondary_image: Mapped[str | None] = mapped_column(String(500), nullable=True)  # back of card flip

    # Detail page
    description: Mapped[str | None] = mapped_column(Text)
    intro_image: Mapped[str | None] = mapped_column(String(500))  # small image beside the title
    client: Mapped[str | None] = mapped_column(String(160))
    project_type: Mapped[str | None] = mapped_column(String(160))  # "Project: Paper Cup Design"
    services: Mapped[list[str]] = mapped_column(JSONB, default=list)  # ["Graphic Design", "Printing"]
    gallery: Mapped[list[str]] = mapped_column(JSONB, default=list)

    # Work card specs (back of card flip)
    craft_tags: Mapped[list[str]] = mapped_column(JSONB, default=list, server_default="[]")
    color_palette: Mapped[list[str]] = mapped_column(JSONB, default=list, server_default="[]")

    # Shown in "Explore more projects" on other project pages
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    sequence: Mapped[int] = mapped_column(Integer, default=0, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    category: Mapped["WorkCategory"] = relationship(back_populates="projects")
