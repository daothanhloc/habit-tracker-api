import { FastifyInstance } from 'fastify';

/**
 * Integration tests for Goal/Habit/Task routes (V2)
 * NOTE: These tests require a running database connection
 * Skipped if DATABASE_URL is not set
 */

const skipIntegrationTests = !process.env.DATABASE_URL;

const testSuite = skipIntegrationTests ? describe.skip : describe;

testSuite('Goal/Habit/Task Routes (Integration)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Lazy import to avoid loading env when skipped
    const { createFastifyApp } = await import('../../src/config/fastify');
    const goalRoutes = (await import('../../src/routes/goals')).default;
    const habitRoutes = (await import('../../src/routes/habits')).default;
    const taskRoutes = (await import('../../src/routes/tasks')).default;
    app = await createFastifyApp();
    await app.register(goalRoutes, { prefix: '/goals' });
    await app.register(habitRoutes);
    await app.register(taskRoutes);
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /goals', () => {
    it('should return 400 for invalid input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/goals',
        payload: {
          title: '', // Empty title should fail
          startDate: '2026-01-01',
          endDate: '2026-01-31',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /goals/:goalId', () => {
    it('should return 404 for a non-existent goal', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/goals/00000000-0000-0000-0000-000000000000',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /habits/:habitId', () => {
    it('should return 404 for a non-existent habit', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/habits/00000000-0000-0000-0000-000000000000',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /habits/:habitId/tasks/today', () => {
    it('should return 404 for a non-existent habit', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/habits/00000000-0000-0000-0000-000000000000/tasks/today',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
