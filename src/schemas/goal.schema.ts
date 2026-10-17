import { Type, Static } from '@sinclair/typebox';
import { HabitSummarySchema } from './habit.schema.js';

// Main Goal schema - represents a Goal with its habits
export const GoalSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  title: Type.String({ minLength: 1, maxLength: 255 }),
  startDate: Type.String({ format: 'date' }),
  endDate: Type.String({ format: 'date' }),
  habits: Type.Array(HabitSummarySchema),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

export type Goal = Static<typeof GoalSchema>;

// Create DTO
export const CreateGoalSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 255 }),
  startDate: Type.String({ format: 'date' }),
  endDate: Type.String({ format: 'date' }),
});

export type CreateGoalDto = Static<typeof CreateGoalSchema>;

// Update DTO - all fields optional
export const UpdateGoalSchema = Type.Partial(CreateGoalSchema);

export type UpdateGoalDto = Static<typeof UpdateGoalSchema>;

// Path parameters
export const GoalParamsSchema = Type.Object({
  goalId: Type.String({ format: 'uuid' }),
});

export type GoalParams = Static<typeof GoalParamsSchema>;
