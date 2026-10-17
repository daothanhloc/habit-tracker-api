# Habit Tracker API

A production-ready REST API for tracking daily habits and consistency metrics. Built with Node.js, Fastify, TypeScript, and PostgreSQL.

## Features

- ✅ Goals with a calendar period (start/end date) that group habits
- ✅ Habits belong to a goal, scheduled on specific weekdays
- ✅ Two progress modes: `sum` (total over the period) and `threshold_count` (N days meeting a daily minimum)
- ✅ Daily tasks, lazily created per scheduled day, with streak tracking
- ✅ JWT auth (access + refresh tokens)
- ✅ Type-safe API with TypeBox validation and Swagger docs
- ✅ PostgreSQL with Prisma ORM for data persistence

## Quick Start

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **PostgreSQL**: 12 or higher (or use Supabase)
- **Git**: For version control

### Installation

1. **Clone the repository** (or create new project):
   ```bash
   cd habbit-tracker-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

4. **Set up your database connection**:

   **Option A: Using Supabase (Recommended)**
   - Go to https://supabase.com/dashboard
   - Create a new project
   - Navigate to Settings → Database
   - Copy the "Connection string" (URI format)
   - Update `DATABASE_URL` in `.env.local`:
     ```
     DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
     ```

   **Option B: Local PostgreSQL**
   - Ensure PostgreSQL is running locally
   - Create a database:
     ```bash
     createdb habit_tracker
     ```
   - Update `.env.local`:
     ```
     DATABASE_URL=postgresql://postgres:password@localhost:5432/habit_tracker
     ```

5. **Initialize the database and run migrations**:
   ```bash
   npm run db:migrate
   ```

6. **Seed the database with test data** (optional but recommended):
   ```bash
   npm run db:seed
   ```

   This creates:
   - 1 test user (test@example.com)
   - 1 sample goal ("Get Fit")
   - 2 sample habits (Run, Sleep)
   - 3 completed sample tasks for Run, with a 3-day streak

7. **Start the development server**:
   ```bash
   npm run dev
   ```

   The server should now be running at `http://localhost:3000`

## Project Structure

```
habit-tracker-api/
├── api/index.ts                     # Vercel serverless entry
├── src/
│   ├── main.ts                      # Local entry point - registers routes
│   ├── config/                      # env validation, Fastify setup/error handler
│   ├── plugins/authenticate.ts      # JWT auth decorator
│   ├── db/prisma.ts                 # PrismaClient singleton
│   ├── schemas/                     # TypeBox schemas: auth, common, goal, habit, task
│   ├── routes/                      # auth, goals, habits, tasks
│   └── services/                    # goal, habit, task business logic
├── prisma/schema.prisma             # Database schema
├── tests/                           # unit (services) and integration (routes)
└── PRPs/                            # Planning docs (see HABIT_TRACKER_V2_SCHEMA_API.md)
```

## API Endpoints

Everything except `/auth/signup`, `/auth/login`, `/auth/refresh` and `/health` needs
`Authorization: Bearer <accessToken>`. Interactive docs are served by Swagger UI.

Hierarchy: **Goal → Habit → Task**. A habit is always created *under* a goal, so
`goalId` is a **URL path parameter**, never a body field.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Register (`email`, `password` 8-72 chars, optional `name`) |
| POST | `/auth/login` | Returns `accessToken`, `refreshToken`, `user` |
| POST | `/auth/refresh` | Body `{ refreshToken }` → new tokens |
| POST | `/auth/logout` | Body `{ refreshToken }` → 204 |
| POST | `/goals` | Create goal (`title`, `startDate`, `endDate` as `YYYY-MM-DD`) |
| GET | `/goals` | List goals with habit summaries and progress |
| GET | `/goals/:goalId` | Get one goal |
| PUT | `/goals/:goalId` | Update goal (all fields optional) |
| DELETE | `/goals/:goalId` | Delete goal; cascades to habits and tasks (204) |
| POST | `/goals/:goalId/habits` | Create habit under a goal (201) |
| GET | `/goals/:goalId/habits` | List a goal's habits |
| GET | `/habits/:habitId` | Get one habit |
| PUT | `/habits/:habitId` | Update habit (all fields optional) |
| DELETE | `/habits/:habitId` | Delete habit (204) |
| GET | `/habits/:habitId/tasks?from=&to=` | Tasks in a date range |
| GET | `/habits/:habitId/tasks/today` | Today's task (404 if not scheduled today) |
| PUT | `/habits/:habitId/tasks/:date` | Set a task's `value` / `status` |
| GET | `/health` | Health check (includes DB ping) |

### Create Habit

`POST /goals/:goalId/habits` - the body is one of two variants, chosen by `goalType`:

```json
{
  "name": "Run",
  "goalType": "sum",
  "unit": "km",
  "targetValue": 100,
  "frequencyDays": [1, 3, 5],
  "defaultTaskValue": 5
}
```

```json
{
  "name": "Sleep",
  "goalType": "threshold_count",
  "unit": "hours",
  "dailyMinValue": 7,
  "targetDays": 20,
  "frequencyDays": [0, 1, 2, 3, 4, 5, 6],
  "defaultTaskValue": 8
}
```

- `frequencyDays`: at least one day, `0`=Sunday … `6`=Saturday
- `sum`: requires `targetValue` (> 0)
- `threshold_count`: requires `dailyMinValue` (> 0) and `targetDays` (≥ 1); a day counts when its task value ≥ `dailyMinValue`
- Request enums are lowercase (`sum`, `done`); responses are uppercase (`SUM`, `DONE`)

