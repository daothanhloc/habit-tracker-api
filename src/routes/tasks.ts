import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Static } from '@sinclair/typebox';
import {
  TaskSchema,
  UpsertTaskSchema,
  TaskHabitParamsSchema,
  TaskDateParamsSchema,
  TaskRangeQuerySchema,
  type UpsertTaskDto,
} from '../schemas/task.schema.js';
import { TaskService } from '../services/task.service.js';
import { HabitService } from '../services/habit.service.js';
import { NotFoundError } from '../services/errors.js';

// Task routes - replaces v1's tracking.ts. Registered with no prefix; paths
// below are absolute. See PRPs/HABIT_TRACKER_V2_SCHEMA_API.md section 6.
const taskRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const habitService = new HabitService(fastify.prisma);
  const taskService = new TaskService(fastify.prisma, habitService);

  // GET /habits/:habitId/tasks?from=&to= - Ranged task read (lazy-creates
  // rows for scheduled dates up to server-side today)
  fastify.get<{
    Params: Static<typeof TaskHabitParamsSchema>;
    Querystring: Static<typeof TaskRangeQuerySchema>;
    Reply: Static<typeof TaskSchema>[];
  }>(
    '/habits/:habitId/tasks',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        summary: 'List tasks in a date range',
        params: TaskHabitParamsSchema,
        querystring: TaskRangeQuerySchema,
        response: {
          200: { type: 'array', items: TaskSchema },
          404: { description: 'Habit not found' },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      try {
        const tasks = await taskService.listRange(
          request.params.habitId,
          userId,
          request.query.from,
          request.query.to
        );
        return reply.send(tasks as any);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ message: error.message } as any);
        }
        throw error;
      }
    }
  );

  // GET /habits/:habitId/tasks/today - Today's task, 404 if unscheduled
  fastify.get<{
    Params: Static<typeof TaskHabitParamsSchema>;
    Reply: Static<typeof TaskSchema>;
  }>(
    '/habits/:habitId/tasks/today',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        summary: "Get today's task",
        params: TaskHabitParamsSchema,
        response: {
          200: TaskSchema,
          404: { description: 'Habit not found, or not scheduled today' },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      try {
        const task = await taskService.getToday(request.params.habitId, userId);
        if (!task) {
          return reply
            .code(404)
            .send({ message: 'Not scheduled today' } as any);
        }
        return reply.send(task as any);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ message: error.message } as any);
        }
        throw error;
      }
    }
  );

  // PUT /habits/:habitId/tasks/:date - Upsert a task's value/status
  fastify.put<{
    Params: Static<typeof TaskDateParamsSchema>;
    Body: UpsertTaskDto;
    Reply: Static<typeof TaskSchema>;
  }>(
    '/habits/:habitId/tasks/:date',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Tasks'],
        security: [{ bearerAuth: [] }],
        summary: 'Upsert a task',
        description:
          'Creates or updates a task for a scheduled date. Rejects future ' +
          'dates and dates outside the habit frequencyDays.',
        params: TaskDateParamsSchema,
        body: UpsertTaskSchema,
        response: {
          200: TaskSchema,
          400: { description: 'Date is in the future' },
          404: { description: 'Habit not found, or date is not scheduled' },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      try {
        const result = await taskService.upsert(
          request.params.habitId,
          userId,
          request.params.date,
          request.body
        );
        if (result.kind === 'future') {
          return reply.code(400).send({
            message: `${request.params.date} is in the future and cannot be completed yet`,
          } as any);
        }
        if (result.kind === 'unscheduled') {
          return reply.code(404).send({
            message: `${request.params.date} is not a scheduled day for this habit`,
          } as any);
        }
        return reply.send(result.task as any);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.code(404).send({ message: error.message } as any);
        }
        throw error;
      }
    }
  );
};

export default taskRoutes;
