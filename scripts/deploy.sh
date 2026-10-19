#!/usr/bin/env bash
# Ananta Graphics - Wrapper to invoke root deploy.sh
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec "$ROOT/deploy.sh" "$@"
