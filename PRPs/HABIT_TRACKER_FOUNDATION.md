# Habit Tracker API - Foundation Implementation

name: "Habit Tracker API Foundation - Phase 1 & 2"
description: |
Complete implementation of the Habit Tracker API foundation with project setup, database schema,
core CRUD operations, and basic habit tracking. This PRP establishes the complete backend
infrastructure for a production-ready habit tracking system.

## Purpose

This PRP provides comprehensive context and validation gates to enable single-pass implementation
of the Habit Tracker API foundation using Fastify, TypeScript, PostgreSQL, and Prisma ORM.

## Core Principles

1. **Context is King**: ALL necessary documentation, patterns, and caveats included
2. **Validation Loops**: Executable tests/lints that AI can run and fix iteratively
3. **Existing Patterns**: Mirrors the example habbit.route.ts patterns provided
4. **Progressive Success**: Start with infrastructure, then CRUD, then tracking features
5. **TypeScript First**: Full type safety with TypeBox schemas and Prisma types

---

## Goal

Build a production-ready Habit Tracker API that allows users to:

- Create, read, update, and delete habits with metadata
- Track daily habit completion with timestamps and notes
- Set consistency goals and calculate metrics
- View historical data and progress metrics

## Why

- **Business value**: Enables users to build and maintain positive habits with data-driven insights
- **Integration**: Establishes the backend foundation for mobile/web clients
- **Problems solved**: Provides the core infrastructure for habit management, tracking, and analytics

## What

A complete Node.js/Fastify/TypeScript backend API with:

- PostgreSQL database with Prisma ORM
- RESTful endpoints for habit management and tracking
- Type-safe request/response validation with TypeBox
- Comprehensive test coverage
- Clear project structure following Node.js best practices
- Environment configuration for local development and production

### Success Criteria

- [ ] Project setup with all dependencies installed and configured
- [ ] PostgreSQL database initialized with Prisma schema and migrations
- [ ] All CRUD endpoints for habits, tracking records, and goals implemented
- [ ] TypeScript compilation with zero errors (`tsc --noEmit`)
- [ ] All unit and integration tests passing (`npm test`)
- [ ] ESLint passes without errors (`npm run lint`)
- [ ] README with clear setup instructions including Supabase configuration
- [ ] `.env.example` file with all required environment variables documented
- [ ] OpenAPI/Swagger documentation generated and accessible

---

## All Needed Context

### Documentation & References (MUST READ)

```yaml
# Core Framework & Language
- url: https://fastify.dev/docs/latest/Reference/TypeScript/
  why: TypeScript integration with Fastify, type inference for routes and plugins
  critical: Use setValidatorCompiler for TypeBox validation

- url: https://www.prisma.io/docs/orm/prisma-schema/overview
  why: Database schema definition, relationships, and migrations
  critical: Use @db.Uuid for PostgreSQL UUID fields, @default(cuid()) for IDs

- url: https://www.prisma.io/fastify
  why: Official Prisma integration patterns with Fastify
  critical: Inject PrismaClient via Fastify.decorate for connection pooling

# Schema Validation & API Definition
- url: https://github.com/sinclairzx81/typebox
  why: TypeBox for runtime schema validation and OpenAPI generation
  critical: Use Type.Omit() and Type.Partial() for DTOs like in example

- url: https://github.com/fastify/fastify-type-provider-typebox
  why: TypeBox type provider for Fastify type inference
  critical: Register with setValidatorCompiler(createValidatorCompiler(TypeBoxSchema))

# Supabase Integration
- url: https://supabase.com/docs/guides/getting-started
  why: PostgreSQL database setup and connection configuration
  critical: Use DATABASE_URL from Supabase credentials for Prisma

- url: https://github.com/psteinroe/fastify-supabase
  why: Optional plugin for Supabase client injection (advanced feature)
  critical: For Phase 2, use basic Prisma connection initially

# Testing & Validation
- url: https://jestjs.io/docs/getting-started
  why: Unit and integration testing framework
  critical: Use jest.config.js with preset: 'ts-jest' for TypeScript

# Real Code Examples in This Repo
- file: examples/habbit.route.ts
  why: Shows the exact pattern to follow for routes, schemas, and CRUD operations
  critical: Extract HabitSchema pattern, use Type.Omit() for CreateHabitDto, Type.Partial() for UpdateHabitDto
```

