import re
import logging
from pathlib import Path
from typing import TypedDict

import yt_dlp
from app.core.config import settings

logger = logging.getLogger(__name__)

INSTAGRAM_REGEX = re.compile(r"instagram\.com/(?:p|reel|reels|tv)/([^/?#&]+)", re.IGNORECASE)


class InstagramMediaResult(TypedDict, total=False):
    shortcode: str
    video_url: str | None
    poster_url: str | None
    caption: str | None
    title: str | None


def extract_shortcode(url: str) -> str | None:
    if not url:
        return None
    match = INSTAGRAM_REGEX.search(url)
    return match.group(1) if match else None


def download_instagram_media(url: str) -> InstagramMediaResult:
    """Download an Instagram Reel or video post to the uploads/reels directory

    using yt-dlp. Returns the local video and poster URL paths.
    """
    shortcode = extract_shortcode(url)
    if not shortcode:
        raise ValueError(f"Could not extract Instagram shortcode from URL: {url}")

    reels_dir = settings.upload_path / "reels"
    reels_dir.mkdir(parents=True, exist_ok=True)

    # Check if this video has already been downloaded
    existing_video = None
    for ext in (".mp4", ".webm", ".mov"):
        candidate = reels_dir / f"{shortcode}{ext}"
        if candidate.exists() and candidate.stat().st_size > 0:
            existing_video = candidate
            break

    existing_poster = None
    for ext in (".jpg", ".webp", ".png", ".jpeg"):
        candidate = reels_dir / f"{shortcode}{ext}"
        if candidate.exists() and candidate.stat().st_size > 0:
            existing_poster = candidate
            break

    if existing_video:
        logger.info("Instagram reel %s already cached at %s", shortcode, existing_video)
        return {
            "shortcode": shortcode,
            "video_url": f"/uploads/reels/{existing_video.name}",
            "poster_url": f"/uploads/reels/{existing_poster.name}" if existing_poster else None,
        }

    # Use yt-dlp to download the reel video and thumbnail
    clean_url = f"https://www.instagram.com/reel/{shortcode}/"
    out_template = str(reels_dir / f"{shortcode}.%(ext)s")

    ydl_opts = {
        "outtmpl": out_template,
        "format": "best[ext=mp4]/best",
        "writethumbnail": True,
        "quiet": True,
        "no_warnings": True,
        "socket_timeout": 30,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=True)
            caption = info.get("description") or info.get("title") or ""
    except Exception as exc:
        logger.error("yt-dlp download failed for %s: %s", clean_url, exc)
        raise exc

    # Locate downloaded files
    video_path = None
    for ext in (".mp4", ".webm", ".mov"):
        candidate = reels_dir / f"{shortcode}{ext}"
        if candidate.exists() and candidate.stat().st_size > 0:
            video_path = candidate
            break

    poster_path = None
    for ext in (".jpg", ".webp", ".png", ".jpeg"):
        candidate = reels_dir / f"{shortcode}{ext}"
        if candidate.exists() and candidate.stat().st_size > 0:
            poster_path = candidate
            break

    return {
        "shortcode": shortcode,
        "video_url": f"/uploads/reels/{video_path.name}" if video_path else None,
        "poster_url": f"/uploads/reels/{poster_path.name}" if poster_path else None,
        "caption": caption[:300] if caption else None,
        "title": (info.get("title") or "")[:200] if info else None,
    }
