import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  HabitSchema,
  CreateHabitSchema,
  UpdateHabitSchema,
  HabitParamsSchema,
  type CreateHabitDto,
  type UpdateHabitDto,
} from "../schemas/habit.schema.js";
import { HabitService } from "../services/habit.service.js";

// Habit routes - CRUD operations for habits
// Mirrors pattern from examples/habbit.route.ts
const habitRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const habitService = new HabitService(fastify.prisma);

  // POST /habits - Create a new habit
  fastify.post<{ Body: CreateHabitDto; Reply: Static<typeof HabitSchema> }>(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        summary: "Create a new habit",
        description: "Creates a new habit for the user",
        body: CreateHabitSchema,
        response: {
          201: HabitSchema,
          400: { description: "Invalid input" },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;

      try {
        const habit = await habitService.create(userId, request.body);
        return reply.code(201).send(habit as any);
      } catch (error: any) {
        if (error.code === "P2002") {
          // Unique constraint violation
          return reply.code(400).send({
            message: "Habit with this name already exists",
          } as any);
        }
        throw error;
      }
    }
  );

  // GET /habits - Get all habits for user
  fastify.get<{ Reply: Static<typeof HabitSchema>[] }>(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        summary: "Get all habits",
        description: "Returns all habits for the current user",
        response: {
          200: { type: "array", items: HabitSchema },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;
      const habits = await habitService.findAll(userId, true);
      return reply.send(habits as any);
    }
  );

  // GET /habits/:id - Get single habit by ID
  fastify.get<{
    Params: Static<typeof HabitParamsSchema>;
    Reply: Static<typeof HabitSchema>;
  }>(
    "/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        summary: "Get habit by ID",
        description: "Retrieves a specific habit by its ID",
        params: HabitParamsSchema,
        response: {
          200: HabitSchema,
          404: { description: "Habit not found" },
        },
      } as any,
    },
    async (request, reply) => {
      const habit = await habitService.findById(request.params.id);
      if (!habit) {
        return reply.code(404).send({
          message: "Habit not found",
        } as any);
      }
      return reply.send(habit as any);
    }
  );

  // PUT /habits/:id - Update habit
  fastify.put<{
    Params: Static<typeof HabitParamsSchema>;
    Body: UpdateHabitDto;
    Reply: Static<typeof HabitSchema>;
  }>(
    "/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        summary: "Update a habit",
        description: "Updates an existing habit",
        params: HabitParamsSchema,
        body: UpdateHabitSchema,
        response: {
          200: HabitSchema,
          404: { description: "Habit not found" },
        },
      } as any,
    },
    async (request, reply) => {
      try {
        const habit = await habitService.update(
          request.params.id,
          request.body
        );
        return reply.send(habit as any);
      } catch (error: any) {
        if (error.code === "P2025") {
          // Record not found
          return reply.code(404).send({
            message: "Habit not found",
          } as any);
        }
        throw error;
      }
    }
  );

  // DELETE /habits/:id - Delete habit
  fastify.delete<{
    Params: Static<typeof HabitParamsSchema>;
  }>(
    "/:id",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        summary: "Delete a habit",
        description: "Deletes a habit and all its associated tracking records",
        params: HabitParamsSchema,
        response: {
          204: { description: "Habit deleted successfully" },
          404: { description: "Habit not found" },
        },
      } as any,
    },
    async (request, reply) => {
      try {
        await habitService.delete(request.params.id);
        return reply.code(204).send();
      } catch (error: any) {
        if (error.code === "P2025") {
          return reply.code(404).send({
            message: "Habit not found",
          } as any);
        }
        throw error;
      }
    }
  );
};

export default habitRoutes;
