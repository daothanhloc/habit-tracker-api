name: "JWT Authentication System - Login, Logout, Signup, Refresh"
description: |

## Purpose
Implement a complete JWT-based authentication system for the Habit Tracker API with secure login, signup, logout, and token refresh capabilities.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Build a secure JWT-based authentication system that allows users to:
- Sign up with email and password
- Log in with credentials to receive access and refresh tokens
- Refresh expired access tokens using refresh tokens
- Log out with token revocation
- Protect existing habit routes with authentication

## Why
- **User Data Protection**: Each user should only access their own habits and data
- **Security Compliance**: Implement industry-standard authentication patterns
- **Token Management**: Secure token lifecycle with refresh token rotation
- **Foundation for Multi-Tenancy**: Enable proper user isolation in the database

## What
Implement JWT authentication with the following features:
- Access tokens that expire in 15 minutes
- Refresh tokens that expire in 7 days
- Password hashing using bcryptjs
- Token storage in database for revocation capability
- Auth routes: `/auth/signup`, `/auth/login`, `/auth/refresh`, `/auth/logout`
- Authentication middleware for protecting routes
- Update existing User model to support authentication

### Success Criteria
- [ ] User can sign up with email and password
- [ ] User can log in and receive access + refresh tokens
- [ ] User can refresh access token using refresh token
- [ ] User can log out and tokens are revoked
- [ ] Protected routes require valid JWT
- [ ] Passwords are securely hashed
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No linting errors

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window

- url: https://github.com/fastify/fastify-jwt
  why: Official @fastify/jwt plugin documentation - core JWT implementation patterns
  critical: Use request.jwtVerify() for token validation, configure with secret and expiration

- url: https://www.npmjs.com/package/@fastify/jwt
  why: NPM documentation with configuration options
  critical: Sign tokens with fastify.jwt.sign(), verify with request.jwtVerify()

- url: https://www.npmjs.com/package/bcryptjs
  why: Password hashing library documentation
  critical: Use bcrypt.hash() with salt rounds of 10-12, bcrypt.compare() for validation

- url: https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/
  why: Refresh token best practices and security patterns
  critical: Store refresh tokens in DB, implement token rotation, short-lived access tokens

- url: https://auth0.com/docs/secure/tokens/token-best-practices
  why: Token security best practices
  critical: Never store sensitive data in JWT payload, implement token expiration and revocation

- url: https://blog.logrocket.com/password-hashing-node-js-bcrypt/
  why: Password hashing best practices in Node.js
  critical: Use 10-12 salt rounds, never store plain text passwords

- file: src/routes/habits.ts
  why: Pattern to follow for route structure and error handling
  critical: Use FastifyPluginAsync, instantiate services, handle Prisma errors (P2002, P2025)

- file: src/services/habit.service.ts
  why: Pattern for service layer with Prisma
  critical: Services take PrismaClient in constructor, handle business logic

- file: src/schemas/habit.schema.ts
  why: Pattern for TypeBox schema definitions
  critical: Use Type.Object(), Type.String(), Static type extraction

- file: src/config/fastify.ts
  why: Fastify app configuration and plugin registration pattern
  critical: Register plugins with await, use decorators for shared instances

- file: src/config/env.ts
  why: Environment variable loading pattern
  critical: Add JWT_SECRET and JWT_REFRESH_SECRET to env interface

- file: prisma/schema.prisma
  why: Current database schema and User model
  critical: User model exists but needs password field and RefreshToken model

- file: examples/habbit.route.ts
  why: Example route pattern with TypeBox schemas
  critical: Follow schema definition patterns for request/response validation
```

### Current Codebase Tree
```bash
/Users/zlatan/playground/habbit-tracker-api
├── CLAUDE.md
├── src
│   ├── config
│   │   ├── env.ts              # Environment variables
│   │   └── fastify.ts          # Fastify app setup
│   ├── db
│   │   └── prisma.ts           # Prisma client singleton
│   ├── main.ts                 # App entry point
│   ├── routes
│   │   ├── goals.ts            # Goal routes
│   │   ├── habits.ts           # Habit routes (REFERENCE THIS)
│   │   └── tracking.ts         # Tracking routes
│   ├── schemas
│   │   ├── common.schema.ts    # Common schemas
│   │   ├── goal.schema.ts      # Goal schemas
│   │   ├── habit.schema.ts     # Habit schemas (REFERENCE THIS)
│   │   └── tracking.schema.ts  # Tracking schemas
│   ├── services
│   │   ├── goal.service.ts     # Goal service
│   │   ├── habit.service.ts    # Habit service (REFERENCE THIS)
│   │   └── tracking.service.ts # Tracking service
│   └── utils                   # Utilities (currently empty)
├── prisma
│   ├── schema.prisma           # Database schema
│   └── migrations/             # DB migrations
└── package.json                # Dependencies
```

### Desired Codebase Tree (Files to be added)
```bash
src/
├── routes
│   └── auth.ts                 # Auth routes (signup, login, refresh, logout)
├── services
│   └── auth.service.ts         # Auth service (password hashing, token generation)
├── schemas
│   └── auth.schema.ts          # Auth DTOs (signup, login, refresh schemas)
├── plugins
│   └── authenticate.ts         # JWT authentication plugin/decorator
├── config
│   └── env.ts                  # UPDATE: Add JWT_SECRET, JWT_REFRESH_SECRET
└── types
    └── fastify.d.ts            # UPDATE: Extend Fastify types for user property

