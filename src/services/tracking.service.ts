import { PrismaClient } from '@prisma/client';
import { CreateHabitTrackingDto } from '../schemas/tracking.schema.js';

export class TrackingService {
  constructor(private prisma: PrismaClient) {}

  async logCompletion(
    habitId: string,
    userId: string,
    data: CreateHabitTrackingDto,
  ) {
    const completedAt = data.completedAt
      ? new Date(data.completedAt)
      : new Date();

    // Check if habit already logged for this date
    const startOfDay = new Date(completedAt);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(completedAt);
    endOfDay.setHours(23, 59, 59, 999);

    const existingTracking = await this.prisma.habitTracking.findFirst({
      where: {
        habitId,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingTracking) {
      throw new Error('Habit already logged for this date');
    }

    // Calculate streak
    const lastTracking = await this.prisma.habitTracking.findFirst({
      where: { habitId },
      orderBy: { completedAt: 'desc' },
    });

    let streak = 1;
    if (lastTracking) {
      const lastDate = new Date(lastTracking.completedAt);
      const daysDiff = Math.floor(
        (completedAt.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // If consecutive day, increment streak
      if (daysDiff === 1) {
        streak = lastTracking.streak + 1;
      }
    }

    return await this.prisma.habitTracking.create({
      data: {
        habitId,
        userId,
        completedAt,
        notes: data.notes,
        streak,
      },
    });
  }

  async getHistory(
    habitId: string,
    limit: number = 30,
    from?: Date,
    to?: Date,
  ) {
    const where: any = { habitId };

    if (from || to) {
      where.completedAt = {};
      if (from) where.completedAt.gte = from;
      if (to) where.completedAt.lte = to;
    }

    return await this.prisma.habitTracking.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      take: limit,
    });
  }

  async getStreak(habitId: string): Promise<number> {
    const lastTracking = await this.prisma.habitTracking.findFirst({
      where: { habitId },
      orderBy: { completedAt: 'desc' },
    });

    if (!lastTracking) {
      return 0;
    }

    return lastTracking.streak;
  }

  async getTrackingById(id: string) {
    return await this.prisma.habitTracking.findUnique({
      where: { id },
    });
  }

  async deleteTracking(id: string) {
    return await this.prisma.habitTracking.delete({
      where: { id },
    });
  }
}
