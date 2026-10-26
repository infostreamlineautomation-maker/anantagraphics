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


def seed_pages(db: Session, reset: bool, sync: bool = False) -> int:
    n = 0
    for page, sections in PAGES.items():
        for seq, (key, label, content) in enumerate(sections):
            row = db.scalar(select(PageSection).where(PageSection.page == page, PageSection.key == key))
            values = {"label": label, "content": content, "sequence": seq}
            if row is None:
                db.add(PageSection(page=page, key=key, **values))
                n += 1
            elif reset or (sync and key in ("featured", "stats")):
                for k, v in values.items():
                    setattr(row, k, v)
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


def sync_client_projects(db: Session) -> dict[str, int]:
    """Sync projects to strictly match the curated real client projects in WORK_CATEGORIES,
    removing obsolete placeholder projects and populating real client works."""
    valid_slugs = set()
    for cat in WORK_CATEGORIES:
        for p in cat.get("projects", []):
            valid_slugs.add(p["slug"])

    # Remove projects not in valid_slugs
    old_projects = db.scalars(select(Project)).all()
    deleted = 0
    for op in old_projects:
        if op.slug not in valid_slugs:
            db.delete(op)
            deleted += 1
    db.flush()

    created = 0
    updated = 0
    for seq, data in enumerate(WORK_CATEGORIES):
        data = dict(data)
        projects = data.pop("projects", [])
        category = db.scalar(select(WorkCategory).where(WorkCategory.slug == data["slug"]))
        if category is None:
            category = WorkCategory(**data, sequence=seq)
            db.add(category)
            db.flush()
        else:
            for k, v in data.items():
                setattr(category, k, v)
            category.sequence = seq

        for pseq, pdata in enumerate(projects):
            pdata = dict(pdata)
            gallery = _extra_gallery(pdata.pop("gallery", [pdata["cover_image"]]))
            project = db.scalar(select(Project).where(Project.slug == pdata["slug"]))
            if project is None:
                db.add(Project(**pdata, gallery=gallery, category_id=category.id, sequence=pseq, is_active=True))
                created += 1
            else:
                project.category_id = category.id
                project.sequence = pseq
                project.gallery = gallery
                project.is_active = True
                for k, v in pdata.items():
                    setattr(project, k, v)
                updated += 1
    db.commit()
    return {"deleted": deleted, "created": created, "updated": updated}


def seed_lists(db: Session, reset: bool = False, sync: bool = False) -> int:
    """Services, clients and FAQs are seeded, and synced when requested."""
    n = 0
    services = db.scalars(select(Service).order_by(Service.sequence, Service.id)).all()
    if not services:
        for seq, s in enumerate(SERVICES):
            db.add(Service(**s, sequence=seq))
            n += 1
    elif reset or sync:
        for seq, s_data in enumerate(SERVICES):
            if seq < len(services):
                s = services[seq]
                for k, v in s_data.items():
                    setattr(s, k, v)
                n += 1
            else:
                db.add(Service(**s_data, sequence=seq))
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
    """Register files under uploads/figma, uploads/reels, and uploads/services in the media library."""
    n = 0
    root = settings.upload_path
    client_alt = {f"clients/{file}": f"{name} logo" for name, file in CLIENTS}
    folders = ["figma", "reels", "services"]
    for folder in folders:
        folder_path = root / folder
        if not folder_path.is_dir():
            continue
        for path in sorted(folder_path.rglob("*")):
            if not path.is_file() or path.name.startswith("."):
                continue
            url = "/uploads/" + path.relative_to(root).as_posix()
            if db.scalar(select(Media.id).where(Media.url == url)):
                continue
            width, height = None, None
            try:
                with Image.open(path) as im:
                    width, height = im.size
            except Exception:
                pass
            rel = path.relative_to(folder_path).as_posix()
            alt = MEDIA_ALT.get(rel) or client_alt.get(rel, "")
            if not alt:
                alt = path.stem.replace("-", " ").title()
            db.add(
                Media(
                    url=url,
                    filename=path.name,
                    mime_type=mimetypes.guess_type(path.name)[0] or "application/octet-stream",
                    size_bytes=path.stat().st_size,
                    width=width,
                    height=height,
                    alt_text=alt,
                    folder=folder,
                )
            )
            n += 1
    return n


def run(reset: bool = False, sync: bool = True) -> dict[str, int]:
    with SessionLocal() as db:
        counts = {
            "settings": seed_settings(db, reset),
            "pages": seed_pages(db, reset, sync=sync),
            "work": seed_work(db, reset),
            "lists": seed_lists(db, reset, sync=sync),
            "media": seed_media(db),
        }
        db.commit()
    return counts


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.seed")
    parser.add_argument("--reset-content", action="store_true", help="Overwrite seeded content with the seed values")
    parser.add_argument("--no-sync", dest="sync", action="store_false", help="Do not sync services and featured reels")
    parser.set_defaults(sync=True)
    args = parser.parse_args()
    counts = run(reset=args.reset_content, sync=args.sync or args.reset_content)
    print("Seed complete:", ", ".join(f"{k}={v}" for k, v in counts.items()))


if __name__ == "__main__":
    main()
