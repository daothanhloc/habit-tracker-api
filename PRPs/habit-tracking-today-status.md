name: "Add Tracking Today Status to GET /habits Endpoint"
description: |

## Purpose
Enhance the GET /habits endpoint to include a `trackedToday` boolean field for each habit, indicating whether the user has already tracked that habit today. This enables the frontend to show tracking status and prevent duplicate tracking attempts.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Add a `trackedToday` boolean field to each habit returned by GET /habits endpoint that indicates whether the user has already logged completion for that habit today.

## Why
- **UX Enhancement**: Frontend can show visual indicators for which habits were completed today
- **Prevent Duplicates**: Frontend can block/warn users trying to track a habit already completed today
- **Single API Call**: Avoid N additional API calls to check tracking status for each habit
- **Data Efficiency**: Return all necessary information in one response

## What
Modify the GET /habits endpoint response to include tracking status for today:

**Current Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Morning Exercise",
    "description": "30 min workout",
    "frequency": "DAILY",
    "category": "Health",
    "isActive": true,
    "color": "#3B82F6",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**New Response (with trackedToday field):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Morning Exercise",
    "description": "30 min workout",
    "frequency": "DAILY",
    "category": "Health",
    "isActive": true,
    "color": "#3B82F6",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "trackedToday": true
  }
]
```

### Success Criteria
- [ ] GET /habits returns `trackedToday` boolean for each habit
- [ ] `trackedToday` is true when habit has tracking record for today
- [ ] `trackedToday` is false when habit has no tracking record for today
- [ ] No N+1 query problem (efficient database queries)
- [ ] TypeScript compilation succeeds
- [ ] No linting errors
- [ ] Manual testing confirms correct behavior

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window

- url: https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting
  why: Prisma date filtering patterns for querying today's records
  critical: Use gte (greater than or equal) and lte (less than or equal) for date ranges

- url: https://www.prisma.io/docs/orm/prisma-client/queries/select-fields
  why: Understand Prisma query optimization patterns
  critical: Select only needed fields, use includes wisely to avoid over-fetching

- file: src/services/tracking.service.ts
  why: Contains existing logic for checking if habit was tracked on a specific date (lines 17-31)
  critical: REUSE the startOfDay/endOfDay pattern for date boundaries:
    ```typescript
    const startOfDay = new Date(completedAt);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(completedAt);
    endOfDay.setHours(23, 59, 59, 999);
    ```

- file: src/services/habit.service.ts
  why: Current implementation of findAll() method that needs to be modified
  critical: Service takes PrismaClient in constructor, returns Prisma query results

- file: src/schemas/habit.schema.ts
  why: TypeBox schema that defines the API response structure
  critical: Use Type.Boolean() for the new field, TypeBox automatically updates TypeScript types

- file: src/routes/habits.ts
  why: Route handler that calls habitService.findAll() - line 66
  critical: Route already uses HabitSchema for response typing, no changes needed here

- file: prisma/schema.prisma
  why: Database schema showing HabitTracking model structure
  critical: HabitTracking has habitId, userId, completedAt fields with unique index on (habitId, completedAt)

- file: dbdiagram.md
  why: Database design documentation explaining tracking table business rules
  critical: Line 89 states "One completion per habit per day (enforced by unique index on habit_id + completed_at)"
```

### Current Codebase Structure
```bash
src/
├── routes/
│   └── habits.ts              # GET /habits endpoint (line 51-69)
├── services/
│   ├── habit.service.ts       # findAll() method to modify (line 23-33)
│   └── tracking.service.ts    # Date boundary logic pattern (line 17-31)
├── schemas/
│   └── habit.schema.ts        # HabitSchema to update (line 18-29)
└── types/
    └── fastify.d.ts
```

