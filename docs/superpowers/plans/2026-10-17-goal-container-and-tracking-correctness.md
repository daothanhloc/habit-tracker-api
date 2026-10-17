# Goal Container + Tracking Correctness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make goals a pure container for habits (no goal-level progress), make "mark done" show correctly in the FE, and lock tracking + streak behaviour behind tests on both sides.

**Architecture:** BE (Fastify/Prisma) drops `unifiedProgress` and counts only `DONE` tasks toward habit progress; its streak code is unchanged and gets scenario tests. FE (React/Vite) separates response enums (uppercase) from request enums (lowercase), fixes every response comparison through one helper module, drops the aggregate progress UI, and gains a vitest suite using API-shaped fixtures.

**Tech Stack:** BE: TypeScript, Fastify 5, TypeBox, Prisma, Jest (ts-jest ESM mapper). FE: React 18, Vite, Zustand, Tailwind v4, shadcn/Radix, new: vitest + jsdom + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-17-goal-container-and-tracking-correctness-design.md` (this repo). Owner decision 7.1 = **DONE-only progress** (taken from "approved" on the recommendation).

## Global Constraints

- BE streak algorithm `HabitService.recomputeStreak` and its rules are NOT modified (VNT day boundary, today intact, `longestStreak` never decreases).
- No Prisma schema change, no migration.
- Requests use lowercase enums (`done|not_done`, `sum|threshold_count`); responses are uppercase (`DONE|NOT_DONE`, `SUM|THRESHOLD_COUNT`).
- Two repos, one PR each, base `main`: API `habit-tracker-api`, FE `habit-tracker-app`. Run commands from inside each repo. Root `/Users/locdao/habbit-tracker` is not a git repo.
- Do not stage `.gitignore` in either repo (owner's uncommitted change). Do not stage the untracked FE `.env.production`.
- Commit messages end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; PR bodies end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- FE: `npm run build` (runs `tsc -b`) and `npm run lint` must pass at the end of every FE task. BE: `npm test` and `npx tsc --noEmit` must pass at the end of every BE task.
- FE test fixtures must mirror real API responses (uppercase `status`, `goalType`).
- The DONE-only progress change (Task 3) is its own commit so it can be reverted alone.

## Review Focus

1. Toggle Done on then off: switch, calendar cell and streak return to the not-done state (FE Task 5 editor test; BE Task 2 un-mark scenario).
2. Threshold habit with `defaultTaskValue: null`, ticking Done sends `value = dailyMinValue`, not `null` (FE Task 5).
3. Unscheduled or future date: BE returns `unscheduled`/`future` and changes no streak (BE Task 2); FE cell stays disabled, unchanged (FE Task 6).
4. Goal with zero habits renders "No habits yet" on card and detail, no crash (FE Task 7).
5. Editing a `SUM` habit opens as `sum`, a `THRESHOLD_COUNT` habit opens as `threshold_count` with its `dailyMinValue`/`targetDays` (FE Task 6).

---

## BE tasks (repo `habit-tracker-api`, branch `feat/goal-container-tracking-correctness`)

### Task 0: Branches and spec/plan commit

- [ ] **Step 1:** In `habit-tracker-api`: `git switch -c feat/goal-container-tracking-correctness origin/main`; `git pull` first if `main` is behind. Stage only `docs/superpowers/specs/2026-10-17-goal-container-and-tracking-correctness-design.md` and this plan; commit `docs: design and plan for goal container and tracking correctness`.
- [ ] **Step 2:** In `habit-tracker-app`: `git switch -c fix/task-status-case-and-goal-container origin/main` (leave `.gitignore` and `.env.production` unstaged; carry them in the working tree).

### Task 1: Remove `unifiedProgress` from the BE

**Files:**
- Modify: `src/schemas/goal.schema.ts` (drop `unifiedProgress` from `GoalSchema`; remove the now-unused `ProgressSchema`/`Progress` exports only if nothing else imports them: `grep -rn "ProgressSchema" src`)
- Modify: `src/services/goal.service.ts` (`toResponse` no `unifiedProgress`; delete `computeUnifiedProgress`)
- Modify: `tests/unit/services/goal.service.test.ts`
- Modify: `PRPs/HABIT_TRACKER_V2_SCHEMA_API.md` (§4 bullet `Goal.unifiedProgress` removed and replaced by "Goals have no progress of their own; each habit's progress covers the goal period"; §6 table row `GET /goals` loses "and `unifiedProgress` (§4)")
- Modify: `README.md` (endpoint table row `GET /goals`: "List goals with their habits"), `CLAUDE.md` unchanged

**Interfaces:**
- Produces: `GoalService.create/findAll/findById/update` responses with shape `{id, userId, title, startDate, endDate, habits: HabitSummary[], createdAt, updatedAt}` and **no** `unifiedProgress` key.

- [ ] **Step 1: Failing test.** In `goal.service.test.ts` replace the `unifiedProgress` describe block and the `toBeNull` assertion with: `it('returns the goal with its habit summaries and no unifiedProgress', ...)` asserting `result` has `habits` of the stubbed length and `expect(result).not.toHaveProperty('unifiedProgress')`; also keep the create-test but assert `habits` equals `[]` and no `unifiedProgress`.
- [ ] **Step 2:** `npm test -- --testPathPattern=goal.service` → FAIL (property exists).
- [ ] **Step 3:** Implement the schema/service/doc edits above.
- [ ] **Step 4:** `npm test && npx tsc --noEmit` → PASS.
- [ ] **Step 5:** Commit `refactor: goals no longer expose unifiedProgress`.

### Task 2: Tracking + streak scenario tests (safety net, no production change expected)

**Files:**
- Create: `tests/helpers/inMemoryPrisma.ts`
- Create: `tests/unit/services/tracking.flow.test.ts`

**Interfaces:**
- Produces: `createInMemoryPrisma(habit: InMemoryHabit): { prisma: any; tasks: Map<string, any>; habit: InMemoryHabit }` where `InMemoryHabit` has `id, userId, goalId, goalType, targetValue, dailyMinValue, targetDays, frequencyDays, defaultTaskValue, currentStreak, longestStreak, goal: {id,startDate,endDate}`. Stub supports `habit.findFirst/findUnique/update`, `task.findUnique/upsert/findMany/createMany/deleteMany`, and `findMany` honours `where.habitId`, `where.date` (`gte`, `lte`, `in`) and `where.status`. Task rows keyed by `YYYY-MM-DD`.

- [ ] **Step 1:** Write the helper (reuse the shape of the verified scratch simulation: `task.upsert` merges `update` over an existing row, `create` otherwise).
- [ ] **Step 2: Tests** in `tracking.flow.test.ts`, using `new TaskService(prisma, new HabitService(prisma))` and `vntTodayDateOnly()` for dates, habit scheduled all 7 days, goal period covering today:
  - `marks 3 consecutive days done -> streak 3 and longest 3`
  - `un-marking today drops currentStreak but keeps longestStreak`
  - `a NOT_DONE gap before today breaks the streak`
  - `marking only today done gives streak 1`
  - `unscheduled date returns {kind:'unscheduled'} and leaves streak unchanged` (habit scheduled only on a weekday that is not the date tested)
  - `future date returns {kind:'future'} and leaves streak unchanged`
  - `the stored and returned task status is the uppercase 'DONE'/'NOT_DONE'`
- [ ] **Step 3:** `npm test -- --testPathPattern=tracking.flow` → PASS (these assert verified behaviour). If any FAIL, stop and report: that is a real BE bug to triage with the owner before continuing.
- [ ] **Step 4:** Commit `test: tracking and streak scenarios through TaskService.upsert`.

### Task 3: Progress counts only DONE tasks (isolated commit)

**Files:**
- Modify: `src/services/habit.service.ts` (`progressFor`: add `status: 'DONE'` to the `task.findMany` `where`)
- Modify: `tests/unit/services/tracking.flow.test.ts` (add progress cases) 
- Modify: `PRPs/HABIT_TRACKER_V2_SCHEMA_API.md` (§4 SUM/THRESHOLD bullets and the "independent of status" bullet; §8 Known Gap rewritten: progress now requires `DONE`; a DONE task with value below `dailyMinValue` still does not count)

**Interfaces:**
- Consumes: `createInMemoryPrisma` (Task 2); `HabitService.findById(habitId, userId)` returning `progress: {current, target}`.
- Produces: progress = sum of `value` over `DONE` tasks (SUM) / count of `DONE` tasks with `value >= dailyMinValue` (THRESHOLD_COUNT); `computeProgress` itself is unchanged.

- [ ] **Step 1: Failing tests** (add to `tracking.flow.test.ts` or a sibling `progress.flow.test.ts`):
  - `SUM: lazily created NOT_DONE tasks with defaultTaskValue do not count` (call `taskService.getToday`, then `habitService.findById`, expect `progress.current === 0`)
  - `SUM: marking done adds the value; un-marking removes it` (current 5 then 0 with `defaultTaskValue 5`)
  - `THRESHOLD_COUNT: DONE with value >= dailyMinValue counts, DONE with null value does not, NOT_DONE with qualifying default does not`
- [ ] **Step 2:** `npm test -- --testPathPattern=flow` → the new tests FAIL (NOT_DONE rows currently count).
- [ ] **Step 3:** Implement the one-line filter in `progressFor` and the PRP edits.
- [ ] **Step 4:** `npm test && npx tsc --noEmit` → PASS (existing `habit.service` mocks of `task.findMany` return rows regardless of `where`, so they still pass).
- [ ] **Step 5:** Commit `fix: habit progress counts only DONE tasks` (own commit).

### Task 4: BE end-to-end serializer check and API PR

- [ ] **Step 1:** Run, from the API repo root with `npx tsx`, a throwaway `.mts` (delete it afterwards, never commit) that registers `habitRoutes`, `goalRoutes`, `taskRoutes` on a bare Fastify with stubbed `prisma` + `authenticate`, then injects `GET /goals/:id` and `PUT /habits/:id/tasks/:date` and prints status + body. Expected: 200 responses, goal body has no `unifiedProgress`, task body `status` is `"DONE"`.
- [ ] **Step 2:** `npm test && npx tsc --noEmit && npm run lint` → PASS.
- [ ] **Step 3:** Push the branch, open PR to `main` (title `feat: goals are containers; progress counts only DONE tasks; tracking tests`), body notes: deploy order is free (spec 5.4), and that Task 3 can be reverted alone; progress for habits with `defaultTaskValue` will read lower after deploy.

---

## FE tasks (repo `habit-tracker-app`, branch `fix/task-status-case-and-goal-container`)

### Task 5: Test runner, enum helpers, and the Done toggle fix

**Files:**
- Modify: `package.json` (devDependencies `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`; script `"test": "vitest run"`)
- Create: `vitest.config.ts` (jsdom env, `@` alias to `./src`, setup file `src/test/setup.ts` importing `@testing-library/jest-dom/vitest`)
- Create: `src/lib/enums.ts`, `src/lib/enums.test.ts`
- Modify: `src/types/task.ts`, `src/types/habit.ts`
- Modify: `src/components/tasks/TaskEditor.tsx`
- Create: `src/components/tasks/TaskEditor.test.tsx`, `src/test/fixtures.ts`

**Interfaces:**
- Produces in `src/types/task.ts`: `TaskStatus = 'DONE' | 'NOT_DONE'`; `TaskStatusInput = 'done' | 'not_done'`; `Task.status: TaskStatus`; `UpsertTaskDto.status?: TaskStatusInput`.
- Produces in `src/types/habit.ts`: `HabitGoalType = 'SUM' | 'THRESHOLD_COUNT'`; `HabitGoalTypeInput = 'sum' | 'threshold_count'`; `HabitSummary.goalType: HabitGoalType`; `CreateHabitDto` keeps literals `'sum'`/`'threshold_count'` (typed via `HabitGoalTypeInput`).
- Produces in `src/lib/enums.ts`: `isTaskDone(task: Pick<Task,'status'>): boolean`; `toTaskStatusInput(done: boolean): TaskStatusInput`; `toGoalTypeInput(goalType: HabitGoalType): HabitGoalTypeInput`; `isThreshold(goalType: HabitGoalType): boolean`.
- Produces in `src/test/fixtures.ts`: `apiTask(overrides?: Partial<Task>): Task` and `apiHabit(overrides?: Partial<Habit>): Habit` with uppercase enums copied from a real response shape.

- [ ] **Step 1:** Install dev deps, add config + setup, add `npm test`; confirm `npm test` runs with zero tests (`No test files found` is acceptable) and `npm run build` still passes.
- [ ] **Step 2: Failing tests.** `enums.test.ts`: `isTaskDone({status:'DONE'})` true, `'NOT_DONE'` false; `toTaskStatusInput(true)==='done'`; `toGoalTypeInput('THRESHOLD_COUNT')==='threshold_count'`, `'SUM'→'sum'`. `TaskEditor.test.tsx` (render with `apiTask`/`apiHabit` fixtures and a `vi.fn()` `onSave`): switch is checked for `status:'DONE'` and unchecked for `'NOT_DONE'`; toggling an unchecked switch calls `onSave` with `{status:'done', value: <number>}`; toggling a checked switch calls `onSave` with `status:'not_done'`; threshold habit (`goalType:'THRESHOLD_COUNT'`, `dailyMinValue:10`, `defaultTaskValue:null`, task `value:null`) shows `10` in the value input and sends `value: 10` on toggle; a `SUM` habit with no default and no value sends `value: null`.
- [ ] **Step 3:** `npm test` → FAIL.
- [ ] **Step 4:** Implement the types, `enums.ts`, and update `TaskEditor` (`done = isTaskDone(task)`, `status: toTaskStatusInput(checked)`, threshold check via `isThreshold`). Fix any other `tsc` errors the type split surfaces **in files owned by Tasks 5 and 6 only**; if the build breaks elsewhere, Task 6 files are fixed there (do not leave `build` red at commit: stub nothing, fix the call sites listed in Task 6 in the same commit if they block the build).
- [ ] **Step 5:** `npm test && npm run build && npm run lint` → PASS.
- [ ] **Step 6:** Commit `fix: read task status and goal type in the API's uppercase form`.

