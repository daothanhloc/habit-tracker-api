import { Habit as PrismaHabit, PrismaClient } from '@prisma/client';
import { CreateHabitDto, UpdateHabitDto } from '../schemas/habit.schema.js';
import { computeProgress } from './progress.util.js';
import {
  dayOfWeek,
  formatDateOnly,
  parseDateOnly,
  vntTodayDateOnly,
} from './date.util.js';
import { NotFoundError } from './errors.js';

export class HabitService {
  constructor(private prisma: PrismaClient) {}

  async create(goalId: string, userId: string, data: CreateHabitDto) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });
    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    const habit = await this.prisma.habit.create({
      data: {
        goalId,
        userId,
        name: data.name,
        unit: data.unit ?? null,
        goalType: data.goalType === 'sum' ? 'SUM' : 'THRESHOLD_COUNT',
        targetValue: data.goalType === 'sum' ? data.targetValue : null,
        dailyMinValue:
          data.goalType === 'threshold_count' ? data.dailyMinValue : null,
        targetDays:
          data.goalType === 'threshold_count' ? data.targetDays : null,
        frequencyDays: data.frequencyDays,
        defaultTaskValue: data.defaultTaskValue ?? null,
      },
    });

    return this.toSummary(habit, { current: 0, target: this.targetFor(habit) });
  }

  // Habit summaries embedded in a Goal response, with progress computed
  // over the goal's own period.
  async listSummariesForGoal(goal: { id: string; startDate: Date; endDate: Date }) {
    const habits = await this.prisma.habit.findMany({
      where: { goalId: goal.id },
      orderBy: { createdAt: 'asc' },
    });

    return Promise.all(
      habits.map((habit) => this.withProgress(habit, goal.startDate, goal.endDate))
    );
  }

  async findById(habitId: string, userId: string) {
    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId },
      include: { goal: true },
    });
    if (!habit) {
      return null;
    }

    const summary = await this.withProgress(
      habit,
      habit.goal.startDate,
      habit.goal.endDate
    );

    return {
      ...summary,
      goalId: habit.goalId,
      userId: habit.userId,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
    };
  }

  async update(habitId: string, userId: string, data: UpdateHabitDto) {
    const existing = await this.prisma.habit.findFirst({
      where: { id: habitId, userId },
      include: { goal: true },
    });
    if (!existing) {
      throw new NotFoundError('Habit not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.defaultTaskValue !== undefined) {
      updateData.defaultTaskValue = data.defaultTaskValue;
    }
    if (data.goalType !== undefined) {
      updateData.goalType = data.goalType === 'sum' ? 'SUM' : 'THRESHOLD_COUNT';
    }
    if (data.targetValue !== undefined) updateData.targetValue = data.targetValue;
    if (data.dailyMinValue !== undefined) {
      updateData.dailyMinValue = data.dailyMinValue;
    }
    if (data.targetDays !== undefined) updateData.targetDays = data.targetDays;

    const frequencyChanged =
      data.frequencyDays !== undefined &&
      JSON.stringify([...data.frequencyDays].sort()) !==
        JSON.stringify([...existing.frequencyDays].sort());
    if (data.frequencyDays !== undefined) {
      updateData.frequencyDays = data.frequencyDays;
    }

    const habit = await this.prisma.habit.update({
      where: { id: habitId },
      data: updateData,
    });

    if (frequencyChanged) {
      // Side effect per PRPs/HABIT_TRACKER_V2_SCHEMA_API.md section 6:
      // drop NOT_DONE tasks so they regenerate lazily under the new
      // schedule. DONE tasks are completed history and are never touched.
      await this.prisma.task.deleteMany({
        where: { habitId, status: 'NOT_DONE' },
      });
      await this.recomputeStreak(habitId);
    }

    const summary = await this.withProgress(
      habit,
      existing.goal.startDate,
      existing.goal.endDate
    );

    return {
      ...summary,
      goalId: habit.goalId,
      userId: habit.userId,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
    };
  }

  async delete(habitId: string, userId: string) {
    const existing = await this.prisma.habit.findFirst({
      where: { id: habitId, userId },
    });
    if (!existing) {
      throw new NotFoundError('Habit not found');
    }
    await this.prisma.habit.delete({ where: { id: habitId } });
  }

  // Recomputes currentStreak/longestStreak per
  // PRPs/HABIT_TRACKER_V2_SCHEMA_API.md section 5: walk scheduled dates
  // backwards from server-side today; a scheduled day before today with no
  // DONE task breaks the run, today itself stays "intact" either way.
  async recomputeStreak(habitId: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
      include: { goal: true },
    });
    if (!habit) {
      return;
    }

    const today = vntTodayDateOnly();
    const startBound = formatDateOnly(habit.goal.startDate);

    const tasks = await this.prisma.task.findMany({
      where: {
        habitId,
        date: { gte: habit.goal.startDate, lte: parseDateOnly(today) },
      },
      select: { date: true, status: true },
    });
    const statusByDate = new Map(
      tasks.map((t) => [formatDateOnly(t.date), t.status])
    );

    let currentStreak = 0;
    let cursor = today;
    let isToday = true;
    while (cursor >= startBound) {
      if (habit.frequencyDays.includes(dayOfWeek(cursor))) {
        const status = statusByDate.get(cursor) ?? 'NOT_DONE';
        if (status === 'DONE') {
          currentStreak += 1;
        } else if (!isToday) {
          // A scheduled, non-today date with no completion breaks the run.
          break;
        }
        // Today's own incomplete task does not break the streak yet.
      }
      isToday = false;
      cursor = formatDateOnly(new Date(parseDateOnly(cursor).getTime() - 86400000));
    }

    const longestStreak = Math.max(habit.longestStreak, currentStreak);

    await this.prisma.habit.update({
      where: { id: habitId },
      data: { currentStreak, longestStreak },
    });
  }

  private async withProgress(habit: PrismaHabit, startDate: Date, endDate: Date) {
    const tasks = await this.prisma.task.findMany({
      where: { habitId: habit.id, date: { gte: startDate, lte: endDate } },
      select: { value: true },
    });

    const progress = computeProgress(
      habit.goalType,
      habit.targetValue,
      habit.dailyMinValue,
      habit.targetDays,
      tasks
    );

    return this.toSummary(habit, progress);
  }

  private targetFor(habit: PrismaHabit): number {
    return habit.goalType === 'SUM'
      ? habit.targetValue ?? 0
      : habit.targetDays ?? 0;
  }

  private toSummary(
    habit: PrismaHabit,
    progress: { current: number; target: number }
  ) {
    return {
      id: habit.id,
      name: habit.name,
      unit: habit.unit,
      goalType: habit.goalType,
      targetValue: habit.targetValue,
      dailyMinValue: habit.dailyMinValue,
      targetDays: habit.targetDays,
      frequencyDays: habit.frequencyDays,
      defaultTaskValue: habit.defaultTaskValue,
      progress,
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
    };
  }
}