### Current Codebase Tree

```
habbit-tracker-api/
├── .claude/                     # Claude Code configuration
│   ├── commands/
│   ├── settings.local.json
├── examples/
│   └── habbit.route.ts          # REFERENCE: Route pattern to follow
├── PRPs/
│   ├── templates/
│   │   └── prp_base.md
│   └── EXAMPLE_multi_agent_prp.md
├── CLAUDE.md                    # Project constraints and tech stack
├── INITIAL.md                   # Original requirements
└── README.md                    # To be created
```

### Desired Codebase Tree After Implementation

```
habbit-tracker-api/
├── src/
│   ├── main.ts                  # Fastify app entry point
│   ├── config/
│   │   ├── env.ts              # Environment variables validation
│   │   └── fastify.ts          # Fastify configuration and plugins
│   ├── schemas/
│   │   ├── habit.schema.ts      # Habit TypeBox schemas (MIRROR: examples/habbit.route.ts)
│   │   ├── tracking.schema.ts   # Tracking record schemas
│   │   ├── goal.schema.ts       # Goal schemas
│   │   └── common.schema.ts     # Common/shared schemas
│   ├── routes/
│   │   ├── habits.ts            # Habit CRUD routes (POST, GET, PUT, DELETE)
│   │   ├── tracking.ts          # Habit tracking/history routes
│   │   └── goals.ts             # Habit goal management routes
│   ├── services/
│   │   ├── habit.service.ts     # Habit business logic
│   │   ├── tracking.service.ts  # Tracking business logic
│   │   └── goal.service.ts      # Goal business logic
│   ├── db/
│   │   └── prisma.ts            # Prisma client singleton
│   └── utils/
│       ├── logger.ts            # Logging utility
│       └── errors.ts            # Custom error classes
├── prisma/
│   ├── schema.prisma            # CRITICAL: Complete database schema
│   └── migrations/              # Auto-generated by Prisma
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   └── integration/
│       ├── habits.test.ts
│       ├── tracking.test.ts
│       └── goals.test.ts
├── .env.example                 # CRITICAL: Environment variables template
├── .env.local                   # GITIGNORED: Local development secrets
├── .gitignore
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Jest testing configuration
├── eslint.config.js             # ESLint configuration
└── README.md                    # Setup instructions and API docs

# Total files to create: ~25 source files + configs
```

### Known Gotchas of Fastify & Prisma with PostgreSQL

```typescript
// ❌ GOTCHA 1: Async/Await is required
// This WON'T work in Fastify - all handlers must be async
fastify.get('/', (request, reply) => {
  const result = db.habit.findAll();  // ❌ WRONG
  return result;
});

// ✅ CORRECT: Always use async/await
fastify.get('/', async (request, reply) => {
  const result = await prisma.habit.findMany();  // ✅ RIGHT
  return result;
});

// ❌ GOTCHA 2: PrismaClient not shared
// Creating a new PrismaClient in every route = connection pool exhaustion
const db = new PrismaClient();  // ❌ WRONG: Creates new connection per request

// ✅ CORRECT: Single PrismaClient instance
// In db/prisma.ts:
declare global {
  var prisma: PrismaClient | undefined;
}
export const prisma = global.prisma || new PrismaClient();

// ❌ GOTCHA 3: TypeBox requires type provider
// Omitting TypeBoxTypeProvider loses type inference on route handlers
const app = fastify();

// ✅ CORRECT: Register type provider early
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
const app = fastify().withTypeProvider<TypeBoxTypeProvider>();

// ❌ GOTCHA 4: Date serialization in TypeBox
// Timestamps must be explicitly serialized as ISO strings
const HabitSchema = Type.Object({
  createdAt: Type.Object({/* ... */})  // ❌ WRONG
});

// ✅ CORRECT: Use Type.String with format
const HabitSchema = Type.Object({
  createdAt: Type.String({ format: 'date-time' })  // ✅ RIGHT
  // Prisma returns Date, Fastify serializes to ISO string automatically
});

// ❌ GOTCHA 5: Prisma UUID vs string IDs
// Mixing @db.Uuid with default string IDs causes migration issues
model Habit {
  id String @id  // ❌ WRONG: String in TypeScript, needs to be Uuid

// ✅ CORRECT: Explicit UUID with cuid() default
model Habit {
  id String @id @default(cuid())  // ✅ RIGHT: Use cuid() for ID generation
  // or @db.Uuid @default(dbgenerated("gen_random_uuid()"))
}

// ❌ GOTCHA 6: Validation happens BEFORE handler
// If you modify schema after registration, changes don't take effect
fastify.post('/', { schema: oldSchema }, handler);  // Request validated with oldSchema
// Changing oldSchema here won't affect incoming requests

// ✅ CORRECT: Schema is locked at route registration time
// This is actually correct behavior - schemas are immutable after registration

// GOTCHA 7: Prisma migrations in development
// Just running `npm run dev` won't run migrations
// Must run: npx prisma migrate dev

// ✅ CORRECT: Include migration in dev script or run separately
// Option A: "dev": "prisma migrate dev && tsx src/main.ts"
// Option B: Manual: npx prisma migrate dev --name <name>

// GOTCHA 8: Frequency enum in database
// Creating enum in TypeBox doesn't create database enum automatically
const FrequencyEnum = Type.Union([
  Type.Literal('daily'),
  Type.Literal('weekly'),
  Type.Literal('monthly')
]);

// ✅ In Prisma schema, create enum:
enum Frequency {
  DAILY
  WEEKLY
  MONTHLY
}

model Habit {
  frequency Frequency  // ✅ Uses database enum for validation
}

// GOTCHA 9: Circular dependencies in schemas
// Don't import schemas that import this schema
// SOLUTION: Keep shared types in common.schema.ts

// GOTCHA 10: Hot reload with TypeScript
// Plain Node.js doesn't support hot reload, need tsx or ts-node
// ✅ CORRECT: Use tsx for development
// "dev": "tsx watch src/main.ts"
```