### Desired Changes (files to modify)
```bash
src/schemas/habit.schema.ts    # ADD trackedToday: Type.Boolean() field
src/services/habit.service.ts  # MODIFY findAll() to query tracking and add trackedToday field
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Date comparison in JavaScript/TypeScript
// - Always set time boundaries (00:00:00.000 to 23:59:59.999) for "same day" checks
// - Use setHours() to set exact time boundaries
// - Prisma expects Date objects for timestamp comparisons

// CRITICAL: Prisma query efficiency
// - AVOID: Querying tracking for each habit (N+1 problem)
// - DO: Query all today's tracking once, then match in-memory
// - Pattern: 2 queries total (habits + today's tracking) then merge

// CRITICAL: TypeBox schema auto-typing
// - When you update HabitSchema, the Static<typeof HabitSchema> type auto-updates
// - The route handler types automatically include the new field
// - No manual type definitions needed

// CRITICAL: Prisma findMany with where conditions
// - Use AND conditions for date ranges: completedAt: { gte: startOfDay, lte: endOfDay }
// - Filter by userId to ensure user isolation
// - Return only needed fields to reduce payload

// GOTCHA: Timezone considerations
// - Current implementation uses server timezone (via new Date())
// - This is consistent with existing tracking logic in TrackingService
// - Future enhancement could accept timezone from client
```

## Implementation Blueprint

### Data Models and Structure

**Modify TypeBox Schema** (src/schemas/habit.schema.ts):
```typescript
// Current HabitSchema (line 18-29)
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
  // ADD THIS LINE:
  trackedToday: Type.Boolean(),
});
```

### List of Tasks (in order of completion)

```yaml
Task 1: Update HabitSchema to include trackedToday field
  File: src/schemas/habit.schema.ts
  Action: MODIFY HabitSchema object
  Details:
    - FIND: The HabitSchema Type.Object definition (line 18)
    - ADD: trackedToday: Type.Boolean() as the last field before closing brace
    - PRESERVE: All existing fields unchanged
    - VALIDATE: TypeScript compilation to ensure schema is valid

Task 2: Modify HabitService.findAll() to query tracking and add trackedToday
  File: src/services/habit.service.ts
  Action: MODIFY findAll method (lines 23-33)
  Details:
    - KEEP: Existing habit query logic
    - ADD: Date boundary calculation (reuse pattern from TrackingService)
    - ADD: Query for today's tracking records
    - ADD: Logic to match tracking records with habits
    - RETURN: Habits array with trackedToday field added to each habit
  Pattern: Follow efficient 2-query approach (see pseudocode below)

Task 3: Test TypeScript compilation
  Command: npm run build
  Expected: No TypeScript errors
  Action: If errors, read carefully and fix type mismatches

Task 4: Run linting
  Command: npm run lint
  Expected: No linting errors
  Action: Fix any style issues reported

Task 5: Manual testing with dev server
  Commands:
    1. npm run dev (start server)
    2. Login to get JWT token
    3. GET /habits with Authorization header
    4. POST /habits/:habitId/track for one habit
    5. GET /habits again to verify trackedToday changed
  Expected:
    - Before tracking: trackedToday: false
    - After tracking: trackedToday: true
    - Other habits: trackedToday: false
```

### Pseudocode for Task 2 (HabitService.findAll modification)

```typescript
// MODIFY src/services/habit.service.ts - findAll method (lines 23-33)

async findAll(userId: string, isActive?: boolean) {
  // STEP 1: Query habits (existing logic - KEEP AS IS)
  const where: any = { userId };
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const habits = await this.prisma.habit.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // STEP 2: Calculate today's date boundaries
  // PATTERN: Reuse from TrackingService lines 17-21
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  // STEP 3: Query all today's tracking for this user (single query)
  const todaysTracking = await this.prisma.habitTracking.findMany({
    where: {
      userId,
      completedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      habitId: true, // Only need habitId for matching
    },
  });

  // STEP 4: Create Set of tracked habit IDs for O(1) lookup
  const trackedHabitIds = new Set(
    todaysTracking.map((tracking) => tracking.habitId)
  );

  // STEP 5: Map habits and add trackedToday field
  const habitsWithTracking = habits.map((habit) => ({
    ...habit,
    trackedToday: trackedHabitIds.has(habit.id),
  }));

  return habitsWithTracking;
}
```

### Integration Points
```yaml
DATABASE:
  - No schema changes needed
  - Uses existing habit and habit_tracking tables
  - Leverages existing indexes for efficient queries

ROUTES:
  - No changes needed to src/routes/habits.ts
  - Response type auto-updates from HabitSchema change

SERVICES:
  - Only modify: src/services/habit.service.ts findAll() method

SCHEMAS:
  - Only modify: src/schemas/habit.schema.ts HabitSchema definition
```

## Validation Loop

