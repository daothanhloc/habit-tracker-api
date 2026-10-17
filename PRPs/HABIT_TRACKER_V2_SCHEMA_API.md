# Habit Tracker V2 — Schema & API

## Status: Draft for review
Derived from `PRPs/HABIT_TRACKER_V2_SPEC.md` (read that first for domain
rules/rationale) and the current codebase's conventions (Fastify + TypeBox
+ Prisma, `src/routes/goals.ts` / `src/routes/tracking.ts` as the pattern
reference). This is a **replacement** of the v1 tracking schema — `Habit`,
`HabitGoal`, `HabitTracking`, and the `Frequency`/`GoalType`(weekly/monthly/
yearly) enums in the current `prisma/schema.prisma` are dropped entirely,
not extended. `User` and `RefreshToken` are untouched.

## 1. Prisma Schema

```prisma
enum HabitGoalType {
  SUM
  THRESHOLD_COUNT
}

enum TaskStatus {
  DONE
  NOT_DONE
}

model Goal {
  id        String   @id @default(uuid())
  userId    String
  title     String   @db.VarChar(255)
  startDate DateTime @db.Date
  endDate   DateTime @db.Date

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  habits Habit[]

  @@index([userId])
}

model Habit {
  id      String @id @default(uuid())
  goalId  String
  userId  String

  name             String        @db.VarChar(255)
  unit             String?
  goalType         HabitGoalType
  targetValue      Float?        // required when goalType = SUM
  dailyMinValue    Float?        // required when goalType = THRESHOLD_COUNT
  targetDays       Int?          // required when goalType = THRESHOLD_COUNT
  frequencyDays    Int[]         // 0=Sun..6=Sat, non-empty
  defaultTaskValue Float?

  currentStreak Int @default(0)
  longestStreak Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  goal  Goal   @relation(fields: [goalId], references: [id], onDelete: Cascade)
  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks Task[]

  @@index([goalId])
  @@index([userId])
}

model Task {
  id      String @id @default(uuid())
  habitId String

  date        DateTime   @db.Date
  value       Float?
  status      TaskStatus @default(NOT_DONE)
  completedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  habit Habit @relation(fields: [habitId], references: [id], onDelete: Cascade)

  @@unique([habitId, date])
  @@index([habitId, date])
}
```

`User` gains a `goals Goal[]` relation (replacing its old `habits`/`goals`/
`tracking` relations to the dropped v1 models).

Validation not expressible in the Prisma schema (enforced in the service
layer / TypeBox body schemas):
- `goalType: SUM` → `targetValue` required, `dailyMinValue`/`targetDays`
  must be absent.
- `goalType: THRESHOLD_COUNT` → `dailyMinValue` + `targetDays` required,
  `targetValue` must be absent.
- `frequencyDays` non-empty, values in `0..6`, no duplicates.

## 2. Date & Timezone Handling

- `date`, `startDate`, `endDate` are plain calendar dates (`YYYY-MM-DD` over
  the wire; `@db.Date` in Postgres — no time component, no timezone stored).
- **"Today" is resolved server-side using a fixed Vietnam-time (UTC+7)
  boundary**, not the request's `Date` header or the client's local clock.
  All day-boundary logic (lazy task creation, streak "intact until EOD",
  future-date rejection) uses this server-side today.
- Comparisons are done as date strings / SQL date equality — never by
  parsing into a JS `Date` and comparing instants, which would be
  timezone-sensitive.

## 3. Task Lifecycle (Lazy Generation)

Tasks are **not** pre-created for the full goal period up front. A `Task`
row is materialized the first time it's needed:
- `GET /habits/:habitId/tasks?from=&to=` creates (if missing) and returns
  rows for every date in `[from, to]` that is (a) in the habit's
  `frequencyDays` and (b) on or before server-side today. Dates after today
  are never materialized by a range read.
- `GET /habits/:habitId/tasks/today` creates (if missing) and returns
  today's row, or `404` if today is not in `frequencyDays` ("unscheduled").
- New rows default to `value: Habit.defaultTaskValue`, `status: NOT_DONE`.

This keeps the table free of rows for dates nobody has viewed yet, and
means a client can infer "this scheduled date is in the future" purely from
a range read returning no row for it — no local "what is today" computation
needed (see `HABIT_TRACKER_V2_SPEC.md` consumer notes).

## 4. Progress Computation

Computed on read, not stored (except `currentStreak`/`longestStreak`, which
*are* persisted on `Habit` and recomputed on every task mutation).

- **`SUM`**: `current = Σ task.value` over all tasks in `[goal.startDate,
  goal.endDate]` (null `value` treated as 0, regardless of `status`).
  `target = habit.targetValue`.
