# Gym Tracker — In-app news

> How in-app news (Novedades) is registered: the cards that open from the stars
> icon on Hoy. They tell the user what they can do in the app, without a
> tutorial that interrupts.

## Where they live

| What | Where |
|---|---|
| Which news items exist | [`apps/web/src/lib/news.ts`](../apps/web/src/lib/news.ts), the `NEWS` list |
| What each one says | `news.items.<id>` in each messages file under [`apps/web/src/i18n/messages/`](../apps/web/src/i18n/messages/) |
| What each user opened and saw | `User.newsOpened` and `User.newsSeen` in the database: ids only |

The database doesn't know which news items exist. Adding or removing one means
editing `news.ts`; it never needs a migration.

## What gets in

Only what adds something for the user, meeting all three:

1. **It helps while training.** Technical work (database, deploys, backups) and
   fixes don't get in.
2. **It isn't obvious.** If it's visible just by using it (logging a set, the
   kg/lb picker), it doesn't need a card.
3. **It works well today.** Nothing with a known bug that would disappoint is
   announced.

The project owner decides them: a news item is never added unless they ask for
it.

## Each news item

```ts
{
  id: "body-measurements",
  Icon: Ruler,
  href: "/perfil#medidas",
}
```

```json
"body-measurements": {
  "title": "Registra tus medidas",
  "body": "Anota altura, peso y % de grasa con su fecha para ver cómo cambias. ..."
}
```

- **`id`:** English and kebab-case. It's what's stored per user: **it's never
  changed or reused**.
- **`Icon`:** from `lucide-react`.
- **`title`** (messages file): a short sentence that stands on its own,
  ideally with a verb ("Registra tus medidas", "Copia el programa de otro").
- **`body`** (messages file): two or three lines: what it does and why it
  helps.
- **`href`:** optional. The screen "Ir" takes you to; with no fixed place
  (something that lives inside training), it's omitted. To open a panel or
  scroll to a section, use a parameter or an anchor that screen already
  understands (`/history?export=1`, `/perfil#medidas`).

**The order in the file is the order on screen.** A new item goes at the top.
Unseen ones always come before seen ones.

## Operations

There are only two: **add** and **remove**.

- **New feature:** add a card with a new id, at the top.
- **Bug in a news item:** remove the card while it's being fixed. When it comes
  back, it comes back with **the same id**: whoever already saw it doesn't see
  it as new again.
- **Improvement to an already announced feature:** remove the old card and add
  a new one with a new id (`explore-programs` → `explore-programs-2`), telling
  what improved. The dot shows up again for everyone.
- **Fixing the text** without the feature changing (a typo, a word): edit it in
  place with the same id; it notifies no one.

A new news item goes in the same commit as the feature it announces.
