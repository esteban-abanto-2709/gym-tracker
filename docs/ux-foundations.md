# Gym Tracker — UI/UX foundations

> Rules every screen must follow. They answer to the certainties in the
> [product vision](./product-vision.md): no thinking and having character.

## Personality

- **With character.** Aggressive, energetic, with presence. Gym apps look calm
  and generic (Strong, Hevy); this one has to stand out.
- **Serious.** Motivating without being cheesy or a clown coach.
- **Serving the "get in, train, get out" promise.** The aesthetics make you want
  to open it; the interface lets you go fast.

## Visual direction

- **Dark as the base**, with an equally polished light mode. Later on,
  swappable themes (see the wishlist).
- **Red accent** and typography with character (Oswald, Space Grotesk, Space
  Mono). They're the current identity, not dogma: they can evolve.
- **High contrast**, readable at a glance.
- **Portrait.** The installed app opens full screen and locked to portrait.

## Context of use

- **Between sets:** tired, in a hurry and with little patience to think. That's
  the moment that drives the ergonomics.
- **Outside the gym:** reviewing your progress, exporting your data or building
  a program calmly, on the phone or on the computer.

That's why there are **two densities**: minimal while you train, generous when
you review.

## Rules for every screen

- **Logging a set is one or two taps** from the main screen.
- **Last time is always visible**, and repeating it is the default.
- **Nothing required before logging:** no setup and no personal data.
- **No leaving the workout to look something up.** That exercise's history, how
  it's done or which plates to load are seen from the same screen.
- **The app suggests, the user decides.** Going up or down in weight is a
  visible suggestion, never an automatic change.
- **Structure helps, it never forces.** You can always skip, replace or add an
  exercise.
- **Immediate feedback** when logging, and clear when the network fails: never
  lose a set silently.
- **Large touch targets** and text that reads effortlessly.
- **No scrolling.** Every screen and every panel fits on a phone (reference:
  390×844 counting iOS safe areas). If it doesn't fit, it's compacted, shows
  only the recent part or is split; a long history lives in its own view.

## How weight is logged

A convention the interface must follow and explain where needed:

| Equipment | What's logged |
|---|---|
| Barbell | The total: bar + plates |
| Dumbbell | The weight of **one** dumbbell |
| Machine | What the machine shows |

Internally everything is stored in kg; the user can log in lb.

## Tone of voice

- **Short sentences** that read well when tired, after a heavy set.
- **Direct and motivating**, never condescending. When suggesting lowering the
  weight, respectfully: nobody wants to lower it.
- **In Spanish.** English technical exercise names come with how they're known
  at the gym.
