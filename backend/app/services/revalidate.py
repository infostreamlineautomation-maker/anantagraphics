import json
import logging
import urllib.request

from app.core.config import settings

log = logging.getLogger(__name__)


def revalidate_site(*tags: str) -> bool:
    """Ask the website to drop cached data for `tags` after a CMS change. Returns whether it worked.

    Best effort: runs as a background task, and a website that's down must not fail the edit.
    """
    if not settings.REVALIDATE_SECRET or not settings.REVALIDATE_URL or not tags:
        log.warning("Website revalidation is off: set REVALIDATE_URL and REVALIDATE_SECRET in backend/.env")
        return False
    body = json.dumps({"tags": sorted(set(tags))}).encode()
    req = urllib.request.Request(
        settings.REVALIDATE_URL,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json", "x-revalidate-secret": settings.REVALIDATE_SECRET},
    )
    try:
        with urllib.request.urlopen(req, timeout=5):
            return True
    except Exception as exc:
        log.warning("Website revalidation failed for %s at %s: %s", tags, settings.REVALIDATE_URL, exc)
        return False
