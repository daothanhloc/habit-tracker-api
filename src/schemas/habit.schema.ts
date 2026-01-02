import { Type, Static } from '@sinclair/typebox';

// Frequency enumeration for INPUT (what users send - lowercase)
export const FrequencyEnum = Type.Union([
  Type.Literal('daily'),
  Type.Literal('weekly'),
  Type.Literal('monthly'),
]);

// Frequency enumeration for OUTPUT (what Prisma returns - uppercase)
export const FrequencyEnumResponse = Type.Union([
  Type.Literal('DAILY'),
  Type.Literal('WEEKLY'),
  Type.Literal('MONTHLY'),
]);

// Main Habit schema - represents a habit in the system
export const HabitSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  frequency: FrequencyEnumResponse,
  category: Type.Optional(Type.String()),
  isActive: Type.Boolean(),
  color: Type.Optional(Type.String()),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  trackedToday: Type.Boolean(),
});

export type Habit = Static<typeof HabitSchema>;

// Create DTO - accepts lowercase frequency (what users send)
export const CreateHabitSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  frequency: FrequencyEnum,
  category: Type.Optional(Type.String()),
  color: Type.Optional(Type.String()),
});

export type CreateHabitDto = Static<typeof CreateHabitSchema>;

// Update DTO - all fields optional
export const UpdateHabitSchema = Type.Partial(CreateHabitSchema);

export type UpdateHabitDto = Static<typeof UpdateHabitSchema>;

// Path parameters
export const HabitParamsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type HabitParams = Static<typeof HabitParamsSchema>;

// List query schema
export const HabitQuerySchema = Type.Object({
  isActive: Type.Optional(Type.Boolean()),
});
