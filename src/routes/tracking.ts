import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  HabitTrackingSchema,
  CreateHabitTrackingSchema,
  TrackingParamsSchema,
  type CreateHabitTrackingDto,
} from "../schemas/tracking.schema";
import { TrackingService } from "../services/tracking.service";

// Tracking routes - habit completion tracking
const trackingRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const trackingService = new TrackingService(fastify.prisma);

  // POST /habits/:habitId/track - Log habit completion
  fastify.post<{
    Params: Static<typeof TrackingParamsSchema>;
    Body: CreateHabitTrackingDto;
    Reply: Static<typeof HabitTrackingSchema>;
  }>(
    "/:habitId/track",
    {
      onRequest: [fastify.authenticate],
      schema: {
        summary: "Log habit completion",
        description: "Records a habit completion for today or a specific date",
        params: TrackingParamsSchema,
        body: CreateHabitTrackingSchema,
        response: {
          201: HabitTrackingSchema,
          400: { description: "Invalid input or duplicate log" },
          404: { description: "Habit not found" },
        },
      } as any,
    },
    async (request, reply) => {
      const userId = request.user.userId;

      try {
        const tracking = await trackingService.logCompletion(
          request.params.habitId,
          userId,
          request.body
        );
        return reply.code(201).send(tracking as any);
      } catch (error: any) {
        if (error.message.includes("already logged")) {
          return reply.code(400).send({
            message: error.message,
          } as any);
        }
        if (error.code === "P2025") {
          return reply.code(404).send({
            message: "Habit not found",
          } as any);
        }
        throw error;
      }
    }
  );

  // GET /habits/:habitId/history - Get tracking history
  fastify.get<{
    Params: Static<typeof TrackingParamsSchema>;
    Reply: Static<typeof HabitTrackingSchema>[];
  }>(
    "/:habitId/history",
    {
      onRequest: [fastify.authenticate],
      schema: {
        summary: "Get habit tracking history",
        description: "Retrieves all tracking records for a habit",
        params: TrackingParamsSchema,
        querystring: {
          type: "object",
          properties: {
            limit: { type: "number", minimum: 1, maximum: 100 },
          },
        },
        response: {
          200: { type: "array", items: HabitTrackingSchema },
        },
      } as any,
    },
    async (request, reply) => {
      const limit = (request.query as any).limit || 30;
      const history = await trackingService.getHistory(
        request.params.habitId,
        limit
      );
      return reply.send(history as any);
    }
  );

  // GET /habits/:habitId/streak - Get current streak
  fastify.get<{
    Params: Static<typeof TrackingParamsSchema>;
    Reply: { streak: number };
  }>(
    "/:habitId/streak",
    {
      onRequest: [fastify.authenticate],
      schema: {
        summary: "Get current streak",
        description: "Returns the current streak for a habit",
        params: TrackingParamsSchema,
        response: {
          200: {
            type: "object",
            properties: {
              streak: { type: "number" },
            },
          },
        },
      } as any,
    },
    async (request, reply) => {
      const streak = await trackingService.getStreak(request.params.habitId);
      return reply.send({ streak });
    }
  );
};

export default trackingRoutes;
