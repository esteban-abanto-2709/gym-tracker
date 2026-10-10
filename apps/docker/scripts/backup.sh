#!/bin/sh
set -eu

CONTAINER="${CONTAINER:-gym-tracker-sql}"
OUTDIR="${1:-$(cd "$(dirname "$0")/.." && pwd)/backups}"
FILE="$OUTDIR/gym-prod_$(date -u +%Y-%m-%d_%H%M%S).sql"

mkdir -p "$OUTDIR"
docker exec "$CONTAINER" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges' > "$FILE.tmp"
mv "$FILE.tmp" "$FILE"
echo "$FILE"