---

## Implementation Blueprint

### Phase 1: Project Infrastructure

#### 1.1 Core Dependencies

```json
{
  "dependencies": {
    "fastify": "^5.0.0",
    "@fastify/type-provider-typebox": "^1.1.0",
    "@sinclair/typebox": "^0.34.0",
    "@prisma/client": "^6.0.0",
    "dotenv": "^16.4.0",
    "pino": "^8.17.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.7.0",
    "@prisma/cli": "^6.0.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "eslint": "^8.55.0"
  }
}
```

#### 1.2 Environment Configuration Pattern

```typescript
// src/config/env.ts - REFERENCE: INITIAL.md mentions .env.example
import { Type, Static } from "@sinclair/typebox";

const EnvSchema = Type.Object({
  NODE_ENV: Type.Optional(
    Type.Enum({ development: "development", production: "production" })
  ),
  PORT: Type.Optional(Type.Number()),
  DATABASE_URL: Type.String(), // From Supabase connection string
  // For future Gmail reminders
  GMAIL_API_KEY: Type.Optional(Type.String()),
  // For future Brave search integration
  BRAVE_API_KEY: Type.Optional(Type.String()),
});

type EnvType = Static<typeof EnvSchema>;

export const env = loadEnv(); // Validates and returns typed config
```

### Phase 2: Database Schema with Prisma

#### 2.1 Core Data Models

```prisma
// prisma/schema.prisma
// CRITICAL: This schema supports all features: CRUD, tracking, goals, metrics

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// User model - foundation for multi-tenant system (future auth)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  habits    Habit[]
  goals     HabitGoal[]
  tracking  HabitTracking[]

  @@index([email])
}

// Habit - core domain entity
model Habit {
  id          String   @id @default(cuid())
  userId      String
  name        String   @db.VarChar(255)
  description String?
  frequency   Frequency @default(DAILY)  // DAILY, WEEKLY, MONTHLY
  category    String?   // e.g., "health", "productivity", "learning"
  isActive    Boolean   @default(true)
  color       String?   @default("#3B82F6")  // For UI - future feature

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tracking    HabitTracking[]
  goals       HabitGoal[]

  @@unique([userId, name])
  @@index([userId])
  @@index([userId, isActive])
}

// Frequency enum - referenced in Habit
enum Frequency {
  DAILY
  WEEKLY
  MONTHLY
}

// HabitTracking - records when user completes a habit
model HabitTracking {
  id          String   @id @default(cuid())
  habitId     String
  userId      String

  completedAt DateTime // When the habit was marked complete
  notes       String?  // Optional notes from user
  streak      Int      @default(1)  // Current streak at this record

  createdAt   DateTime @default(now())

  habit       Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([habitId, completedAt])  // Can't log same habit twice in a day
  @@index([habitId, completedAt])
  @@index([userId, completedAt])
}

// HabitGoal - consistency targets
model HabitGoal {
  id          String   @id @default(cuid())
  habitId     String
  userId      String

  targetFrequency Int    // e.g., 5 times per week, 20 times per month
  goalType    GoalType @default(WEEKLY)  // WEEKLY, MONTHLY, YEARLY

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  habit       Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([habitId, goalType])
  @@index([userId])
}

// Goal type enum
enum GoalType {
  WEEKLY
  MONTHLY
  YEARLY
}
```

