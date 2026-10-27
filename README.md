# Gym Tracker

A strength-training logger you use **between sets, without thinking**.

You see what you lifted last time, repeat it or add weight, log it in two
seconds and put the phone down.

[![CD](https://github.com/esteban-abanto-2709/gym-tracker/actions/workflows/cd.yml/badge.svg?branch=main)](https://github.com/esteban-abanto-2709/gym-tracker/actions/workflows/cd.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](./apps/docker/README.md)

---

## The problem

Gym apps make logging harder than training.

They ask for your age, weight, goals and even what you eat before letting you
log your first set. They lock the basics, like creating your own routines,
behind a subscription. And to know whether it's time to add weight, you have to
go through your history day by day, between sets, with the rest timer running.

Gym Tracker starts from the opposite idea: **the app should stay out of the
way**.

## How it feels

- **No thinking.** You open it, pick your routine and the app shows you what
  you did last time. It suggests when to go up; you decide.
- **Character.** Dark, energetic, with an identity. Not a neutral notebook.
- **Get in, train, get out.** No onboarding, no surveys, no required personal
  data.

## What it does today

**While training**

- **Logging in two seconds.** Your last weight and reps come prefilled; you
  confirm and you're done. The set is saved instantly, even with bad gym
  signal: if it doesn't get through, it retries in the background without
  duplicating.
- **Guided routines.** The app takes you exercise by exercise, with each set's
  target and a session map. You can skip, replace or jump ahead: the structure
  helps, it doesn't force.
- **Streak and load suggestion.** A flame counts the sessions in a row where you
  hit the top of the range with the same weight. With a streak it suggests going
  up; if you fall short, going down. It never tells you how much: you decide. It
  only compares within the same equipment, because a machine and a dumbbell
  don't weigh the same.
- **Exercise history** without leaving the workout: your last sessions of that
  exercise, with their equipment.
- **Rest time.** You see how long it's been since your last set, without
  starting anything.
- **Watch the exercise** on video with one tap, if you don't remember how it's
  done.
- **Kilos or pounds.** You pick the unit when logging, because some machines
  only come in pounds.

**Outside the gym**

- **All kinds of sets.** Weight and reps with a range (3 × 8-10), reps only
  (pull-ups, dips), timed (plank), warm-ups and ramp-up sets.
- **Programs.** Group your routines (Push, Pull, Legs; Upper/Lower) and the app
  tells you which one is up today. You can also browse other people's programs
  and copy them.
- **Free day.** No routine today? Log sets loose.
- **Editable history** by day, to fix any set afterwards.
- **Export for your AI.** A date range in a file ready for your assistant to
  analyze your progress.
- **Optional body measurements:** weight, body fat % and height by date.
- **Exercises in English or Spanish.** Almost 100 official exercises in both
  languages; search finds them regardless of accents.
- **In-app news**, to discover what it can do.
- **Your own account** with email or Google, and **it installs on your phone**:
  it opens full screen, like an app.

## What it is NOT

- **Not all-in-one.** No nutrition, habits or physiotherapy.
- **Not a social network.** No feed, no chat, no photos.
- **No timer to manage.** Rest counts itself; there's nothing to start or stop.
- **No paywall** for the essentials.

## What's next

- **Plate calculator:** how much to load on each side of the bar.
- **More ways to find an exercise:** aliases ("press plano") and variants by
  equipment.
- **The interface in English**, not only the exercises.
- **One-tap logging:** an experiment to mark sets without a form.

The detail and the order are in the [roadmap](./docs/logbook/roadmap.md).

## How it's built

Two independent applications and the orchestration that ties them together:

```
browser ──/api/*──▶ web (Next.js) ──▶ api (NestJS) ──▶ PostgreSQL
```

| Folder | What it is |
|---|---|
| [`apps/web`](./apps/web/README.md) | The interface: Next.js, React and Tailwind, built for the phone |
| [`apps/api`](./apps/api/README.md) | The REST API: NestJS, Prisma and PostgreSQL |
| [`apps/docker`](./apps/docker/README.md) | Docker Compose for development and the server, backups and restore |
| [`.github/workflows`](./.github/workflows/README.md) | CI on every pull request and automatic deploy on every push to `main` |

The browser only talks to the web app, which proxies to the API: the API's
address never reaches the client. The session lives in an httpOnly cookie.

Each folder has its own README with the technical detail: commands,
environment variables, architecture and endpoints.

### Run it on your machine

The whole stack (database, API, web and an optional Cloudflare tunnel) runs
with Docker Compose:

```bash
cd apps/docker
cp .env.example .env   # works as is on your machine
docker compose up -d --build
```

Then open `http://localhost:3000`.

The details are in [`apps/docker/README.md`](./apps/docker/README.md).

## About the project

It's an app I actually use, every week, at the gym. It was born from my own
annoyance and it's kept going for the same reason: decisions are made based on
whether they improve the minute and a half between sets, not on whether they
add one more feature to the list.

The hard part isn't building an exercise CRUD, it's deciding what not to build.

- [Product vision](./docs/product-vision.md): what it is, who it's for and why.
- [UI/UX foundations](./docs/ux-foundations.md): the design criteria.
- [Logbook](./docs/logbook/): roadmap, technical debt, ideas and changelog.

## License

[MIT](./LICENSE) © Esteban Abanto
