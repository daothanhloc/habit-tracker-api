import { Goal as PrismaGoal, PrismaClient } from '@prisma/client';
import { CreateGoalDto, UpdateGoalDto } from '../schemas/goal.schema.js';
import { HabitSummary } from '../schemas/habit.schema.js';
import { HabitService } from './habit.service.js';
import { formatDateOnly, parseDateOnly } from './date.util.js';
import { NotFoundError } from './errors.js';

export class GoalService {
  constructor(
    private prisma: PrismaClient,
    private habitService: HabitService
  ) {}

  async create(userId: string, data: CreateGoalDto) {
    const goal = await this.prisma.goal.create({
      data: {
        userId,
        title: data.title,
        startDate: parseDateOnly(data.startDate),
        endDate: parseDateOnly(data.endDate),
      },
    });
    return this.toResponse(goal, []);
  }

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(goals.map((goal) => this.withHabits(goal)));
  }

  async findById(goalId: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });
    if (!goal) {
      return null;
    }
    return this.withHabits(goal);
  }

  async update(goalId: string, userId: string, data: UpdateGoalDto) {
    const existing = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });
    if (!existing) {
      throw new NotFoundError('Goal not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.startDate !== undefined) {
      updateData.startDate = parseDateOnly(data.startDate);
    }
    if (data.endDate !== undefined) {
      updateData.endDate = parseDateOnly(data.endDate);
    }

    const goal = await this.prisma.goal.update({
      where: { id: goalId },
      data: updateData,
    });
    return this.withHabits(goal);
  }

  async delete(goalId: string, userId: string) {
    const existing = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });
    if (!existing) {
      throw new NotFoundError('Goal not found');
    }
    await this.prisma.goal.delete({ where: { id: goalId } });
  }

  private async withHabits(goal: PrismaGoal) {
    const habits = await this.habitService.listSummariesForGoal(goal);
    return this.toResponse(goal, habits);
  }

  private toResponse(goal: PrismaGoal, habits: HabitSummary[]) {
    return {
      id: goal.id,
      userId: goal.userId,
      title: goal.title,
      startDate: formatDateOnly(goal.startDate),
      endDate: formatDateOnly(goal.endDate),
      unifiedProgress: this.computeUnifiedProgress(habits),
      habits,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }

  // Unified only when every habit has the same non-null unit - see
  // PRPs/HABIT_TRACKER_V2_SCHEMA_API.md section 4. Habits with different
  // goalTypes (SUM vs THRESHOLD_COUNT) sharing a unit are summed as-is;
  // the spec's worked examples only exercise the mixed-unit case, so this
  // edge case (same unit, different goalType) is an open assumption, not a
  // confirmed rule.
  private computeUnifiedProgress(habits: HabitSummary[]) {
    if (habits.length === 0) {
      return null;
    }
    const unit = habits[0].unit;
    if (unit === null) {
      return null;
    }
    const allSameUnit = habits.every((h) => h.unit === unit);
    if (!allSameUnit) {
      return null;
    }
    return habits.reduce(
      (acc, h) => ({
        current: acc.current + h.progress.current,
        target: acc.target + h.progress.target,
      }),
      { current: 0, target: 0 }
    );
  }
}
