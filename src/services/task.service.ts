import { PrismaClient } from '@prisma/client';
import { UpsertTaskDto } from '../schemas/task.schema.js';
import { HabitService } from './habit.service.js';
import {
  dayOfWeek,
  enumerateDates,
  formatDateOnly,
  parseDateOnly,
  vntTodayDateOnly,
} from './date.util.js';
import { NotFoundError } from './errors.js';

export class TaskService {
  constructor(
    private prisma: PrismaClient,
    private habitService: HabitService
  ) {}

  async listRange(habitId: string, userId: string, fromStr: string, toStr: string) {
    const habit = await this.getOwnedHabit(habitId, userId);
    if (!habit) {
      throw new NotFoundError('Habit not found');
    }

    const today = vntTodayDateOnly();
    const effectiveTo = toStr > today ? today : toStr;

    if (effectiveTo >= fromStr) {
      const scheduledDates = enumerateDates(fromStr, effectiveTo).filter((d) =>
        habit.frequencyDays.includes(dayOfWeek(d))
      );
      await this.ensureTasksExist(habit.id, habit.defaultTaskValue, scheduledDates);
    }

    return this.prisma.task.findMany({
      where: {
        habitId,
        date: { gte: parseDateOnly(fromStr), lte: parseDateOnly(toStr) },
      },
      orderBy: { date: 'asc' },
    });
  }

  // Returns null when today is not in the habit's frequencyDays
  // ("unscheduled") - the route maps that to a 404.
  async getToday(habitId: string, userId: string) {
    const habit = await this.getOwnedHabit(habitId, userId);
    if (!habit) {
      throw new NotFoundError('Habit not found');
    }

    const today = vntTodayDateOnly();
    if (!habit.frequencyDays.includes(dayOfWeek(today))) {
      return null;
    }

    await this.ensureTasksExist(habit.id, habit.defaultTaskValue, [today]);
    return this.prisma.task.findUnique({
      where: { habitId_date: { habitId, date: parseDateOnly(today) } },
    });
  }

  async upsert(
    habitId: string,
    userId: string,
    dateStr: string,
    data: UpsertTaskDto
  ): Promise<{ kind: 'ok'; task: unknown } | { kind: 'future' } | { kind: 'unscheduled' }> {
    const habit = await this.getOwnedHabit(habitId, userId);
    if (!habit) {
      throw new NotFoundError('Habit not found');
    }

    const today = vntTodayDateOnly();
    if (dateStr > today) {
      return { kind: 'future' };
    }
    if (!habit.frequencyDays.includes(dayOfWeek(dateStr))) {
      return { kind: 'unscheduled' };
    }

    const date = parseDateOnly(dateStr);
    const existing = await this.prisma.task.findUnique({
      where: { habitId_date: { habitId, date } },
    });

    const nextStatus = data.status
      ? data.status === 'done'
        ? 'DONE'
        : 'NOT_DONE'
      : existing?.status ?? 'NOT_DONE';
    const nextValue =
      data.value !== undefined
        ? data.value
        : existing?.value ?? habit.defaultTaskValue ?? null;
    const wasAlreadyDone = existing?.status === 'DONE';

    const task = await this.prisma.task.upsert({
      where: { habitId_date: { habitId, date } },
      create: {
        habitId,
        date,
        value: nextValue,
        status: nextStatus,
        completedAt: nextStatus === 'DONE' ? new Date() : null,
      },
      update: {
        value: nextValue,
        status: nextStatus,
        completedAt:
          nextStatus === 'DONE'
            ? wasAlreadyDone
              ? existing!.completedAt
              : new Date()
            : null,
      },
    });

    await this.habitService.recomputeStreak(habitId);

    return { kind: 'ok', task };
  }

  private async getOwnedHabit(habitId: string, userId: string) {
    return this.prisma.habit.findFirst({ where: { id: habitId, userId } });
  }

  private async ensureTasksExist(
    habitId: string,
    defaultTaskValue: number | null,
    dateStrs: string[]
  ) {
    if (dateStrs.length === 0) {
      return;
    }

    const existing = await this.prisma.task.findMany({
      where: { habitId, date: { in: dateStrs.map(parseDateOnly) } },
      select: { date: true },
    });
    const existingSet = new Set(existing.map((t) => formatDateOnly(t.date)));
    const missing = dateStrs.filter((d) => !existingSet.has(d));
    if (missing.length === 0) {
      return;
    }

    await this.prisma.task.createMany({
      data: missing.map((d) => ({
        habitId,
        date: parseDateOnly(d),
        value: defaultTaskValue,
        status: 'NOT_DONE' as const,
      })),
      skipDuplicates: true,
    });
  }
}
