import { TaskService } from '../../../src/services/task.service';
import { HabitService } from '../../../src/services/habit.service';
import {
  dayOfWeek,
  formatDateOnly,
  parseDateOnly,
  vntTodayDateOnly,
} from '../../../src/services/date.util';
import { createInMemoryPrisma, InMemoryHabit } from '../../helpers/inMemoryPrisma';

const addDays = (dateStr: string, n: number) =>
  formatDateOnly(new Date(parseDateOnly(dateStr).getTime() + n * 86400000));

describe('tracking + streak scenarios (TaskService.upsert)', () => {
  const today = vntTodayDateOnly();
  const d = (offset: number) => addDays(today, offset);

  function setup(overrides: Partial<InMemoryHabit> = {}) {
    const habit: InMemoryHabit = {
      id: 'habit-1',
      userId: 'user-1',
      goalId: 'goal-1',
      goalType: 'DAYS',
      targetValue: null,
      dailyMinValue: null,
      targetDays: 10,
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      defaultTaskValue: null,
      currentStreak: 0,
      longestStreak: 0,
      goal: {
        id: 'goal-1',
        startDate: parseDateOnly(d(-30)),
        endDate: parseDateOnly(d(30)),
      },
      ...overrides,
    };
    const mem = createInMemoryPrisma(habit);
    const service = new TaskService(mem.prisma, new HabitService(mem.prisma));
    return { ...mem, service };
  }

  const mark = (
    s: ReturnType<typeof setup>,
    date: string,
    status: 'done' | 'not_done'
  ) => s.service.upsert('habit-1', 'user-1', date, { status });

  it('marks 3 consecutive days done -> streak 3 and longest 3', async () => {
    const s = setup();
    // Streak is anchored at today: an older done day alone is not a streak.
    await mark(s, d(-2), 'done');
    expect(s.habit.currentStreak).toBe(0);
    await mark(s, d(-1), 'done');
    expect(s.habit.currentStreak).toBe(2);
    await mark(s, d(0), 'done');
    expect(s.habit.currentStreak).toBe(3);
    expect(s.habit.longestStreak).toBe(3);
  });

  it('un-marking today drops currentStreak but keeps longestStreak', async () => {
    const s = setup();
    await mark(s, d(-2), 'done');
    await mark(s, d(-1), 'done');
    await mark(s, d(0), 'done');
    await mark(s, d(0), 'not_done');
    expect(s.habit.currentStreak).toBe(2);
    expect(s.habit.longestStreak).toBe(3);
  });

  it('a NOT_DONE gap before today breaks the streak', async () => {
    const s = setup();
    await mark(s, d(-2), 'done');
    await mark(s, d(-1), 'not_done');
    await mark(s, d(0), 'done');
    expect(s.habit.currentStreak).toBe(1);
  });

  it('marking only today done gives streak 1', async () => {
    const s = setup();
    await mark(s, d(0), 'done');
    expect(s.habit.currentStreak).toBe(1);
    expect(s.habit.longestStreak).toBe(1);
  });

  it("unscheduled date returns {kind:'unscheduled'} and leaves streak unchanged", async () => {
    const yesterday = d(-1);
    const s = setup({ frequencyDays: [(dayOfWeek(yesterday) + 1) % 7] });
    s.habit.currentStreak = 4;
    s.habit.longestStreak = 6;
    const result = await mark(s, yesterday, 'done');
    expect(result).toEqual({ kind: 'unscheduled' });
    expect(s.habit.currentStreak).toBe(4);
    expect(s.habit.longestStreak).toBe(6);
    expect(s.tasks.size).toBe(0);
  });

  it("future date returns {kind:'future'} and leaves streak unchanged", async () => {
    const s = setup();
    s.habit.currentStreak = 2;
    s.habit.longestStreak = 5;
    const result = await mark(s, d(1), 'done');
    expect(result).toEqual({ kind: 'future' });
    expect(s.habit.currentStreak).toBe(2);
    expect(s.habit.longestStreak).toBe(5);
    expect(s.tasks.size).toBe(0);
  });

  it("the stored and returned task status is the uppercase 'DONE'/'NOT_DONE'", async () => {
    const s = setup();
    const done: any = await mark(s, d(0), 'done');
    expect(done.kind).toBe('ok');
    expect(done.task.status).toBe('DONE');
    expect(s.tasks.get(d(0)).status).toBe('DONE');

    const undone: any = await mark(s, d(0), 'not_done');
    expect(undone.task.status).toBe('NOT_DONE');
    expect(s.tasks.get(d(0)).status).toBe('NOT_DONE');
  });
});
