# Habit Tracker V2 — Feature Spec

## Status: Approved baseline for implementation
Reconstructed from the original product-spec conversation. This is the
source of truth for domain rules; `HABIT_TRACKER_V2_SCHEMA_API.md` derives
the Prisma schema and REST surface from it.

> Revised 2026-10-17 (owner decision): a Goal only wraps habits and has no
> progress of its own; habit progress counts only `DONE` tasks. Affected:
> Goal entity, Habit `goalType`, the status/value note, worked example 3.

## Scope

Clean slate on the tracking domain: **Goal → Habit → Task** replaces v1's
flat `Habit` + `HabitGoal` + `HabitTracking` model entirely (no DB column
carries over — see current `prisma/schema.prisma` for what's being
replaced).

Carried over unchanged:
- Auth (JWT access/refresh, `User`, `RefreshToken` models, `/auth/*` routes,
  `fastify.authenticate` guard). Nothing in this spec touches login/signup.

Explicitly **not** carried over from v1 (no equivalent entity in V2 — if it's
not listed under Entities below, it doesn't exist):
- `category`, `color`, `description` on habits — no free-text/cosmetic
  metadata field anywhere in V2.
- `frequency: daily/weekly/monthly` enum — replaced by explicit
  `frequencyDays` (specific weekdays), which is strictly more expressive.
- Notifications/reminders — no scheduling or push entity in this spec.

## Entities

### Goal
- `title` — free text.
- `period`: `startDate`, `endDate` — calendar window (e.g. "this month",
  "this week"). Plain dates, inclusive range.
- A Goal only wraps its habits: it has no progress of its own. Each habit
  carries its own progress and streak.

### Habit (belongs to exactly one Goal)
- `name`
- `unit` — `km`, `hours`, `sessions`, or none (nullable). Purely a display
  label; does not change how progress or streak are computed.
- `goalType`: `SUM` or `THRESHOLD_COUNT`
  - `SUM` → `targetValue` (e.g. 100km total over the period). Progress =
    sum of `value` over `DONE` tasks across the period (null counts as 0)
    vs. `targetValue`.
  - `THRESHOLD_COUNT` → `dailyMinValue` (e.g. 8h) + `targetDays` (e.g. 30
    days). A day **counts** toward progress if that day's task is `DONE` and its
    `value ≥ dailyMinValue`. Progress = count of qualifying days vs. `targetDays`.
- `frequencyDays` — specific days of week (e.g. Mon/Wed/Fri). Tasks are only
  generated on these days; other days are not "missed," they simply don't
  exist for this habit.
- `defaultTaskValue` — pre-fills new tasks' `value`; editable per task after
  creation.
- `currentStreak`, `longestStreak` — computed and persisted (see Streak
  Logic). Not client-writable.

### Task (one habit's instance for one scheduled date, auto-generated per `frequencyDays`)
- `date`
- `value` — editable, defaults from `Habit.defaultTaskValue` when the task
  is first created/opened.
- `status` — `done` / `not_done`.
- `completedAt` — set when `status` transitions to `done`, cleared on
  reversion.

Note the relationship between `status` and `value`: `status` drives streak;
progress counts only `DONE` tasks, by their `value` — see `HABIT_TRACKER_V2_SCHEMA_API.md` §Known Gap
for the edge case this creates.

## Streak Logic (per habit)

- Counts **consecutive scheduled occurrences completed** — not consecutive
  calendar days. Non-scheduled days (per `frequencyDays`) are skipped
  entirely: they neither extend nor break the streak.
- A scheduled day stays "intact" until end-of-day — i.e. today's scheduled
  task being `not_done` does not yet break the streak; it only breaks once
  the day has fully passed without completion.
- Tracks both `currentStreak` (active run) and `longestStreak` (personal
  best, monotonically non-decreasing, never reset).

## Worked Examples

1. **"Run 100km this month"** → Habit "Run" (`unit: km`, `goalType: SUM`,
   `targetValue: 100`, `frequencyDays: [Mon, Wed, Fri]`,
   `defaultTaskValue: 5`). Each `DONE` task's `value` sums toward 100;
   streak counts consecutive completed Mon/Wed/Fri occurrences only.
2. **"Sleep better"** → Habit "Sleep" (`unit: hours`,
   `goalType: THRESHOLD_COUNT`, `dailyMinValue: 8`, `targetDays: 30`,
   `frequencyDays: every day`). Progress counts how many `DONE` days had
   `value ≥ 8`, out of 30 needed — not a sum of hours slept.
3. **"Get Fit" goal** with Habit "Run" (`km`) + Habit "Gym" (`sessions`) →
   the Goal has no progress of its own; API/UI show two separate per-habit
   progress bars (Run in km, Gym in sessions), each with its own streak.

## Open Questions Resolved

- **Scope**: confirmed clean slate — Goal/Habit/Task only, auth untouched,
  no categories/notifications/cosmetic fields carried over (per the
  "Explicitly not carried over" list above).
- **Next step**: this spec is the approved baseline;
  `HABIT_TRACKER_V2_SCHEMA_API.md` is the implementation-ready schema + API
  contract derived from it.
