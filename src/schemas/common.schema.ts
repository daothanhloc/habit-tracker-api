import { Type } from '@sinclair/typebox';

// Common schemas used across multiple resources

export const IdSchema = Type.String({ format: 'uuid' });
export const TimestampSchema = Type.String({ format: 'date-time' });

// Error response schema
export const ErrorSchema = Type.Object({
  statusCode: Type.Number(),
  message: Type.String(),
});

// Pagination query parameters
export const PaginationSchema = Type.Object({
  skip: Type.Optional(Type.Number({ minimum: 0 })),
  take: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
});