### Level 1: Syntax & Type Checking
```bash
# Build TypeScript - must pass before proceeding
npm run build

# Expected: Build successful with no errors
# If errors: Read error messages, check:
#   - HabitSchema syntax is correct
#   - Service method return type matches schema
#   - All Type imports are present
```

### Level 2: Code Quality
```bash
# Run linter
npm run lint

# Expected: No linting errors
# If errors: Run auto-fix or manually fix style issues
npm run lint:fix
```

### Level 3: Manual Integration Testing
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test the endpoint
# Step 1: Login to get access token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
# Save the accessToken from response

# Step 2: Get habits (should show trackedToday: false for all)
curl -X GET http://localhost:3000/habits \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Step 3: Track one habit
curl -X POST http://localhost:3000/habits/HABIT_ID/track \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Step 4: Get habits again (should show trackedToday: true for tracked habit)
curl -X GET http://localhost:3000/habits \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Expected Results:
# - All habits have trackedToday field (boolean)
# - Tracked habit shows trackedToday: true
# - Other habits show trackedToday: false
# - Response matches schema structure
```

### Level 4: Edge Case Testing
```bash
# Test 1: User with no habits
# Expected: Empty array []

# Test 2: User with habits but no tracking
# Expected: All habits have trackedToday: false

# Test 3: User with all habits tracked today
# Expected: All habits have trackedToday: true

# Test 4: Check that tracking from yesterday doesn't affect today
# - Create tracking with completedAt from yesterday
# - Call GET /habits
# Expected: trackedToday: false (only today's tracking counts)
```

## Final Validation Checklist
- [ ] TypeScript builds successfully: `npm run build`
- [ ] No linting errors: `npm run lint`
- [ ] Manual test shows `trackedToday` field in response
- [ ] `trackedToday: false` before tracking
- [ ] `trackedToday: true` after tracking same habit
- [ ] Other habits remain `trackedToday: false`
- [ ] Response structure matches updated schema
- [ ] No performance degradation (check query count in logs)
- [ ] Works with multiple habits efficiently

---

## Anti-Patterns to Avoid
- ❌ Don't create N+1 queries (querying tracking for each habit)
- ❌ Don't modify the route file (schema change auto-updates types)
- ❌ Don't use Prisma include for tracking (inefficient for this use case)
- ❌ Don't compare dates without time boundaries (will miss same-day records)
- ❌ Don't hardcode timezone offsets (use server timezone consistently)
- ❌ Don't add optional field (trackedToday should always be present)
- ❌ Don't fetch full tracking records (only need habitId for matching)
- ❌ Don't skip testing both true and false cases

## Performance Considerations
```typescript
// GOOD: 2 queries total (O(n) where n = number of habits)
// 1. Query all habits for user
// 2. Query all today's tracking for user
// 3. Match in-memory with Set (O(1) lookup)

// BAD: N+1 queries (O(n²) where n = number of habits)
// 1. Query all habits
// 2. For each habit, query its tracking (N additional queries)

// Our implementation uses the GOOD pattern!
```

## Expected Database Query Plan
```sql
-- Query 1: Get all habits for user
SELECT * FROM habits
WHERE user_id = $1 AND is_active = $2
ORDER BY created_at DESC;

-- Query 2: Get today's tracking for user
SELECT habit_id FROM habit_tracking
WHERE user_id = $1
  AND completed_at >= $2  -- startOfDay
  AND completed_at <= $3  -- endOfDay;

-- Total: 2 queries regardless of number of habits
-- Uses existing indexes: habits(user_id, is_active), habit_tracking(user_id, completed_at)
```

## Future Enhancements (Not in Scope)
- Add `trackedThisWeek` or `trackedThisMonth` fields
- Accept timezone parameter from client
- Return tracking details (notes, completedAt) instead of just boolean
- Add streak information to the habit response

---

**Confidence Score: 9/10**

**Reasoning:**
- Clear, well-defined task with existing patterns to follow
- Minimal code changes (2 files)
- Efficient implementation approach
- Strong validation strategy
- Complete context provided
- Edge cases documented

**Risk Areas:**
- Date/timezone handling (mitigated by reusing existing pattern)
- Performance with large number of habits (mitigated by efficient query strategy)

**Why not 10/10:**
- Could benefit from automated tests, but manual testing is thorough
- Timezone handling could be more sophisticated (future enhancement)
