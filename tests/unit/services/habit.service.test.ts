import { HabitService } from '../../../src/services/habit.service';
import { NotFoundError } from '../../../src/services/errors';
import { vntTodayDateOnly, parseDateOnly, formatDateOnly } from '../../../src/services/date.util';

describe('HabitService', () => {
  let habitService: HabitService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      goal: {
        findFirst: jest.fn(),
      },
      habit: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      task: {
        findMany: jest.fn().mockResolvedValue([]),
        deleteMany: jest.fn(),
      },
    };

    habitService = new HabitService(mockPrisma);
  });

  describe('create', () => {
    it('creates a SUM habit and returns zeroed progress', async () => {
      mockPrisma.goal.findFirst.mockResolvedValue({ id: 'goal-1', userId: 'user-1' });
      const mockHabit = {
        id: 'habit-1',
        goalId: 'goal-1',
        userId: 'user-1',
        name: 'Run',
        unit: 'km',
        goalType: 'SUM',
        targetValue: 100,
        dailyMinValue: null,
        targetDays: null,
        frequencyDays: [1, 3, 5],
        defaultTaskValue: 5,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.habit.create.mockResolvedValue(mockHabit);

      const result = await habitService.create('goal-1', 'user-1', {
        goalType: 'sum',
        name: 'Run',
        unit: 'km',
        targetValue: 100,
        frequencyDays: [1, 3, 5],
        defaultTaskValue: 5,
      });

      expect(result.progress).toEqual({ current: 0, target: 100 });
      expect(mockPrisma.habit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          goalType: 'SUM',
          targetValue: 100,
          dailyMinValue: null,
          targetDays: null,
        }),
      });
    });

    it('throws NotFoundError when the goal is not owned by the user', async () => {
      mockPrisma.goal.findFirst.mockResolvedValue(null);

      await expect(
        habitService.create('goal-1', 'user-1', {
          goalType: 'sum',
          name: 'Run',
          targetValue: 100,
          frequencyDays: [1],
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('recomputeStreak', () => {
    const goal = {
      startDate: parseDateOnly('2020-01-01'),
      endDate: parseDateOnly('2099-01-01'),
    };

    function habitFixture(frequencyDays: number[], longestStreak = 0) {
      return {
        id: 'habit-1',
        frequencyDays,
        longestStreak,
        goal,
      };
    }

    it('counts consecutive DONE scheduled days and treats today as intact', async () => {
      const today = vntTodayDateOnly();
      const yesterday = formatDateOnly(new Date(parseDateOnly(today).getTime() - 86400000));

      mockPrisma.habit.findUnique.mockResolvedValue(habitFixture([0, 1, 2, 3, 4, 5, 6]));
      mockPrisma.task.findMany.mockResolvedValue([
        { date: parseDateOnly(today), status: 'NOT_DONE' },
        { date: parseDateOnly(yesterday), status: 'DONE' },
      ]);

      await habitService.recomputeStreak('habit-1');

      expect(mockPrisma.habit.update).toHaveBeenCalledWith({
        where: { id: 'habit-1' },
        data: { currentStreak: 1, longestStreak: 1 },
      });
    });

    it('breaks the streak at the first NOT_DONE day before today', async () => {
      const today = vntTodayDateOnly();
      const yesterday = formatDateOnly(new Date(parseDateOnly(today).getTime() - 86400000));
      const twoDaysAgo = formatDateOnly(new Date(parseDateOnly(today).getTime() - 2 * 86400000));

      mockPrisma.habit.findUnique.mockResolvedValue(habitFixture([0, 1, 2, 3, 4, 5, 6], 5));
      mockPrisma.task.findMany.mockResolvedValue([
        { date: parseDateOnly(today), status: 'DONE' },
        { date: parseDateOnly(yesterday), status: 'NOT_DONE' },
        { date: parseDateOnly(twoDaysAgo), status: 'DONE' },
      ]);

      await habitService.recomputeStreak('habit-1');

      // today is DONE (counts), yesterday is NOT_DONE and before today -> breaks
      expect(mockPrisma.habit.update).toHaveBeenCalledWith({
        where: { id: 'habit-1' },
        data: { currentStreak: 1, longestStreak: 5 },
      });
    });

    it('never decreases longestStreak', async () => {
      mockPrisma.habit.findUnique.mockResolvedValue(habitFixture([0, 1, 2, 3, 4, 5, 6], 10));
      mockPrisma.task.findMany.mockResolvedValue([]);

      await habitService.recomputeStreak('habit-1');

      expect(mockPrisma.habit.update).toHaveBeenCalledWith({
        where: { id: 'habit-1' },
        data: { currentStreak: 0, longestStreak: 10 },
      });
    });
  });

  describe('delete', () => {
    it('throws NotFoundError when the habit is not owned by the user', async () => {
      mockPrisma.habit.findFirst.mockResolvedValue(null);

      await expect(habitService.delete('habit-1', 'user-1')).rejects.toThrow(NotFoundError);
    });

    it('deletes an owned habit', async () => {
      mockPrisma.habit.findFirst.mockResolvedValue({ id: 'habit-1', userId: 'user-1' });
      mockPrisma.habit.delete.mockResolvedValue({ id: 'habit-1' });

      await habitService.delete('habit-1', 'user-1');

      expect(mockPrisma.habit.delete).toHaveBeenCalledWith({ where: { id: 'habit-1' } });
    });
  });
});
