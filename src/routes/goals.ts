import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Static } from '@sinclair/typebox';
import {
  GoalSchema,
  CreateGoalSchema,
  UpdateGoalSchema,
  GoalParamsSchema,
  type CreateGoalDto,
  type UpdateGoalDto,
} from '../schemas/goal.schema.js';
import { GoalService } from '../services/goal.service.js';
import { HabitService } from '../services/habit.service.js';
import { NotFoundError } from '../services/errors.js';

// Goal routes - CRUD for the top-level Goal entity. Registered at prefix
// '/goals'. See PRPs/HABIT_TRACKER_V2_SCHEMA_API.md section 6.
const goalRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const habitService = new HabitService(fastify.prisma);
  const goalService = new GoalService(fastify.prisma, habitService);

  // POST /goals - Create a new goal
  fastify.post<{ Body: CreateGoalDto; Reply: Static<typeof GoalSchema> }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        summary: 'Create a new goal',
        description: 'Creates a new goal with a title and calendar period',
        body: CreateGoalSchema,
        response: {
          201: GoalSchema,
          400: { description: 'Invalid input' },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      const goal = await goalService.create(userId, request.body);
      return reply.code(201).send(goal as any);
    }
  );

  // GET /goals - List all goals for the current user
  fastify.get<{ Reply: Static<typeof GoalSchema>[] }>(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        summary: 'List goals',
        description: 'Returns all goals for the current user, with their habits (each with its own progress)',
        response: {
          200: { type: 'array', items: GoalSchema },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      const goals = await goalService.findAll(userId);
      return reply.send(goals as any);
    }
  );

  // GET /goals/:goalId - Get a single goal
  fastify.get<{
    Params: Static<typeof GoalParamsSchema>;
    Reply: Static<typeof GoalSchema>;
  }>(
    '/:goalId',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        summary: 'Get a goal by ID',
        params: GoalParamsSchema,
        response: {
          200: GoalSchema,
          404: { description: 'Goal not found' },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      const goal = await goalService.findById(request.params.goalId, userId);
      if (!goal) {
        return reply.code(404).send({ message: 'Goal not found' } as any);
      }
      return reply.send(goal as any);
    }
  );

  // PUT /goals/:goalId - Update a goal
  fastify.put<{
    Params: Static<typeof GoalParamsSchema>;
    Body: UpdateGoalDto;
    Reply: Static<typeof GoalSchema>;
  }>(
    '/:goalId',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        summary: 'Update a goal',
        params: GoalParamsSchema,
        body: UpdateGoalSchema,
        response: {
          200: GoalSchema,
          404: { description: 'Goal not found' },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      try {
        const goal = await goalService.update(
          request.params.goalId,
          userId,
          request.body
        );
        return reply.send(goal as any);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ message: error.message } as any);
        }
        throw error;
      }
    }
  );

  // DELETE /goals/:goalId - Delete a goal (cascades to its habits and tasks)
  fastify.delete<{ Params: Static<typeof GoalParamsSchema> }>(
    '/:goalId',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Goals'],
        security: [{ bearerAuth: [] }],
        summary: 'Delete a goal',
        description: 'Deletes a goal and cascades to all of its habits and tasks',
        params: GoalParamsSchema,
        response: {
          204: { description: 'Goal deleted successfully' },
          404: { description: 'Goal not found' },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      try {
        await goalService.delete(request.params.goalId, userId);
        return reply.code(204).send();
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ message: error.message } as any);
        }
        throw error;
      }
    }
  );
};

export default goalRoutes;
