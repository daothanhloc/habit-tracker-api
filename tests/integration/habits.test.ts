import { FastifyInstance } from 'fastify';

/**
 * Integration tests for Habit routes
 * NOTE: These tests require a running database connection
 * Skipped if DATABASE_URL is not set
 */

const skipIntegrationTests = !process.env.DATABASE_URL;

const testSuite = skipIntegrationTests ? describe.skip : describe;

testSuite('Habit Routes (Integration)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Lazy import to avoid loading env when skipped
    const { createFastifyApp } = await import('../../src/config/fastify');
    const habitRoutes = (await import('../../src/routes/habits')).default;
    app = await createFastifyApp();
    await app.register(habitRoutes, { prefix: '/habits' });
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /habits', () => {
    it('should create a new habit', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/habits',
        payload: {
          name: 'Morning Exercise',
          description: '30 min workout',
          frequency: 'daily',
          category: 'health',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.name).toBe('Morning Exercise');
      expect(body.frequency).toBe('DAILY');
    });

    it('should return 400 for invalid input', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/habits',
        payload: {
          name: '', // Empty name should fail
          frequency: 'daily',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /habits', () => {
    it('should return list of habits', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/habits',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('GET /habits/:id', () => {
    it('should return 404 for non-existent habit', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/habits/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);
      expect(body.message).toBe('Habit not found');
    });
  });

  describe('PUT /habits/:id', () => {
    it('should return 404 for non-existent habit', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/habits/non-existent-id',
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /habits/:id', () => {
    it('should return 404 for non-existent habit', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/habits/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
