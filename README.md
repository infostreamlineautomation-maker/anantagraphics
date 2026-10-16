# Ananta Graphics

Website + CMS. Next.js (website, CMS) · FastAPI · PostgreSQL · Alembic.

| Service    | URL (dev)                    |
|------------|------------------------------|
| Website    | http://localhost:3000        |
| CMS        | http://localhost:3001        |
| Public API | http://localhost:8000/docs   |
| Admin API  | http://localhost:8001/docs   |

## Quick start

Prerequisites: Python 3.11+, Node.js 20+, PostgreSQL running locally (setup creates the `ananta_graphics` database).

**Windows**
```bat
scripts\setup.bat
scripts\run.bat
```

**Linux / macOS**
```bash
./scripts/setup.sh
./scripts/run.sh
```

`setup` creates `backend/.env`, `frontend/.env.local` and `cms/.env.local` (secrets generated), installs
everything, creates the database and runs migrations. If the database step fails, fix `DATABASE_URL` in
`backend/.env` and run setup again — it is safe to re-run.

`run` starts all four services with hot reload. **Ctrl+C stops every process** (Next.js workers, uvicorn
reloaders) and frees the ports. If a port is already taken, it tells you by what and offers to stop it.

| Command                              | Does |
|--------------------------------------|------|
| `run.bat` / `run.sh`                 | Dev mode |
| `run.bat prod`                       | Windows: migrate, build both apps, serve in production mode (`set SKIP_BUILD=1` to reuse a build) |
| `run.sh prod` · `stop` · `status` · `logs` | Linux server: same under PM2 (see [deployment](docs/DEPLOYMENT.md)) |
| `setup.sh --prod`                    | Server setup (`APP_ENV=production`, no dev packages) |

Ports can be changed with `WEB_PORT`, `CMS_PORT`, `API_PORT`, `ADMIN_API_PORT`.

Create a CMS login:

```bash
cd backend && venv/bin/python -m app.cli create-admin --email you@example.com      # Windows: venv\Scripts\python
```

## Seed content

Setup loads the design's content (settings, page text, work categories, projects, services, client logos,
FAQs, and the images in `backend/uploads/figma/` as a media library). It only creates what's missing, so it
never overwrites CMS edits:

```bash
cd backend && venv/bin/python -m app.seed                    # add missing content
cd backend && venv/bin/python -m app.seed --reset-content    # restore seed text over CMS edits
```

## Tests

Backend tests run against a separate `<db>_test` database (created and dropped automatically):

```bash
cd backend
venv/bin/python -m pytest
venv/bin/ruff check app tests
```

## Database migrations

```bash
cd backend
venv/bin/alembic revision --autogenerate -m "describe change"   # after editing models (import new models in app/models/__init__.py)
venv/bin/alembic upgrade head
```

## Docs

- [Project plan](docs/PLAN.md)
- [Deployment](docs/DEPLOYMENT.md)
