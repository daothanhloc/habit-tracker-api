name: "Swagger OpenAPI Integration - API Documentation UI"
description: |

## Purpose
Integrate Swagger/OpenAPI documentation with interactive UI to enable easy API testing directly in the browser.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Add Swagger/OpenAPI documentation with an interactive UI that:
- Auto-generates API documentation from existing TypeBox schemas
- Provides interactive testing interface at `/documentation`
- Includes JWT Bearer authentication for testing protected routes
- Organizes endpoints by tags (Auth, Habits, Tracking, Goals)

## Why
- **Developer Experience**: Test APIs directly in browser without curl/Postman
- **Documentation**: Auto-generated, always up-to-date API docs from code
- **Onboarding**: New developers can explore the API visually
- **No External Tools**: Self-contained documentation within the application

## What
Integrate `@fastify/swagger` and `@fastify/swagger-ui` plugins to:
- Generate OpenAPI 3.0.3 specification from existing route schemas
- Serve Swagger UI at `/documentation` endpoint
- Configure JWT Bearer authentication in security schemes
- Add tags to organize routes by domain (Auth, Habits, Tracking, Goals)
- Expose JSON spec at `/documentation/json` and YAML at `/documentation/yaml`

### Success Criteria
- [ ] Swagger UI accessible at `http://localhost:3000/documentation`
- [ ] All existing routes appear in documentation
- [ ] Request/response schemas display correctly (from TypeBox)
- [ ] JWT Bearer auth can be configured in UI for testing protected routes
- [ ] Routes are organized by tags
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Server starts without errors

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window

- url: https://github.com/fastify/fastify-swagger
  why: Official @fastify/swagger plugin - generates OpenAPI spec from route schemas
  critical: |
    - Must register BEFORE routes to ensure route discovery
    - TypeBox schemas automatically convert to JSON Schema (OpenAPI-compatible)
    - Use openapi.components.securitySchemes for JWT auth

- url: https://github.com/fastify/fastify-swagger-ui
  why: Official @fastify/swagger-ui plugin - serves Swagger UI interface
  critical: |
    - Exposes /documentation, /documentation/json, /documentation/yaml
    - routePrefix defaults to '/documentation'
    - uiConfig.docExpansion controls initial state ('list', 'full', 'none')

- url: https://swagger.io/specification/
  why: OpenAPI 3.0 specification reference
  critical: |
    - Security schemes defined in components.securitySchemes
    - Bearer auth type: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    - Tags array in openapi config, then reference tags in routes

- file: src/config/fastify.ts
  why: Current Fastify app configuration - WHERE to add swagger plugins
  critical: |
    - Register swagger plugins AFTER cors/jwt but BEFORE routes
    - Use await fastify.register() pattern
    - Swagger must see routes when they're registered

- file: src/routes/habits.ts
  why: Example route showing existing schema pattern
  critical: |
    - Routes already have schema.summary and schema.description
    - Add 'tags' array to schema for organization
    - Add 'security' array for JWT-protected routes

- file: src/schemas/habit.schema.ts
  why: TypeBox schema pattern
  critical: |
    - TypeBox schemas automatically convert to JSON Schema
    - No changes needed to schemas - swagger reads them directly
```

### Current Codebase Tree
```bash
src/
├── config/
│   ├── env.ts              # Environment variables
│   └── fastify.ts          # Fastify app setup (MODIFY THIS)
├── db/
│   └── prisma.ts           # Prisma client singleton
├── main.ts                 # App entry point (MODIFY THIS)
├── plugins/
│   └── authenticate.ts     # JWT authentication decorator
├── routes/
│   ├── auth.ts             # Auth routes (ADD TAGS)
│   ├── goals.ts            # Goal routes (ADD TAGS)
│   ├── habits.ts           # Habit routes (ADD TAGS)
│   └── tracking.ts         # Tracking routes (ADD TAGS)
├── schemas/                # TypeBox schemas (NO CHANGES NEEDED)
│   ├── auth.schema.ts
│   ├── common.schema.ts
│   ├── goal.schema.ts
│   ├── habit.schema.ts
│   └── tracking.schema.ts
├── services/               # Business logic (NO CHANGES)
└── types/
    └── fastify.d.ts        # Type declarations (NO CHANGES)
