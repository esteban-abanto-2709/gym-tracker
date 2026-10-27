# Gym Tracker — Product vision

> What the app is, who it's for and why. Committed work lives in the
> [`roadmap`](./logbook/roadmap.md); how it looks and feels, in
> [`ux-foundations.md`](./ux-foundations.md).

## In one sentence

A strength-training logger you use **between sets, without thinking**: you see
what you did last time, the app tells you whether it's time to go up, you log
it and put the phone down.

## Who it's for

- **Today:** the author, who uses it every week at the gym.
- **Next:** the author's friends, and their friends.
- **The profile:** young people at an **intermediate** level. They know the
  exercises and how to do them well, but they're still discovering nuances.
  They don't need the app to teach them how to train; they need it to stay out
  of the way. Absolute beginners aren't the target.

## The problem

> "I'm at the gym, I want to train now. I don't want to tell an app my age, my
> weight or what I eat. I want to see which routine I'm doing today, know how
> much weight, log it and get on with my life."

Existing gym apps:

- Ask for personal data and goals before letting you log your first set.
- Hide the basics (creating your routines) behind a subscription.
- Make you go through your history day by day to decide whether to add weight.
- Look bland: they want to please the whole market and have no character.

## The two certainties

Everything else is judged against these.

### 1. No thinking

- **Zero setup to start.** You get in, pick a routine (or copy a friend's) and
  train.
- **The app does the math; you decide.** It shows you last time, keeps the
  streak and suggests going up or down. The final call is yours.
- **Nothing takes you out of the workout.** What you need to check in the
  moment (your history with that exercise, how it's done, which plates to load)
  is one tap away, without leaving the set.

### 2. Character

- The app looks **aggressive, with an identity**, not like a neutral notebook.
- The promise isn't that the gym is your life: it's **get in, train, get out**.
  The character is in the aesthetics, not in demanding your time.

## How training progresses

The logic behind the suggestions, without the user configuring it:

- **Double progression.** Each exercise in a routine has a rep range (e.g.
  3 × 8-10). When **every** set reaches the top, it's time to add weight and the
  target goes back to the minimum.
- **Streak.** Each session with every set at the top adds to a streak; a set
  below breaks it and adding weight resets it. The longer it is, the clearer the
  suggestion to go up.
- **Going down with respect.** Below the minimum is acceptable. Below a floor
  (by default, two reps under the minimum: 6 on an 8-10) the app suggests
  lowering the weight.
- **Real increments.** The jump depends on the equipment: a barbell, a dumbbell
  and a machine don't go up the same way.
- Reps-only or timed exercises progress with more reps or more time.

## Principles

- **Logging is the core.** Everything else adds to it or is surplus; it never
  makes work for the user.
- **Personal data is optional.** Age, body weight or body fat percentage
  improve the analysis, but they're added whenever you want, from the profile,
  never before training or during it.
- **Tools for the real gym.** What helps between sets when you're tired: the
  plate calculator, finding the exercise on video, seeing your history with
  that exercise.
- **If another app already does it well, it isn't copied.** To talk with your
  friends there's WhatsApp; for food, nutrition apps.
- **Your data is yours.** It can be exported for your trusted AI to analyze.
- **No paywall for the essentials.**

## What it is NOT

- **Not all-in-one:** no nutrition, habits or physiotherapy.
- **Not a social network:** no chat, no feed, no photos. The social side is
  limited to copying programs and, at most, comparing yourself with friends.
- **No timer.** As a web app, the system freezes it in the background; you use
  the phone's.
- **No onboarding.** No surveys or goals when signing up.

## Where it's going

- **Always available:** moving from a home server to the cloud, so the app
  works even when the power goes out.
- **Polishing the training moment:** exercise history with streak, finding the
  exercise on video, plate calculator and one-tap logging.
- **Opening it to friends**, with a comfortable desktop version to review your
  data, export it or import a program built with your AI.
- **Sharing programs and standalone routines** that others can copy and adapt.

The committed detail is in the [`roadmap`](./logbook/roadmap.md) and the
uncommitted ideas, in the [`wishlist`](./logbook/wishlist.md).

## Constraints

- Stack: NestJS + Next.js + PostgreSQL (Prisma), in Docker.
- Web app installable on the phone (full screen, portrait).
- Minimal budget: free tiers and credits, built in spare time.
