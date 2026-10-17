import { formatDateOnly } from '../../src/services/date.util';

export interface InMemoryHabit {
  id: string;
  userId: string;
  goalId: string;
  goalType: 'SUM' | 'DAYS' | 'THRESHOLD_COUNT';
  targetValue: number | null;
  dailyMinValue: number | null;
  targetDays: number | null;
  frequencyDays: number[];
  defaultTaskValue: number | null;
  currentStreak: number;
  longestStreak: number;
  goal: { id: string; startDate: Date; endDate: Date };
}

const key = (d: Date) => formatDateOnly(d);

// Minimal in-memory Prisma stand-in for habit/task flows. Task rows are keyed
// by YYYY-MM-DD (one habit per instance).
export function createInMemoryPrisma(habit: InMemoryHabit) {
  const tasks = new Map<string, any>();
  let seq = 0;

  const matches = (row: any, where: any = {}) => {
    if (where.habitId !== undefined && row.habitId !== where.habitId) return false;
    if (where.status !== undefined && row.status !== where.status) return false;
    const d = where.date;
    if (d) {
      const t = row.date.getTime();
      if (d.gte && t < d.gte.getTime()) return false;
      if (d.lte && t > d.lte.getTime()) return false;
      if (d.in && !d.in.some((x: Date) => x.getTime() === t)) return false;
    }
    return true;
  };

  const prisma: any = {
    habit: {
      findFirst: async ({ where }: any) =>
        (where.id === undefined || where.id === habit.id) &&
        (where.userId === undefined || where.userId === habit.userId)
          ? habit
          : null,
      findUnique: async ({ where }: any) => (where.id === habit.id ? habit : null),
      update: async ({ data }: any) => Object.assign(habit, data),
    },
    task: {
      findUnique: async ({ where }: any) =>
        tasks.get(key(where.habitId_date.date)) ?? null,
      upsert: async ({ where, create, update }: any) => {
        const k = key(where.habitId_date.date);
        const existing = tasks.get(k);
        const row = existing
          ? { ...existing, ...update }
          : { id: `task-${++seq}`, ...create };
        tasks.set(k, row);
        return row;
      },
      findMany: async ({ where }: any = {}) =>
        [...tasks.values()]
          .filter((r) => matches(r, where))
          .sort((a, b) => a.date.getTime() - b.date.getTime()),
      createMany: async ({ data, skipDuplicates }: any) => {
        let count = 0;
        for (const r of data) {
          const k = key(r.date);
          if (tasks.has(k)) {
            if (skipDuplicates) continue;
            throw new Error('Unique constraint failed');
          }
          tasks.set(k, { id: `task-${++seq}`, completedAt: null, ...r });
          count++;
        }
        return { count };
      },
      deleteMany: async ({ where }: any = {}) => {
        let count = 0;
        for (const [k, r] of [...tasks]) {
          if (matches(r, where)) {
            tasks.delete(k);
            count++;
          }
        }
        return { count };
      },
    },
  };

  return { prisma, tasks, habit };
}
