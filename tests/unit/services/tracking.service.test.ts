import { TrackingService } from '../../../src/services/tracking.service';

describe('TrackingService', () => {
  let trackingService: TrackingService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      habitTracking: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    trackingService = new TrackingService(mockPrisma);
  });

  describe('logCompletion', () => {
    it('should log a habit completion', async () => {
      const mockTracking = {
        id: '1',
        habitId: 'habit-1',
        userId: 'user-1',
        completedAt: new Date(),
        notes: 'Good workout',
        streak: 1,
        createdAt: new Date(),
      };

      mockPrisma.habitTracking.findFirst.mockResolvedValueOnce(null);
      mockPrisma.habitTracking.findFirst.mockResolvedValueOnce(null);
      mockPrisma.habitTracking.create.mockResolvedValue(mockTracking);

      const result = await trackingService.logCompletion('habit-1', 'user-1', {
        notes: 'Good workout',
      });

      expect(result).toEqual(mockTracking);
      expect(mockPrisma.habitTracking.create).toHaveBeenCalled();
    });

    it('should throw error if habit already logged for date', async () => {
      mockPrisma.habitTracking.findFirst.mockResolvedValueOnce({
        id: '1',
      });

      await expect(
        trackingService.logCompletion('habit-1', 'user-1', {}),
      ).rejects.toThrow('Habit already logged for this date');
    });
  });

  describe('getHistory', () => {
    it('should return tracking history', async () => {
      const mockHistory = [
        {
          id: '1',
          completedAt: new Date(),
        },
      ];

      mockPrisma.habitTracking.findMany.mockResolvedValue(mockHistory);

      const result = await trackingService.getHistory('habit-1');

      expect(result).toEqual(mockHistory);
      expect(mockPrisma.habitTracking.findMany).toHaveBeenCalled();
    });
  });

  describe('getStreak', () => {
    it('should return current streak', async () => {
      mockPrisma.habitTracking.findFirst.mockResolvedValue({
        streak: 5,
      });

      const result = await trackingService.getStreak('habit-1');

      expect(result).toBe(5);
    });

    it('should return 0 if no tracking records', async () => {
      mockPrisma.habitTracking.findFirst.mockResolvedValue(null);

      const result = await trackingService.getStreak('habit-1');

      expect(result).toBe(0);
    });
  });
});
