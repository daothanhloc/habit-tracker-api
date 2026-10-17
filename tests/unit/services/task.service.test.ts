import { TaskService } from '../../../src/services/task.service';
import { HabitService } from '../../../src/services/habit.service';
import { NotFoundError } from '../../../src/services/errors';
import { vntTodayDateOnly } from '../../../src/services/date.util';

describe('TaskService', () => {
  let taskService: TaskService;
  let mockPrisma: any;
  let mockHabitService: jest.Mocked<Pick<HabitService, 'recomputeStreak'>>;

  function habitFixture(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      id: 'habit-1',
      userId: 'user-1',
      frequencyDays: [0, 1, 2, 3, 4, 5, 6],
      defaultTaskValue: 5,
      ...overrides,
    };
  }

  beforeEach(() => {
    mockPrisma = {
      habit: {
        findFirst: jest.fn(),
      },
      task: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        createMany: jest.fn(),
        upsert: jest.fn(),
      },
    };
    mockHabitService = {
      recomputeStreak: jest.fn(),
    };

    taskService = new TaskService(mockPrisma, mockHabitService as unknown as HabitService);
  });

  describe('upsert', () => {
    it('throws NotFoundError when the habit is not owned by the user', async () => {
      mockPrisma.habit.findFirst.mockResolvedValue(null);

      await expect(
        taskService.upsert('habit-1', 'user-1', '2026-01-01', { status: 'done' })
      ).rejects.toThrow(NotFoundError);
    });

    it('rejects a date after server-side today', async () => {
      mockPrisma.habit.findFirst.mockResolvedValue(habitFixture());

      const result = await taskService.upsert('habit-1', 'user-1', '2999-01-01', {
        status: 'done',
      });

      expect(result).toEqual({ kind: 'future' });
    });

    it('rejects a date outside the habit frequencyDays', async () => {
      mockPrisma.habit.findFirst.mockResolvedValue(habitFixture({ frequencyDays: [] }));
      const today = vntTodayDateOnly();

      const result = await taskService.upsert('habit-1', 'user-1', today, { status: 'done' });

      expect(result).toEqual({ kind: 'unscheduled' });
    });

    it('upserts the task and recomputes the streak on success', async () => {
      mockPrisma.habit.findFirst.mockResolvedValue(habitFixture());
      mockPrisma.task.findUnique.mockResolvedValue(null);
      const today = vntTodayDateOnly();
      mockPrisma.task.upsert.mockResolvedValue({
        id: 'task-1',
        habitId: 'habit-1',
        value: 5,
        status: 'DONE',
      });

      const result = await taskService.upsert('habit-1', 'user-1', today, {
        status: 'done',
      });

      expect(result.kind).toBe('ok');
      expect(mockHabitService.recomputeStreak).toHaveBeenCalledWith('habit-1');
    });
  });

  describe('getToday', () => {
    it('returns null when today is not in frequencyDays', async () => {
      mockPrisma.habit.findFirst.mockResolvedValue(habitFixture({ frequencyDays: [] }));

      const result = await taskService.getToday('habit-1', 'user-1');

      expect(result).toBeNull();
    });

    it('throws NotFoundError when the habit is not owned by the user', async () => {
      mockPrisma.habit.findFirst.mockResolvedValue(null);

      await expect(taskService.getToday('habit-1', 'user-1')).rejects.toThrow(NotFoundError);
    });
  });
});
