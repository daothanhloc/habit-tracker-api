import { PrismaClient, GoalType } from '@prisma/client';
import { CreateHabitGoalDto, UpdateHabitGoalDto } from '../schemas/goal.schema.js';

export class GoalService {
  constructor(private prisma: PrismaClient) {}

  async create(habitId: string, userId: string, data: CreateHabitGoalDto) {
    const goalTypeMap: Record<string, GoalType> = {
      weekly: 'WEEKLY',
      monthly: 'MONTHLY',
      yearly: 'YEARLY',
    };

    return await this.prisma.habitGoal.create({
      data: {
        habitId,
        userId,
        targetFrequency: data.targetFrequency,
        goalType: goalTypeMap[data.goalType],
      },
    });
  }

  async findByHabitId(habitId: string) {
    return await this.prisma.habitGoal.findMany({
      where: { habitId },
    });
  }

  async findByHabitAndGoalType(habitId: string, goalType: string) {
    const goalTypeMap: Record<string, GoalType> = {
      weekly: 'WEEKLY',
      monthly: 'MONTHLY',
      yearly: 'YEARLY',
    };

    return await this.prisma.habitGoal.findFirst({
      where: {
        habitId,
        goalType: goalTypeMap[goalType.toLowerCase()],
      },
    });
  }

  async update(id: string, data: UpdateHabitGoalDto) {
    const updateData: any = { ...data };

    // Convert goalType if provided
    if (data.goalType) {
      const goalTypeMap: Record<string, GoalType> = {
        weekly: 'WEEKLY',
        monthly: 'MONTHLY',
        yearly: 'YEARLY',
      };
      updateData.goalType = goalTypeMap[data.goalType];
    }

    return await this.prisma.habitGoal.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return await this.prisma.habitGoal.delete({
      where: { id },
    });
  }

  async getProgress(habitId: string, goalType: string) {
    const goal = await this.findByHabitAndGoalType(habitId, goalType);

    if (!goal) {
      return null;
    }

    // Calculate period based on goalType
    const now = new Date();
    let periodStart: Date;

    if (goalType === 'weekly') {
      // Get start of week (Monday)
      const dayOfWeek = now.getDay();
      const daysDiff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - daysDiff);
    } else if (goalType === 'monthly') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // yearly
      periodStart = new Date(now.getFullYear(), 0, 1);
    }

    // Count completions in period
    const completions = await this.prisma.habitTracking.count({
      where: {
        habitId,
        completedAt: {
          gte: periodStart,
          lte: now,
        },
      },
    });

    const percentage = Math.round(
      (completions / goal.targetFrequency) * 100,
    );

    return {
      goal,
      completions,
      targetFrequency: goal.targetFrequency,
      percentage: Math.min(percentage, 100), // Cap at 100%
    };
  }
}
