#!/usr/bin/env bash
# Ananta Graphics - run the stack (Linux / macOS / VPS)
#
#   ./scripts/run.sh            # dev: all 4 services with hot reload; Ctrl+C stops everything
#   ./scripts/run.sh prod       # production: migrate + seed, start APIs, build website + CMS, run all under PM2
#                               # (SKIP_BUILD=1 ./scripts/run.sh prod restarts without rebuilding)
#   ./scripts/run.sh stop       # stop the PM2 processes
#   ./scripts/run.sh status     # PM2 status
#   ./scripts/run.sh logs       # tail PM2 logs
#
# Ports (override via env): WEB_PORT=3000 CMS_PORT=3001 API_PORT=8000 ADMIN_API_PORT=8001
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
ECOSYSTEM="$ROOT/deploy/ecosystem.config.js"

export WEB_PORT="${WEB_PORT:-3000}"
export CMS_PORT="${CMS_PORT:-3001}"
export API_PORT="${API_PORT:-8000}"
export ADMIN_API_PORT="${ADMIN_API_PORT:-8001}"
PORTS=("$API_PORT" "$ADMIN_API_PORT" "$WEB_PORT" "$CMS_PORT")
STOP_TIMEOUT="${STOP_TIMEOUT:-10}"   # seconds to wait for a clean exit before force-killing

