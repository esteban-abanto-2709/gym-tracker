#!/bin/sh
set -eu

case "${1:-}" in
  dev)  CONTAINER=gym-tracker-dev-sql; API=gym-tracker-dev-api ;;
  prod) CONTAINER=gym-tracker-sql;     API=gym-tracker-api ;;
  *)
    echo "Usage: sh restore.sh <dev|prod> [file.sql]" >&2
    echo "  Leaves the dev or prod DB exactly as in the backup (REPLACES the whole database)." >&2
    exit 1
    ;;
esac
TARGET=$1
BACKUP=${2:-}

if [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null)" != "true" ]; then
  echo "[ERROR] Container $CONTAINER ($TARGET) is not running. Start it first." >&2
  exit 1
fi

if [ -z "$BACKUP" ]; then
  BACKUP=$(ls -t "$(cd "$(dirname "$0")/.." && pwd)"/backups/gym-prod_*.sql 2>/dev/null | head -n 1)
fi
if [ -z "$BACKUP" ] || [ ! -f "$BACKUP" ]; then
  echo "[ERROR] No backup found: create one with backup.sh or pass its path as the 2nd argument." >&2
  exit 1
fi
if ! grep -q '^CREATE TABLE public._prisma_migrations ' "$BACKUP"; then
  echo "[ERROR] $BACKUP is not a full backup (it's data-only, from before the format change)." >&2
  echo "  Restore it with the previous version of restore.sh (see apps/docker/README.md)." >&2
  exit 1
fi

echo "RESTORE on $TARGET (container $CONTAINER)"
echo "Backup:  $BACKUP"
echo "This DELETES the whole database and leaves it exactly as in the backup."
printf "Type 'yes' to continue: "
read -r CONFIRM
[ "$CONFIRM" = "yes" ] || { echo "Cancelled."; exit 1; }

if [ "$(docker inspect -f '{{.State.Running}}' "$API" 2>/dev/null)" = "true" ]; then
  docker stop "$API" > /dev/null
  trap 'docker start "$API" > /dev/null && echo "API started: it applies pending migrations (docker logs $API)."' EXIT
fi

{
  echo 'SET client_min_messages = warning;'
  echo 'DROP SCHEMA public CASCADE;'
  echo 'CREATE SCHEMA public AUTHORIZATION pg_database_owner;'
  echo 'GRANT USAGE ON SCHEMA public TO PUBLIC;'
  cat "$BACKUP"
} | docker exec -i "$CONTAINER" sh -c 'psql -q -o /dev/null -U "$POSTGRES_USER" -d "$POSTGRES_DB" --single-transaction -v ON_ERROR_STOP=1 -f -'

echo "Restore complete on $TARGET."