prisma/
└── schema.prisma               # UPDATE: Add password field to User, create RefreshToken model
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: @fastify/jwt configuration
// - Must register plugin BEFORE routes that use authentication
// - Use fastify.jwt.sign() to create tokens, NOT jwt.sign()
// - request.jwtVerify() throws error if token invalid - use try/catch
// - Tokens are signed synchronously but can be async if using functions

// CRITICAL: bcryptjs
// - bcrypt.hash() returns a Promise - must await
// - bcrypt.compare() returns Promise<boolean> - must await
// - Salt rounds of 10-12 recommended (12 = ~250ms, 10 = ~65ms)
// - Maximum password length is 72 bytes

// CRITICAL: Prisma
// - Error code P2002 = Unique constraint violation
// - Error code P2025 = Record not found
// - Must use `await prisma.$disconnect()` in lifecycle hooks (already done)

// CRITICAL: TypeBox
// - Use Static<typeof Schema> to extract TypeScript type
// - Type.Optional() for optional fields
// - Type.String({ format: 'email' }) for email validation
// - Type.String({ format: 'uuid' }) for UUID validation

// CRITICAL: Fastify
// - Plugins are async - use await fastify.register()
// - Use fastify.decorate() to add properties to instance
// - onRequest hook runs before route handler - use for authentication
// - Error handler already configured in src/config/fastify.ts

// CRITICAL: JWT Payload
// - NEVER store password or sensitive data in JWT
// - Keep payload small (userId, email is enough)
// - Access token: 15 minutes expiration
// - Refresh token: 7 days expiration

// CRITICAL: Security
// - Hash passwords before storing (bcryptjs)
// - Validate email format in schema
// - Store refresh tokens in database for revocation
// - Implement token rotation on refresh
// - Delete refresh tokens on logout
```

## Implementation Blueprint

### Data Models and Database Schema

Update Prisma schema to support authentication:

```prisma
// prisma/schema.prisma

// UPDATE User model - add password field
model User {
  id       String   @id @default(uuid())
  email    String   @unique
  name     String?
  password String   // ADD THIS - hashed password

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  habits        Habit[]
  goals         HabitGoal[]
  tracking      HabitTracking[]
  refreshTokens RefreshToken[] // ADD THIS

  @@index([email])
}

// CREATE RefreshToken model - for token revocation
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}
```

### Task List (In Order of Implementation)

```yaml
Task 1: Update Environment Configuration
  MODIFY src/config/env.ts:
    - ADD JWT_SECRET and JWT_REFRESH_SECRET to Env interface
    - ADD validation for these environment variables in loadEnv()
    - PATTERN: Follow existing env variable pattern (see DATABASE_URL)

Task 2: Update Prisma Schema and Run Migration
  MODIFY prisma/schema.prisma:
    - ADD password field to User model (String type)
    - CREATE RefreshToken model with fields: id, token, userId, expiresAt, createdAt
    - ADD relation from User to RefreshToken
    - ADD indexes as shown above
  RUN: npm run db:migrate
    - Name migration: "add_auth_support"

Task 3: Create Auth Schemas (TypeBox)
  CREATE src/schemas/auth.schema.ts:
    - PATTERN: Mirror src/schemas/habit.schema.ts structure
    - CREATE SignupSchema: email, password, name (optional)
    - CREATE LoginSchema: email, password
    - CREATE RefreshTokenSchema: refreshToken
    - CREATE AuthResponseSchema: accessToken, refreshToken, user
    - ADD password validation: minLength 8, maxLength 72
    - ADD email format validation: Type.String({ format: 'email' })

