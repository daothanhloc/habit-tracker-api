import { GoalService } from '../../../src/services/goal.service';
import { HabitService } from '../../../src/services/habit.service';
import { NotFoundError } from '../../../src/services/errors';

describe('GoalService', () => {
  let goalService: GoalService;
  let mockPrisma: any;
  let mockHabitService: jest.Mocked<Pick<HabitService, 'listSummariesForGoal'>>;

  beforeEach(() => {
    mockPrisma = {
      goal: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    mockHabitService = {
      listSummariesForGoal: jest.fn().mockResolvedValue([]),
    };

    goalService = new GoalService(mockPrisma, mockHabitService as unknown as HabitService);
  });

  function habitSummary(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      id: 'habit-1',
      name: 'Run',
      unit: 'km',
      goalType: 'SUM',
      targetValue: 100,
      dailyMinValue: null,
      targetDays: null,
      frequencyDays: [1, 3, 5],
      defaultTaskValue: 5,
      progress: { current: 10, target: 100 },
      currentStreak: 1,
      longestStreak: 1,
      ...overrides,
    };
  }

  describe('create', () => {
    it('creates a goal with no habits and null unifiedProgress', async () => {
      const mockGoal = {
        id: 'goal-1',
        userId: 'user-1',
        title: 'Get Fit',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.goal.create.mockResolvedValue(mockGoal);

      const result = await goalService.create('user-1', {
        title: 'Get Fit',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });

      expect(result.title).toBe('Get Fit');
      expect(result.unifiedProgress).toBeNull();
      expect(result.habits).toEqual([]);
    });
  });

  describe('findById', () => {
    it('returns null when the goal is not owned by the user', async () => {
      mockPrisma.goal.findFirst.mockResolvedValue(null);

      const result = await goalService.findById('goal-1', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('unifiedProgress', () => {
    const mockGoal = {
      id: 'goal-1',
      userId: 'user-1',
      title: 'Get Fit',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-01-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('sums progress when every habit shares the same non-null unit', async () => {
      mockPrisma.goal.findFirst.mockResolvedValue(mockGoal);
      mockHabitService.listSummariesForGoal.mockResolvedValue([
        habitSummary({ id: 'h1', unit: 'km', progress: { current: 10, target: 100 } }),
        habitSummary({ id: 'h2', unit: 'km', progress: { current: 5, target: 50 } }),
      ] as any);

      const result = await goalService.findById('goal-1', 'user-1');

      expect(result?.unifiedProgress).toEqual({ current: 15, target: 150 });
    });

    it('is null when habits have different units', async () => {
      mockPrisma.goal.findFirst.mockResolvedValue(mockGoal);
      mockHabitService.listSummariesForGoal.mockResolvedValue([
        habitSummary({ id: 'h1', unit: 'km' }),
        habitSummary({ id: 'h2', unit: 'sessions' }),
      ] as any);

      const result = await goalService.findById('goal-1', 'user-1');

      expect(result?.unifiedProgress).toBeNull();
    });

    it('is null when a habit has no unit', async () => {
      mockPrisma.goal.findFirst.mockResolvedValue(mockGoal);
      mockHabitService.listSummariesForGoal.mockResolvedValue([
        habitSummary({ id: 'h1', unit: null }),
      ] as any);

      const result = await goalService.findById('goal-1', 'user-1');

      expect(result?.unifiedProgress).toBeNull();
    });
  });

  describe('update', () => {
    it('throws NotFoundError when the goal is not owned by the user', async () => {
      mockPrisma.goal.findFirst.mockResolvedValue(null);

      await expect(
        goalService.update('goal-1', 'user-1', { title: 'New title' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('throws NotFoundError when the goal is not owned by the user', async () => {
      mockPrisma.goal.findFirst.mockResolvedValue(null);

      await expect(goalService.delete('goal-1', 'user-1')).rejects.toThrow(NotFoundError);
    });
  });
});
