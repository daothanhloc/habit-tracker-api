import { Type, Static } from '@sinclair/typebox';

// HabitGoalType enumeration for INPUT (what users send - lowercase)
export const HabitGoalTypeEnum = Type.Union([
  Type.Literal('sum'),
  Type.Literal('threshold_count'),
]);

// HabitGoalType enumeration for OUTPUT (what Prisma returns - uppercase)
export const HabitGoalTypeEnumResponse = Type.Union([
  Type.Literal('SUM'),
  Type.Literal('THRESHOLD_COUNT'),
]);

const ProgressSchema = Type.Object({
  current: Type.Number(),
  target: Type.Number(),
});

// Fields shared by both SUM and THRESHOLD_COUNT variants
const HabitBaseFields = {
  name: Type.String({ minLength: 1, maxLength: 255 }),
  unit: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  // 0=Sun..6=Sat, at least one day required
  frequencyDays: Type.Array(Type.Integer({ minimum: 0, maximum: 6 }), {
    minItems: 1,
  }),
  defaultTaskValue: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
};

// Fields shared by the embedded summary and the full detail response
const HabitSummaryFields = {
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  unit: Type.Union([Type.String(), Type.Null()]),
  goalType: HabitGoalTypeEnumResponse,
  targetValue: Type.Union([Type.Number(), Type.Null()]),
  dailyMinValue: Type.Union([Type.Number(), Type.Null()]),
  targetDays: Type.Union([Type.Integer(), Type.Null()]),
  frequencyDays: Type.Array(Type.Integer()),
  defaultTaskValue: Type.Union([Type.Number(), Type.Null()]),
  progress: ProgressSchema,
  currentStreak: Type.Integer(),
  longestStreak: Type.Integer(),
};

// Lightweight habit shape embedded in Goal responses
export const HabitSummarySchema = Type.Object(HabitSummaryFields);

export type HabitSummary = Static<typeof HabitSummarySchema>;

// Full Habit schema - habit detail, includes ownership/timestamps. Kept as
// a flat object (not Type.Intersect) to match every other schema in this
// codebase and avoid allOf-based schemas, which fast-json-stringify (the
// response serializer Fastify uses) doesn't handle as reliably.
export const HabitSchema = Type.Object({
  ...HabitSummaryFields,
  goalId: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

export type Habit = Static<typeof HabitSchema>;

// Create DTO - discriminated by goalType. Ajv validates this as "matches at
// least one variant"; the service layer re-checks the discriminant since
// Ajv's error messages for failed unions are not user-friendly.
export const CreateHabitSchema = Type.Union([
  Type.Object({
    ...HabitBaseFields,
    goalType: Type.Literal('sum'),
    targetValue: Type.Number({ exclusiveMinimum: 0 }),
  }),
  Type.Object({
    ...HabitBaseFields,
    goalType: Type.Literal('threshold_count'),
    dailyMinValue: Type.Number({ exclusiveMinimum: 0 }),
    targetDays: Type.Integer({ minimum: 1 }),
  }),
]);

export type CreateHabitDto = Static<typeof CreateHabitSchema>;

// Update DTO - all fields optional; cross-field goalType/targetValue
// consistency is enforced in HabitService.update, not here, since a PATCH
// may legitimately touch only e.g. frequencyDays without restating goalType.
export const UpdateHabitSchema = Type.Partial(
  Type.Object({
    ...HabitBaseFields,
    goalType: HabitGoalTypeEnum,
    targetValue: Type.Number({ exclusiveMinimum: 0 }),
    dailyMinValue: Type.Number({ exclusiveMinimum: 0 }),
    targetDays: Type.Integer({ minimum: 1 }),
  })
);

export type UpdateHabitDto = Static<typeof UpdateHabitSchema>;

// Path parameters
export const HabitParamsSchema = Type.Object({
  habitId: Type.String({ format: 'uuid' }),
});

export type HabitParams = Static<typeof HabitParamsSchema>;

// Path parameters for routes nested under a goal
export const GoalHabitParamsSchema = Type.Object({
  goalId: Type.String({ format: 'uuid' }),
});

export type GoalHabitParams = Static<typeof GoalHabitParamsSchema>;
