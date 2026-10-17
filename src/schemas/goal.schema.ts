import { Type, Static } from '@sinclair/typebox';
import { HabitSummarySchema } from './habit.schema.js';

// Progress is computed on read, never stored directly
export const ProgressSchema = Type.Object({
  current: Type.Number(),
  target: Type.Number(),
});

export type Progress = Static<typeof ProgressSchema>;

// Main Goal schema - represents a Goal with its habits and derived progress
export const GoalSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  title: Type.String({ minLength: 1, maxLength: 255 }),
  startDate: Type.String({ format: 'date' }),
  endDate: Type.String({ format: 'date' }),
  // null when habits don't share a common unit - see
  // PRPs/HABIT_TRACKER_V2_SCHEMA_API.md section 4
  unifiedProgress: Type.Union([ProgressSchema, Type.Null()]),
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
