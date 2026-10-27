# Sets benchmark

Measures two queries that grew with the user's sets: the last set
(`GET /workouts/recommendation`), which runs every time a set form opens, and
the history, which runs when entering that screen. The history was
`GET /workouts/days` until RM-134 and is now `GET /sessions`. The benchmark
requests both equally, so the history weighs much more than in real use. Dev
only.

## Data

`pnpm run seed:bench` fills the dev database with 100 test users
(`@gym-tracker.test`) and 109,000 sets spread over two years, in sessions of
20 sets 4 minutes apart:

- `bench@gym-tracker.test` (password `bench-password`): 500 sessions, 10,000
  sets, 2,000 of them barbell bench press (4 per session). About five years of
  a consistent user.
- 99 more users with 50 sessions (1,000 sets) each, so the table weighs as it
  would with a hundred active users.

It's repeatable: each run deletes the previous test users and creates them
again. `pnpm run seed:bench -- --clean` only deletes them. It refuses to run
if `DATABASE_URL` doesn't point to `localhost`.

## Running it

With the dev API up (`docker compose up -d --build api` in
`apps/docker`), from `apps/api`:

```bash
pnpm run seed:bench
```

The seed prints the `EXERCISE_ID` of the measured exercise. k6 runs in a
container inside the dev network, without installing anything:

```bash
docker run --rm -i --network gym-tracker-dev_gym-tracker-network -e EXERCISE_ID=<id> grafana/k6:1.3.0 run --quiet - < bench/form.k6.js
```

By default it's 10 virtual users for 30 s, each requesting both routes without
pause: it measures the API's capacity. With `--vus 1` after `run` it measures
how long a single request takes, with no queue. `docker stats` in another
terminal shows who's spending the CPU.

## Results

Measured on the development PC with Docker Desktop: the absolute numbers aren't
the prod server's; they're for comparing one change against another. Between
two identical runs the numbers vary 5-7%, so a difference under 10% proves
nothing.

| Version                 | Users | `recommendation` p95 | history p95 | Requests/s |
| ----------------------- | ----- | -------------------- | ----------- | ---------- |
| Before (TD-107, TD-108) | 1     | 9 ms                 | 23 ms       | 68         |
| Before (TD-107, TD-108) | 10    | 139-148 ms           | 214-228 ms  | 74-79      |
| Last set (TD-107)       | 1     | 3.8 ms               | 23 ms       | 81         |
| Last set (TD-107)       | 10    | 110 ms               | 184-186 ms  | 101        |
| Indexes (TD-108)        | 1     | 2.6 ms               | 22 ms       | 88         |
| Indexes (TD-108)        | 10    | 111-113 ms           | 186 ms      | 102        |
| Days in SQL (TD-131)    | 1     | 2.1 ms               | 11 ms       | 174        |
| Days in SQL (TD-131)    | 10    | 9.8 ms               | 24 ms       | 718-720    |
| Sessions (RM-134)       | 1     | 1.7 ms               | 2.8 ms      | 573        |
| Sessions (RM-134)       | 10    | 9.7 ms               | 15 ms       | 995        |

Postgres time alone (`EXPLAIN ANALYZE`, user `bench`):

| Query                             | No indexes | With indexes |
| --------------------------------- | ---------- | ------------ |
| Last set (`LIMIT 1`)              | 1.37 ms    | 0.05 ms      |
| Days (the user's `createdAt`)     | 2.08 ms    | 1.16 ms      |
| Progress (exercise's `LIMIT 300`) | 1.09 ms    | 0.66 ms      |

With TD-131 the days query groups in Postgres (`GROUP BY` on the local date):
it takes 7.6 ms, more than reading the dates, but it returns 731 rows instead
of 10,000 and the API no longer converts them.

- **The API saturates at about 75-80 requests/s.** From 1 to 10 users the total
  barely rises and latency multiplies by 15: the rest is queueing.
- **The bottleneck is the API, not the database.** With 10 users the API uses
  133% CPU and Postgres 42%. `EXPLAIN ANALYZE` of the last set takes 3.8 ms:
  Postgres already filters by `userId` with the unique `(userId, clientId)`
  index and doesn't scan the whole table. The cost is the API converting the
  exercise's 2,013 sets to use just one.
- **TD-107 confirms it.** Fetching only the last set brings `recommendation`
  down from 9 to 3.8 ms and raises capacity 30%, because it removes work from
  the API itself. Now `days` is almost all of each round's time (TD-131).
- **TD-108 speeds up the database, not capacity.** With the index, the last set
  reads one row (walking the index backwards) instead of 2,013, and the days are
  read from the index without sorting. With 1 user `recommendation` drops from
  3.8 to 2.6 ms; with 10 capacity doesn't change, because the limit is still the
  API's CPU. The index matters once the table no longer fits in memory.
- **TD-131 multiplies capacity by 7.** With days grouped in SQL the API goes
  from ~100 to ~720 requests/s and `days` drops from 186 to 24 ms with 10
  users. The work moved to Postgres, which spreads it across several cores
  (316% CPU); the API, single-threaded, is again close to its ceiling (115%),
  now with 7 times more requests.
- **RM-134 changes the design, not the query.** The history moves from `days`
  (every day at once) to `/sessions` (a page of 20 sessions). With 1 user the
  history drops from 11 to 2.8 ms, and with 10 the API serves ~995 requests/s:
  13 times the starting point. The response no longer grows with the history.

## History: days versus sessions

Each history route on its own, with the `bench` user (500 sessions), measured
before removing `/workouts/days`. `/workouts/days` returned every day at once;
`/sessions` returns a page of 20 sessions with their set count.

| Route                              | Users | p95     | Requests/s | Per response |
| ---------------------------------- | ----- | ------- | ---------- | ------------ |
| `/workouts/days`                   | 1     | 10.8 ms | 102        | ~19 KB       |
| `/workouts/days`                   | 10    | 23 ms   | 507        | ~19 KB       |
| `/sessions` with Prisma's `_count` | 1     | 11.9 ms | 88         | ~3.9 KB      |
| `/sessions` with Prisma's `_count` | 10    | 18.5 ms | 675        | ~3.9 KB      |
| `/sessions` with per-page count    | 1     | 3 ms    | 483        | ~3.9 KB      |
| `/sessions` with per-page count    | 10    | 16 ms   | 835        | ~3.9 KB      |

- **Prisma's `_count` counted the whole table.** For each session's set count,
  Prisma generates a `COUNT(*) ... GROUP BY "sessionId"` over every set of
  every user and joins it with the page: 9 ms, and it grows with each new user.
  It shows up with `log_min_duration_statement = 0` in the dev Postgres.
- **Counting only the page fixes it.** A `groupBy` with `sessionId IN (...)`
  uses the `sessionId` index and reads only the sets of those 20 sessions: with
  one user it drops from 11.9 to 3 ms.
