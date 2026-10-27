# Docker

Stack orchestration with Docker Compose. There are **two environments**, each
in its own folder and with **its own database**:

| Folder | Purpose | Ports published to the host | Data volume |
|--------|---------|-----------------------------|-------------|
| `prod/` | the app you use every day | none (it only goes out through the tunnel) | `gym-tracker_postgres_data` |
| `dev/` | trying changes before they reach prod | `3000` web · `4000` api · `5432` postgres | `gym-tracker-dev_postgres_data_dev` |

Both bring up the same thing (`postgres` + `api` + `web` + `cloudflared`) from
the same code (`apps/api` and `apps/web`). `prod/` lives in the repository
because it's the real configuration the app runs with: there's no other place
it's deployed from.

```
apps/docker/
├── .env.example      # the ONLY template: copied to prod/.env and dev/.env
├── .gitignore        # ignores both folders' .env files and backups/
├── README.md
├── backups/          # prod dumps (ignored by git)
├── scripts/
│   ├── backup.sh
│   ├── restore.sh
│   └── update.sh
├── prod/
│   └── docker-compose.yml
└── dev/
    └── docker-compose.yml
```

> Every `docker compose` runs **from its folder** (`apps/docker/prod/` or
> `apps/docker/dev/`): that's where it reads its `.env`.

## First start

**`.env.example` serves both environments.** Prod and dev use exactly the same
variables, so there's a single template at the root of `apps/docker/`. Copy it
into the folder of each environment you'll use and fill in the values:

```bash
# from apps/docker/
cp .env.example prod/.env
cp .env.example dev/.env
```

Variables:

