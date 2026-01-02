import { Type, Static } from '@sinclair/typebox';

// Goal type enumeration for INPUT (what users send - lowercase)
export const GoalTypeEnum = Type.Union([
  Type.Literal('weekly'),
  Type.Literal('monthly'),
  Type.Literal('yearly'),
]);

// Goal type enumeration for OUTPUT (what Prisma returns - uppercase)
export const GoalTypeEnumResponse = Type.Union([
  Type.Literal('WEEKLY'),
  Type.Literal('MONTHLY'),
  Type.Literal('YEARLY'),
]);

// Habit goal schema - represents a consistency goal for a habit
export const HabitGoalSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  habitId: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  targetFrequency: Type.Number({ minimum: 1 }),
  goalType: GoalTypeEnumResponse,
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

export type HabitGoal = Static<typeof HabitGoalSchema>;

// Create goal DTO
export const CreateHabitGoalSchema = Type.Object({
  targetFrequency: Type.Number({ minimum: 1 }),
  goalType: GoalTypeEnum,
});

export type CreateHabitGoalDto = Static<typeof CreateHabitGoalSchema>;

// Update goal DTO
export const UpdateHabitGoalSchema = Type.Partial(CreateHabitGoalSchema);

export type UpdateHabitGoalDto = Static<typeof UpdateHabitGoalSchema>;

// Path parameters
export const GoalParamsSchema = Type.Object({
  habitId: Type.String({ format: 'uuid' }),
  goalId: Type.Optional(Type.String({ format: 'uuid' })),
});
