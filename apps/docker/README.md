# Docker

The whole stack (`postgres` + `api` + `web` + an optional Cloudflare tunnel)
runs with Docker Compose, from the same code in `apps/api` and `apps/web`.

## Quick start

```bash
cd apps/docker
cp .env.example .env
docker compose up -d --build
```

Open `http://localhost:3000` and create an account with email and password.
The `.env.example` values work as they are on your machine; no Google or
Cloudflare account needed.

## How it's laid out

One base file plus one file per environment, merged by Compose:

```
apps/docker/
├── compose.yaml           # what both environments share: services, healthchecks, network, volume
├── compose.override.yaml  # development: builds from source, publishes ports (loaded automatically)
├── compose.prod.yaml      # server: published images, no ports
├── .env.example           # template; works as is for development
├── .env                   # one per machine (ignored by git)
├── backups/               # database dumps (ignored by git)
└── scripts/
    ├── backup.sh
    ├── restore.sh
    └── update.sh          # what the CD runs on the server
```

- **On your machine** a plain `docker compose …` uses `compose.yaml` +
  `compose.override.yaml`: development. There's no way to start production by
  accident.
- **On the server** its `.env` has `COMPOSE_FILE=compose.yaml:compose.prod.yaml`,
  so every `docker compose …` typed there is production. `update.sh` sets the
  same files itself, so deploys don't depend on that line.

| | Development | Server |
|---|---|---|
| Project | `gym-tracker-dev` | `gym-tracker` |
| Images | built from `apps/api` and `apps/web` | `ghcr.io/esteban-abanto-2709/gym-tracker-{api,web}` |
| Ports on the host | `3000` web · `4000` api · `5432` postgres | none (only out through the tunnel) |
| Containers | `gym-tracker-dev-{sql,api,web,tunnel}` | `gym-tracker-{sql,api,web,tunnel}` |
| Data volume | `gym-tracker-dev_postgres_data_dev` | `gym-tracker_postgres_data` |
| Tunnel | only with `COMPOSE_PROFILES=tunnel` | always |

## Variables

