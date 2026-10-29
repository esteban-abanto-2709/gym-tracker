# Roadmap

Committed work: what will be done. Code `RM-###` (never reused).
Ordered by priority, top first. When a task is finished it moves to the
changelog and is deleted from here.

**Entry format:**
- **Goal:** what we want to achieve.
- **Scope:** (optional) what's in and what's out.
- **Open questions:** (optional) what must be decided when starting.
- **Done when:** clear completion criterion.
- **Date** and **Status** (Open / In progress).

---

> The product logic behind each task is in
> [`../product-vision.md`](../product-vision.md).

## [RM-054] Plate calculator
- **Goal:** no doing math while tired to know which plates to load on the bar.
- **Scope:** when logging with a barbell, show the bar (20 kg) visually with the plates on each side for the total weight. Fixed available plates: 20, 10, 5 and 2.5 kg. Customizing bars and plates per user stays in the wishlist (WL-063).
- **Done when:** with 90 kg on bench press you see "barra 20 + 35 por lado" drawn with its plates (20 + 10 + 5).
- **Date:** 2026-10-06 · **Status:** Open

## [RM-055] One-tap logging (demo)
- **Goal:** validate whether logging by tapping is faster than the current form.
- **Scope:** isolated demo, not wired into production. Each set is a card preloaded with weight and target: one tap marks it done; tapping again subtracts a rep; a long press opens editing.
- **Done when:** the demo is used in a real session and it's decided whether it replaces `SetForm` + `SetDoneScreen`.
- **Date:** 2026-10-06 · **Status:** Open

## [RM-090] Exercise dictionary: aliases and variants
- **Goal:** find an exercise by any name it's known by, including the ones that carry the equipment in the name. Depends on RM-086.
- **Scope:**
  - **Aliases:** other names for the same exercise, each in one language ("press plano" → Press de banca).
  - **Variants:** an alias can carry an equipment. "Smith squat" or "sentadilla en Smith" isn't another exercise: it's Squat + Smith equipment, and choosing it selects both. Rule: if the movement or the muscles change, it's another exercise; if only the equipment changes, it's the same exercise with other equipment. Requires TD-091.
  - A variant's name is built automatically ("Sentadilla · Smith"), not stored by hand; the TikTok button searches with that full name.
- **Open questions:** whether users can add aliases and who sees them. Proposal: curated official aliases for everyone and personal aliases only their creator sees, so nobody pollutes other people's search.
- **Done when:** searching "press plano" finds Press de banca, and searching "smith squat" leaves Squat and the Smith equipment selected.
- **Date:** 2026-10-12 · **Status:** Open

## [RM-033] Replacement with the exercise's real shape + edit the slot in session
- **Goal:** replacing an exercise in guided mode leaves the slot the way **you usually do that exercise**, not with the replaced slot's blocks, and you can adjust the day's slot with a pencil.
- **Problem:** today the substitute inherits the slot's blocks (RM-020 rule). When replacing Incline Press (`[warmup 2×25] + [weight_reps 3×8]`) with Plank, the map counts "0/5 series" and the target says `Cal. 2 × 25 + 3 × 8` for a timed exercise. Found while testing RM-031 on 2026-09-19.
- **Rule:** when replacing, the slot is rebuilt from the **last day** you did the substitute: its warm-ups go into a `warmup` block (sets and reps from that day) and its working sets into a block with the measurement you used (`weight_reps`/`reps`/`time`). No history → free slot and the measurement is chosen in the form. Weights still come from "la última vez".
- **API:** new endpoint that returns the shape of an exercise's last session (how many warm-ups, how many working sets and with which measurement).
- **Pencil (edit slot):** available on any slot, not only after a replacement; lets you change sets, reps or seconds and add/remove the warm-up. **Affects only today's session** (stored in `ActiveSession`); the saved routine isn't touched, same as skip/replace/add. Offering "guardar en la rutina" is left for later.
- **Steps:** (1) endpoint + test; (2) the replacement uses it; (3) the pencil.
- **Done when:** replacing Incline Press with Plank leaves "3 × 40 s" (what you usually do) instead of inheriting the warm-up, and from the pencil I can lower it to 2 sets just for today.
- **Date:** 2026-09-19 · **Status:** Open

## [RM-027] Equipment default from the DB (the exercise's last real Workout)
- **Goal:** when starting an exercise, preselect the equipment by asking the DB **how it was done last time** (the equipment of that exercise's last `Workout`), instead of relying only on RM-026's per-browser localStorage memory. Robust across devices and against storage clearing/incognito.
- **Scope:** extend `GET /workouts/recommendation` (or another lightweight endpoint) to return `lastEquipmentId` from that exercise's last set; the front end uses it as the selector's default, with the localStorage memory as an optimistic/offline fallback.
- **Done when:** when choosing an exercise from any device, the default equipment = that of the exercise's last real `Workout` in the DB.
- **Date:** 2026-07-23 · **Status:** Open

## [RM-075] Managed database
- **Goal:** prod data no longer depends on a single disk or on hand-made backups: automatic backups, restore to any recent minute and patches handled by the provider.
- **Scope:** move Postgres from the prod compose to a managed service. Migration with `backup.sh`/`restore.sh` and reversible: if it doesn't convince, the database goes back to the compose. The API only changes `DATABASE_URL`/`DIRECT_URL`. If migrations stop running at API startup, `prisma` goes back to devDependencies and the image drops the CLI (`node_modules` 371 → 136 MB measured); the CLI loads Studio at startup, so it can't be trimmed from inside.
- **Done when:** prod runs against the managed database with all the data, the service's automatic backup exists and restoring one in dev was tested.
- **Date:** 2026-10-08 · **Status:** Open