### Task 6: Calendar, form and store use the corrected contract

**Files:**
- Modify: `src/components/tasks/TaskCalendarGrid.tsx` (lines ~108, ~110: use `isTaskDone(task)`)
- Modify: `src/components/habits/HabitForm.tsx` (`habitToDefaults`: branch on `isThreshold(habit.goalType)`, emit `goalType: toGoalTypeInput(habit.goalType)` values)
- Create: `src/components/tasks/TaskCalendarGrid.test.tsx`, `src/components/habits/HabitForm.test.tsx`, `src/store/taskStore.test.ts`

**Interfaces:**
- Consumes: Task 5 helpers and fixtures.
- Produces: no new exports.

- [ ] **Step 1: Failing tests.**
  - `TaskCalendarGrid`: with tasks fetched for the current month (mock `@/services/taskService.listRange` to resolve `apiTask({date, status:'DONE'})` for one scheduled past date and `'NOT_DONE'` for another), the DONE cell has class `bg-primary` and the NOT_DONE cell has `border-dashed` and not `bg-primary`; a future scheduled date and an unscheduled weekday cell are not clickable (rendered as `div`, no popover trigger).
  - `HabitForm` edit mode: `apiHabit({goalType:'THRESHOLD_COUNT', dailyMinValue:30, targetDays:20})` renders the daily-minimum and target-days fields with 30 and 20; `apiHabit({goalType:'SUM', targetValue:100})` renders the sum field with 100.
  - `taskStore.upsertTask` (mock `taskService.upsert` to resolve `apiTask({status:'DONE'})` and `habitService.get` to resolve `apiHabit({currentStreak: 3})`): updates `tasksByHabitId` entry for that date, updates `todayByHabitId` when the date matches, and leaves `useHabitStore.getState().currentHabit.currentStreak === 3`; a rejected upsert leaves state unchanged and does not throw.
