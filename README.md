# Habit Tracker API

A production-ready REST API for tracking daily habits and consistency metrics. Built with Node.js, Fastify, TypeScript, and PostgreSQL.

## Features

- ✅ Create, read, update, and delete habits
- ✅ Track daily habit completion with automatic streak calculation
- ✅ Set consistency goals (weekly, monthly, yearly)
- ✅ View habit history and progress metrics
- ✅ Type-safe API with full TypeScript support
- ✅ Comprehensive validation with TypeBox schemas
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
   - 3 sample habits (Morning Exercise, Read, Meditate)
   - 1 sample goal (5x per week for Morning Exercise)
   - 3 sample tracking records with streak data

7. **Start the development server**:
   ```bash
   npm run dev
   ```

   The server should now be running at `http://localhost:3000`

## Project Structure

```
habbit-tracker-api/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── config/
│   │   ├── env.ts                  # Environment variables validation
│   │   └── fastify.ts              # Fastify configuration and setup
│   ├── db/
│   │   └── prisma.ts               # PrismaClient singleton
│   ├── schemas/
│   │   ├── common.schema.ts         # Shared schemas
│   │   ├── habit.schema.ts          # Habit schemas and DTOs
│   │   ├── tracking.schema.ts       # Tracking record schemas
│   │   └── goal.schema.ts           # Goal schemas and DTOs
│   ├── routes/
│   │   ├── habits.ts                # Habit CRUD routes
│   │   ├── tracking.ts              # Habit tracking routes
│   │   └── goals.ts                 # Goal management routes
│   └── services/
│       ├── habit.service.ts         # Habit business logic
│       ├── tracking.service.ts      # Tracking business logic
│       └── goal.service.ts          # Goal business logic
├── prisma/
│   └── schema.prisma                # Database schema
├── tests/
│   ├── unit/                        # Unit tests for services
│   └── integration/                 # Integration tests for API
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── jest.config.js                   # Jest configuration
└── README.md                        # This file
```

## API Endpoints

### Habits

#### Create Habit
```bash
POST /habits
Content-Type: application/json

{
  "name": "Morning Exercise",
  "description": "30 min workout",
  "frequency": "daily",
  "category": "health"
}

Response (201):
{
  "id": "uuid",
  "userId": "user-id",
  "name": "Morning Exercise",
  "description": "30 min workout",
  "frequency": "daily",
  "category": "health",
  "isActive": true,
  "createdAt": "2025-01-01T08:00:00Z",
  "updatedAt": "2025-01-01T08:00:00Z"
}
```

#### Get All Habits
```bash
GET /habits

Response (200):
[
  {
    "id": "uuid",
    "name": "Morning Exercise",
    ...
  }
]
```

#### Get Single Habit
```bash
GET /habits/:id

Response (200):
{
  "id": "uuid",
  "name": "Morning Exercise",
  ...
}
```

#### Update Habit
```bash
PUT /habits/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "frequency": "weekly"
}

Response (200):
{
  "id": "uuid",
  "name": "Updated Name",
  ...
}
```

#### Delete Habit
```bash
DELETE /habits/:id

Response (204): No content
```

### Habit Tracking

#### Log Habit Completion
```bash
POST /habits/:habitId/track
Content-Type: application/json

{
  "notes": "Great workout today!",
  "completedAt": "2025-01-01T18:30:00Z" // optional, defaults to now
}

Response (201):
{
  "id": "uuid",
  "habitId": "uuid",
  "userId": "user-id",
  "completedAt": "2025-01-01T18:30:00Z",
  "notes": "Great workout today!",
  "streak": 5,
  "createdAt": "2025-01-01T18:30:00Z"
}
```

#### Get Habit History
```bash
GET /habits/:habitId/history?limit=30

Response (200):
[
  {
    "id": "uuid",
    "completedAt": "2025-01-01T18:30:00Z",
    "streak": 5,
    ...
  }
]
```

#### Get Current Streak
```bash
GET /habits/:habitId/streak

Response (200):
{
  "streak": 5
}
```

### Habit Goals