info() { printf '\033[1;34m[run]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

require_setup() {
  [[ -x "$BACKEND/venv/bin/python" ]] || fail "Backend venv missing - run ./scripts/setup.sh first"
  [[ -d "$ROOT/frontend/node_modules" && -d "$ROOT/cms/node_modules" ]] || fail "node_modules missing - run ./scripts/setup.sh first"
}

require_pm2() {
  command -v pm2 >/dev/null || fail "pm2 not found (sudo npm install -g pm2)"
}

# PIDs listening on a TCP port (empty if free, or if neither lsof nor ss is available)
port_pids() {
  if command -v lsof >/dev/null; then
    lsof -nP -tiTCP:"$1" -sTCP:LISTEN 2>/dev/null | sort -u
  elif command -v ss >/dev/null; then
    ss -ltnpH "sport = :$1" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2 | sort -u
  fi
}

# Refuse to start on a busy port; offer to stop a leftover process when run interactively
check_ports() {
  local port pids answer
  for port in "${PORTS[@]}"; do
    pids="$(port_pids "$port" | tr '\n' ' ')"
    [[ -z "${pids// /}" ]] && continue
    warn "Port $port is already in use by: $(ps -o pid=,comm= -p ${pids// /,} 2>/dev/null | xargs)"
    if [[ -t 0 ]]; then
      read -r -p "Stop it and continue? [y/N] " answer
      if [[ "$answer" =~ ^[Yy]$ ]]; then
        kill -TERM $pids 2>/dev/null; sleep 2; kill -KILL $pids 2>/dev/null
        continue
      fi
    fi
    fail "Free port $port or use other ports, e.g. WEB_PORT=3100 CMS_PORT=3101 ./scripts/run.sh"
  done
}

# ---------------------------------------------------------------- dev
run_dev() {
  require_setup
  check_ports

  # Job control gives every service its own process group, so shutdown can signal the whole
  # tree (Next.js workers, uvicorn reloader + worker) - even children that were re-parented.
  set -m
  # Globals, not locals: the EXIT trap runs after this function has returned
  names=() pids=() stopping=0 force=0

  start() {
    local name="$1" color="$2" dir="$3"; shift 3
    local tag; tag="$(printf '\033[%sm%-9s|\033[0m' "$color" "$name")"
    # The log prefixer ignores Ctrl+C so services can still print while they shut down
    ( cd "$dir" && exec "$@" ) < /dev/null > >(trap '' INT; exec awk -v t="$tag" '{ print t " " $0; fflush() }') 2>&1 &
    names+=("$name"); pids+=("$!")
  }

  group_alive() { kill -0 -- "-$1" 2>/dev/null; }

  shutdown() {
    (( stopping )) && return
    stopping=1
    trap 'force=1' INT TERM
    echo
    info "Stopping all services (press Ctrl+C again to force)..."
    local pid i
    for pid in "${pids[@]}"; do kill -TERM -- "-$pid" 2>/dev/null; done

    for (( i = 0; i < STOP_TIMEOUT * 4; i++ )); do
      local alive=0
      for pid in "${pids[@]}"; do group_alive "$pid" && alive=1; done
      (( alive && !force )) || break
      sleep 0.25
    done
    for pid in "${pids[@]}"; do
      group_alive "$pid" && { warn "Force-killing process group $pid"; kill -KILL -- "-$pid" 2>/dev/null; }
    done

    # Safety net: anything still holding our ports was started by this run (they were free at start)
    local port leftover
    for port in "${PORTS[@]}"; do
      leftover="$(port_pids "$port" | tr '\n' ' ')"
      [[ -n "${leftover// /}" ]] && { warn "Killing leftover process on port $port"; kill -KILL $leftover 2>/dev/null; }
    done
    wait 2>/dev/null
    info "All services stopped."
  }
  trap 'shutdown; exit 0' INT TERM HUP
  trap 'shutdown' EXIT

  info "Website   http://localhost:$WEB_PORT"
  info "CMS       http://localhost:$CMS_PORT"
  info "API       http://localhost:$API_PORT/docs"
  info "Admin API http://localhost:$ADMIN_API_PORT/docs"
  info "Press Ctrl+C to stop everything."
  echo

  local uv="$BACKEND/venv/bin/uvicorn"
  start "API"       "34" "$BACKEND"       "$uv" app.main:app       --reload --reload-dir app --port "$API_PORT"
  start "ADMIN_API" "35" "$BACKEND"       "$uv" app.admin_main:app --reload --reload-dir app --port "$ADMIN_API_PORT"
  start "WEB"       "32" "$ROOT/frontend" npm run dev -- -p "$WEB_PORT"
  start "CMS"       "33" "$ROOT/cms"      npm run dev -- -p "$CMS_PORT"

  # If any service exits on its own (crash, port clash), take the rest down too
  local i
  while sleep 1; do
    for i in "${!pids[@]}"; do
      if ! kill -0 "${pids[$i]}" 2>/dev/null; then
        warn "${names[$i]} exited - stopping the other services"
        exit 1
      fi
    done
  done
}

# ---------------------------------------------------------------- prod (PM2)
wait_for() {
  local url="$1" tries=30
  until curl -fsS "$url" >/dev/null 2>&1; do
    (( --tries )) || fail "Timed out waiting for $url (check: pm2 logs)"
    sleep 1
  done
}

run_prod() {
  set -e
  require_setup
  require_pm2
  command -v curl >/dev/null || fail "curl not found (apt install curl)"

  info "Applying database migrations and seeding missing content..."
  ( cd "$BACKEND" && ./venv/bin/alembic upgrade head && ./venv/bin/python -m app.seed )

  # The website prerenders pages from the API at build time, so the APIs start first
  info "Starting APIs..."
  pm2 startOrReload "$ECOSYSTEM" --only ag-api,ag-admin-api --update-env
  wait_for "http://127.0.0.1:$API_PORT/health"
  wait_for "http://127.0.0.1:$ADMIN_API_PORT/health"

  if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
    info "Building website and CMS..."
    ( cd "$ROOT/frontend" && npm run build )
    ( cd "$ROOT/cms" && npm run build )
  fi

  pm2 startOrReload "$ECOSYSTEM" --update-env
  pm2 save
  pm2 status
  echo
  info "Tip: run 'pm2 startup' once so PM2 restarts the apps after a server reboot."
}

case "${1:-dev}" in
  dev)    run_dev ;;
  prod)   run_prod ;;
  stop)   require_pm2; pm2 stop "$ECOSYSTEM" ;;
  status) require_pm2; pm2 status ;;
  logs)   require_pm2; pm2 logs ;;
  *)      fail "Unknown command '$1' (use: dev | prod | stop | status | logs)" ;;
esac
