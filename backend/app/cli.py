"""Management commands (run from backend/).

    python -m app.cli init-env [--prod]            # create/complete backend/.env, frontend/.env.local, cms/.env.local
    python -m app.cli create-db                    # create the DATABASE_URL database if it doesn't exist
    python -m app.cli create-admin --email you@example.com [--password ...] [--name ...]
    python -m app.cli send-test-email --to you@example.com   # check the SMTP_* settings

init-env runs before dependencies or a database exist, so it only uses the standard library;
the other commands import the app lazily.
"""
import argparse
import getpass
import re
import secrets
import shutil
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BACKEND_DIR.parent


# ------------------------------------------------------------------ env files
def _env_get(text: str, key: str) -> str | None:
    match = re.search(rf"^{re.escape(key)}=(.*)$", text, re.MULTILINE)
    return match.group(1).strip() if match else None


def _env_set(text: str, key: str, value: str) -> str:
    line = f"{key}={value}"
    pattern = re.compile(rf"^{re.escape(key)}=.*$", re.MULTILINE)
    if pattern.search(text):
        return pattern.sub(lambda _: line, text)
    return text.rstrip("\n") + f"\n{line}\n"


def _ensure_file(target: Path, example: Path) -> bool:
    """Copy example -> target if target is missing. Returns True when created."""
    if target.exists() or not example.exists():
        return False
    shutil.copyfile(example, target)
    return True


def init_env(prod: bool) -> None:
    backend_env = BACKEND_DIR / ".env"
    if _ensure_file(backend_env, BACKEND_DIR / ".env.example"):
        print("[warn] Created backend/.env - check DATABASE_URL" + (", CORS origins and site URLs" if prod else ""))

    text = backend_env.read_text(encoding="utf-8")
    if (_env_get(text, "SECRET_KEY") or "change-me") == "change-me":
        text = _env_set(text, "SECRET_KEY", secrets.token_urlsafe(64))
    if not _env_get(text, "REVALIDATE_SECRET"):
        text = _env_set(text, "REVALIDATE_SECRET", secrets.token_urlsafe(32))
    if prod:
        text = _env_set(text, "APP_ENV", "production")
    backend_env.write_text(text, encoding="utf-8")
    revalidate_secret = _env_get(text, "REVALIDATE_SECRET")

    for app in ("frontend", "cms"):
        target = ROOT_DIR / app / ".env.local"
        if _ensure_file(target, ROOT_DIR / app / ".env.example"):
            print(f"[warn] Created {app}/.env.local - review the URLs" + (" (baked in at build time)" if prod else ""))
        if app == "frontend" and target.exists():
            app_text = target.read_text(encoding="utf-8")
            # The website must share the backend's secret, or CMS edits can't refresh its cache
            if _env_get(app_text, "REVALIDATE_SECRET") != revalidate_secret:
                target.write_text(_env_set(app_text, "REVALIDATE_SECRET", revalidate_secret), encoding="utf-8")
    print("Env files ready.")


# ------------------------------------------------------------------ database
def create_db() -> None:
    from sqlalchemy import create_engine, text
    from sqlalchemy.engine import make_url

    from app.core.config import settings

    url = make_url(settings.DATABASE_URL)
    name = url.database
    engine = create_engine(url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    try:
        with engine.connect() as conn:
            exists = conn.scalar(text("SELECT 1 FROM pg_database WHERE datname = :n"), {"n": name})
            if exists:
                print(f"Database '{name}' already exists.")
                return
            conn.execute(text(f'CREATE DATABASE "{name.replace(chr(34), "")}"'))
            print(f"Created database '{name}'.")
    except Exception as exc:  # connection refused, bad password, missing CREATEDB right...
        sys.exit(f"[error] Could not create database '{name}': {exc.__class__.__name__}: {str(exc).splitlines()[0]}")
    finally:
        engine.dispose()


# ------------------------------------------------------------------ admins
def create_admin(email: str, password: str, name: str) -> None:
    from sqlalchemy import select

    from app.core.database import SessionLocal
    from app.core.security import hash_password
    from app.models import AdminUser

    email = email.strip().lower()
    with SessionLocal() as db:
        admin = db.scalar(select(AdminUser).where(AdminUser.email == email))
        if admin:
            admin.password_hash = hash_password(password)
            admin.is_active = True
            print(f"Updated password for existing admin {email}")
        else:
            db.add(AdminUser(email=email, full_name=name, password_hash=hash_password(password), role="superadmin"))
            print(f"Created superadmin {email}")
        db.commit()


def send_test_email(to: str) -> None:
    from app.services import mailer

    s = mailer.status()
    print(f"SMTP {s['host']}:{s['port']} (SSL {'on' if s['ssl'] else 'off'}) as {s['sender']}")
    print(f"Enquiry alerts go to: {', '.join(s['recipients']) or '(nobody - set ENQUIRY_NOTIFY_TO)'}")
    try:
        mailer.deliver([to], "Ananta Graphics: test email", "Test email from `python -m app.cli send-test-email`.")
    except mailer.EmailError as exc:
        sys.exit(f"[error] {exc}")
    print(f"Sent a test email to {to}.")


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("init-env", help="Create missing env files and generate secrets")
    p.add_argument("--prod", action="store_true", help="Set APP_ENV=production")

    sub.add_parser("create-db", help="Create the database named in DATABASE_URL if missing")

    p = sub.add_parser("create-admin", help="Create or reset a superadmin user")
    p.add_argument("--email", required=True)
    p.add_argument("--password", help="Prompted if omitted")
    p.add_argument("--name", default="Administrator")

    p = sub.add_parser("send-test-email", help="Check the SMTP settings by sending one email")
    p.add_argument("--to", required=True)

    args = parser.parse_args()
    if args.command == "send-test-email":
        send_test_email(args.to)
    elif args.command == "init-env":
        init_env(args.prod)
    elif args.command == "create-db":
        create_db()
    elif args.command == "create-admin":
        password = args.password or getpass.getpass("Password: ")
        if len(password) < 8:
            sys.exit("Password must be at least 8 characters")
        create_admin(args.email, password, args.name)


if __name__ == "__main__":
    main()
