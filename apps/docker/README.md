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
| `web` | `http://localhost:3000` y a través del tunnel |
| `api` | privado en la red `gym-tracker-network` (`http://api:4000`) |
| `postgres` | privado en la red (`postgres:5432`, publicado a `localhost:5432`) |
| `cloudflared` | sin puerto; alcanza a `web` por la red interna |

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

> No levantes prod local y dev a la vez: ambos publican el puerto `5432` y chocarán.

## Resetear la base de datos

El `-v` elimina el volumen y con él **todos los datos**:

```bash
# prod local
docker compose down -v

# dev
docker compose -f docker-compose.dev.yml down -v
```