Task 4: Create Auth Service
  CREATE src/services/auth.service.ts:
    - PATTERN: Mirror src/services/habit.service.ts structure
    - INJECT PrismaClient in constructor
    - IMPLEMENT signup(email, password, name?)
      - Hash password with bcryptjs (10 rounds)
      - Check if user exists (throw error if exists)
      - Create user in database
    - IMPLEMENT validateCredentials(email, password)
      - Find user by email
      - Compare password with bcrypt.compare()
      - Return user or null
    - IMPLEMENT storeRefreshToken(userId, token, expiresAt)
      - Create refresh token in database
    - IMPLEMENT validateRefreshToken(token)
      - Find refresh token in database
      - Check if expired
      - Return userId or null
    - IMPLEMENT revokeRefreshToken(token)
      - Delete refresh token from database
    - IMPLEMENT revokeAllUserTokens(userId)
      - Delete all user's refresh tokens

Task 5: Register @fastify/jwt Plugin
  MODIFY src/config/fastify.ts:
    - IMPORT @fastify/jwt
    - REGISTER fastify-jwt plugin AFTER cors, BEFORE routes
    - CONFIGURE with:
      - secret: env.JWT_SECRET
      - sign options: { expiresIn: '15m' }
    - CREATE second JWT instance for refresh tokens:
      - Use namespace: 'refresh'
      - secret: env.JWT_REFRESH_SECRET
      - sign options: { expiresIn: '7d' }

Task 6: Create Authentication Plugin
  CREATE src/plugins/authenticate.ts:
    - PATTERN: Create Fastify plugin using FastifyPluginAsync
    - EXPORT authenticate decorator function
    - IMPLEMENT: Call request.jwtVerify() in try/catch
    - IF token invalid: reply.code(401).send({ message: 'Unauthorized' })
    - IF token valid: Extract user info, attach to request.user
    - CRITICAL: This will be used as onRequest hook in protected routes

Task 7: Extend Fastify TypeScript Types
  CREATE src/types/fastify.d.ts:
    - DECLARE module 'fastify'
    - EXTEND FastifyRequest interface
    - ADD user property: { userId: string; email: string }
    - This enables TypeScript autocomplete for request.user

Task 8: Create Auth Routes
  CREATE src/routes/auth.ts:
    - PATTERN: Mirror src/routes/habits.ts structure
    - INSTANTIATE AuthService with fastify.prisma

    POST /auth/signup:
      - VALIDATE request.body with SignupSchema
      - CALL authService.signup()
      - SIGN access token: fastify.jwt.sign({ userId, email })
      - SIGN refresh token: fastify.jwt.refresh.sign({ userId })
      - STORE refresh token in database
      - RETURN { accessToken, refreshToken, user }
      - HANDLE P2002 error: "User already exists"

    POST /auth/login:
      - VALIDATE request.body with LoginSchema
      - CALL authService.validateCredentials()
      - IF invalid: reply.code(401).send({ message: 'Invalid credentials' })
      - SIGN access token and refresh token
      - STORE refresh token in database
      - RETURN { accessToken, refreshToken, user }

    POST /auth/refresh:
      - VALIDATE request.body with RefreshTokenSchema
      - VERIFY refresh token: fastify.jwt.refresh.verify()
      - CHECK if token exists in database (not revoked)
      - IF invalid/revoked: reply.code(401).send({ message: 'Invalid refresh token' })
      - REVOKE old refresh token (rotation)
      - SIGN new access token and new refresh token
      - STORE new refresh token in database
      - RETURN { accessToken, refreshToken }

    POST /auth/logout:
      - REQUIRE authentication (use authenticate decorator)
      - EXTRACT refresh token from request body
      - REVOKE refresh token from database
      - RETURN 204 No Content

Task 9: Register Auth Routes in Main
  MODIFY src/main.ts:
    - IMPORT authRoutes from './routes/auth'
    - REGISTER authRoutes with prefix '/auth'
    - POSITION: Register AFTER fastify app creation, with other routes

Task 10: Protect Existing Routes with Authentication
  MODIFY src/routes/habits.ts:
    - IMPORT authenticate from '../plugins/authenticate'
    - ADD onRequest: [authenticate] to ALL routes
    - REPLACE hardcoded userId with request.user.userId
    - REMOVE TODO comments about JWT extraction

  MODIFY src/routes/tracking.ts:
    - Same pattern as habits.ts

  MODIFY src/routes/goals.ts:
    - Same pattern as habits.ts

Task 11: Add JWT Secrets to .env
  CREATE/UPDATE .env file:
    - ADD JWT_SECRET=your-secret-key-here
    - ADD JWT_REFRESH_SECRET=your-refresh-secret-key-here
    - NOTE: In production, use strong random secrets