#### 2.2 Prisma Migration Commands

```bash
# Initialize Prisma in project
npx prisma init

# Create initial migration
npx prisma migrate dev --name init

# Seed database with sample data (optional)
npx prisma db seed

# Validate schema
npx prisma validate
```

### Phase 3: TypeBox Schemas (MIRROR example/habbit.route.ts)

```typescript
// src/schemas/common.schema.ts
export const IdSchema = Type.String({ format: "uuid" });
export const TimestampSchema = Type.String({ format: "date-time" });

// src/schemas/habit.schema.ts - PATTERN: Like example/habbit.route.ts
export const FrequencyEnum = Type.Union([
  Type.Literal("daily"),
  Type.Literal("weekly"),
  Type.Literal("monthly"),
]);

export const HabitSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  userId: Type.String({ format: "uuid" }),
  name: Type.String({ minLength: 1, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  frequency: FrequencyEnum,
  category: Type.Optional(Type.String()),
  isActive: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export type Habit = Static<typeof HabitSchema>;

// Create DTO - omit server-managed fields
export const CreateHabitSchema = Type.Omit(HabitSchema, [
  "id",
  "userId",
  "createdAt",
  "updatedAt",
  "isActive",
]);
export type CreateHabitDto = Static<typeof CreateHabitSchema>;

// Update DTO - all fields optional
export const UpdateHabitSchema = Type.Partial(CreateHabitSchema);
export type UpdateHabitDto = Static<typeof UpdateHabitSchema>;

// Params
export const HabitParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});
```

### Phase 4: Route Implementation (MIRROR example/habbit.route.ts)

```typescript
// src/routes/habits.ts - PATTERN: Identical to example/habbit.route.ts structure

import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { Static } from "@sinclair/typebox";
import {
  HabitSchema,
  CreateHabitSchema,
  UpdateHabitSchema,
  HabitParamsSchema,
  type CreateHabitDto,
  type UpdateHabitDto,
} from "../schemas/habit.schema";
import { HabitService } from "../services/habit.service";

const habitRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const habitService = new HabitService(fastify.prisma);
  const HABIT_TAG = "Habits";

  // POST /habits - Create
  fastify.post<{ Body: CreateHabitDto; Reply: Static<typeof HabitSchema> }>(
    "/",
    {
      schema: {
        tags: [HABIT_TAG],
        summary: "Create a new habit",
        body: CreateHabitSchema,
        response: { 201: HabitSchema },
      },
    },
    async (request, reply) => {
      // TODO: Extract userId from JWT (future auth)
      const userId = "cmjpxvspj0000wavckybybye3";
      const habit = await habitService.create(userId, request.body);
      return reply.code(201).send(habit);
    }
  );

  // GET /habits - List all
  fastify.get<{ Reply: Static<typeof HabitSchema>[] }>(
    "/",
    { schema: { tags: [HABIT_TAG], summary: "Get all habits" } },
    async (request, reply) => {
      const userId = "cmjpxvspj0000wavckybybye3"; // TODO: From JWT
      const habits = await habitService.findAll(userId);
      return reply.send(habits);
    }
  );

  // GET /habits/:id - Get one
  fastify.get<{ Params: Static<typeof HabitParamsSchema> }>(
    "/:id",
    {
      schema: {
        tags: [HABIT_TAG],
        summary: "Get habit by ID",
        params: HabitParamsSchema,
      },
    },
    async (request, reply) => {
      const habit = await habitService.findById(request.params.id);
      if (!habit) return reply.code(404).send({ message: "Not found" });
      return reply.send(habit);
    }
  );

  // PUT /habits/:id - Update
  fastify.put<{
    Params: Static<typeof HabitParamsSchema>;
    Body: UpdateHabitDto;
  }>(
    "/:id",
    {
      schema: {
        tags: [HABIT_TAG],
        summary: "Update a habit",
        params: HabitParamsSchema,
        body: UpdateHabitSchema,
      },
    },
    async (request, reply) => {
      const habit = await habitService.update(request.params.id, request.body);
      return reply.send(habit);
    }
  );

  // DELETE /habits/:id - Delete
  fastify.delete<{ Params: Static<typeof HabitParamsSchema> }>(
    "/:id",
    {
      schema: {
        tags: [HABIT_TAG],
        summary: "Delete a habit",
        params: HabitParamsSchema,
      },
    },
    async (request, reply) => {
      await habitService.delete(request.params.id);
      return reply.code(204).send();
    }
  );
};

export default habitRoutes;
```

