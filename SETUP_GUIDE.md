# 🚀 Quick Setup Guide - Habit Tracker API

## Prerequisites
- Node.js 18+
- npm/yarn
- PostgreSQL (or Supabase account)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
# Copy example to local file
cp .env.example .env.local

# Edit .env.local and add your database URL
nano .env.local  # or your preferred editor
```

**For Supabase:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Settings** → **Database**
4. Copy the connection string (URI format)
5. Paste into `DATABASE_URL` in `.env.local`

Example:
```
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

### 3. Initialize Database
```bash
# Run migrations to create tables
npm run db:migrate
```

You'll be prompted to create a new migration. Press Enter to create an initial migration.

### 4. Seed Test Data (Recommended)
```bash
# Populate database with sample data
npm run db:seed
```

This creates:
- ✅ Test user: `test@example.com`
- ✅ 3 sample habits (Morning Exercise, Read, Meditate)
- ✅ 1 goal for Morning Exercise
- ✅ Sample tracking records

**Output will show the test user ID** - save this for reference!

### 5. Start Development Server
```bash
npm run dev
```

Server runs at: **http://localhost:3000**

---

## 🧪 Testing the API

### Option A: Postman (Recommended)
1. Open Postman
2. **File** → **Import**
3. Select `postman_collection.json`
4. Set variables:
   - `base_url`: http://localhost:3000
   - Create a habit and copy its `id` to `habit_id`
   - Create a goal and copy its `id` to `goal_id`

### Option B: cURL
```bash
# Get all habits
curl http://localhost:3000/habits

# Create new habit
curl -X POST http://localhost:3000/habits \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meditation",
    "frequency": "daily",
    "category": "wellness"
  }'

# Log completion
curl -X POST http://localhost:3000/habits/{habitId}/track \
  -H "Content-Type: application/json" \
  -d '{"notes": "Great session!"}'

# Check streak
curl http://localhost:3000/habits/{habitId}/streak
```

---

## 📊 Database Management

### View Database with Prisma Studio
```bash
npm run db:studio
```

Opens a visual database browser at http://localhost:5555

### Reset Database (Development Only)
```bash
# Reset all data and re-run migrations + seed
npx prisma migrate reset
```

⚠️ **Warning**: This deletes all data!

---

## 🛠️ Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm test` | Run all tests |
| `npm test:watch` | Run tests in watch mode |
| `npm run lint` | Check code quality |
| `npm run db:migrate` | Create/update migrations |
| `npm run db:seed` | Populate with sample data |
| `npm run db:studio` | Open database UI |

---

## ✅ Troubleshooting

### Error: "DATABASE_URL environment variable is required"
- Check `.env.local` exists
- Verify `DATABASE_URL` is set correctly
- Database must be accessible from your machine

### Error: "Foreign key constraint violated"
- Run migrations first: `npm run db:migrate`
- Then seed: `npm run db:seed`
- Don't skip the seed step!

### Error: "Port 3000 already in use"
- Change port: `PORT=3001 npm run dev`
- Or kill process: `lsof -ti:3000 | xargs kill -9`

### Tests failing
- Make sure `npm test` passes
- Check database is running and migrated
- Seed is optional for unit tests

---

## 📚 API Documentation

See [README.md](./README.md#api-endpoints) for complete API endpoint documentation.

---

## 🔐 Security Notes

⚠️ **This is a development setup!**

For production:
1. Implement JWT authentication
2. Add rate limiting
3. Use environment-specific secrets
4. Enable HTTPS
5. Add CORS restrictions
6. Implement input validation

---

## 🤔 Next Steps

1. ✅ Get API working
2. 📝 Add authentication (JWT)
3. 🔔 Implement habit reminders
4. 🤖 Add AI suggestions
5. 📊 Create metrics dashboard
6. 📱 Build frontend (web/mobile)

---

## 💡 Tips

- Use **Postman collection** for quick API testing
- Check **Prisma Studio** (`npm run db:studio`) to inspect database
- Unit tests cover service logic: `npm test`
- Integration tests require DATABASE_URL (skipped otherwise)
- Use `npm run lint` to catch issues before committing

---

**Happy tracking! 🎯**
