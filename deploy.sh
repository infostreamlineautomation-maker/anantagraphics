#!/usr/bin/env bash
# Ananta Graphics - Automated Production Deployment Script
#
# Usage:
#   ./deploy.sh            # Pull latest git changes, smart-detect changes, build & restart
#   ./deploy.sh --all      # Force-build and restart everything (Backend, Frontend, CMS, PM2)
#   ./deploy.sh --quick    # Pull and restart without rebuilding frontend/cms (backend-only updates)
#
set -euo pipefail

# ---------------------------------------------------------------- directories & config
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# If invoked from within scripts/ directory, set ROOT to parent
if [[ "$(basename "$ROOT")" == "scripts" ]]; then
  ROOT="$(cd "$ROOT/.." && pwd)"
fi

BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
CMS="$ROOT/cms"
ECOSYSTEM="$ROOT/deploy/ecosystem.config.js"
VENV_PY="$BACKEND/venv/bin/python"

export WEB_PORT="${WEB_PORT:-3100}"
export CMS_PORT="${CMS_PORT:-3101}"
export API_PORT="${API_PORT:-8100}"
export ADMIN_API_PORT="${ADMIN_API_PORT:-8101}"

# ANSI colors
info()  { printf '\033[1;34m[deploy]\033[0m %s\n' "$*"; }
ok()    { printf '\033[1;32m[ok]\033[0m     %s\n' "$*"; }
warn()  { printf '\033[1;33m[warn]\033[0m   %s\n' "$*"; }
fail()  { printf '\033[1;31m[error]\033[0m  %s\n' "$*" >&2; exit 1; }

START_TIME=$(date +%s)
FORCE_ALL=0
QUICK_MODE=0

for arg in "$@"; do
  case "$arg" in
    --all|-a|--force|-f) FORCE_ALL=1 ;;
    --quick|-q)          QUICK_MODE=1 ;;
    --help|-h)
      echo "Ananta Graphics VPS Deployment Tool"
      echo "Usage: ./deploy.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --all, -a     Force full rebuild & restart of all services"
      echo "  --quick, -q   Skip Next.js build; apply migrations and restart APIs"
      echo "  --help, -h    Show this help message"
      exit 0
      ;;
  esac
done

echo "=================================================================="
info "Starting deployment at $(date '+%Y-%m-%d %H:%M:%S')"
info "Target root: $ROOT"
echo "=================================================================="

# ---------------------------------------------------------------- 1. sanity checks
info "[1/7] Checking environment & toolchain..."
command -v git  >/dev/null || fail "git not found"
command -v node >/dev/null || fail "node not found"
command -v npm  >/dev/null || fail "npm not found"
command -v pm2  >/dev/null || fail "pm2 not found (run: sudo npm install -g pm2)"
command -v curl >/dev/null || fail "curl not found"

[[ -x "$VENV_PY" ]] || fail "Backend virtualenv not found at $VENV_PY (run ./scripts/setup.sh --prod first)"

# ---------------------------------------------------------------- 2. git pull & conflict auto-resolution
info "[2/7] Syncing repository with remote..."
cd "$ROOT"

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")"
OLD_REV="$(git rev-parse HEAD 2>/dev/null || echo "")"

# Auto-stash any local unstaged or tracking modifications (prevents "overwritten by merge" errors)
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  warn "Uncommitted local changes detected in working tree. Auto-stashing..."
  git stash --include-untracked -q || true
fi

info "Fetching latest changes from origin/$BRANCH..."
git fetch origin "$BRANCH" -q || warn "Could not fetch from remote (offline or network timeout). Continuing with local commit."

REMOTE_REV="$(git rev-parse "origin/$BRANCH" 2>/dev/null || echo "$OLD_REV")"

if [[ -n "$OLD_REV" && -n "$REMOTE_REV" && "$OLD_REV" != "$REMOTE_REV" ]]; then
  info "New commits detected ($OLD_REV..$REMOTE_REV). Merging..."
  git merge "origin/$BRANCH" -q
  NEW_REV="$(git rev-parse HEAD)"
else
  info "Repository is at commit ${OLD_REV:0:7}."
  NEW_REV="$OLD_REV"
fi

# ---------------------------------------------------------------- 3. detect changes
info "[3/7] Analyzing modified components..."
BACKEND_CHANGED=0
PIP_CHANGED=0
MIGRATIONS_CHANGED=0
FRONTEND_CHANGED=0
FRONTEND_PKG_CHANGED=0
CMS_CHANGED=0
CMS_PKG_CHANGED=0
NGINX_CHANGED=0
ECOSYSTEM_CHANGED=0

if (( FORCE_ALL )); then
  info "(--all flag detected: Rebuilding and restarting all components)"
  BACKEND_CHANGED=1
  PIP_CHANGED=1
  MIGRATIONS_CHANGED=1
  FRONTEND_CHANGED=1
  CMS_CHANGED=1
elif [[ "$OLD_REV" == "$NEW_REV" ]]; then
  # No new commits pulled: check if any build artifacts are missing
  [[ -d "$FRONTEND/.next" ]] || FRONTEND_CHANGED=1
  [[ -d "$CMS/.next" ]] || CMS_CHANGED=1
  # Default to restarting to guarantee fresh code is running
  BACKEND_CHANGED=1
  FRONTEND_CHANGED=1