```

### Desired Codebase Tree (Files to modify/add)
```bash
src/
├── config/
│   └── fastify.ts          # MODIFY: Add swagger plugin registration
├── main.ts                 # MODIFY: Routes get tags automatically
├── routes/
│   ├── auth.ts             # MODIFY: Add tags: ['Auth'] to schemas
│   ├── goals.ts            # MODIFY: Add tags: ['Goals'] to schemas
│   ├── habits.ts           # MODIFY: Add tags: ['Habits'] to schemas
│   └── tracking.ts         # MODIFY: Add tags: ['Tracking'] to schemas
└── (no new files needed)
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: @fastify/swagger registration order
// - MUST register swagger BEFORE routes are registered
// - If routes are registered first, swagger won't discover them
// - Register order: cors -> jwt -> swagger -> swagger-ui -> routes

// CRITICAL: TypeBox compatibility
// - TypeBox schemas ARE JSON Schema - no conversion needed
// - @fastify/swagger reads schema.body, schema.params, schema.response automatically
// - Static<typeof Schema> types don't affect swagger output

// CRITICAL: Security schemes
// - Define in openapi.components.securitySchemes
// - Apply to routes via schema.security array
// - UI shows "Authorize" button when security schemes exist

// CRITICAL: Tags
// - Define tag names and descriptions in openapi.tags array
// - Reference in routes via schema.tags array
// - Routes without tags appear under "default" group

// CRITICAL: Route schema casting
// - Existing routes use `as any` on schema to avoid TypeScript errors
// - This doesn't affect swagger - it reads the schema values correctly
// - Don't remove these casts - they're needed for TypeScript

// GOTCHA: Protected route schema.security
// - Routes with onRequest: [fastify.authenticate] should have security: [{ bearerAuth: [] }]
// - This tells swagger UI that the route requires authentication
// - Without this, users might get 401 errors when testing

// GOTCHA: Response descriptions
// - If schema.response[statusCode] doesn't have description, swagger uses 'Default Response'
// - For better docs, add description to response schemas
```

## Implementation Blueprint

### Task List (In Order of Implementation)

```yaml
Task 1: Install Dependencies
  RUN npm command:
    - npm install @fastify/swagger @fastify/swagger-ui
  VERIFY:
    - Check package.json has both packages in dependencies
    - Both are official Fastify plugins, well-maintained

Task 2: Configure Swagger Plugin in fastify.ts
  MODIFY src/config/fastify.ts:
    - IMPORT @fastify/swagger and @fastify/swagger-ui
    - ADD swagger registration AFTER jwt plugin, BEFORE routes would be registered
    - CONFIGURE openapi object with:
      - openapi: '3.0.3'
      - info: title, description, version
      - servers: [{ url: 'http://localhost:3000' }]
      - components.securitySchemes: bearerAuth config
      - tags: [Auth, Habits, Tracking, Goals]
    - ADD swagger-ui registration with:
      - routePrefix: '/documentation'
      - uiConfig: { docExpansion: 'list', deepLinking: true }

Task 3: Add Tags to Auth Routes
  MODIFY src/routes/auth.ts:
    - ADD tags: ['Auth'] to each route's schema
    - ADD security: [{ bearerAuth: [] }] to /logout route (protected)
    - DON'T add security to /signup, /login, /refresh (public routes)

