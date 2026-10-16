"""Load the Figma content into the database.

    python -m app.seed                   # create anything missing; never overwrites CMS edits
    python -m app.seed --reset-content   # overwrite settings, page sections and seeded rows with seed values

Safe to run on every setup and deploy (setup and `run.sh prod` call it). It never creates admin
accounts: use `python -m app.cli create-admin`.
"""
import argparse
import mimetypes

from PIL import Image
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models import Client, Faq, Media, PageSection, Project, Service, SiteSetting, WorkCategory
from app.seed_data import CLIENTS, FAQS, MEDIA_ALT, PAGES, SERVICES, SETTINGS, WORK_CATEGORIES

FIGMA = "/uploads/figma"


def _apply(obj, values: dict, reset: bool) -> bool:
    """Write seed values onto an existing row only when resetting. Returns True if anything was written."""
    if not reset:
        return False
    for k, v in values.items():
        setattr(obj, k, v)
    return True


def _extra_gallery(images: list[str]) -> list[str]:
    """Add numbered siblings found on disk: paper-cup-gallery-1.jpg -> -2.jpg, -3.jpg …"""
    out = list(images)
    for img in images:
        stem, dot, ext = img.rpartition(".")
        if not stem.endswith("-1"):
            continue
        base = stem[:-2]
        n = 2
        while (settings.upload_path / f"{base}-{n}.{ext}".removeprefix("/uploads/")).is_file():
            path = f"{base}-{n}.{ext}"
            if path not in out:
                out.append(path)
            n += 1
    return out


def seed_settings(db: Session, reset: bool) -> int:
    n = 0
    for key, value in SETTINGS.items():
        row = db.get(SiteSetting, key)
        if row is None:
            db.add(SiteSetting(key=key, value=value))
            n += 1
        elif _apply(row, {"value": value}, reset):
            n += 1
    return n


def seed_pages(db: Session, reset: bool) -> int:
    n = 0
    for page, sections in PAGES.items():
        for seq, (key, label, content) in enumerate(sections):
            row = db.scalar(select(PageSection).where(PageSection.page == page, PageSection.key == key))
            values = {"label": label, "content": content, "sequence": seq}
            if row is None:
                db.add(PageSection(page=page, key=key, **values))
                n += 1
            elif _apply(row, values, reset):
                n += 1
    return n


def seed_work(db: Session, reset: bool) -> int:
    n = 0
    for seq, data in enumerate(WORK_CATEGORIES):
        data = dict(data)
        projects = data.pop("projects")
        category = db.scalar(select(WorkCategory).where(WorkCategory.slug == data["slug"]))
        if category is None:
            category = WorkCategory(**data, sequence=seq)
            db.add(category)
            db.flush()
            n += 1
        elif _apply(category, data, reset):
            n += 1

        for pseq, pdata in enumerate(projects):
            pdata = {**pdata, "gallery": _extra_gallery(pdata["gallery"])}
            project = db.scalar(select(Project).where(Project.slug == pdata["slug"]))
            if project is None:
                db.add(Project(**pdata, category_id=category.id, sequence=pseq))
                n += 1
            elif _apply(project, pdata, reset):
                n += 1
    return n


def seed_lists(db: Session) -> int:
    """Services, clients and FAQs are only seeded into an empty table, so CMS deletions stick."""
    n = 0
    if db.scalar(select(Service.id).limit(1)) is None:
        for seq, s in enumerate(SERVICES):
            db.add(Service(**s, sequence=seq))
            n += 1
    if db.scalar(select(Client.id).limit(1)) is None:
        for seq, (name, file) in enumerate(CLIENTS):
            if (settings.upload_path / "figma" / "clients" / file).is_file():
                db.add(Client(name=name, logo=f"{FIGMA}/clients/{file}", sequence=seq))
                n += 1
    if db.scalar(select(Faq.id).limit(1)) is None:
        for seq, (question, answer) in enumerate(FAQS):
            db.add(Faq(question=question, answer=answer, sequence=seq))
            n += 1
    return n


def seed_media(db: Session) -> int:
    """Register every file under uploads/figma in the media library."""
    n = 0
    root = settings.upload_path
    client_alt = {f"clients/{file}": f"{name} logo" for name, file in CLIENTS}
    for path in sorted((root / "figma").rglob("*")):
        if not path.is_file() or path.name.startswith("."):
            continue
        url = "/uploads/" + path.relative_to(root).as_posix()
        if db.scalar(select(Media.id).where(Media.url == url)):
            continue
        with Image.open(path) as im:
            width, height = im.size
        rel = path.relative_to(root / "figma").as_posix()
        db.add(
            Media(
                url=url,
                filename=path.name,
                mime_type=mimetypes.guess_type(path.name)[0] or "application/octet-stream",
                size_bytes=path.stat().st_size,
                width=width,
                height=height,
                alt_text=MEDIA_ALT.get(rel) or client_alt.get(rel, ""),
                folder="figma",
            )
        )
        n += 1
    return n


def run(reset: bool = False) -> dict[str, int]:
    with SessionLocal() as db:
        counts = {
            "settings": seed_settings(db, reset),
            "pages": seed_pages(db, reset),
            "work": seed_work(db, reset),
            "lists": seed_lists(db),
            "media": seed_media(db),
        }
        db.commit()
    return counts


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.seed")
    parser.add_argument("--reset-content", action="store_true", help="Overwrite seeded content with the seed values")
    args = parser.parse_args()
    counts = run(reset=args.reset_content)
    print("Seed complete:", ", ".join(f"{k}={v}" for k, v in counts.items()))


if __name__ == "__main__":
    main()
