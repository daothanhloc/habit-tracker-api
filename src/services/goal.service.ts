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
      habits,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }
}
