import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  HabitGoalSchema,
  CreateHabitGoalSchema,
  UpdateHabitGoalSchema,
  GoalParamsSchema,
  type CreateHabitGoalDto,
  type UpdateHabitGoalDto,
} from "../schemas/goal.schema";
import { GoalService } from "../services/goal.service";

// Goal routes - habit goal and consistency tracking
const goalRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const goalService = new GoalService(fastify.prisma);

  // POST /habits/:habitId/goals - Create goal
  fastify.post<{
    Params: Static<typeof GoalParamsSchema>;
    Body: CreateHabitGoalDto;
    Reply: Static<typeof HabitGoalSchema>;
  }>(
    "/:habitId/goals",
    {
      onRequest: [fastify.authenticate],
      schema: {
        summary: "Create a habit goal",
        description:
          "Sets a consistency goal for a habit (weekly, monthly, yearly)",
        params: GoalParamsSchema,
        body: CreateHabitGoalSchema,
        response: {
          201: HabitGoalSchema,
          400: { description: "Invalid input" },
          404: { description: "Habit not found" },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;

      try {
        const goal = await goalService.create(
          request.params.habitId,
          userId,
          request.body
        );
        return reply.code(201).send(goal as any);
      } catch (error: any) {
        if (error.code === "P2025") {
          return reply.code(404).send({
            message: "Habit not found",
          } as any);
        }
        if (error.code === "P2002") {
          return reply.code(400).send({
            message: "Goal for this type already exists",
          } as any);
        }
        throw error;
      }
    }
  );

  // GET /habits/:habitId/goals - Get all goals for habit
  fastify.get<{
    Params: Static<typeof GoalParamsSchema>;
    Reply: Static<typeof HabitGoalSchema>[];
  }>(
    "/:habitId/goals",
    {
      onRequest: [fastify.authenticate],
      schema: {
        summary: "Get all goals for a habit",
        description: "Retrieves all consistency goals for a habit",
        params: GoalParamsSchema,
        response: {
          200: { type: "array", items: HabitGoalSchema },
        },
      } as any,
    },
    async (request, reply) => {
      const goals = await goalService.findByHabitId(request.params.habitId);
      return reply.send(goals as any);
    }
  );

  // GET /habits/:habitId/goals/:goalId - Get goal progress
  fastify.get<{
    Params: Static<typeof GoalParamsSchema>;
    Reply: {
      goal: Static<typeof HabitGoalSchema>;
      completions: number;
      targetFrequency: number;
      percentage: number;
    };
  }>(
    "/:habitId/goals/:goalId",
    {
      onRequest: [fastify.authenticate],
      schema: {
        summary: "Get goal progress",
        description:
          "Retrieves progress towards a specific goal (completions vs target)",
        params: GoalParamsSchema,
        response: {
          200: {
            type: "object",
            properties: {
              goal: HabitGoalSchema,
              completions: { type: "number" },
              targetFrequency: { type: "number" },
              percentage: { type: "number" },
            },
          },
          404: { description: "Goal not found" },
        },
      } as any,
    },
    async (request, reply) => {
      const goal = await goalService.getProgress(
        request.params.habitId,
        (request.params.goalId as string) || (request.query as any).toString()
      );

      if (!goal) {
        return reply.code(404).send({
          message: "Goal not found",
        } as any);
      }

      return reply.send(goal as any);
    }
  );

  // PUT /habits/:habitId/goals/:goalId - Update goal
  fastify.put<{
    Params: Static<typeof GoalParamsSchema>;
    Body: UpdateHabitGoalDto;
    Reply: Static<typeof HabitGoalSchema>;
  }>(
    "/:habitId/goals/:goalId",
    {
      onRequest: [fastify.authenticate],
      schema: {
        summary: "Update a goal",
        description: "Updates the target frequency or goal type",
        params: GoalParamsSchema,
        body: UpdateHabitGoalSchema,
        response: {
          200: HabitGoalSchema,
          404: { description: "Goal not found" },
        },
      } as any,
    },
    async (request, reply) => {
      try {
        const goal = await goalService.update(
          request.params.goalId!,
          request.body
        );
        return reply.send(goal as any);
      } catch (error: any) {
        if (error.code === "P2025") {
          return reply.code(404).send({
            message: "Goal not found",
          } as any);
        }
        throw error;
      }
    }
  );

  // DELETE /habits/:habitId/goals/:goalId - Delete goal
  fastify.delete<{
    Params: Static<typeof GoalParamsSchema>;
  }>(
    "/:habitId/goals/:goalId",
    {
      onRequest: [fastify.authenticate],
      schema: {
        summary: "Delete a goal",
        description: "Removes a goal from a habit",
        params: GoalParamsSchema,
        response: {
          204: { description: "Goal deleted successfully" },
          404: { description: "Goal not found" },
        },
      } as any,
    },
    async (request, reply) => {
      try {
        await goalService.delete(request.params.goalId!);
        return reply.code(204).send();
      } catch (error: any) {
        if (error.code === "P2025") {
          return reply.code(404).send({
            message: "Goal not found",
          } as any);
        }
        throw error;
      }
    }
  );
};

export default goalRoutes;