### Phase 5: Service Layer (Business Logic)

```typescript
// src/services/habit.service.ts
import { PrismaClient } from "@prisma/client";
import { CreateHabitDto, UpdateHabitDto } from "../schemas/habit.schema";

export class HabitService {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, data: CreateHabitDto) {
    return await this.prisma.habit.create({
      data: {
        ...data,
        userId,
        frequency: data.frequency.toUpperCase() as any,
      },
    });
  }

  async findAll(userId: string) {
    return await this.prisma.habit.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return await this.prisma.habit.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateHabitDto) {
    return await this.prisma.habit.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await this.prisma.habit.delete({ where: { id } });
  }
}
```

---

## Implementation Tasks (In Order)

### Task 1: PROJECT SETUP AND CONFIGURATION

```yaml
CREATE package.json:
  - Add all dependencies from "Core Dependencies" section above
  - Scripts: "dev", "build", "start", "lint", "test", "db:migrate"
  - Include proper version pinning

CREATE tsconfig.json:
  - target: ES2020
  - module: commonjs
  - strict: true
  - esModuleInterop: true
  - skipLibCheck: true
  - Include src/ and tests/

CREATE jest.config.js:
  - preset: ts-jest
  - testEnvironment: node
  - testMatch: tests/**/*.test.ts
  - collectCoverageFrom: src/**

CREATE .gitignore:
  - node_modules/
  - dist/
  - .env
  - .env.local
  - prisma/.env
  - coverage/

CREATE src/config/env.ts:
  - Load and validate environment variables
  - Export typed config object
  - Throw error if required vars missing

CREATE .env.example (CRITICAL - from INITIAL.md requirement):
  - DATABASE_URL=postgresql://user:pass@host:port/dbname
  - NODE_ENV=development
  - PORT=3000
  - GMAIL_API_KEY=
  - BRAVE_API_KEY=
  - Add comments explaining each variable
```

**Validation:**

```bash
npm install                           # No errors
npm run build                         # TypeScript compiles
npx tsc --noEmit                      # Type checking passes
```

### Task 2: DATABASE SCHEMA AND MIGRATIONS

```yaml
CREATE prisma/.gitignore:
  - .env

CREATE prisma/schema.prisma:
  - Copy schema from "Phase 2: Database Schema" section above
  - Include all models: User, Habit, HabitTracking, HabitGoal
  - Include enums: Frequency, GoalType
  - Add proper indexes for performance

RUN prisma init commands:
  - npx prisma migrate dev --name init
  - Generates migrations/ folder with SQL

CREATE prisma/seed.ts (optional but recommended):
  - Seed sample habits for testing
  - 3-4 test users with habits
```

**Validation:**

```bash
npx prisma validate              # Schema is valid
npx prisma migrate deploy        # Migrations can run
```

### Task 3: FASTIFY SETUP AND PLUGINS

```yaml
CREATE src/main.ts:
  - Initialize Fastify with TypeBoxTypeProvider
  - Register prisma plugin using fastify.decorate
  - Register all route plugins
  - Start server on env.PORT
  - Error handling middleware

CREATE src/config/fastify.ts:
  - Fastify instance creation
  - Plugin registration logic
  - Global error handler
  - Request/response logging

CREATE src/db/prisma.ts:
  - Singleton PrismaClient instance (CRITICAL for connection pooling)
  - Global declaration for hot reload safety
```

**Validation:**

```bash
npm run dev                      # Server starts without errors
curl http://localhost:3000/     # Server responds
```

### Task 4: SCHEMAS AND TYPES

