import { Type, Static } from '@sinclair/typebox';

// TaskStatus enumeration for INPUT (what users send - lowercase)
export const TaskStatusEnum = Type.Union([
  Type.Literal('done'),
  Type.Literal('not_done'),
]);

// TaskStatus enumeration for OUTPUT (what Prisma returns - uppercase)
export const TaskStatusEnumResponse = Type.Union([
  Type.Literal('DONE'),
  Type.Literal('NOT_DONE'),
]);

// Task schema - one scheduled day's instance of a Habit
export const TaskSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  habitId: Type.String({ format: 'uuid' }),
  date: Type.String({ format: 'date' }),
  value: Type.Union([Type.Number(), Type.Null()]),
  status: TaskStatusEnumResponse,
  completedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
});

export type Task = Static<typeof TaskSchema>;

// Upsert DTO - PUT /habits/:habitId/tasks/:date
export const UpsertTaskSchema = Type.Object({
  value: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  status: Type.Optional(TaskStatusEnum),
});

export type UpsertTaskDto = Static<typeof UpsertTaskSchema>;

// Path parameters
export const TaskHabitParamsSchema = Type.Object({
  habitId: Type.String({ format: 'uuid' }),
});

export type TaskHabitParams = Static<typeof TaskHabitParamsSchema>;

export const TaskDateParamsSchema = Type.Object({
  habitId: Type.String({ format: 'uuid' }),
  date: Type.String({ format: 'date' }),
});

export type TaskDateParams = Static<typeof TaskDateParamsSchema>;

// Query parameters for ranged task reads
export const TaskRangeQuerySchema = Type.Object({
  from: Type.String({ format: 'date' }),
  to: Type.String({ format: 'date' }),
});

export type TaskRangeQuery = Static<typeof TaskRangeQuerySchema>;