else
  DIFF_FILES="$(git diff --name-only "$OLD_REV" "$NEW_REV")"
  echo "Files changed in update:"
  echo "$DIFF_FILES" | sed 's/^/   * /'

  grep -q "^backend/requirements" <<< "$DIFF_FILES" && PIP_CHANGED=1 || true
  grep -q "^backend/app/alembic"   <<< "$DIFF_FILES" && MIGRATIONS_CHANGED=1 || true
  grep -q "^backend/"              <<< "$DIFF_FILES" && BACKEND_CHANGED=1 || true
  grep -q "^frontend/package"      <<< "$DIFF_FILES" && FRONTEND_PKG_CHANGED=1 || true
  grep -q "^frontend/"             <<< "$DIFF_FILES" && FRONTEND_CHANGED=1 || true
  grep -q "^cms/package"           <<< "$DIFF_FILES" && CMS_PKG_CHANGED=1 || true
  grep -q "^cms/"                  <<< "$DIFF_FILES" && CMS_CHANGED=1 || true
  grep -q "^deploy/nginx"          <<< "$DIFF_FILES" && NGINX_CHANGED=1 || true
  grep -q "^deploy/ecosystem"      <<< "$DIFF_FILES" && ECOSYSTEM_CHANGED=1 || true
fi

(( QUICK_MODE )) && { FRONTEND_CHANGED=0; CMS_CHANGED=0; info "(--quick flag: skipping frontend & CMS builds)"; }

# ---------------------------------------------------------------- 4. backend updates
if (( BACKEND_CHANGED || MIGRATIONS_CHANGED || PIP_CHANGED )); then
  info "[4/7] Updating Backend & Database..."
  cd "$BACKEND"

  if (( PIP_CHANGED )); then
    info "  -> Installing Python dependencies..."
    "$VENV_PY" -m pip install -r requirements.txt -q --disable-pip-version-check
  fi

  info "  -> Running database migrations (alembic upgrade head)..."
  ./venv/bin/alembic upgrade head

  info "  -> Synchronizing seed data & CMS defaults..."
  ./venv/bin/python -m app.seed
  ok "Backend & Database updated."
else
  info "[4/7] Backend & Database unchanged (skipping)."
fi

# ---------------------------------------------------------------- 5. frontend & cms builds
if (( FRONTEND_CHANGED )); then
  info "[5/7] Updating Frontend Website..."
  cd "$FRONTEND"
  if (( FRONTEND_PKG_CHANGED )); then
    info "  -> Installing frontend dependencies..."
    npm install --no-audit --no-fund -q
  fi
  info "  -> Building Next.js production bundle..."
  npm run build
  ok "Frontend built successfully."
else
  info "[5/7] Frontend unchanged (skipping build)."
fi

if (( CMS_CHANGED )); then
  info "Updating CMS Admin Panel..."
  cd "$CMS"
  if (( CMS_PKG_CHANGED )); then
    info "  -> Installing CMS dependencies..."
    npm install --no-audit --no-fund -q
  fi
  info "  -> Building Next.js CMS bundle..."
  npm run build
  ok "CMS built successfully."
fi

# ---------------------------------------------------------------- 6. nginx reload
if (( NGINX_CHANGED )); then
  info "[6/7] Updating Nginx configuration..."
  if [[ -f /etc/nginx/sites-available/anantagraphics ]]; then
    if sudo nginx -t 2>/dev/null; then
      sudo systemctl reload nginx
      ok "Nginx reloaded."
    else
      warn "Nginx syntax test failed. Skipping reload."
    fi
  fi
else
  info "[6/7] Nginx configuration unchanged."
fi

# ---------------------------------------------------------------- 7. process restart (PM2)
info "[7/7] Restarting application processes under PM2..."
cd "$ROOT"

RESTART_TARGETS=()
if (( ECOSYSTEM_CHANGED || FORCE_ALL )); then
  pm2 startOrReload "$ECOSYSTEM" --update-env
elif pm2 describe ag-api >/dev/null 2>&1; then
  (( BACKEND_CHANGED ))  && RESTART_TARGETS+=("ag-api" "ag-admin-api")
  (( FRONTEND_CHANGED )) && RESTART_TARGETS+=("ag-web")
  (( CMS_CHANGED ))      && RESTART_TARGETS+=("ag-cms")

  if (( ${#RESTART_TARGETS[@]} > 0 )); then
    info "Restarting PM2 targets: ${RESTART_TARGETS[*]}..."
    pm2 restart "${RESTART_TARGETS[@]}" --update-env
  else
    info "Restarting PM2 services to guarantee fresh process state..."
    pm2 restart ag-api ag-web --update-env
  fi
else
  info "Starting all PM2 services from ecosystem config..."
  pm2 startOrReload "$ECOSYSTEM" --update-env
fi

pm2 save -q 2>/dev/null || true

# ---------------------------------------------------------------- health verification
info "Verifying service health..."
sleep 2

check_url() {
  local name="$1" url="$2"
  if curl -fsS "$url" >/dev/null 2>&1; then
    ok "$name is healthy ($url)"
  else
    warn "$name did not respond at $url (check: pm2 logs $name)"
  fi
}

check_url "ag-api"       "http://127.0.0.1:$API_PORT/health"
check_url "ag-admin-api" "http://127.0.0.1:$ADMIN_API_PORT/health"

ELAPSED=$(( $(date +%s) - START_TIME ))
echo
echo "=================================================================="
ok "Deployment complete in ${ELAPSED}s!"
echo "=================================================================="
pm2 status
