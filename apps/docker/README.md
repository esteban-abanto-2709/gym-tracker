# Docker

Orquestación del stack con Docker Compose. Hay dos escenarios:

- **Prod local** (`docker-compose.yml`) — todo en contenedores: `postgres` + `api` + `web` + `cloudflared` (Cloudflare Tunnel). Es el despliegue real autohospedado.
- **Dev** (`docker-compose.dev.yml`) — solo un Postgres aislado. La API y la web corren en tu máquina con `npm run start:dev` / `pnpm dev` apuntando a ese Postgres.

> Ejecuta todos los comandos **desde `apps/docker/`** (es donde vive el `.env`).

## Primer arranque

```bash
cp .env.example .env   # y rellena los valores
```

Variables en `.env`:

| Variable | Para qué |
|----------|----------|
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | credenciales de Postgres |
| `DATABASE_URL` / `DIRECT_URL` | conexión de la API a Postgres (ambas a la red interna) |
| `FRONTEND_URL` | origen permitido por CORS en la API |
| `APP_TIMEZONE` | zona horaria para agrupar workouts por día local |
| `TUNNEL_TOKEN` | token del Cloudflare Tunnel (vacío si usas quick tunnel) |

## Prod local (stack completo)

```bash
docker compose up --build       # levanta postgres + api + web + cloudflared
docker compose up -d --build    # igual, en segundo plano
docker compose logs -f cloudflared   # ver la URL pública del tunnel
docker compose down             # detener (conserva los datos)
docker compose down -v          # detener y BORRAR el volumen postgres_data
```

Servicios:

| Servicio | Acceso |
|----------|--------|
| `web` | **solo** a través del tunnel (no publica puerto en el host) |
| `api` | privado en la red `gym-tracker-network` (`http://api:4000`) |
| `postgres` | privado en la red (`postgres:5432`, **sin** publicar al host) |
| `cloudflared` | sin puerto; alcanza a `web` por la red interna |

> Por seguridad, prod no publica ningún puerto al host: `web` solo se alcanza por
> el Cloudflare Tunnel y `postgres` solo desde dentro de la red. El único puerto
> `5432` publicado al host es el de **dev** (`docker-compose.dev.yml`).

### Cloudflare Tunnel

Hoy se usa un **quick tunnel** (`command: tunnel --no-autoupdate --url http://web:3000`): genera una URL aleatoria de `trycloudflare.com` que **cambia en cada reinicio** y no necesita `TUNNEL_TOKEN`. La URL aparece en los logs de `cloudflared`.

Para una URL/dominio fijo hay que pasar a un *named tunnel*: rellenar `TUNNEL_TOKEN` en `.env` y usar `command: tunnel --no-autoupdate run` (requiere un dominio configurado en Cloudflare). Pendiente.

## Dev (solo la base de datos)

```bash
docker compose -f docker-compose.dev.yml up -d   # levanta solo postgres-dev
docker compose -f docker-compose.dev.yml down    # detener (conserva los datos)
docker compose -f docker-compose.dev.yml down -v # detener y resetear la BD de dev
```

Luego, en tu máquina, apunta `apps/api/.env` a `localhost:5432` y corre la API y la web nativas:

```bash
# apps/api/
npx prisma migrate dev
npm run start:dev

# apps/web/
pnpm dev
```

> Solo **dev** publica el `5432` al host; prod ya no. Esto es a propósito: al
> desarrollar siempre apuntas a `localhost:5432`, así que si tienes el stack de
> **prod** levantado (en vez de dev) y corres `prisma migrate dev` o la API local,
> la conexión a `localhost:5432` **falla** — la señal de que levantaste el Docker
> equivocado. Para desarrollar, usa pnpm/npm en local contra el Postgres de dev,
> nunca el contenedor de prod.

## Backups de prod

Genera un dump de **solo datos** (tablas `Exercise` y `Workout`) de la BD de prod
en un solo comando. El archivo cae en `apps/docker/backups/` (ignorada por git)
con nombre `gym-prod_YYYY-MM-DD_HHmmss.sql`.

```cmd
backup-prod.cmd
```

Es un script batch puro de Windows (`.cmd`, solo cmd.exe — no corre en Linux/mac).
Lee las credenciales de `.env`, corre `pg_dump` dentro del contenedor
`gym-tracker-sql` (misma versión que el servidor, sin líos de compatibilidad) y
copia el archivo al host. Para guardar en otra carpeta, pásala como primer argumento:

```cmd
backup-prod.cmd "D:\mis-backups"
```

### Requisitos para que el comando funcione

- **Docker corriendo** y el contenedor `gym-tracker-sql` **levantado** (el `pg_dump`
  se ejecuta dentro de ese contenedor, no en tu máquina). Si no está, el script
  se detiene con un aviso. Levanta prod con `docker compose up -d`.
- **`.env` presente** en `apps/docker/` con `POSTGRES_USER`, `POSTGRES_PASSWORD`
  y `POSTGRES_DB` (de ahí saca las credenciales).
- Es un `.cmd` (cmd.exe). No necesitas `pg_dump` en el host: vive dentro del
  contenedor. Tampoco depende de PowerShell.

### ¿Y si cambia el schema de la base de datos?

El script dumpea explícitamente las tablas `Exercise` y `Workout` (líneas `-t` en
`backup-prod.cmd`). Según el cambio:

| Cambio en el schema | ¿Hay que tocar el script? |
|---------------------|---------------------------|
| Agregar/quitar columnas en `Exercise` o `Workout` | **No** — `--data-only` toma las columnas que existan al momento del dump. |
| Agregar una tabla nueva (p. ej. rutinas v1.5, usuarios v2.0) | **Sí** — añade otra línea `-t 'public."NuevaTabla"'` o quedará fuera del backup. |
| Renombrar una tabla | **Sí** — actualiza el patrón `-t` correspondiente. |

> El backup es **solo datos**, no incluye el schema. Por eso al restaurar, la BD
> destino debe tener las tablas ya creadas por las migraciones de Prisma.

## Restaurar un backup (llenar dev o prod)

Carga un backup en la BD que elijas. **Reemplaza** los datos: hace `TRUNCATE` de
`Exercise`/`Workout` y luego carga el backup.

```cmd
restore.cmd dev          :: llena dev con el backup mas reciente de backups/
restore.cmd prod         :: idem, sobre prod
restore.cmd dev "D:\mis-backups\gym-prod_2026-06-14_120000.sql"   :: archivo concreto
```

- Mapea el destino al contenedor: `dev` → `gym-tracker-dev-sql`, `prod` → `gym-tracker-sql`.
- Si no pasas archivo, toma el `gym-prod_*.sql` más reciente de `backups/`.
- **Pide confirmación** (hay que escribir `si`) porque borra los datos actuales.
- El contenedor destino debe estar **corriendo** y sus tablas deben **existir ya**
  (creadas por las migraciones de Prisma). Si la BD está vacía, corre primero
  `prisma migrate dev` (dev) / `migrate deploy` (prod) y reintenta.

> El restore corre por `docker exec` (no depende de puertos publicados), así que
> funciona sobre el contenedor que tengas levantado, sea dev o prod.

## Resetear la base de datos

El `-v` elimina el volumen y con él **todos los datos**:

```bash
# prod local
docker compose down -v

# dev
docker compose -f docker-compose.dev.yml down -v
```