Task 12: Install Required Dependencies
  RUN: npm install @fastify/jwt bcryptjs
  RUN: npm install --save-dev @types/bcryptjs
```

### Pseudocode for Key Components

```typescript
// Task 4: Auth Service - signup method
async signup(email: string, password: string, name?: string) {
  // PATTERN: Validate input first (will be done by schema)

  // Check if user exists
  const existing = await this.prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('User already exists') // Controller will catch P2002

  // GOTCHA: bcryptjs hash is async and takes 10 rounds = ~65ms
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const user = await this.prisma.user.create({
    data: { email, password: hashedPassword, name }
  })

  // CRITICAL: Never return password in response
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

// Task 5: Fastify JWT Plugin Registration
await fastify.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: '15m' // 15 minutes for access token
  }
})

// Register refresh token JWT with namespace
await fastify.register(fastifyJwt, {
  secret: env.JWT_REFRESH_SECRET,
  namespace: 'refresh', // Access via fastify.jwt.refresh
  jwtSign: 'refreshSign',
  jwtVerify: 'refreshVerify',
  sign: {
    expiresIn: '7d' // 7 days for refresh token
  }
})

// Task 6: Authentication Plugin
export const authenticate: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async function(request, reply) {
    try {
      // CRITICAL: jwtVerify() throws if token invalid
      await request.jwtVerify()
      // Token payload is now in request.user
    } catch (err) {
      reply.code(401).send({ message: 'Unauthorized' })
    }
  })
}

// Task 8: Auth Routes - login handler
async (request, reply) => {
  const { email, password } = request.body

  const user = await authService.validateCredentials(email, password)
  if (!user) {
    return reply.code(401).send({ message: 'Invalid credentials' })
  }

  // PATTERN: Sign tokens with user payload (keep it small)
  const accessToken = fastify.jwt.sign({
    userId: user.id,
    email: user.email
  })

  const refreshToken = fastify.jwt.sign(
    { userId: user.id },
    { expiresIn: '7d' }
  )

  // CRITICAL: Store refresh token for revocation capability
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  await authService.storeRefreshToken(user.id, refreshToken, expiresAt)

  return reply.send({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name }
  })
}

// Task 10: Protecting routes
fastify.post<{ Body: CreateHabitDto }>(
  '/',
  {
    onRequest: [fastify.authenticate], // ADD THIS - will call authenticate decorator
    schema: { /* ... */ }
  },
  async (request, reply) => {
    // REPLACE hardcoded userId with:
    const userId = request.user.userId

    const habit = await habitService.create(userId, request.body)
    return reply.code(201).send(habit)
  }
)
```

### Integration Points

```yaml
DATABASE:
  - migration: "Add password field to User table"
  - migration: "Create RefreshToken table with userId foreign key"
  - indexes: "Add indexes on RefreshToken(token), RefreshToken(userId), RefreshToken(expiresAt)"

CONFIG:
  - add to: src/config/env.ts
  - pattern: |
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
  - validation: |
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET required')

ROUTES:
  - add to: src/main.ts
  - pattern: "await fastify.register(authRoutes, { prefix: '/auth' })"
  - position: After habitRoutes, trackingRoutes, goalRoutes

PLUGINS:
  - add to: src/config/fastify.ts
  - pattern: "await fastify.register(fastifyJwt, { secret, sign: { expiresIn } })"
  - position: After CORS, before routes registration

DEPENDENCIES:
  - npm install: "@fastify/jwt bcryptjs"
  - npm install --save-dev: "@types/bcryptjs"
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm run lint:fix                    # Auto-fix ESLint issues
npx tsc --noEmit                    # Type checking without emitting files

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Database Migration
```bash
# Generate and apply migration
npm run db:migrate

# Verify migration was created
ls prisma/migrations/

# Expected: New migration folder with name containing "add_auth_support"
# If migration fails, check Prisma error and fix schema
```

### Level 3: Manual Testing with curl

```bash
# Start the dev server
npm run dev

# Test 1: Signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Expected:
# {
#   "accessToken": "eyJhbGc...",
#   "refreshToken": "eyJhbGc...",
#   "user": { "id": "...", "email": "test@example.com", "name": "Test User" }
# }

# Test 2: Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: Same response structure as signup

# Test 3: Access protected route (habits)
# Replace YOUR_ACCESS_TOKEN with token from login/signup
curl -X GET http://localhost:3000/habits \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Expected: Array of habits (may be empty)

# Test 4: Access without token (should fail)
curl -X GET http://localhost:3000/habits

# Expected: 401 Unauthorized

# Test 5: Refresh token
# Replace YOUR_REFRESH_TOKEN with refresh token from login/signup
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'

# Expected: New access token and refresh token

# Test 6: Logout
# Replace tokens with actual values
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'

# Expected: 204 No Content

# Test 7: Try to use revoked refresh token (should fail)
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REVOKED_REFRESH_TOKEN"
  }'

# Expected: 401 Unauthorized
```

