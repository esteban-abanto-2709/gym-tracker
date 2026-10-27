#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

f=$(sh scripts/backup.sh)
echo "pre-deploy backup: $f"
cd prod
docker compose pull api web
if ! docker compose up -d --wait --wait-timeout 180; then
  docker compose ps
  docker compose logs --tail 50 api web
  exit 1
fi
docker image prune -f
docker compose ps