- [ ] **Step 2:** `npm test` → new tests FAIL (calendar and form).
- [ ] **Step 3:** Implement the two component edits (store needs none unless the test reveals a defect; if it does, fix minimally and note it in the PR).
- [ ] **Step 4:** `npm test && npm run build && npm run lint` → PASS.
- [ ] **Step 5:** Commit `fix: calendar highlight and habit edit form use uppercase enums`.

### Task 7: Goal is a container in the FE

**Files:**
- Modify: `src/types/goal.ts` (remove `unifiedProgress`)
- Modify: `src/components/goals/GoalCard.tsx` (title, period; one row per habit: name, `current / target`, thin progress bar, `currentStreak`; "No habits yet" when empty; delete the aggregate branch and the unused `progressPercent`/`formatProgressTarget` imports only if unused)
- Modify: `src/pages/GoalDetailPage.tsx` (delete the "Overall progress" block, lines ~133-146, and the `Progress`/`progressPercent` imports if now unused)
- Create: `src/components/goals/GoalCard.test.tsx`
- Modify: `PRPs/HABIT_TRACKER_V2_FRONTEND.md` (Goal type ~line 90; GoalCard/GoalDetail sections ~246-258; `unifiedProgress` notes ~371, ~399-401; `TaskStatus`/`HabitGoalType` type blocks ~148 with the request/response casing rule)
- Modify: `postman_collection.json` (List Goals description: "All goals for the user, each with its habits" — no progress wording) and root `/Users/locdao/habbit-tracker/CLAUDE.md` (add `TaskStatus` and `HabitGoalType` to the lowercase-request / uppercase-response note; this root file is not in either repo, so edit it directly and mention it in the PR)

