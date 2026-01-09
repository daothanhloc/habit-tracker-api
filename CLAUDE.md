# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Technical Stack

- **Runtime**: Node.js with ES Modules (`"type": "module"`)
- **Framework**: Fastify 5 with TypeBox type provider
- **Language**: TypeScript (strict mode disabled)
- **Database**: PostgreSQL via Prisma ORM (hosted on Supabase)
- **Authentication**: JWT with access/refresh token pattern via @fastify/jwt

## Common Commands

```bash
# Development
npm run dev              # Start with hot reload (tsx watch)

# Build & Production
npm run build            # Compile TypeScript
npm start                # Run compiled JS

# Testing
npm test                 # Run all tests
npm test -- --testPathPattern="habit"  # Run single test file
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix lint issues

# Database
npm run db:migrate       # Create/apply migrations (dev)
npm run db:deploy        # Deploy migrations (prod)
npm run db:seed          # Seed test data
npm run db:studio        # Visual database browser
```

## Architecture

### Layered Structure
```
src/
├── main.ts              # Entry point - registers routes with prefixes
├── config/
│   ├── env.ts           # Environment validation
│   └── fastify.ts       # App setup, plugins, error handling
├── plugins/
│   └── authenticate.ts  # JWT auth decorator
├── routes/              # HTTP handlers (thin layer)
├── services/            # Business logic (testable)
├── schemas/             # TypeBox validation schemas
├── db/
│   └── prisma.ts        # PrismaClient singleton
└── types/
    └── fastify.d.ts     # Type augmentations
```

### Request Flow Pattern
Routes → Services → Prisma

- **Routes** handle HTTP concerns (status codes, auth guards), instantiate services with `fastify.prisma`
- **Services** are classes accepting `PrismaClient` via constructor - pure business logic
- **Schemas** use TypeBox for runtime validation AND TypeScript types (`Static<typeof Schema>`)

### Key Conventions

**Route Definition Pattern:**
```typescript
fastify.post<{ Body: CreateHabitDto; Reply: Static<typeof HabitSchema> }>(
  "/",
  {
    onRequest: [fastify.authenticate],  // JWT guard
    schema: { body: CreateHabitSchema, response: { 201: HabitSchema } }
  },
  async (request, reply) => { ... }
);
```

**Service Pattern:**
```typescript
export class HabitService {
  constructor(private prisma: PrismaClient) {}
  // Methods return domain objects, not HTTP responses
}
```

**Schema Pattern** (TypeBox):
- Input schemas use lowercase enums: `'daily' | 'weekly' | 'monthly'`
- Output schemas use Prisma enums: `'DAILY' | 'WEEKLY' | 'MONTHLY'`
- Services handle the mapping

### Authentication
- Access tokens: 15 min expiry, verified via `fastify.authenticate` decorator
- Refresh tokens: 7 days, separate JWT namespace (`refreshSign`/`refreshVerify`)
- User ID available as `request.user.userId` in protected routes

### Prisma Error Codes
- `P2002`: Unique constraint violation (409 or 400)
- `P2025`: Record not found (404)

## API Route Structure

All routes require JWT auth (except `/auth/*` and `/health`):
- `POST/GET /auth/*` - Registration, login, token refresh, logout
- `POST/GET/PUT/DELETE /habits` - Habit CRUD
- `POST/GET /habits/:habitId/track` - Tracking records
- `POST/GET/PUT/DELETE /habits/:habitId/goals` - Goals
- `GET /health` - Health check (includes DB ping)