| Variable | Purpose |
|----------|---------|
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Postgres credentials |
| `DATABASE_URL` / `DIRECT_URL` | the API's connection to Postgres (both on the internal network) |
| `FRONTEND_URL` | origin allowed by CORS in the API |
| `JWT_SECRET` | secret the sessions are signed with |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (API and the web's button) |
| `TUNNEL_TOKEN` | Cloudflare Tunnel token (empty if you use a quick tunnel) |

What must differ between `prod/.env` and `dev/.env`:

- **`JWT_SECRET`: different in each.** That way a session from one environment
  doesn't work in the other. When switching environments you'll have to log in;
  that's expected.
- **`POSTGRES_*`: it doesn't matter if they match, but don't change them
  later.** Postgres only applies them the first time it creates the volume; if
  you change them in the `.env` afterwards, the API can no longer connect to
  that database.
- **`TUNNEL_TOKEN` and `FRONTEND_URL`: different.** Each environment goes out
  through its own tunnel and its own subdomain (see
  [Prod and dev at the same time](#prod-and-dev-at-the-same-time)).
- **`GOOGLE_CLIENT_ID`: can be the same**, with both origins authorized.

## Prod

```bash
# from apps/docker/prod/
docker compose pull api web          # pulls the images published from main
docker compose up -d                 # starts with the images you have
docker compose up -d --build         # builds from your working folder (see below)
docker compose logs -f cloudflared   # see the tunnel's public URL
docker compose down                  # stop (keeps the data)
docker compose down -v               # stop and DELETE the data volume
```

> **Prod images come from `main`.** On every push to `main`, the `cd.yml`
> workflow runs CI and, if it passes, builds `api` and `web` for ARM64 and
> publishes them to GHCR (`ghcr.io/esteban-abanto-2709/gym-tracker-{api,web}`)
> tagged `latest` and with the commit SHA. A prod server only needs `pull` +
> `up -d`: it builds nothing.
>
> **Updating a prod server** (what the CD does on every push to `main`):
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
>
> **Rolling back to the previous version** if a deploy goes red. The good SHA is
> the last green deploy's (in GitHub Actions or with `git log` on the server):
>
> - **No migration involved:** `git revert <commit>` and push to `main`; the CD
>   deploys the previous version.
> - **If a migration failed:** Prisma blocks the following ones (`P3009`) until
>   the database is cleaned up, so the revert alone isn't enough. On the server,
>   from `apps/docker/prod/`, first go back to the previous images and then
>   restore the backup `update.sh` made right before (the `backup previo:` line
>   in the CD log). The order matters: `restore.sh` starts the API when it
>   finishes, and it must start the old image.
>
>   ```bash
>   sha=<good-sha>
>   for app in api web; do
>     docker pull ghcr.io/esteban-abanto-2709/gym-tracker-$app:$sha
>     docker tag ghcr.io/esteban-abanto-2709/gym-tracker-$app:$sha ghcr.io/esteban-abanto-2709/gym-tracker-$app:latest
>   done
>   sh ../scripts/restore.sh prod ../backups/gym-prod_<date>.sql
>   docker compose up -d --wait --wait-timeout 180
>   ```
>
>   Then fix the migration (or revert the commit) before the next push.
>
> **`--build` builds from your working folder** (`apps/api`, `apps/web`) and
> tags the result with those same names: it's for your own self-host or a
> machine without access to GHCR. Careful: if you rebuild with a half-done
> change, that's what ends up in prod, and the published `web` image carries the
> project's Google Client ID: with your own Client ID, build it yourself. Dev
> images have another prefix (`gym-tracker-dev-*`), so building dev never
> overwrites prod's.

Services:

| Service | Access |
|---------|--------|
| `web` | **only** through the tunnel (publishes no port on the host) |
| `api` | private on the `gym-tracker-network` network (`http://api:4000`) |
| `postgres` | private on the network (`postgres:5432`, **not** published to the host) |
| `cloudflared` | no port; reaches `web` over the internal network |

> For security, prod publishes no port to the host: `web` is only reachable
> through the Cloudflare Tunnel and `postgres` only from inside the network.

## Dev

Dev has two uses. Both share the same dev database.

### Full stack (testing on the phone)

```bash
# from apps/docker/dev/
docker compose up -d --build   # postgres + api + web + cloudflared
docker compose down            # stop (keeps the data)
docker compose down -v         # stop and reset the dev DB
```

- Everything is open on the host: web on `http://localhost:3000`, API on
  `http://localhost:4000`, Postgres on `localhost:5432`.
- The API applies pending migrations on start, same as in prod.
- It goes out to the internet through its own tunnel: see
  [Prod and dev at the same time](#prod-and-dev-at-the-same-time).

### Database only (native development with hot reload)

```bash
# from apps/docker/dev/
docker compose up -d postgres
```

Then, on your machine, point `apps/api/.env` to `localhost:5432` and run the
API and the web natively:

```bash
# apps/api/
pnpm exec prisma migrate dev
pnpm run start:dev

# apps/web/
pnpm dev
```

> The full dev stack takes ports `3000` and `4000`: don't keep it up while you
> run the API and the web natively. It's one or the other.

> Prod doesn't publish `5432`; dev does. That's on purpose: when developing you
> always point to `localhost:5432`, so if you brought up prod instead of dev and
> run `prisma migrate dev` or the local API, the connection **fails**: the sign
> that you started the wrong Docker.

## Prod and dev at the same time

Each environment has **its own tunnel**: a token and a subdomain for prod
(`yourdomain`) and others for dev (`dev.yourdomain`). That way both run at
once, on the same machine or on different ones, and dev can be tested on the
phone without taking prod down.

- **Never the same `TUNNEL_TOKEN` in both `.env` files.** With two connectors
  on the same tunnel, Cloudflare splits traffic randomly between them: sets
  logged in prod can land in the dev database without any warning.
- **Separate origins.** With different domains, the ongoing guided session
  (`localStorage`) and the session cookie from one environment don't show up in
  the other.
- **Google login:** add `https://dev.yourdomain` to the authorized JavaScript
  origins of your Client ID; the same Client ID works for both.
- **Everything has different names** (containers, volumes, networks, images):
  both stacks live on the same machine without stepping on each other. That's
  how a prod backup is brought to dev (see
  [Restoring a backup](#restoring-a-backup-fill-dev-or-prod)).

### Cloudflare Tunnel (optional)

The tunnel **is only needed if you want to reach your instance from outside
your local network** (for example, from the gym). Without it the app works the
same: you bring up the stack and use it from the same network. Everyone exposes
—or doesn't— their own instance; the repository ships no configured domain or
token.

There are two modes, and both composes ship with the second one active:

| Mode | `command` | `TUNNEL_TOKEN` | URL |
|------|-----------|----------------|-----|
| **Quick tunnel** | `tunnel --no-autoupdate --url http://web:3000` | not needed | random `trycloudflare.com` one, **changes on every restart** |
| **Named tunnel** | `tunnel --no-autoupdate run` | required | fixed, on your own domain |

The **quick tunnel** is the zero-configuration path: it asks for no account or
domain, and the URL shows up in the logs (`docker compose logs -f cloudflared`).
It's for trying things out. In `prod/docker-compose.yml` its line is commented
right below the active one.

The **named tunnel** is the one to use if you'll use the app every day: you need
a Cloudflare account and a domain delegated to it. You create the tunnel from
the Cloudflare dashboard (Tunnels section), add a route (*published
application*) from your domain to `http://web:3000`, and paste the token it
gives you into `TUNNEL_TOKEN` in your `.env`. For dev, repeat with a second
tunnel and another subdomain (see
[Prod and dev at the same time](#prod-and-dev-at-the-same-time)).

> The `.env` files are in `.gitignore`: your token and your domain **never**
> leave your machine. If you don't want a tunnel, leave `TUNNEL_TOKEN` empty and
> skip the service with `docker compose up -d postgres api web`.

## Prod backups

Generates a **full** dump of the prod DB in a single command: schema, data and
the `_prisma_migrations` table, with no table list. Whatever exists in the
database goes in on its own, so a migration never forces a change to the
script. The file lands in `apps/docker/backups/` (ignored by git) named
`gym-prod_YYYY-MM-DD_HHmmss.sql` (UTC time).

```bash
# from apps/docker/, on Linux, mac or Git Bash on Windows
sh scripts/backup.sh
sh scripts/backup.sh /another/folder   # save to another folder
CONTAINER=gym-tracker-dev-sql sh scripts/backup.sh   # dump dev (testing)
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

**Requirement:** Docker running and the `gym-tracker-sql` container up. The
database alone is enough: `docker compose up -d postgres` in `prod/`.

**On Windows** it needs an `sh`: Git Bash's works. The repo forces LF line
endings on `.sh` files (`.gitattributes`); with CRLF, `sh` can't read them.

**To run it daily** on a server, one line in the `crontab` of the user that
runs Docker. `cron` starts with a minimal `PATH`: if the command that uploads
the file doesn't live in `/usr/bin` or `/bin`, declare it in the crontab's
header.

## Restoring a backup (fill dev or prod)

Leaves the DB you choose **exactly** as it was when the backup was taken: it
drops the whole `public` schema (tables, data, types and any table the backup
doesn't include) and loads the dump. It's a **full** rollback, not a surgical
one.

```bash
# from apps/docker/, on Linux, mac or Git Bash on Windows
sh scripts/restore.sh dev        # fills dev with the latest backup in backups/
sh scripts/restore.sh prod       # same, on prod
sh scripts/restore.sh dev /another/folder/gym-prod_2026-06-14_120000.sql   # a specific file
```

- Maps the target to its containers: `dev` → `gym-tracker-dev-sql` and
  `gym-tracker-dev-api`, `prod` → `gym-tracker-sql` and `gym-tracker-api`. Like
  `backup.sh`, it takes the credentials from the container itself, without
  reading any `.env`.
- If you don't pass a file, it takes the latest `gym-prod_*.sql` from
  `apps/docker/backups/`.
- **Asks for confirmation** (you have to type `si`) because it deletes the
  current database.
- **Stops the API** while restoring and starts it again when done (also if it
  fails). On start, the API runs `prisma migrate deploy`: if the backup predates
  some migration, it's applied on its own over the restored data. If the API was
  off, it stays off and the migrations are applied when you bring it up.
- Runs in **a single transaction**: if any line of the backup fails, everything
  is rolled back, the drop included, and the database stays as it was.
- Only goes **forward**: a backup taken with migrations the current code doesn't
  have can't be used with that code.

> The restore runs through `docker exec` (it doesn't depend on published ports),
> so it works on whichever container you have up, dev or prod.

### Data-only backups (before TD-084)

Until TD-084 the backup was **data only** for a fixed list of tables. Those
files have no `CREATE TABLE` and `restore.sh` rejects them. To use one, on a DB
with every migration applied, run the previous version of the script:

```bash
git show 5a2be58:apps/docker/scripts/restore.sh > /tmp/restore-data.sh
sh /tmp/restore-data.sh dev backups/gym-prod_2026-10-07_230155.sql
```

Backups from before columns were removed (RM-031, WL-012) also need the manual
steps documented in `git show 5a2be58:apps/docker/README.md`.

### Bringing prod's real data to dev

To test in dev with your real data without risking it, both databases can be
up at once (the tunnel isn't needed):

```bash
# from apps/docker/, in Git Bash
(cd prod && docker compose up -d postgres)
(cd dev && docker compose up -d postgres)
sh scripts/backup.sh
sh scripts/restore.sh dev
```

If dev is behind prod it doesn't matter: the restore leaves it the same as
prod. If it's ahead (new migrations not yet deployed), the dev API applies them
on start over prod's data.

## Resetting the database

`-v` removes the volume and with it **all the data**. Run it in the folder of
the environment you want to reset:

```bash
# from apps/docker/prod/  (DELETES your real data)
docker compose down -v

# from apps/docker/dev/
docker compose down -v
```
