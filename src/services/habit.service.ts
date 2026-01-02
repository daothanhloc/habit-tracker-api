import { PrismaClient, Frequency } from "@prisma/client";
import { CreateHabitDto, UpdateHabitDto } from "../schemas/habit.schema";

export class HabitService {
  constructor(private prisma: PrismaClient) {}

  private async isTrackedToday(habitId: string, userId: string): Promise<boolean> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const tracking = await this.prisma.habitTracking.findFirst({
      where: {
        habitId,
        userId,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return !!tracking;
  }

  async create(userId: string, data: CreateHabitDto) {
    const frequencyMap: Record<string, Frequency> = {
      daily: "DAILY",
      weekly: "WEEKLY",
      monthly: "MONTHLY",
    };

    const habit = await this.prisma.habit.create({
      data: {
        ...data,
        userId,
        frequency: frequencyMap[data.frequency || "daily"],
      },
    });

    return {
      ...habit,
      trackedToday: false, // New habit can't be tracked yet
    };
  }

  async findAll(userId: string, isActive?: boolean) {
    const where: any = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const habits = await this.prisma.habit.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Calculate today's date boundaries
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Query all today's tracking for this user
    const todaysTracking = await this.prisma.habitTracking.findMany({
      where: {
        userId,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        habitId: true,
      },
    });

    // Create Set of tracked habit IDs for O(1) lookup
    const trackedHabitIds = new Set(
      todaysTracking.map((tracking) => tracking.habitId)
    );

    // Map habits and add trackedToday field
    const habitsWithTracking = habits.map((habit) => ({
      ...habit,
      trackedToday: trackedHabitIds.has(habit.id),
    }));

    return habitsWithTracking;
  }

  async findById(id: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id },
    });

    if (!habit) {
      return null;
    }

    const trackedToday = await this.isTrackedToday(habit.id, habit.userId);

    return {
      ...habit,
      trackedToday,
    };
  }

  async update(id: string, data: UpdateHabitDto) {
    const updateData: any = { ...data };

    // Convert frequency if provided
    if (data.frequency) {
      const frequencyMap: Record<string, Frequency> = {
        daily: "DAILY",
        weekly: "WEEKLY",
        monthly: "MONTHLY",
      };
      updateData.frequency = frequencyMap[data.frequency];
    }

    const habit = await this.prisma.habit.update({
      where: { id },
      data: updateData,
    });

    const trackedToday = await this.isTrackedToday(habit.id, habit.userId);

    return {
      ...habit,
      trackedToday,
    };
  }

  async delete(id: string) {
    return await this.prisma.habit.delete({
      where: { id },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    const habit = await this.prisma.habit.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!habit) {
      return null;
    }

    const trackedToday = await this.isTrackedToday(habit.id, userId);

    return {
      ...habit,
      trackedToday,
    };
  }
}
