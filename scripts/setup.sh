#!/usr/bin/env bash
# Ananta Graphics - project setup (Linux / macOS / VPS)
#
#   ./scripts/setup.sh           # development setup
#   ./scripts/setup.sh --prod    # server setup (APP_ENV=production; builds happen in run.sh prod)
#
# Safe to re-run: creates only what is missing, re-installs dependencies, applies new migrations.
# Override the interpreter with PYTHON=/usr/bin/python3.12 ./scripts/setup.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
VENV_PY="$BACKEND/venv/bin/python"
PYTHON="${PYTHON:-python3}"
MODE="dev"
[[ "${1:-}" == "--prod" ]] && MODE="prod"

info() { printf '\033[1;34m[setup]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m  %s\n' "$*"; }
fail() { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

info "Ananta Graphics setup - mode: $MODE, root: $ROOT"

# ---------------------------------------------------------------- 1. prerequisites
info "[1/6] Checking prerequisites"
command -v "$PYTHON" >/dev/null || fail "$PYTHON not found (Ubuntu: apt install python3 python3-venv python3-pip)"
command -v node      >/dev/null || fail "node not found (install Node.js 20+)"
command -v npm       >/dev/null || fail "npm not found"

"$PYTHON" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)' \
  || fail "Python 3.11+ required (found $("$PYTHON" --version 2>&1))"
"$PYTHON" -c 'import venv, ensurepip' 2>/dev/null || fail "python venv module missing (Ubuntu: apt install python3-venv)"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
(( NODE_MAJOR >= 20 )) || fail "Node.js 20+ required (found $(node -v))"
command -v psql >/dev/null || warn "psql not found - fine if PostgreSQL runs elsewhere, otherwise install it"

# ---------------------------------------------------------------- 2. backend
info "[2/6] Backend virtualenv + Python packages"
cd "$BACKEND"
[[ -x "$VENV_PY" ]] || "$PYTHON" -m venv venv
"$VENV_PY" -m pip install --upgrade pip -q --disable-pip-version-check
if [[ "$MODE" == "prod" ]]; then
  "$VENV_PY" -m pip install -r requirements.txt -q --disable-pip-version-check
else
  "$VENV_PY" -m pip install -r requirements-dev.txt -q --disable-pip-version-check
fi
mkdir -p uploads

# ---------------------------------------------------------------- 3. env files
info "[3/6] Env files (secrets are generated once and never overwritten)"
if [[ "$MODE" == "prod" ]]; then "$VENV_PY" -m app.cli init-env --prod; else "$VENV_PY" -m app.cli init-env; fi

# ---------------------------------------------------------------- 4. node apps
npm_install() {
  local dir="$1"
  cd "$dir"
  if [[ -f package-lock.json ]]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
}
info "[4/6] Node packages (tooling, website, CMS)"
npm_install "$ROOT"
npm_install "$ROOT/frontend"
npm_install "$ROOT/cms"

# ---------------------------------------------------------------- 5. database
info "[5/6] Database: create if missing, migrate, seed"
cd "$BACKEND"
DB_OK=1
"$VENV_PY" -m app.cli create-db || DB_OK=0
if (( DB_OK )) && ./venv/bin/alembic upgrade head; then
  "$VENV_PY" -m app.seed
else
  DB_OK=0
  warn "Database step skipped - check DATABASE_URL in backend/.env and that PostgreSQL is running,"
  warn "then re-run this script (or: cd backend && ./venv/bin/alembic upgrade head && ./venv/bin/python -m app.seed)"
fi

# ---------------------------------------------------------------- 6. finish
info "[6/6] Making scripts executable"
chmod +x "$ROOT/scripts/"*.sh

cat <<EOF

Setup complete ($MODE)$( (( DB_OK )) || echo ' - database still needs attention, see warnings above').
  Create a CMS login : cd backend && ./venv/bin/python -m app.cli create-admin --email you@example.com
  Start dev servers  : ./scripts/run.sh
  Start production   : ./scripts/run.sh prod
EOF
