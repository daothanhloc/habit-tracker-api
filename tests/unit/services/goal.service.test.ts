import { GoalService } from '../../../src/services/goal.service';

describe('GoalService', () => {
  let goalService: GoalService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      habitGoal: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      habitTracking: {
        count: jest.fn(),
      },
    };

    goalService = new GoalService(mockPrisma);
  });

  describe('create', () => {
    it('should create a new goal', async () => {
      const mockGoal = {
        id: '1',
        habitId: 'habit-1',
        userId: 'user-1',
        targetFrequency: 5,
        goalType: 'WEEKLY',
      };

      mockPrisma.habitGoal.create.mockResolvedValue(mockGoal);

      const result = await goalService.create('habit-1', 'user-1', {
        targetFrequency: 5,
        goalType: 'weekly',
      });

      expect(result).toEqual(mockGoal);
      expect(mockPrisma.habitGoal.create).toHaveBeenCalled();
    });
  });

  describe('findByHabitId', () => {
    it('should return goals for a habit', async () => {
      const mockGoals = [
        {
          id: '1',
          habitId: 'habit-1',
          goalType: 'WEEKLY',
          targetFrequency: 5,
        },
      ];

      mockPrisma.habitGoal.findMany.mockResolvedValue(mockGoals);

      const result = await goalService.findByHabitId('habit-1');

      expect(result).toEqual(mockGoals);
      expect(mockPrisma.habitGoal.findMany).toHaveBeenCalledWith({
        where: { habitId: 'habit-1' },
      });
    });
  });

  describe('getProgress', () => {
    it('should calculate progress percentage', async () => {
      const mockGoal = {
        id: '1',
        habitId: 'habit-1',
        targetFrequency: 5,
        goalType: 'WEEKLY',
      };

      mockPrisma.habitGoal.findFirst.mockResolvedValue(mockGoal);
      mockPrisma.habitTracking.count.mockResolvedValue(3);

      const result = await goalService.getProgress('habit-1', 'weekly');

      expect(result).not.toBeNull();
      expect(result?.percentage).toBe(60); // 3/5 * 100
      expect(result?.completions).toBe(3);
      expect(result?.targetFrequency).toBe(5);
    });

    it('should return null if goal not found', async () => {
      mockPrisma.habitGoal.findFirst.mockResolvedValue(null);

      const result = await goalService.getProgress('habit-1', 'weekly');

      expect(result).toBeNull();
    });
  });
});
