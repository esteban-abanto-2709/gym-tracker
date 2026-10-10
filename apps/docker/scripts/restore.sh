#!/bin/sh
set -eu

case "${1:-}" in
  dev)  CONTAINER=gym-tracker-dev-sql; API=gym-tracker-dev-api ;;
  prod) CONTAINER=gym-tracker-sql;     API=gym-tracker-api ;;
  *)
    echo "Uso: sh restore.sh <dev|prod> [archivo.sql]" >&2
    echo "  Deja la BD de dev o prod igual que en el backup (REEMPLAZA toda la base)." >&2
    exit 1
    ;;
esac
TARGET=$1
BACKUP=${2:-}

if [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null)" != "true" ]; then
  echo "[ERROR] El contenedor $CONTAINER ($TARGET) no esta corriendo. Levantalo primero." >&2
  exit 1
fi

if [ -z "$BACKUP" ]; then
  BACKUP=$(ls -t "$(cd "$(dirname "$0")/.." && pwd)"/backups/gym-prod_*.sql 2>/dev/null | head -n 1)
fi
if [ -z "$BACKUP" ] || [ ! -f "$BACKUP" ]; then
  echo "[ERROR] No hay backup: genera uno con backup.sh o pasa la ruta como 2do argumento." >&2
  exit 1
fi
if ! grep -q '^CREATE TABLE public._prisma_migrations ' "$BACKUP"; then
  echo "[ERROR] $BACKUP no es un backup completo (es de solo datos, anterior al cambio de formato)." >&2
  echo "  Restauralo con la version anterior de restore.sh (ver apps/docker/README.md)." >&2
  exit 1
fi

echo "RESTORE en $TARGET (contenedor $CONTAINER)"
echo "Backup:  $BACKUP"
echo "Esto BORRA toda la base y la deja igual que en el backup."
printf "Escribe 'si' para continuar: "
read -r CONFIRM
[ "$CONFIRM" = "si" ] || { echo "Cancelado."; exit 1; }

if [ "$(docker inspect -f '{{.State.Running}}' "$API" 2>/dev/null)" = "true" ]; then
  docker stop "$API" > /dev/null
  trap 'docker start "$API" > /dev/null && echo "API arrancada: aplica las migraciones pendientes (docker logs $API)."' EXIT
fi

{
  echo 'SET client_min_messages = warning;'
  echo 'DROP SCHEMA public CASCADE;'
  echo 'CREATE SCHEMA public AUTHORIZATION pg_database_owner;'
  echo 'GRANT USAGE ON SCHEMA public TO PUBLIC;'
  cat "$BACKUP"
} | docker exec -i "$CONTAINER" sh -c 'psql -q -o /dev/null -U "$POSTGRES_USER" -d "$POSTGRES_DB" --single-transaction -v ON_ERROR_STOP=1 -f -'

echo "Restore completo en $TARGET."