```yaml
CREATE src/schemas/common.schema.ts:
  - IdSchema
  - TimestampSchema
  - ErrorSchema

CREATE src/schemas/habit.schema.ts:
  - HabitSchema, CreateHabitSchema, UpdateHabitSchema
  - HabitParamsSchema
  - Export TypeScript types using Static<>

CREATE src/schemas/tracking.schema.ts:
  - HabitTrackingSchema, CreateTrackingSchema
  - Query params for filtering by date

CREATE src/schemas/goal.schema.ts:
  - HabitGoalSchema, CreateGoalSchema
```

**Validation:**

```bash
npx tsc --noEmit                 # All schemas compile
```

### Task 5: SERVICE LAYER

```yaml
CREATE src/services/habit.service.ts:
  - Methods: create, findAll, findById, update, delete
  - Methods: findByUserId
  - Proper error handling and validation

CREATE src/services/tracking.service.ts:
  - Methods: logCompletion, getHistory, getStreak
  - Date filtering and aggregation

CREATE src/services/goal.service.ts:
  - Methods: create, update, getProgress
  - Calculate completion percentage
```

**Validation:**

```bash
npm test -- src/services         # Service unit tests pass
```

### Task 6: ROUTES

```yaml
CREATE src/routes/habits.ts:
  - POST /   (create habit)
  - GET /    (list habits)
  - GET /:id (get one)
  - PUT /:id (update)
  - DELETE /:id (delete)
  - MIRROR: examples/habbit.route.ts pattern exactly

CREATE src/routes/tracking.ts:
  - POST /habits/:habitId/track (log completion)
  - GET /habits/:habitId/history (get tracking history)
  - GET /habits/:habitId/streak (get current streak)

CREATE src/routes/goals.ts:
  - POST /habits/:habitId/goals (create goal)
  - GET /habits/:habitId/goals (get goal)
  - PUT /habits/:habitId/goals/:goalId (update goal)
```

**Validation:**

```bash
npm run dev                      # Routes load without errors
npx tsc --noEmit                # No type errors
```

### Task 7: INTEGRATION AND TESTING

```yaml
CREATE tests/integration/habits.test.ts:
  - Test POST /habits creates habit
  - Test GET / returns habits
  - Test GET /:id returns correct habit
  - Test PUT /:id updates habit
  - Test DELETE /:id removes habit
  - Test 404 on non-existent habit

CREATE tests/integration/tracking.test.ts:
  - Test logging completion
  - Test streak calculation
  - Test history retrieval

CREATE tests/unit/services/:
  - Unit tests for each service method
  - Mock Prisma client
```

**Validation:**

```bash
npm test                         # All tests pass
npm run lint                     # No lint errors
npm run build                    # Production build succeeds
```

### Task 8: DOCUMENTATION (CRITICAL - from INITIAL.md requirement)

```yaml
CREATE README.md:
  - Project overview
  - Setup instructions:
    * Prerequisites (Node.js 18+, npm/yarn)
    * Install dependencies
    * Configure Supabase connection (detailed steps)
    * Run migrations
    * Start development server
  - API endpoints documentation:
    * List all routes with examples
    * Request/response formats
  - Project structure (tree view)
  - Environment variables explanation
  - Testing instructions
  - Future features (reminders, AI, etc.)

UPDATE .env.example:
  - Add comments for each variable
  - Show example values
  - Explain Gmail and Brave setup (from INITIAL.md)
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST
npx tsc --noEmit                 # TypeScript type checking
npm run lint                     # ESLint
npm run lint -- --fix            # Auto-fix what's possible

# Expected: No errors, warnings only if acceptable
```

### Level 2: Unit Tests

```bash
# Test individual services and utilities
npm test -- --testPathPattern=services
npm test -- --testPathPattern=utils

# Expected: All pass, >80% coverage
```

### Level 3: Integration Tests

```bash
# Start dev server in background, then test
npm run dev &
npm test -- --testPathPattern=integration

# Expected: All pass
```

### Level 4: Manual API Test

```bash
# Start server
npm run dev

# Test create habit
curl -X POST http://localhost:3000/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Exercise",
    "description": "30 min workout",
    "frequency": "daily",
    "category": "health"
  }'

# Expected response:
# {
#   "id": "uuid",
#   "name": "Morning Exercise",
#   ...
# }

# Test list habits
curl http://localhost:3000/habits

# Test get one
curl http://localhost:3000/habits/{id}

# Test update
curl -X PUT http://localhost:3000/habits/{id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Test delete
curl -X DELETE http://localhost:3000/habits/{id}
```