| Variable | Purpose |
|----------|---------|
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Postgres credentials |
| `DATABASE_URL` / `DIRECT_URL` | the API's connection to Postgres (both on the internal network) |
| `FRONTEND_URL` | origin allowed by CORS in the API |
| `JWT_SECRET` | secret the sessions are signed with |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (API and the web's button); optional |
| `COMPOSE_PROFILES` | `tunnel` to start `cloudflared` in development |
| `TUNNEL_TOKEN` | Cloudflare Tunnel token |
| `COMPOSE_FILE` | server only: `compose.yaml:compose.prod.yaml` |

- **`POSTGRES_*`: don't change them after the first start.** Postgres only
  applies them when it creates the volume; if you change them later, the API
  can no longer connect to that database.
- **On a real server, `JWT_SECRET` is a long random string**, different from
  the development one, so a session from one environment never works in the
  other.

## Development

```bash
# from apps/docker/
docker compose up -d --build   # postgres + api + web (+ cloudflared with the tunnel profile)
docker compose down            # stop (keeps the data)
docker compose down -v         # stop and reset the development database
```

- Everything is open on the host: web on `http://localhost:3000`, API on
  `http://localhost:4000`, Postgres on `localhost:5432`.
- The API applies pending migrations on start, same as on the server.

### Database only (native development with hot reload)

```bash
# from apps/docker/
docker compose up -d postgres
```

Then point `apps/api/.env` to `localhost:5432` and run the API and the web
natively:

```bash
# apps/api/
pnpm exec prisma migrate dev
pnpm run start:dev

# apps/web/
pnpm dev
```

> The full stack takes ports `3000` and `4000`: don't keep it up while you run
> the API and the web natively. It's one or the other.

## Cloudflare Tunnel (optional)

The tunnel is only needed to reach your instance from outside your local
network (for example, from the gym, on your phone). In development it's off
until you ask for it:

```bash
# in apps/docker/.env
COMPOSE_PROFILES=tunnel
TUNNEL_TOKEN=<your token>
```

Create the tunnel in the Cloudflare dashboard (Tunnels section), add a route
(*published application*) from your domain to `http://web:3000`, and paste the
token it gives you. To try it without an account or domain, run a **quick
tunnel** instead: `docker compose run --rm cloudflared tunnel --no-autoupdate --url http://web:3000`
prints a random `trycloudflare.com` URL that changes on every restart.

- **Never the same `TUNNEL_TOKEN` on two machines.** With two connectors on the
  same tunnel, Cloudflare splits traffic randomly between them: sets logged in
  production could land in a development database without any warning. Use a
  second tunnel and subdomain (`dev.yourdomain`) for development.
- **Google login:** add each origin (`https://yourdomain`, `https://dev.yourdomain`,
  `http://localhost:3000`) to the authorized JavaScript origins of your Client
  ID; the same Client ID works for all of them.

## Server

The server runs the images published from `main`; it builds nothing. Its
`.env` lives at `apps/docker/.env` with the production values and the
`COMPOSE_FILE` line.

```bash
# from apps/docker/ on the server
docker compose ps
docker compose logs -f api
```

> **Images come from `main`.** On every push to `main`, the `cd.yml` workflow
> runs CI and, if it passes, builds `api` and `web` for ARM64 and publishes them
> to GHCR tagged `latest` and with the commit SHA. Then it tells the server to
> run:
>
> ```bash
> # from the repo root
> git pull --ff-only && sh apps/docker/scripts/update.sh
> ```
>
> `update.sh` backs up the database, pulls the new images, recreates the
> containers that changed (the API applies its migrations on start), waits up
> to 3 minutes for `api` and `web` to pass their healthcheck and removes the old
> images. If they don't end up healthy, it prints the status and the latest logs
> and exits with an error: the CD goes red and GitHub emails you. A failing
> migration stops the API (it doesn't start on a half-applied schema), so it
> also leaves the deploy red. The `git pull` goes first so the freshly pulled
> version of the script always runs.

**Rolling back** if a deploy goes red. The good SHA is the last green deploy's
(in GitHub Actions or with `git log` on the server):

- **No migration involved:** `git revert <commit>` and push to `main`; the CD
  deploys the previous version.
- **If a migration failed:** Prisma blocks the following ones (`P3009`) until
  the database is cleaned up, so the revert alone isn't enough. On the server,
  first go back to the previous images and then restore the backup `update.sh`
  made right before (the `pre-deploy backup:` line in the CD log). The order
  matters: `restore.sh` starts the API when it finishes, and it must start the
  old image.

  ```bash
  # from apps/docker/ on the server
  sha=<good-sha>
  for app in api web; do
    docker pull ghcr.io/esteban-abanto-2709/gym-tracker-$app:$sha
    docker tag ghcr.io/esteban-abanto-2709/gym-tracker-$app:$sha ghcr.io/esteban-abanto-2709/gym-tracker-$app:latest
  done
  sh scripts/restore.sh prod backups/gym-prod_<date>.sql
  docker compose up -d --wait --wait-timeout 180
  ```

  Then fix the migration (or revert the commit) before the next push.

> **Self-hosting your own server:** copy `.env.example` to `.env`, fill in real
> values and add the `COMPOSE_FILE` line. The published `web` image carries this
> project's Google Client ID; with your own Client ID, build the images yourself.

## Backups

Generates a **full** dump of the server's database in a single command:
schema, data and the `_prisma_migrations` table, with no table list. Whatever
exists in the database goes in on its own, so a migration never forces a change
to the script. The file lands in `apps/docker/backups/` named
`gym-prod_YYYY-MM-DD_HHmmss.sql` (UTC time).

```bash
# from apps/docker/, on Linux, mac or Git Bash on Windows
sh scripts/backup.sh
sh scripts/backup.sh /another/folder                 # save to another folder
CONTAINER=gym-tracker-dev-sql sh scripts/backup.sh   # dump development (testing)
```

It runs `pg_dump` inside the `gym-tracker-sql` container (same version as the
server, no compatibility trouble) with the credentials from the container's own
variables, so it reads no `.env` and doesn't need `pg_dump` on the host. It
writes a `.tmp` first and renames it when done: a failed dump never leaves a
file that looks good. When done it removes from that folder the `gym-prod_*.sql`
files older than 14 days, so dumps don't fill the server's disk: the long-term
copy is the one taken off the machine. On stdout it prints only the file's path,
to chain it with whatever copies it off the machine:

```bash
f=$(sh scripts/backup.sh) && echo "backup at $f"
```

- **On Windows** it needs an `sh`: Git Bash's works. The repo forces LF line
  endings on `.sh` files (`.gitattributes`); with CRLF, `sh` can't read them.
- **To run it daily** on a server, one line in the `crontab` of the user that
  runs Docker. `cron` starts with a minimal `PATH`: if the command that uploads
  the file doesn't live in `/usr/bin` or `/bin`, declare it in the crontab's
  header.

## Restoring a backup

Leaves the database you choose **exactly** as it was when the backup was taken:
it drops the whole `public` schema (tables, data, types and any table the
backup doesn't include) and loads the dump. It's a **full** rollback, not a
surgical one.

```bash
# from apps/docker/, on Linux, mac or Git Bash on Windows
sh scripts/restore.sh dev        # fills development with the latest backup in backups/
sh scripts/restore.sh prod       # same, on the server
sh scripts/restore.sh dev /another/folder/gym-prod_2026-06-14_120000.sql   # a specific file
```

- Maps the target to its containers: `dev` → `gym-tracker-dev-sql` and
  `gym-tracker-dev-api`, `prod` → `gym-tracker-sql` and `gym-tracker-api`. Like
  `backup.sh`, it takes the credentials from the container itself, without
  reading any `.env`.
- If you don't pass a file, it takes the latest `gym-prod_*.sql` from
  `apps/docker/backups/`.
- **Asks for confirmation** (you have to type `yes`) because it deletes the
  current database.
- **Stops the API** while restoring and starts it again when done (also if it
  fails). On start, the API runs `prisma migrate deploy`: if the backup predates
  some migration, it's applied on its own over the restored data. If the API was
  off, it stays off and the migrations are applied when you bring it up.
- Runs in **a single transaction**: if any line of the backup fails, everything
  is rolled back, the drop included, and the database stays as it was.
- Only goes **forward**: a backup taken with migrations the current code doesn't
  have can't be used with that code.

**Real data in development:** copy a server backup into `apps/docker/backups/`
on your machine, start the development database (`docker compose up -d postgres`)
and run `sh scripts/restore.sh dev`. If development is ahead (new migrations not
yet deployed), its API applies them on start over the restored data.

### Data-only backups (before TD-084)

Until TD-084 the backup was **data only** for a fixed list of tables. Those
files have no `CREATE TABLE` and `restore.sh` rejects them. To use one, on a
database with every migration applied, run the previous version of the script:

```bash
git show 5a2be58:apps/docker/scripts/restore.sh > /tmp/restore-data.sh
sh /tmp/restore-data.sh dev backups/gym-prod_2026-10-07_230155.sql
```

Backups from before columns were removed (RM-031, WL-012) also need the manual
steps documented in `git show 5a2be58:apps/docker/README.md`.
