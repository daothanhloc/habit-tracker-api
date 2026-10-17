# Goal as a container + tracking/streak correctness

Date: 2026-10-17
Repos: `habit-tracker-api` (BE, Fastify/Prisma), `habit-tracker-app` (FE, React/Vite)
Status: draft, awaiting owner approval

## 1. Intent

Tracking a habit and its streak are the core of this app. Today they are
unreliable: a user marks a habit done and the UI does not show it as done, and
progress does not move as expected. Separately, the Goal screen shows an
aggregate "overall progress" bar that does not fit how the owner thinks about
goals.

Owner's mental model:

- A **Goal** is a named period of time chosen by the user (e.g. "Get Fit",
  1 Oct - 31 Oct). It only **wraps habits**. It has no progress of its own.
- A **Habit** belongs to exactly one goal and carries its own target, schedule,
  progress and streak. Examples inside the goal "Get Fit":
  - *Run*: 100 km over the period, every day (`sum`, `targetValue 100`,
    `frequencyDays [0..6]`).
  - *Gym*: at least 20 days over the period, at least 30 minutes each time
    (`threshold_count`, `dailyMinValue 30`, `targetDays 20`).

The existing data model already expresses both examples; no new habit types are
needed.

## 1a. Findings that drive this design (verified 2026-10-17)

- **BE tracking and streak work.** Running the real `TaskService.upsert` +
  `recomputeStreak` against an in-memory Prisma stub, marking 3 consecutive
  days done stored `status = DONE` each time and produced streak 0 -> 2 -> 3
  (the first mark is 0 because the following days were still undone). Existing
  streak unit tests also pass. The streak algorithm needs no change.
- **FE reads the wrong case.** The API returns `status: 'DONE'` /
  `goalType: 'SUM' | 'THRESHOLD_COUNT'`; the FE compares against lowercase.
  Result: the Done switch never shows on, completed calendar days are never
  highlighted. This is the "marked done but UI does not mark it" symptom.
  Note the FE refetches the habit after each upsert, so streak display should
  follow once the BE value is stored; to be confirmed by the FE tests below
  (and a manual check), not assumed.
- **Threshold habits record no value.** `TaskEditor` is meant to pre-fill
  `dailyMinValue`, but compares `goalType === 'threshold_count'` against an
  uppercase response, so it pre-fills nothing and sends `value: null`. A
  `null` value never counts toward `THRESHOLD_COUNT` progress. This is why
  tracking a threshold habit (e.g. "Gym") can leave progress unchanged.
- **Progress ignores `status`** (section 5.5): a separate BE behaviour.
- **Only the FE consumes `unifiedProgress`.** Grep over both repos finds it in
  the BE schema/service/tests/PRP and in the FE type, `GoalCard`,
  `GoalDetailPage` and PRP only; the Postman collection does not reference it.

## 2. Goals

1. Remove goal-level progress (`unifiedProgress`) from the BE response and from
   every FE screen. A goal shows its title, period and its habits.
2. Make "mark done" work end to end: the FE shows the done state correctly,
   the BE stores it, recomputes the streak, and the FE shows the new streak and
   progress.
3. Make that behaviour hard to break again: automated tests on both sides that
   use API-shaped fixtures (uppercase enums, as the API really returns them).
4. Update the written docs (PRPs, README, CLAUDE.md, Postman) so they describe
   the new behaviour and the enum contract.

## 3. Non-goals

- No change to the streak algorithm (`HabitService.recomputeStreak`) or its
  rules (VNT day boundary, today is "intact", `longestStreak` never decreases).
- No change to the database schema; no migration. `unifiedProgress` was
  computed on read, never stored.
