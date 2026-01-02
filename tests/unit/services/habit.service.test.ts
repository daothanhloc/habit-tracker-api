import { HabitService } from '../../../src/services/habit.service';

describe('HabitService', () => {
  let habitService: HabitService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      habit: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    habitService = new HabitService(mockPrisma);
  });

  describe('create', () => {
    it('should create a new habit', async () => {
      const mockHabit = {
        id: '123',
        userId: 'user-1',
        name: 'Morning Exercise',
        description: '30 min workout',
        frequency: 'DAILY',
        category: 'health',
        isActive: true,
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.habit.create.mockResolvedValue(mockHabit);

      const result = await habitService.create('user-1', {
        name: 'Morning Exercise',
        description: '30 min workout',
        frequency: 'daily',
        category: 'health',
        color: '#3B82F6',
      });

      expect(result).toEqual(mockHabit);
      expect(mockPrisma.habit.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all habits for a user', async () => {
      const mockHabits = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Exercise',
          frequency: 'DAILY',
          isActive: true,
        },
      ];

      mockPrisma.habit.findMany.mockResolvedValue(mockHabits);

      const result = await habitService.findAll('user-1');

      expect(result).toEqual(mockHabits);
      expect(mockPrisma.habit.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by isActive when provided', async () => {
      const mockHabits = [
        {
          id: '1',
          userId: 'user-1',
          name: 'Exercise',
          frequency: 'DAILY',
          isActive: true,
        },
      ];

      mockPrisma.habit.findMany.mockResolvedValue(mockHabits);

      const result = await habitService.findAll('user-1', true);

      expect(result).toEqual(mockHabits);
      expect(mockPrisma.habit.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a habit by id', async () => {
      const mockHabit = { id: '123', name: 'Exercise' };

      mockPrisma.habit.findUnique.mockResolvedValue(mockHabit);

      const result = await habitService.findById('123');

      expect(result).toEqual(mockHabit);
      expect(mockPrisma.habit.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });
  });

  describe('update', () => {
    it('should update a habit', async () => {
      const updatedHabit = {
        id: '123',
        name: 'Updated Exercise',
      };

      mockPrisma.habit.update.mockResolvedValue(updatedHabit);

      const result = await habitService.update('123', {
        name: 'Updated Exercise',
      });

      expect(result).toEqual(updatedHabit);
      expect(mockPrisma.habit.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a habit', async () => {
      mockPrisma.habit.delete.mockResolvedValue({ id: '123' });

      await habitService.delete('123');

      expect(mockPrisma.habit.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });
  });
});
