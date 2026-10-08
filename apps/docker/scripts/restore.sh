#!/bin/sh
set -eu

case "${1:-}" in
  dev)  CONTAINER=gym-tracker-dev-sql ;;
  prod) CONTAINER=gym-tracker-sql ;;
  *)
    echo "Uso: sh restore.sh <dev|prod> [archivo.sql]" >&2
    echo "  Llena la BD de dev o prod con un backup (REEMPLAZA los datos actuales)." >&2
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

echo "RESTORE en $TARGET (contenedor $CONTAINER)"
echo "Backup:  $BACKUP"
echo "Esto BORRA y reemplaza User, Exercise, Program, Routine, RoutineItem y Workout."
printf "Escribe 'si' para continuar: "
read -r CONFIRM
[ "$CONFIRM" = "si" ] || { echo "Cancelado."; exit 1; }

{
  echo 'TRUNCATE "Workout", "RoutineItem", "Routine", "Program", "Exercise", "User" CASCADE;'
  echo 'SET session_replication_role = replica;'
  cat "$BACKUP"
} | docker exec -i "$CONTAINER" sh -c 'psql -q -o /dev/null -U "$POSTGRES_USER" -d "$POSTGRES_DB" --single-transaction -v ON_ERROR_STOP=1 -f -'

echo "Restore completo en $TARGET."