- No new habit types, no per-habit custom periods (a habit's period is its
  goal's period).
- No redesign of visual style, navigation, or auth.

## 4. Anti-goals (a failure even if it "works")

- Any regression in marking a task done/not-done, streak values, or the
  per-habit progress numbers.
- A FE that only works against fixtures it invented. Test fixtures must match
  real API responses (see section 6).
- Breaking either deployment while the other is not yet deployed (see 5.4).

## 5. Design

### 5.1 Goal becomes a container (BE)

- `GoalSchema`: remove `unifiedProgress`. Keep `habits: HabitSummary[]`; each
  summary still carries `progress`, `currentStreak`, `longestStreak`.
- `GoalService.toResponse`: stop computing it; delete `computeUnifiedProgress`.
- Affects `POST/GET/PUT /goals` and `GET /goals/:goalId` responses.
- Tests: remove the three `unifiedProgress` tests and the null assertion in
  `goal.service.test.ts`; add an assertion that the response has no
  `unifiedProgress` key and still lists habit summaries.

### 5.2 Goal becomes a container (FE)

- `types/goal.ts`: remove `unifiedProgress`.
- `GoalDetailPage`: remove the "Overall progress" block.
- `GoalCard`: show title, period, and one row per habit (name, `current /
  target`, thin progress bar, current streak). This is the layout the card
  already uses when `unifiedProgress` is null; the aggregate branch is deleted.
  Empty state "No habits yet" stays. *(Owner has not specified the card
  contents; this is the builder's call - see section 8.)*

### 5.3 Enum casing contract (FE)

The API takes lowercase enums in **requests** and returns uppercase in
**responses** (root `CLAUDE.md`). The FE types currently use lowercase for
responses, which is the bug.

- Response types: `TaskStatus = 'DONE' | 'NOT_DONE'`,
  `HabitGoalType = 'SUM' | 'THRESHOLD_COUNT'`.
- Request types: `TaskStatusInput = 'done' | 'not_done'`,
  `HabitGoalTypeInput = 'sum' | 'threshold_count'`.
- `UpsertTaskDto.status` and `CreateHabitDto.goalType` use the request types.
- Fix every comparison against a response value:
  `TaskEditor.tsx` (`done`, and `goalType === 'threshold_count'`),
  `TaskCalendarGrid.tsx` (done highlight and dashed border),
  `HabitForm.tsx` (edit mode must map response `goalType` to the form's
  lowercase value).
- Put the comparison/mapping in one small module (`src/lib/enums.ts`:
  `isTaskDone`, `toGoalTypeInput`) so components never compare raw strings.
- Response and request types are deliberately distinct, so comparing a
  response value to a lowercase literal (the current bug) becomes a TypeScript
  error instead of silently being always-false.

### 5.4 Deploy order

BE and FE deploy independently (Vercel). Either order is safe:

- BE first: old FE treats missing `unifiedProgress` as falsy, so the aggregate
  block is simply not rendered and the card falls back to per-habit rows.
- FE first: new FE ignores the extra `unifiedProgress` field.

The enum fix is FE-only and independent of the goal change.

### 5.5 Progress counts only tracked days (DECISION NEEDED - see section 7)

Current BE behaviour (`HabitService.withProgress` + `computeProgress`): progress
sums/counts task `value` over the goal period **regardless of `status`**. Task
rows are created lazily for every scheduled day that is viewed, pre-filled with
`habit.defaultTaskValue`, status `NOT_DONE`. Consequences:

- A `sum` habit with `defaultTaskValue 5` gains 5 progress per viewed scheduled
  day without the user marking anything, and marking done changes nothing.
- A `threshold_count` habit whose `defaultTaskValue >= dailyMinValue` counts
  untracked days as qualifying.

The V2 PRP calls this intentional ("independent of status"), so changing it is
a product decision, not a bug fix.

Proposed rule: progress only counts tasks with `status = DONE`.

- `SUM`: `current = sum of value over DONE tasks` (null counts as 0).
- `THRESHOLD_COUNT`: `current = DONE tasks with value >= dailyMinValue`.
- Un-marking a task (DONE -> NOT_DONE) removes its contribution.

### 5.6 Threshold habit value pre-fill (FE)

When the user ticks Done on a `threshold_count` habit with no value, the editor
pre-fills `dailyMinValue` (the code already intends this; it is broken by 5.3).
After 5.3 this works again; add a test so it stays working.

## 6. Tests (the safety net)

BE (Jest, already configured; unit tests with a stubbed Prisma):

- `TaskService.upsert` end-to-end streak scenarios using an in-memory Prisma
  stub: mark 3 consecutive days -> streak 3; un-mark today -> streak drops,
  `longestStreak` keeps its max; a gap breaks the streak; unscheduled date ->
  `unscheduled`, no streak change; future date -> `future`.
- `HabitService.progress` behaviour for 5.5 once decided.
- `GoalService` response shape (5.1).
- Run the real Fastify routes through the response serializer with a stub
  database for `POST/GET /goals/:id/habits` and `PUT /habits/:id/tasks/:date`
  using `tsx` (jest cannot load Fastify's `inject` ESM dependency in this repo).
  Kept as a script under `scripts/` or run in CI via `tsx`; builder decides.

FE (no test runner exists today; adding one is part of this work):

- Add `vitest` (+ `jsdom`, `@testing-library/react`) as dev dependencies and a
  `test` script. Builder's call on exact versions.
- Fixtures are copied from real API responses (uppercase `status`, `goalType`).
- Tests: `isTaskDone`; `TaskEditor` renders the switch checked for
  `status: 'DONE'`, unchecked for `'NOT_DONE'`, and sends `{status: 'done'}` on
  toggle; `TaskCalendarGrid` marks done days; `taskStore.upsertTask` updates the
  range, the today entry, and refetches the habit; `HabitForm` edit mode opens
  a `THRESHOLD_COUNT` habit as `threshold_count`.
- `npm run build` (runs `tsc -b`) must pass.

## 7. Open decisions for the owner

1. **Progress rule (5.5):** count only `DONE` tasks (recommended), or keep the
   current "value regardless of status" rule?
   - If DONE-only: existing habits that have a `defaultTaskValue` will show
     **lower** progress after deploy (untracked days stop counting). No
     migration or backfill; task rows and streaks are untouched. The change
     ships as its own commit so it can be dropped without affecting the rest.
   - If kept: sections 5.5 and the BE progress tests are removed from scope;
     the progress symptom for habits with default values remains.

## 8. Left to the builder

- Exact `GoalCard` layout (section 5.2), within the constraint of no
  goal-level progress.
- Test library versions, file placement of the serializer script.
- Commit/PR split: one PR per repo; BE docs + code in the API repo, FE docs +
  code in the app repo.

## 9. Docs to update

- `habit-tracker-api/PRPs/HABIT_TRACKER_V2_SCHEMA_API.md`: section 4
  (`unifiedProgress` removed; progress rule per decision 7.1), section 6 table
  row for `GET /goals`, section 8 (known gap) if 7.1 changes.
- `habit-tracker-app/PRPs/HABIT_TRACKER_V2_FRONTEND.md`: Goal type (line ~90),
  GoalCard/GoalDetail sections (~246-258), `unifiedProgress` notes (~371,
  ~399-401), `TaskStatus`/`HabitGoalType` types (~148) with the casing rule.
- `habit-tracker-api/README.md` and `postman_collection.json` (List Goals
  description): goals return habits, no goal-level progress.
- Root `CLAUDE.md`: add `TaskStatus`/`HabitGoalType` to the lowercase-request /
  uppercase-response contract note.
