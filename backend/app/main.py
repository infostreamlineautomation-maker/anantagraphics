"""Public website API (port 8000). Read-only content + form submissions."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.limiter import limiter
from app.routers import health
from app.routers.public import content, forms

app = FastAPI(
    title=f"{settings.APP_NAME} API",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

settings.upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_path), name="uploads")

app.include_router(health.router)
app.include_router(content.router)
app.include_router(forms.router)


@app.on_event("startup")
def on_startup():
    from app.core.database import SessionLocal
    from app.seed import sync_client_projects
    from app.services.revalidate import revalidate_site
    try:
        with SessionLocal() as db:
            sync_client_projects(db)
        revalidate_site("work", "projects", "home")
    except Exception as e:
        import logging
        logging.getLogger("uvicorn.error").error(f"Startup project sync failed: {e}")


@app.get("/")
def root():
    return {"service": "public-api", "app": settings.APP_NAME}


@app.get("/revalidate-cache")
def trigger_reval():
    import urllib.request, json
    from app.core.config import settings
    url = settings.REVALIDATE_URL.replace("127.0.0.1", "localhost")
    body = json.dumps({"tags": ["work", "projects", "home", "services"]}).encode()
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json", "x-revalidate-secret": settings.REVALIDATE_SECRET},
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return {"status": resp.status, "body": resp.read().decode()}
    except Exception as e:
        return {"error": str(e), "url": url, "has_secret": bool(settings.REVALIDATE_SECRET)}
