#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

f=$(sh scripts/backup.sh)
echo "backup previo: $f"
cd prod
docker compose pull api web
docker compose up -d
docker image prune -f
docker compose ps