- **`THRESHOLD_COUNT`**: `current = count of tasks where value ≥
  dailyMinValue` over the period (regardless of `status`). `target =
  habit.targetDays`.
- Progress is driven by `value`, independent of `status`. This is
  intentional (see §8 Known Gap) — don't special-case it away.
- Goals have no progress of their own; each habit's progress covers the
  goal period.

## 5. Streak Recomputation

Recomputed on every `PUT .../tasks/:date` call that changes `status`, for
the affected habit:
1. Walk the habit's scheduled dates (per `frequencyDays`) from server-side
   today backwards.
2. Skip non-scheduled dates (they don't exist as rows — no-op).
3. For each scheduled date: if `status = DONE`, extend the run; if
   `NOT_DONE` **and the date is before today**, the run breaks — stop. If
   `NOT_DONE` **and the date is today**, the day is still "intact" (not yet
   end-of-day) — don't break the streak on today's incomplete task, just
   don't count it yet either.
4. `currentStreak` = length of that run. `longestStreak` = `max(longestStreak,
   currentStreak)` — only ever grows.

The client never recomputes streaks locally; it always reads the
server-persisted value back after a mutation.

## 6. REST API

All routes under `fastify.authenticate` (bearer JWT, matching
`src/plugins/authenticate.ts`), scoped to `request.user.userId` the same
way `src/routes/goals.ts` scopes to habit ownership today. Error shape and
status-code mapping (`P2025` → 404, `P2002` → 400 duplicate) follow the
existing pattern in `src/routes/goals.ts` / `src/routes/tracking.ts`.

### Goals
| Method | Path | Notes |
|---|---|---|
| POST | `/goals` | Body: `{title, startDate, endDate}` |
| GET | `/goals` | List user's goals, each with `habits: HabitSummary[]` |
| GET | `/goals/:goalId` | Single goal, same shape |
| PUT | `/goals/:goalId` | Partial update of `title`/`startDate`/`endDate` |
| DELETE | `/goals/:goalId` | Cascades to habits and tasks. `204` on success, `404` if not found/not owned |

### Habits
| Method | Path | Notes |
|---|---|---|
| POST | `/goals/:goalId/habits` | Body per discriminated union in §1 validation rules. `404` if goal not found/not owned |
| GET | `/goals/:goalId/habits` | List habits for a goal |
| GET | `/habits/:habitId` | Full habit incl. `progress`, `currentStreak`, `longestStreak` |
| PUT | `/habits/:habitId` | Partial update. **Side effect**: if `frequencyDays` changes, delete `NOT_DONE` task rows that fall outside the new schedule and let future reads lazily regenerate correct rows under the new rules; `DONE` tasks are never touched (completed history is immutable — see `HABIT_TRACKER_V2_SPEC.md` — completed tasks are never auto-modified) |
| DELETE | `/habits/:habitId` | Cascades to tasks |

### Tasks
| Method | Path | Notes |
|---|---|---|
| GET | `/habits/:habitId/tasks?from=YYYY-MM-DD&to=YYYY-MM-DD` | Lazy-creates + returns rows in range (§3) |
| GET | `/habits/:habitId/tasks/today` | Lazy-creates + returns today's row; `404 "not scheduled today"` if today ∉ `frequencyDays` |
| PUT | `/habits/:habitId/tasks/:date` | Body: `{value?, status?}`. Upserts, recomputes streak (§5). `404` if `date` ∉ `frequencyDays` (off-schedule). `400 "<date> is in the future and cannot be completed yet"` if `date` is after server-side today |

## 7. Migration Notes

- Single Prisma migration: drop `Habit`, `HabitGoal`, `HabitTracking` tables
  and the `Frequency` / old `GoalType` enums; create `Goal`, `Habit` (new
  shape), `Task`, `HabitGoalType`, `TaskStatus`.
- No data migration path from v1 rows to v2 — the domain models aren't
  compatible field-for-field (e.g. v1 `HabitTracking.completedAt` is a
  single timestamp per completion with no `value`; v2 `Task` is one row per
  scheduled date with a `value`). Treat this as a destructive schema
  replacement, not a backfill.
- `User`/`RefreshToken` and all `/auth/*` routes are unaffected.

## 8. Known Gap (carried from spec)

For a `THRESHOLD_COUNT` habit, `status: DONE` (streak) and `value ≥
dailyMinValue` (progress) are independent. A day can be marked done
(extending the streak) while its `value` is `null` or below threshold
(not counting toward progress target). This is intentional per-field
independence (§4), not a bug — but it means UI should always collect a
`value` when marking done (defaulting to `dailyMinValue` so a plain toggle
qualifies by default) to avoid *new* zero-value "done" tasks. Historical
done-but-unqualified tasks are not retroactively fixed, since completed
tasks are never auto-modified.