Task 4: Add Tags and Security to Habit Routes
  MODIFY src/routes/habits.ts:
    - ADD tags: ['Habits'] to each route's schema
    - ADD security: [{ bearerAuth: [] }] to ALL routes (all protected)
  PATTERN for each route:
    schema: {
      tags: ['Habits'],
      security: [{ bearerAuth: [] }],
      summary: '...',
      // ... rest of schema
    }

Task 5: Add Tags and Security to Tracking Routes
  MODIFY src/routes/tracking.ts:
    - ADD tags: ['Tracking'] to each route's schema
    - ADD security: [{ bearerAuth: [] }] to ALL routes (all protected)

Task 6: Add Tags and Security to Goal Routes
  MODIFY src/routes/goals.ts:
    - ADD tags: ['Goals'] to each route's schema
    - ADD security: [{ bearerAuth: [] }] to ALL routes (all protected)

Task 7: Verify and Test
  RUN: npm run dev
  TEST: Open http://localhost:3000/documentation in browser
  VERIFY:
    - Swagger UI loads
    - All routes visible and grouped by tags
    - Authorize button appears (for JWT)
    - Request/response schemas display correctly
```

### Pseudocode for Key Components

```typescript
// Task 2: Swagger Plugin Configuration in src/config/fastify.ts

import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

// INSIDE createFastifyApp() function, AFTER jwt registration:

// Register Swagger plugin - generates OpenAPI spec
await fastify.register(swagger, {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'Habit Tracker API',
      description: 'REST API for tracking daily habits and consistency metrics',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Habits', description: 'Habit CRUD operations' },
      { name: 'Tracking', description: 'Habit completion tracking' },
      { name: 'Goals', description: 'Habit goals and progress' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token from /auth/login or /auth/signup',
        },
      },
    },
  },
});

// Register Swagger UI - serves the documentation interface
await fastify.register(swaggerUi, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',  // Show routes collapsed initially
    deepLinking: true,      // Enable deep linking to specific operations
  },
  staticCSP: true,
});

// Task 3-6: Adding tags to route schemas
// PATTERN - apply to each route in each file:

fastify.post<{ Body: CreateHabitDto }>(
  '/',
  {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Habits'],                    // ADD THIS
      security: [{ bearerAuth: [] }],      // ADD THIS for protected routes
      summary: 'Create a new habit',
      description: 'Creates a new habit for the user',
      body: CreateHabitSchema,
      response: {
        201: HabitSchema,
        400: { description: 'Invalid input' },
      },
    } as any,
  },
  async (request, reply) => {
    // ... handler code unchanged
  }
);
```

### Integration Points

```yaml
DEPENDENCIES:
  - npm install: "@fastify/swagger @fastify/swagger-ui"
  - No dev dependencies needed

PLUGIN REGISTRATION ORDER in fastify.ts:
  1. cors
  2. jwt (access token)
  3. jwt (refresh token with namespace)
  4. authenticate plugin
  5. swagger          # ADD HERE
  6. swagger-ui       # ADD HERE
  7. (routes registered in main.ts come after)

ROUTE SCHEMA UPDATES:
  - Each route's schema object gets: tags, security (if protected)
  - No changes to body/params/response schemas
  - Existing TypeBox schemas work as-is
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                # Check for ESLint issues
npm run build               # TypeScript compilation

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Server Startup
```bash
# Start the development server
npm run dev

# Expected output includes:
# Server running on http://localhost:3000

# If startup fails, check:
# - Import paths are correct (.js extension for ESM)
# - Plugin registration order is correct
# - No TypeScript compilation errors
```

### Level 3: Swagger UI Access
```bash
# Open in browser:
# http://localhost:3000/documentation

# Verify:
# - [ ] Page loads without errors
# - [ ] "Habit Tracker API" title displays
# - [ ] Four tag sections visible: Auth, Habits, Tracking, Goals
# - [ ] "Authorize" button visible (top right)
# - [ ] Expand any route to see request/response schemas
```