### Level 4: Unit Tests (Optional but Recommended)

```typescript
// tests/unit/services/auth.service.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../../../src/services/auth.service';
import { PrismaClient } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    authService = new AuthService(prisma);
  });

  it('should hash password on signup', async () => {
    const user = await authService.signup('test@test.com', 'password123');
    expect(user.password).not.toBe('password123'); // Password should be hashed
  });

  it('should validate correct credentials', async () => {
    await authService.signup('test@test.com', 'password123');
    const user = await authService.validateCredentials('test@test.com', 'password123');
    expect(user).toBeTruthy();
    expect(user.email).toBe('test@test.com');
  });

  it('should reject invalid credentials', async () => {
    await authService.signup('test@test.com', 'password123');
    const user = await authService.validateCredentials('test@test.com', 'wrongpassword');
    expect(user).toBeNull();
  });
});
```

```bash
# Run tests
npm test

# Expected: All tests pass
# If failing: Read error, understand root cause, fix code, re-run
```

## Final Validation Checklist
- [ ] All linting passes: `npm run lint`
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Database migration successful: `npm run db:migrate`
- [ ] Signup endpoint works (curl test)
- [ ] Login endpoint works (curl test)
- [ ] Protected routes require authentication (curl test)
- [ ] Refresh token endpoint works (curl test)
- [ ] Logout revokes tokens (curl test)
- [ ] Passwords are hashed (check in database)
- [ ] JWT_SECRET and JWT_REFRESH_SECRET in .env
- [ ] All TODO comments about JWT removed from existing routes
- [ ] Error cases return appropriate status codes (401, 400, etc.)

---

## Anti-Patterns to Avoid
- ❌ Don't store passwords in plain text - always hash with bcryptjs
- ❌ Don't put sensitive data in JWT payload (passwords, secrets)
- ❌ Don't skip token revocation - implement logout properly
- ❌ Don't use the same secret for access and refresh tokens
- ❌ Don't forget to validate refresh tokens exist in database
- ❌ Don't hardcode JWT secrets - use environment variables
- ❌ Don't forget to remove hardcoded userId from existing routes
- ❌ Don't use short expiration for refresh tokens (7 days minimum)
- ❌ Don't forget to implement token rotation on refresh
- ❌ Don't ignore Prisma error codes - handle them explicitly

## Security Checklist
- [ ] Passwords hashed with bcryptjs (10+ rounds)
- [ ] Email validation in schema (Type.String({ format: 'email' }))
- [ ] Password length validation (min 8, max 72 characters)
- [ ] JWT secrets stored in environment variables
- [ ] Refresh tokens stored in database for revocation
- [ ] Token rotation implemented on refresh
- [ ] Access token expires in 15 minutes
- [ ] Refresh token expires in 7 days
- [ ] Protected routes use authentication middleware
- [ ] Error messages don't leak sensitive information

---

## PRP Quality Score: 9/10

**Confidence Level for One-Pass Implementation**: 9/10

**Reasoning**:
- ✅ All necessary context provided (codebase patterns, external docs, gotchas)
- ✅ Step-by-step tasks with clear order of execution
- ✅ Validation gates at multiple levels (syntax, migration, manual testing)
- ✅ Security best practices explicitly documented
- ✅ Error handling patterns from existing codebase referenced
- ⚠️ Minor risk: First time implementing auth in this codebase (no existing auth patterns to reference)

**What could improve the score**:
- Having an existing auth route to reference would make it 10/10
- More comprehensive unit tests for all auth flows

## External Resources Referenced

**Fastify JWT**:
- [GitHub - fastify/fastify-jwt](https://github.com/fastify/fastify-jwt)
- [@fastify/jwt - npm](https://www.npmjs.com/package/@fastify/jwt)
- [Adding JWTs to a Fastify Server](https://kevincunningham.co.uk/posts/adding-jwts-to-a-fastify-server/)

**Password Hashing**:
- [bcryptjs - npm](https://www.npmjs.com/package/bcryptjs)
- [Password hashing in Node.js with bcrypt - LogRocket Blog](https://blog.logrocket.com/password-hashing-node-js-bcrypt/)

**JWT Best Practices**:
- [Refresh Tokens - Auth0](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
- [Token Best Practices - Auth0](https://auth0.com/docs/secure/tokens/token-best-practices)
