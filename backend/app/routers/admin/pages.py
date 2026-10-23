from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.deps import get_current_admin
from app.models import AdminUser, PageSection
from app.routers.admin._helpers import apply_update, get_or_404
from app.schemas.content import PageSectionAdmin, PageSectionUpdate
from app.services import audit
from app.services.revalidate import revalidate_site

router = APIRouter(prefix="/pages", tags=["pages"])

# Sections are created by the seed (their shape is fixed by the website),
# so the CMS edits and toggles them but doesn't create or delete them.


@router.get("", response_model=dict[str, list[PageSectionAdmin]])
def list_pages(db: Session = Depends(get_db)):
    pages: dict[str, list[PageSectionAdmin]] = {}
    for s in db.scalars(select(PageSection).order_by(PageSection.page, PageSection.sequence)):
        pages.setdefault(s.page, []).append(PageSectionAdmin.model_validate(s))
    return pages


@router.get("/{page}", response_model=list[PageSectionAdmin])
def get_page(page: str, db: Session = Depends(get_db)):
    sections = db.scalars(select(PageSection).where(PageSection.page == page).order_by(PageSection.sequence)).all()
    if not sections:
        raise HTTPException(404, "Page not found")
    return sections


@router.patch("/sections/{section_id}", response_model=PageSectionAdmin)
def update_section(
    section_id: int,
    payload: PageSectionUpdate,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
):
    section = get_or_404(db, PageSection, section_id, "Section")
    # If updating home featured section with instagram reels, auto-download missing video files
    if section.page == "home" and section.key == "featured" and payload.content and "items" in payload.content:
        items = payload.content.get("items")
        if isinstance(items, list):
            from app.services.instagram import download_instagram_media
            for it in items:
                if isinstance(it, dict):
                    insta_url = it.get("instagram_url") or (it.get("href") if "instagram.com" in (it.get("href") or "") else None)
                    if insta_url and not it.get("video_url") and not it.get("media"):
                        try:
                            dl = download_instagram_media(insta_url)
                            if dl.get("video_url"):
                                it["video_url"] = dl["video_url"]
                                it["media"] = dl["video_url"]
                            if dl.get("poster_url") and not it.get("poster"):
                                it["poster"] = dl["poster_url"]
                            if dl.get("caption") and not it.get("caption"):
                                it["caption"] = dl["caption"]
                        except Exception:
                            pass

    changes = apply_update(section, payload)
    if changes:
        # Content diffs can be large; log which fields changed, not the whole JSON
        summary_changes = {k: v for k, v in changes.items() if k != "content"}
        if "content" in changes:
            summary_changes["content"] = "updated"
        audit.record(
            db, admin, "update", "page_section", f"Updated {section.page} / {section.label}", section.id, summary_changes, request
        )
        db.commit()
        background.add_task(revalidate_site, f"page:{section.page}")
    return section
