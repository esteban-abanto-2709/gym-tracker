# Wishlist

Possible ideas and improvements, no commitment (maybe never). Code `WL-###` (never reused).
If an idea is promoted, it's deleted from here and a new `RM` is born.

**Format:** title + the idea in 1–2 lines, no fields.

---

## [WL-139] Public pages under `/es` and `/en` for search and shared links
Today one URL serves both languages by cookie or phone, so Google indexes only one (likely English) and a WhatsApp preview takes the bot's language, with the OG image cached for a year in the first language asked. Decided approach: move only the public pages (landing, privacy, Explore and publications) under a language folder with next-intl routing, `hreflang` and a sitemap, and share links that carry the language; the signed-in app keeps following the account. Worth it when publications should be found by search. Do it in the same pass as static pages for the signed-in app: with every page under `[locale]` and `localePrefix: 'never'` for the private ones, the build renders each page once per language and the proxy picks the copy by cookie without a locale in the URL, so pages are static and prefetched again (today the cookie makes them all dynamic, see TD-166). Start with a demo.

## [WL-138] Tell the user their routine no longer exists
Since TD-147 the sets of a deleted routine are saved as a free day, and opening a guided session whose routine is gone drops it silently. Say so instead: "Esta rutina ya no existe; tus series se guardaron como día libre".

## [WL-124] Recover the password by email
The "¿Olvidaste tu contraseña?": a single-use, expiring link by email, `POST /auth/forgot` (answers the same whether the account exists or not) and `POST /auth/reset` (closes every session with TD-120), with an attempt limit. It requires the app to send email: a provider (candidate Resend) and SPF/DKIM in the DNS. Postponed: today almost everyone signs in with Google and changing the password already exists (WL-061).

## [WL-122] User manual
A non-technical document that explains how the app works for anyone, with its concrete rules: what counts for the streak, what happens to the guided session at the end of the day, that signing out signs out every device (TD-120), etc. Different from `product-vision.md` (the why) and from the READMEs (the technical side).

## [WL-115] Saved-set animation with more motion
Since RM-114 the check appears instantly, but the overlay comes and goes somewhat abruptly, with a micro-pause. Give it a smoother entry and exit (transition from the button, exit that blends into the next screen). Fine detail: you see it when using it, not when reading the code.

## [WL-103] Should free sets exist?
A routine exercise without blocks ("Series libres") has no target: the app doesn't know when to move to the next one or how to compute the fire, and it forces special cases in the guided session. Discuss whether to remove them (require at least one block when saving) or give them a clear use.

## [WL-098] Guided tutorials
From a Novedades card, a "ver tutorial" button that dims the screen and highlights step by step where to tap (e.g. Perfil → Medidas). Optional: only whoever asks for it sees it. With an existing library (`driver.js` or `react-joyride`, both MIT) and only for the two or three most confusing features, because every screen change can break a tutorial.

## [WL-097] Swipe to close the panels
Swipe down to close the panels that slide up from the bottom (Novedades, Exportar, Idioma, Medidas, session map), all five at once so they behave the same. First choose a library: `vaul` (the one behind shadcn's Drawer) looks unmaintained, verify it and compare with alternatives like `motion`'s drag.

## [WL-087] Merge and promote exercises
With user-created exercises, duplicates appear ("press raro" created several times). A tool to merge one exercise into another (moving its sets and routines) and to promote a user exercise to official, filling in its muscles and type. Depends on RM-056.

## [WL-078] AI export, second version
Improvements to the RM-021 file following the review in [`docs/feedback/2026-10-09-export-ia.md`](../feedback/2026-10-09-export-ia.md): session identifier, exercise slug, training goal and a computed summary above the sets. Done when real use shows they're missing.

## [WL-066] Suggest going down after many sessions without going up
If many sessions go by without completing the top of the range at the same weight, suggest going down to build back up. It's still undefined how many count as "many".

## [WL-010] Hide the equipment selector on reps-only sets
In a `reps` block (Dead Bug, ab plank) the equipment is always "peso corporal", so the selector only gets in the way. Idea: hide it for that measurement, leaving the door open to showing it if it's ever done weighted or assisted.

## [WL-011] Mark the warm-up explicitly in guided mode
Today a warm-up set is only told apart by the small "Calentamiento · La última vez…" label above the form (`SetForm.tsx`), same as a working set. Idea: a clear marker on the exercise card (badge or color) when the set is a warm-up, and check that the rest screen's text isn't cut off.

## [WL-037] Reload from inside the installed app
In full-screen mode Safari's reload button doesn't exist: if something hangs, you have to close the app. Evaluate a pull-to-refresh or a retry button in the error states.

## [WL-009] Keep the set's original unit
A `unit` column on `Workout` to show the weight in the unit it was logged in (e.g. "45 lb" instead of "20.4 kg"). Worth evaluating together with the export (RM-021), so the AI sees what was really loaded. Today everything is converted to kg rounded to 1 decimal when saving.

## [WL-058] Desktop version
A comfortable computer experience for what isn't done between sets: reviewing your progress, exporting your data and importing or building programs. On desktop, the exercise video can open on YouTube instead of TikTok. Today only the landing has breakpoints: 31 files pin `max-w-md` and the bottom nav shows on a monitor; a start would be one shared shell (sidebar from `lg:`) and two columns in History, Routines and Explore. Better after TD-138.

## [WL-060] Create a program with your AI
The app hands out a `.md` with the programs and routines format, the logging conventions and what to ask the user. Your AI of choice uses it to build the program and returns a JSON; importing it creates a **new** program, it never replaces an existing one. It doesn't include history: if you want the AI to take it into account, you give it separately with the export (RM-021).

## [WL-047] Per-muscle analysis
A radar chart of how much you work each muscle (biceps, triceps, quads, hamstrings…), to see what you overtrain and what you neglect. Depends on the catalog having muscles (RM-056). Before building other charts, look for a library that fits the stack.

## [WL-065] Training session on the server
Today each `Workout` is a standalone set and the guided session lives in `localStorage`. A session entity in the database would let you continue it from another device. Logging offline and not duplicating on retry is already solved by RM-114 without it. The analyzed references agree on this change.

## [WL-003] Compare yourself with friends
Healthy, optional rivalry: compare the muscle radar, consistency (days per week) or the load on an exercise. Prefer sharing an image or a link on WhatsApp over building profiles, friendships or chat.

## [WL-064] Usage analytics
Know how many users come in, how many train each week and how many come back. Start with database queries before a tool.

## [WL-063] Per-user and per-exercise customization
The exercise (name, muscles, description) is shared by everyone, but each user does it their own way: another bar (the short one for hip thrust), other plates or the machine scales at their gym. With that layer, the plate calculator adapts to each person and the suggestion to go up can propose a concrete weight with their equipment's real step (the leg press goes up 10 kg per side; the barbell, 5 kg in total).

## [WL-062] Themes
Besides light and dark, swappable themes (Dracula-style) to customize the app.

## [WL-005] Extended logging: cardio and mobility
Log post-routine cardio and mobility/warm-up exercises before, without cluttering the main weights flow.

## [WL-077] Hide the deploy identifiers in the logs
The `deploy` job's variables with the role to assume and the target server aren't credentials, but GitHub variables aren't masked and stay readable in the public Actions logs. Move them to *Secrets* (`cd.yml` reads `secrets.` instead of `vars.`) and delete the logs of past runs.
