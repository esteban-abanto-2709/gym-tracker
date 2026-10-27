# Workflows

Two files, one per responsibility: **CI verifies**, **CD publishes**.

| File | Triggered by | What it does |
|---|---|---|
| `ci.yml` | every pull request to `main`, or when another workflow calls it | lint, unit tests and build of `api` and `web` |
| `cd.yml` | every push to `main` | calls `ci.yml` and, if it passes, publishes the images and deploys |

```
push to main ──▶ cd.yml
                 ├─ CI   (ci.yml: api + web)
                 ├─ Images (only if CI passes)
                 │    ├─ api ─┐
                 │    └─ web ─┴─▶ ghcr.io/esteban-abanto-2709/gym-tracker-{api,web}
                 └─ Deploy (only if both images were published)
                      └─▶ prod server: git pull + scripts/update.sh
```

## Why two files

The usual setup is a single `ci.yml` that does everything. Here they're split
because they're different things: verifying a proposal isn't the same as
publishing what's already on `main`, and a pull request must never publish
anything.

- **`ci.yml` isn't duplicated:** it declares `workflow_call`, so `cd.yml`
  reuses it as its first job instead of copying its steps.
- **It doesn't run twice per push:** `ci.yml` no longer listens to pushes to
  `main`; there only `cd.yml` runs, and it calls it once. On a pull request only
  `ci.yml` runs.
- **What's published is exactly what was verified:** `cd.yml`'s CI tests the
  commit it's about to build, not the pull request's (another change could have
  landed on `main` in between).

## Images

- Built on a GitHub **ARM64** runner (`ubuntu-24.04-arm`), the same
  architecture as the prod server: no emulation.
- Each image has two tags: `latest` (what prod runs) and the **commit SHA** (to
  go back to a specific version).
- They use the GitHub Actions cache (`type=gha`), split per app.
- The GHCR packages are **public**: they hold no secrets. The runner builds from
  a clean copy of the repo, where the `.env` files don't exist; the only
  "custom" value is the web's Google Client ID, which is already public because
  it travels in the browser's JavaScript.

## Deploy

- **No stored keys:** the job requests temporary credentials through **OIDC**.
  The cloud provider only hands them out if the GitHub token comes from this
  repo and the `main` branch; they last one hour and exist only inside that run.
- **No open ports:** the command reaches the server through an agent that
  connects outwards; SSH stays closed to everyone but whoever administers it.
- **What it runs:** `git pull --ff-only` and then the freshly pulled
  [`apps/docker/scripts/update.sh`](../../apps/docker/scripts/update.sh): a
  database backup first, `docker compose pull`, `up -d --wait` (which applies
  pending migrations when the API starts and waits for `api` and `web` to pass
  their healthcheck) and cleanup of old images.
- **Visible result:** the job waits for the server to finish (10 min max),
  prints its output and fails if the command failed, including when the app
  doesn't end up healthy (a failed migration or an API that doesn't start).
- **The pre-deploy backup** stays in the server's `apps/docker/backups/`: if a
  migration breaks something, there's a copy from a minute before.

> **Whatever reaches `main` reaches prod.** Whoever can push to `main` can, in
> practice, run commands on the server. While there's a single developer it's
> enough not to push anything half-done; with collaborators, `main` must be
> protected (pull requests only, with required CI and review).

## Repo configuration

| Variable (Settings → Secrets and variables → Actions → Variables) | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID baked into the `web` image |

The `deploy` job also reads three variables with the role to assume, the region
and the target server (their names are in `cd.yml`). None of them is a
credential: without the OIDC token of a run on `main` they grant access to
nothing. That's why they're variables and not secrets, and why they aren't
written in the file.

## Concurrency

- `cd.yml` uses the `cd` group without cancelling: if two pushes arrive in a
  row, the second waits for the first to finish instead of cutting it off
  halfway.
- `ci.yml` cancels the previous run on the same branch: on a pull request only
  the last commit matters.
