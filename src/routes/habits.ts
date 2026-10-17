import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Static } from '@sinclair/typebox';
import {
  HabitSchema,
  CreateHabitSchema,
  UpdateHabitSchema,
  HabitParamsSchema,
  GoalHabitParamsSchema,
  type CreateHabitDto,
  type UpdateHabitDto,
} from '../schemas/habit.schema.js';
import { HabitService } from '../services/habit.service.js';
import { NotFoundError } from '../services/errors.js';

// Habit routes. Create/list are nested under a Goal; get/update/delete are
// flat under /habits/:habitId. Registered with no prefix - paths below are
// absolute. See PRPs/HABIT_TRACKER_V2_SCHEMA_API.md section 6.
const habitRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const habitService = new HabitService(fastify.prisma);

  // POST /goals/:goalId/habits - Create a habit under a goal
  fastify.post<{
    Params: Static<typeof GoalHabitParamsSchema>;
    Body: CreateHabitDto;
    Reply: Static<typeof HabitSchema>;
  }>(
    '/goals/:goalId/habits',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        summary: 'Create a habit under a goal',
        params: GoalHabitParamsSchema,
        body: CreateHabitSchema,
        response: {
          201: HabitSchema,
          400: { description: 'Invalid input' },
          404: { description: 'Goal not found' },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      try {
        const habit = await habitService.create(
          request.params.goalId,
          userId,
          request.body
        );
        return reply.code(201).send(habit as any);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ message: error.message } as any);
        }
        throw error;
      }
    }
  );

  // GET /goals/:goalId/habits - List habits for a goal
  fastify.get<{
    Params: Static<typeof GoalHabitParamsSchema>;
    Reply: Static<typeof HabitSchema>[];
  }>(
    '/goals/:goalId/habits',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        summary: 'List habits for a goal',
        params: GoalHabitParamsSchema,
        response: {
          200: { type: 'array', items: HabitSchema },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      const goal = await fastify.prisma.goal.findFirst({
        where: { id: request.params.goalId, userId },
      });
      if (!goal) {
        return reply.code(404).send({ message: 'Goal not found' } as any);
      }
      const habits = await habitService.listForGoal(goal);
      return reply.send(habits as any);
    }
  );

  // GET /habits/:habitId - Get a single habit
  fastify.get<{
    Params: Static<typeof HabitParamsSchema>;
    Reply: Static<typeof HabitSchema>;
  }>(
    '/habits/:habitId',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        summary: 'Get habit by ID',
        params: HabitParamsSchema,
        response: {
          200: HabitSchema,
          404: { description: 'Habit not found' },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      const habit = await habitService.findById(request.params.habitId, userId);
      if (!habit) {
        return reply.code(404).send({ message: 'Habit not found' } as any);
      }
      return reply.send(habit as any);
    }
  );

  // PUT /habits/:habitId - Update a habit
  fastify.put<{
    Params: Static<typeof HabitParamsSchema>;
    Body: UpdateHabitDto;
    Reply: Static<typeof HabitSchema>;
  }>(
    '/habits/:habitId',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        summary: 'Update a habit',
        description:
          'Updates a habit. Changing frequencyDays drops NOT_DONE tasks so ' +
          'they regenerate under the new schedule; DONE tasks are untouched.',
        params: HabitParamsSchema,
        body: UpdateHabitSchema,
        response: {
          200: HabitSchema,
          404: { description: 'Habit not found' },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      try {
        const habit = await habitService.update(
          request.params.habitId,
          userId,
          request.body
        );
        return reply.send(habit as any);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ message: error.message } as any);
        }
        throw error;
      }
    }
  );

  // DELETE /habits/:habitId - Delete a habit (cascades to its tasks)
  fastify.delete<{ Params: Static<typeof HabitParamsSchema> }>(
    '/habits/:habitId',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        summary: 'Delete a habit',
        description: 'Deletes a habit and all of its tasks',
        params: HabitParamsSchema,
        response: {
          204: { description: 'Habit deleted successfully' },
          404: { description: 'Habit not found' },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      try {
        await habitService.delete(request.params.habitId, userId);
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

export default habitRoutes;