### Upsert Task

`PUT /habits/:habitId/tasks/:date` with `{ "value": 5, "status": "done" }` (both optional).
Future dates return 400; dates outside the habit's `frequencyDays` return 404.

## Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Building
npm run build        # Compile TypeScript to JavaScript

# Production
npm start            # Start production server

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting errors automatically

# Database
npm run db:migrate   # Create and apply migrations
npm run db:deploy    # Deploy migrations to production
npm run db:seed      # Seed database with sample data (if available)
npm run db:studio    # Open Prisma Studio for visual database management
```

## Environment Variables

All environment variables are defined in `.env.example`. Copy this file to `.env.local` for local development:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Environment mode | `development` \| `production` |
| `PORT` | No | Server port | `3000` |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `GMAIL_API_KEY` | No | Gmail API key (future feature) | `your-api-key` |
| `BRAVE_API_KEY` | No | Brave Search API key (future feature) | `your-api-key` |

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Manual Testing

#### Option 1: Using Postman (Recommended)

1. Import the `postman_collection.json` file:
   - Open Postman
   - Click **File** → **Import**
   - Select `postman_collection.json`
   - Click **Import**

2. Set environment variables in Postman:
   - **base_url**: `http://localhost:3000`
   - **habit_id**: Copy from "Create Habit" response
   - **goal_id**: Copy from "Create Goal" response

#### Option 2: Using cURL

Start the development server (`npm run dev`), then:

```bash
BASE=http://localhost:3000

# Sign up (or log in) and grab the access token
TOKEN=$(curl -s -X POST $BASE/auth/signup -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"password123"}' | jq -r .accessToken)

# Create a goal
GOAL_ID=$(curl -s -X POST $BASE/goals \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Get Fit","startDate":"2026-10-01","endDate":"2026-10-31"}' | jq -r .id)

# Create a habit under that goal (goalId is in the URL, not the body)
HABIT_ID=$(curl -s -X POST $BASE/goals/$GOAL_ID/habits \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Run","goalType":"sum","unit":"km","targetValue":100,"frequencyDays":[1,3,5],"defaultTaskValue":5}' | jq -r .id)

# List the goal's habits
curl -s $BASE/goals/$GOAL_ID/habits -H "Authorization: Bearer $TOKEN"

# Mark a task done
curl -s -X PUT $BASE/habits/$HABIT_ID/tasks/2026-10-16 \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"value":5,"status":"done"}'
```

## Database Schema

### Models

- **User**: `id`, `email` (unique), `name`, timestamps
- **Goal**: `id`, `userId`, `title`, `startDate`, `endDate` (calendar dates), timestamps
- **Habit**: belongs to one Goal
  - `goalType`: `SUM` or `THRESHOLD_COUNT`
  - `targetValue` (SUM), or `dailyMinValue` + `targetDays` (THRESHOLD_COUNT)
  - `frequencyDays` (`Int[]`, 0=Sun..6=Sat), `unit`, `defaultTaskValue`
  - `currentStreak`, `longestStreak`
- **Task**: one scheduled day of a Habit - `habitId`, `date`, `value`, `status` (`DONE` | `NOT_DONE`), `completedAt`; unique per (`habitId`, `date`)
- **RefreshToken**: stored refresh tokens for revocation

Deleting a Goal cascades to its Habits, and deleting a Habit cascades to its Tasks.
Full design: `PRPs/HABIT_TRACKER_V2_SCHEMA_API.md`.

## Goal Types

- `sum`: progress is the total of task values over the goal period, against `targetValue`
- `threshold_count`: progress is the number of days with task value ≥ `dailyMinValue`, against `targetDays`

## Future Features

The following features are planned for future phases:

1. **Authentication**: JWT-based user authentication
2. **Habit Reminders**: Email/SMS reminders via Gmail API
3. **AI Suggestions**: Habit recommendations using LLM
4. **Brave Search Integration**: External habit research
5. **Advanced Analytics**: Dashboard and metrics visualization
6. **WebSocket Support**: Real-time progress updates
7. **Caching Layer**: Redis for performance optimization

## Development

### Code Style

This project uses:
- **TypeScript** for type safety
- **ESLint** for code style and quality
- **Prettier** (optional) for formatting
- **Jest** for testing

### Type Safety

The project enforces strict TypeScript rules. All files must:
- Have proper type annotations
- Pass `tsc --noEmit` without errors
- Use `@sinclair/typebox` for schema validation

### Contributing

1. Ensure code passes linting: `npm run lint`
2. Ensure all tests pass: `npm test`
3. Ensure TypeScript compiles: `npm run build`
4. Create descriptive commit messages

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
```
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Verify credentials in `.env.local`

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
- Change PORT in `.env.local`
- Or kill process using port: `lsof -ti:3000 | xargs kill -9`

### Type Errors
```
error TS2322: Type 'X' is not assignable to type 'Y'
```
- Run `npm run build` to see all type errors
- Check schema definitions match Prisma models
- Ensure all imports are correct

### Tests Failing
- Clear Jest cache: `npx jest --clearCache`
- Ensure test database is properly set up
- Check test files match the test pattern

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check test files for usage examples
4. Open an issue on GitHub (if available)

---

**Happy tracking! 🎯**
