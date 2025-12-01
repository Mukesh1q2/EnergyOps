#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.." || exit 1

# Ensure GHCR_NAMESPACE is set.
# It might be in .env.ghcr if deployed via the workflow, or set in environment.
if [ -f .env.ghcr ]; then
  export $(grep -v '^#' .env.ghcr | xargs)
fi

if [ -z "${GHCR_NAMESPACE:-}" ]; then
  echo "Error: GHCR_NAMESPACE is not set. Please set it or ensure .env.ghcr exists."
  exit 1
fi

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
docker image prune -f