#### Create Goal
```bash
POST /habits/:habitId/goals
Content-Type: application/json

{
  "targetFrequency": 5,
  "goalType": "weekly"
}

Response (201):
{
  "id": "uuid",
  "habitId": "uuid",
  "targetFrequency": 5,
  "goalType": "weekly",
  ...
}
```

#### Get Goals
```bash
GET /habits/:habitId/goals

Response (200):
[
  {
    "id": "uuid",
    "targetFrequency": 5,
    "goalType": "weekly",
    ...
  }
]
```

#### Get Goal Progress
```bash
GET /habits/:habitId/goals/:goalId

Response (200):
{
  "goal": {
    "id": "uuid",
    ...
  },
  "completions": 3,
  "targetFrequency": 5,
  "percentage": 60
}
```

#### Update Goal
```bash
PUT /habits/:habitId/goals/:goalId
Content-Type: application/json

{
  "targetFrequency": 6
}

Response (200):
{
  "id": "uuid",
  "targetFrequency": 6,
  ...
}
```

#### Delete Goal
```bash
DELETE /habits/:habitId/goals/:goalId

Response (204): No content
```

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

Start the development server:
```bash
npm run dev
```

Then test endpoints (note: make sure to run `npm run db:seed` first):

```bash
# Create a habit
curl -X POST http://localhost:3000/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Coding",
    "description": "2 hours of coding practice",
    "frequency": "daily",
    "category": "learning"
  }'

# Get all habits
curl http://localhost:3000/habits

# Log habit completion
curl -X POST http://localhost:3000/habits/{habitId}/track \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Great coding session today!"
  }'

# Get streak
curl http://localhost:3000/habits/{habitId}/streak

# Create a goal
curl -X POST http://localhost:3000/habits/{habitId}/goals \
  -H "Content-Type: application/json" \
  -d '{
    "targetFrequency": 5,
    "goalType": "weekly"
  }'

# Get goal progress
curl http://localhost:3000/habits/{habitId}/goals/{goalId}
```

**Important**: Replace `{habitId}` and `{goalId}` with actual IDs from the responses.

## Database Schema

### Models

- **User**: Stores user information
  - `id` (String, PK): Unique identifier
  - `email` (String, Unique): User email
  - `name` (String, Optional): User name
  - `createdAt` (DateTime): Creation timestamp
  - `updatedAt` (DateTime): Last update timestamp

- **Habit**: Represents a habit to track
  - `id` (String, PK): Unique identifier
  - `userId` (String, FK): Reference to User
  - `name` (String, Unique per user): Habit name
  - `description` (String, Optional): Habit description
  - `frequency` (Enum): DAILY, WEEKLY, or MONTHLY
  - `category` (String, Optional): Habit category
  - `isActive` (Boolean): Whether habit is active
  - `color` (String, Optional): UI color for habit
  - `createdAt` (DateTime): Creation timestamp
  - `updatedAt` (DateTime): Last update timestamp

- **HabitTracking**: Records habit completions
  - `id` (String, PK): Unique identifier
  - `habitId` (String, FK): Reference to Habit
  - `userId` (String, FK): Reference to User
  - `completedAt` (DateTime, Unique per habit per date): Completion timestamp
  - `notes` (String, Optional): User notes
  - `streak` (Integer): Current streak at this record
  - `createdAt` (DateTime): Record creation timestamp

- **HabitGoal**: Consistency goals for habits
  - `id` (String, PK): Unique identifier
  - `habitId` (String, FK): Reference to Habit
  - `userId` (String, FK): Reference to User
  - `targetFrequency` (Integer): Target completions per period
  - `goalType` (Enum): WEEKLY, MONTHLY, or YEARLY
  - `createdAt` (DateTime): Creation timestamp
  - `updatedAt` (DateTime): Last update timestamp

## Frequency Values

- `daily`: Track every day
- `weekly`: Track multiple times per week
- `monthly`: Track multiple times per month

## Goal Types

- `weekly`: Weekly consistency goal
- `monthly`: Monthly consistency goal
- `yearly`: Yearly consistency goal

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
