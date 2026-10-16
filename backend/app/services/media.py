import io
import uuid
import warnings
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from PIL import Image, ImageOps
from sqlalchemy import String, cast, or_, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Client, PageSection, Project, Service, SiteSetting, WorkCategory

# Format reported by Pillow -> (extension, mime type). SVG is not accepted: it can carry scripts.
ALLOWED_FORMATS = {
    "JPEG": (".jpg", "image/jpeg"),
    "PNG": (".png", "image/png"),
    "WEBP": (".webp", "image/webp"),
    "GIF": (".gif", "image/gif"),
}

ALLOWED_VIDEOS = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".ogv": "video/ogg",
}

MAX_PIXELS = 50_000_000  # ~7000x7000; rejects decompression bombs
Image.MAX_IMAGE_PIXELS = MAX_PIXELS


@dataclass
class StoredFile:
    url: str
    mime_type: str
    size_bytes: int
    width: int
    height: int


def _read_limited(upload: UploadFile) -> bytes:
    limit = settings.MAX_UPLOAD_MB * 1024 * 1024
    data = upload.file.read(limit + 1)
    if len(data) > limit:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, f"File is larger than {settings.MAX_UPLOAD_MB} MB")
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Empty file")
    return data


def store_image(upload: UploadFile, folder: str = "library") -> StoredFile:
    """Validate an uploaded image or video by its content/signature, strip metadata from images, and save."""
    raw = _read_limited(upload)

    # Check if uploaded file is a video
    filename = (upload.filename or "").lower()
    content_type = (upload.content_type or "").lower()
    ext = Path(filename).suffix

    if ext in ALLOWED_VIDEOS or content_type.startswith("video/"):
        video_ext = ext if ext in ALLOWED_VIDEOS else ".mp4"
        mime = ALLOWED_VIDEOS.get(video_ext, content_type or "video/mp4")
        now = datetime.now(timezone.utc)
        rel = Path(folder) / f"{now:%Y}" / f"{now:%m}" / f"{uuid.uuid4().hex}{video_ext}"
        dest = settings.upload_path / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(raw)
        return StoredFile(url="/uploads/" + rel.as_posix(), mime_type=mime, size_bytes=len(raw), width=1920, height=1080)

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(raw)) as probe:
                probe.verify()
            img = Image.open(io.BytesIO(raw))
            img.load()
    except (Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Image dimensions are too large") from None
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File is not a valid image or video") from None

    fmt = img.format or ""
    if fmt not in ALLOWED_FORMATS:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Use a JPG, PNG, WebP, GIF image or MP4/WebM video")
    ext, mime = ALLOWED_FORMATS[fmt]

    if fmt == "GIF":
        # Re-encoding would drop animation frames; the content was verified above
        out = raw
    else:
        img = ImageOps.exif_transpose(img)  # apply camera rotation, then drop EXIF/GPS
        buf = io.BytesIO()
        if fmt == "JPEG":
            img.convert("RGB").save(buf, "JPEG", quality=88, optimize=True, progressive=True)
        elif fmt == "PNG":
            img.save(buf, "PNG", optimize=True)
        else:
            img.save(buf, "WEBP", quality=88)
        out = buf.getvalue()

    now = datetime.now(timezone.utc)
    rel = Path(folder) / f"{now:%Y}" / f"{now:%m}" / f"{uuid.uuid4().hex}{ext}"
    dest = settings.upload_path / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(out)
    return StoredFile(url="/uploads/" + rel.as_posix(), mime_type=mime, size_bytes=len(out), width=img.width, height=img.height)


def delete_file(url: str) -> None:
    """Remove a stored file; ignores anything outside backend/uploads."""
    if not url.startswith("/uploads/"):
        return
    root = settings.upload_path.resolve()
    path = (root / url.removeprefix("/uploads/")).resolve()
    if root in path.parents and path.is_file():
        path.unlink()


def find_usage(db: Session, url: str) -> list[str]:
    """Human-readable list of places that reference `url` (blocks deleting media that's in use)."""
    pattern = f"%{url}%"
    used: list[str] = []
    for c in db.scalars(select(WorkCategory).where(or_(WorkCategory.card_image == url, WorkCategory.og_image == url))):
        used.append(f"Work category: {c.name}")
    for p in db.scalars(
        select(Project).where(
            or_(
                Project.cover_image == url,
                Project.intro_image == url,
                Project.og_image == url,
                cast(Project.gallery, String).like(pattern),
            )
        )
    ):
        used.append(f"Project: {p.title}")
    for s in db.scalars(select(Service).where(Service.image == url)):
        used.append(f"Service: {s.title}")
    for c in db.scalars(select(Client).where(Client.logo == url)):
        used.append(f"Client: {c.name}")
    for s in db.scalars(select(PageSection).where(cast(PageSection.content, String).like(pattern))):
        used.append(f"Page: {s.page} / {s.label}")
    for st in db.scalars(select(SiteSetting).where(cast(SiteSetting.value, String).like(pattern))):
        used.append(f"Settings: {st.key}")
    return used
