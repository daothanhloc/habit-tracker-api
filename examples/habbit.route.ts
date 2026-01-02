import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { Type, Static } from "@sinclair/typebox";

// -----------------------------------------------------------------------------
// DTOs / Schemas (Best Practice: Keep these in a separate file, e.g., schemas/habit.schema.ts)
// -----------------------------------------------------------------------------

export const HabitSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  frequency: Type.Union([
    Type.Literal("daily"),
    Type.Literal("weekly"),
    Type.Literal("monthly"),
  ]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export type Habit = Static<typeof HabitSchema>;

const CreateHabitSchema = Type.Omit(HabitSchema, [
  "id",
  "createdAt",
  "updatedAt",
]);
type CreateHabitDto = Static<typeof CreateHabitSchema>;

const UpdateHabitSchema = Type.Partial(CreateHabitSchema);
type UpdateHabitDto = Static<typeof UpdateHabitSchema>;

const HabitParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

// -----------------------------------------------------------------------------
// Routes (Best Practice: Keep handlers in controllers)
// -----------------------------------------------------------------------------

const habitRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const HABIT_TAG = "Habits";

  // Mock Database / Service
  // In a real app, inject `habitService` via dependency injection or plugins
  const mockHabitService = {
    getAll: async () => [] as Habit[],
    getById: async (id: string) =>
      ({
        id,
        name: "Mock Habit",
        frequency: "daily",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Habit),
    create: async (data: CreateHabitDto) =>
      ({
        ...data,
        id: "123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Habit),
    update: async (id: string, data: UpdateHabitDto) =>
      ({
        id,
        ...data,
        name: data.name || "Updated",
        frequency: "daily",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Habit),
    delete: async (id: string) => true,
  };

  // POST /habits
  fastify.post<{ Body: CreateHabitDto; Reply: Habit }>(
    "/",
    {
      schema: {
        tags: [HABIT_TAG],
        summary: "Create a new habit",
        body: CreateHabitSchema,
        response: {
          201: HabitSchema,
        },
      },
    },
    async (request, reply) => {
      const newHabit = await mockHabitService.create(request.body);
      return reply.code(201).send(newHabit);
    }
  );

  // GET /habits
  fastify.get<{ Reply: Habit[] }>(
    "/",
    {
      schema: {
        tags: [HABIT_TAG],
        summary: "Get all habits",
        response: {
          200: Type.Array(HabitSchema),
        },
      },
    },
    async (request, reply) => {
      const habits = await mockHabitService.getAll();
      return reply.send(habits);
    }
  );

  // GET /habits/:id
  fastify.get<{ Params: Static<typeof HabitParamsSchema>; Reply: Habit }>(
    "/:id",
    {
      schema: {
        tags: [HABIT_TAG],
        summary: "Get a habit by ID",
        params: HabitParamsSchema,
        response: {
          200: HabitSchema,
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const habit = await mockHabitService.getById(request.params.id);
      if (!habit) {
        return reply.code(404).send({ message: "Habit not found" } as any);
      }
      return reply.send(habit);
    }
  );

  // PUT /habits/:id
  fastify.put<{
    Params: Static<typeof HabitParamsSchema>;
    Body: UpdateHabitDto;
    Reply: Habit;
  }>(
    "/:id",
    {
      schema: {
        tags: [HABIT_TAG],
        summary: "Update a habit",
        params: HabitParamsSchema,
        body: UpdateHabitSchema,
        response: {
          200: HabitSchema,
        },
      },
    },
    async (request, reply) => {
      const updatedHabit = await mockHabitService.update(
        request.params.id,
        request.body
      );
      return reply.send(updatedHabit);
    }
  );

  // DELETE /habits/:id
  fastify.delete<{ Params: Static<typeof HabitParamsSchema> }>(
    "/:id",
    {
      schema: {
        tags: [HABIT_TAG],
        summary: "Delete a habit",
        params: HabitParamsSchema,
        response: {
          204: Type.Null(),
        },
      },
    },
    async (request, reply) => {
      await mockHabitService.delete(request.params.id);
      return reply.code(204).send();
    }
  );
};

export default habitRoutes;