---

## Final Validation Checklist

- [ ] **Project Setup**: `package.json`, `tsconfig.json`, `jest.config.js` created
- [ ] **Database**: Prisma schema valid, migrations created
- [ ] **TypeScript**: `npx tsc --noEmit` passes with zero errors
- [ ] **Linting**: `npm run lint` passes with zero errors
- [ ] **Unit Tests**: `npm test` passes, services tested
- [ ] **Integration Tests**: All API endpoints tested
- [ ] **Manual Testing**: All CRUD operations work via curl
- [ ] **Type Safety**: No `any` types in src/ (except necessary escapes)
- [ ] **Error Handling**: 400/404/500 errors handled properly
- [ ] **Logging**: All major operations logged
- [ ] **Documentation**: README complete with setup and API docs
- [ ] **Environment**: `.env.example` has all required variables documented
- [ ] **Performance**: Prisma connection pooling configured correctly
- [ ] **Code Review**: No security vulnerabilities (SQL injection, XSS prevention)

---

## Anti-Patterns to AVOID

- ❌ Creating multiple PrismaClient instances (use singleton from db/prisma.ts)
- ❌ Omitting TypeBoxTypeProvider registration in Fastify
- ❌ Using sync functions in async routes
- ❌ Hardcoding config values - use .env and env.ts
- ❌ Not validating environment variables at startup
- ❌ Catching all exceptions with `catch (e)` - be specific
- ❌ Missing error handling in try/catch blocks
- ❌ Not using indexes in Prisma schema for frequent queries
- ❌ Mixing business logic with route handlers - use services
- ❌ Forgetting to handle Prisma connection shutdown in tests
- ❌ Not following the example/habbit.route.ts pattern for new routes
- ❌ Using `any` type without justification

---

## References & Resources

### Official Documentation

- Fastify TypeScript Guide: https://fastify.dev/docs/latest/Reference/TypeScript/
- Prisma ORM: https://www.prisma.io/docs/orm/prisma-schema/overview
- Prisma + Fastify: https://www.prisma.io/fastify
- TypeBox: https://github.com/sinclairzx81/typebox
- Fastify TypeBox Type Provider: https://github.com/fastify/fastify-type-provider-typebox

### Real Examples in This Repo

- Route Pattern: `/Users/zlatan/playground/habbit-tracker-api/examples/habbit.route.ts`
- PRP Template: `/Users/zlatan/playground/habbit-tracker-api/PRPs/templates/prp_base.md`

### Related Articles

- Fastify + Prisma + PostgreSQL: https://medium.com/@christianinyekaka/building-a-restful-api-with-typescript-fastify-typeorm-and-postgresql-dd6309c0d05a
- Fastify Database Patterns: https://fastify.dev/docs/latest/Guides/Database/

---

## Summary

This PRP provides everything needed to implement a complete Habit Tracker API foundation:

1. **Clear goals**: Type-safe CRUD operations with tracking and metrics
2. **Complete context**: All necessary documentation URLs and code examples
3. **Existing patterns**: Mirrors provided example/habbit.route.ts exactly
4. **Gotchas documented**: All common pitfalls with solutions provided
5. **Executable validation**: Lint, tests, and manual curl commands provided
6. **Step-by-step tasks**: 8 implementation tasks with clear deliverables

**Confidence Score: 9/10** - The combination of:

- Complete schema design with all required entities
- Detailed TypeBox schema examples from real codebase
- Explicit service layer pattern
- Comprehensive gotchas documented
- Multiple validation gates
- Clear connection to example code

This should enable single-pass implementation with iterative refinement through provided validation loops.

---

## Future Enhancements (Beyond This PRP)

These features are documented but deferred to future PRPs:

1. **Authentication**: JWT-based user authentication
2. **Habit Reminders**: Scheduled notifications via Gmail API
3. **AI Habit Management**: Integration with LLM for suggestions
4. **Brave Search Integration**: External API integration pattern
5. **Metrics Dashboard**: Advanced analytics and visualizations
6. **WebSocket Support**: Real-time progress updates
7. **Caching Layer**: Redis for performance optimization

Each future PRP should follow this same template and reference this foundation implementation.
