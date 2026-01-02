import { Type, Static } from '@sinclair/typebox';

// Habit tracking record schema - represents a completed habit log
export const HabitTrackingSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  habitId: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  completedAt: Type.String({ format: 'date-time' }),
  notes: Type.Optional(Type.String()),
  streak: Type.Number({ minimum: 1 }),
  createdAt: Type.String({ format: 'date-time' }),
});

export type HabitTracking = Static<typeof HabitTrackingSchema>;

// Create tracking record DTO
export const CreateHabitTrackingSchema = Type.Object({
  completedAt: Type.Optional(Type.String({ format: 'date-time' })),
  notes: Type.Optional(Type.String()),
});

export type CreateHabitTrackingDto = Static<typeof CreateHabitTrackingSchema>;

// Path parameters
export const TrackingParamsSchema = Type.Object({
  habitId: Type.String({ format: 'uuid' }),
});

// Query parameters for filtering tracking records
export const TrackingQuerySchema = Type.Object({
  from: Type.Optional(Type.String({ format: 'date-time' })),
  to: Type.Optional(Type.String({ format: 'date-time' })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
});