### Level 4: Test JWT Authentication in Swagger UI
```bash
# 1. First, get a token by testing /auth/signup or /auth/login:
#    - Expand Auth section
#    - Click "POST /auth/signup"
#    - Click "Try it out"
#    - Enter test data and Execute
#    - Copy the accessToken from response

# 2. Configure Bearer auth:
#    - Click "Authorize" button (top right)
#    - Paste token in the Value field
#    - Click "Authorize"
#    - Click "Close"

# 3. Test a protected route:
#    - Expand Habits section
#    - Click "GET /habits"
#    - Click "Try it out"
#    - Click "Execute"
#    - Should return 200 with habits array (or empty array)

# 4. Test without auth (should fail):
#    - Click "Authorize" button
#    - Click "Logout"
#    - Try GET /habits again
#    - Should return 401 Unauthorized
```

### Level 5: Verify OpenAPI Spec
```bash
# Access raw OpenAPI spec:
curl http://localhost:3000/documentation/json | jq .

# Verify the output contains:
# - "openapi": "3.0.3"
# - "info.title": "Habit Tracker API"
# - "paths" object with all routes
# - "components.securitySchemes.bearerAuth"
# - "tags" array with Auth, Habits, Tracking, Goals

# Alternative: YAML format
curl http://localhost:3000/documentation/yaml
```

## Final Validation Checklist
- [ ] Dependencies installed: `npm list @fastify/swagger @fastify/swagger-ui`
- [ ] No lint errors: `npm run lint`
- [ ] No build errors: `npm run build`
- [ ] Server starts: `npm run dev`
- [ ] Swagger UI loads: `http://localhost:3000/documentation`
- [ ] All routes visible in correct tag groups
- [ ] Request/response schemas display correctly
- [ ] Authorize button works for JWT
- [ ] Protected routes require authentication
- [ ] OpenAPI JSON spec accessible: `/documentation/json`

---

## Anti-Patterns to Avoid
- DON'T register swagger AFTER routes - it won't discover them
- DON'T modify TypeBox schemas for swagger - they work as-is
- DON'T add security to public routes (/auth/signup, /auth/login, /auth/refresh)
- DON'T remove the `as any` casts on route schemas - they're needed for TypeScript
- DON'T forget to add tags to routes - they'll appear under "default" otherwise
- DON'T set docExpansion to 'full' - it's overwhelming with many routes

## Security Considerations
- [ ] Swagger UI only exposes documentation, not sensitive data
- [ ] JWT tokens entered in UI are stored in browser memory only
- [ ] Consider disabling swagger-ui in production via environment variable
- [ ] OpenAPI spec doesn't include actual data, just schema definitions

---

## PRP Quality Score: 9/10

**Confidence Level for One-Pass Implementation**: 9/10

**Reasoning**:
- All necessary context provided (plugin docs, codebase patterns)
- Clear task order with specific files and changes
- Validation at multiple levels (build, server, UI, API)
- Existing codebase already has well-structured schemas
- Simple integration - just plugin registration and schema additions

**What could reduce success**:
- TypeScript strict mode issues (but strict is disabled in this project)
- Possible version incompatibility (but using latest stable versions)

**What makes this high confidence**:
- TypeBox schemas already work with OpenAPI (JSON Schema compatible)
- Routes already have summary/description fields
- Simple plugin configuration - mostly boilerplate
- No business logic changes required

---

## External Resources Referenced

**Fastify Swagger**:
- [GitHub - fastify/fastify-swagger](https://github.com/fastify/fastify-swagger) - Official documentation generator plugin
- [GitHub - fastify/fastify-swagger-ui](https://github.com/fastify/fastify-swagger-ui) - Official Swagger UI plugin

**OpenAPI Specification**:
- [OpenAPI 3.0 Specification](https://swagger.io/specification/) - Official spec reference

**Fastify TypeBox**:
- [Fastify TypeScript Guide](https://fastify.dev/docs/latest/Reference/TypeScript/) - TypeBox integration patterns