**Interfaces:**
- Consumes: `apiHabit` fixture (Task 5); `Goal` type without `unifiedProgress`.

- [ ] **Step 1: Failing test** `GoalCard.test.tsx` (wrap in `MemoryRouter`): goal with two habits renders both names, each `current / target` text (e.g. `42 / 100`, `8 / 20`) and each streak; no text "Overall"/"Progress" label for the goal; goal with `habits: []` renders `No habits yet`.
- [ ] **Step 2:** `npm test` → FAIL (type error / aggregate branch).
- [ ] **Step 3:** Implement the edits above.
- [ ] **Step 4:** `npm test && npm run build && npm run lint` → PASS.
- [ ] **Step 5:** Commit `feat: goals show habits only, no goal-level progress`.

### Task 8: Verify in the real app and open the FE PR

- [ ] **Step 1:** Start BE locally against a dev DB if one is available (`npm run dev` in the API, `VITE_API_URL=http://localhost:3000`), or use the deployed API after the BE PR deploys. In the browser: create a goal, add a `sum` habit and a `threshold_count` habit, open each habit, toggle Done today, confirm the switch stays on after reload, the calendar cell is filled, streak increments, progress moves; toggle off and confirm streak and progress revert. Record what was and was not exercised in the PR. If no environment is available, say so in the PR and do not claim manual verification.
- [ ] **Step 2:** `npm test && npm run build && npm run lint` → PASS.
- [ ] **Step 3:** Push, open PR to `main`: `fix: show task done state and drop goal-level progress`, body lists the three root causes (uppercase status, uppercase goalType, null threshold value) and links the BE PR.

## Self-review notes

- Spec 5.1 → Task 1; 5.2 → Task 7; 5.3 → Tasks 5, 6; 5.4 → PR text in Tasks 4, 8; 5.5 → Task 3; 5.6 → Task 5 (threshold pre-fill test); section 6 tests → Tasks 2, 3, 4, 5, 6, 7; section 9 docs → Tasks 1, 3, 7.
- Task 5/6 split: the type split can break `tsc` in files Task 6 owns; Task 5 step 4 says to fix blocking call sites in the same commit rather than leave the build red.
