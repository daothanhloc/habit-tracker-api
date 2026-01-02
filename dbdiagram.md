# Habit Tracker Database Schema

This file contains the database diagram structure for the Habit Tracker application using DBML (Database Markup Language) syntax. You can visualize this at https://dbdiagram.io

## Database Diagram (DBML)

```dbml
// Habit Tracker Database Schema
// PostgreSQL (Supabase)

Table habits {
  id uuid [primary key, default: `gen_random_uuid()`]
  name varchar(255) [not null]
  description text
  frequency varchar(20) [not null, note: 'Values: daily, weekly, custom']
  category varchar(100) [not null]
  color varchar(7) [not null, note: 'Hex color code']
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  Indexes {
    category
    frequency
    created_at
  }

  Note: 'Core habit definition table. Each habit represents a behavior to track.'
}

Table habit_tracking {
  id uuid [primary key, default: `gen_random_uuid()`]
  habit_id uuid [not null, ref: > habits.id]
  completed_at timestamp [not null]
  notes text [null]
  created_at timestamp [not null, default: `now()`]

  Indexes {
    habit_id
    completed_at
    (habit_id, completed_at) [unique]
  }

  Note: 'Records each completion of a habit. Used for streak calculation and history.'
}

Table habit_goals {
  id uuid [primary key, default: `gen_random_uuid()`]
  habit_id uuid [not null, ref: > habits.id]
  target_frequency integer [not null, note: 'Number of times to complete']
  goal_type varchar(20) [not null, note: 'Values: weekly, monthly, yearly']
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`]

  Indexes {
    habit_id
    goal_type
  }

  Note: 'Goals for habit completion frequency. Multiple goals per habit allowed.'
}
```

## Table Descriptions

### habits
The core table storing habit definitions. Each record represents a behavior that a user wants to track.

**Fields:**
- `id`: Unique identifier (UUID)
- `name`: Display name of the habit (e.g., "Morning Exercise")
- `description`: Detailed description of the habit
- `frequency`: How often the habit should be performed (daily, weekly, or custom)
- `category`: Categorization for organization (e.g., health, productivity, mindfulness)
- `color`: Hex color code for visual identification in UI
- `created_at`: Timestamp when habit was created
- `updated_at`: Timestamp when habit was last modified

### habit_tracking
Records each completion of a habit. Used to calculate streaks and display history.

**Fields:**
- `id`: Unique identifier (UUID)
- `habit_id`: Foreign key reference to habits table
- `completed_at`: Timestamp when the habit was completed
- `notes`: Optional notes about this specific completion
- `created_at`: Timestamp when this tracking record was created

**Business Rules:**
- One completion per habit per day (enforced by unique index on habit_id + completed_at)
- Used for streak calculations (consecutive days with completions)
- Completions can be backdated via completed_at field

### habit_goals
Defines goals for habit completion frequency over different time periods.

**Fields:**
- `id`: Unique identifier (UUID)
- `habit_id`: Foreign key reference to habits table
- `target_frequency`: Number of times the habit should be completed in the goal period
- `goal_type`: Time period for the goal (weekly, monthly, or yearly)
- `created_at`: Timestamp when goal was created
- `updated_at`: Timestamp when goal was last modified

**Business Rules:**
- Multiple goals per habit are allowed (e.g., weekly AND monthly goals)
- Progress is calculated by counting completions within the goal period
- Goals are evaluated based on current date and goal_type

## Relationships

1. **habits → habit_tracking** (One-to-Many)
   - One habit can have many tracking records
   - Cascade delete: When a habit is deleted, all its tracking records should be deleted

2. **habits → habit_goals** (One-to-Many)
   - One habit can have multiple goals
   - Cascade delete: When a habit is deleted, all its goals should be deleted

## Indexes

**habits:**
- Primary key on `id`
- Index on `category` for filtering
- Index on `frequency` for filtering
- Index on `created_at` for sorting

**habit_tracking:**
- Primary key on `id`
- Foreign key index on `habit_id` for joins
- Index on `completed_at` for date range queries
- Unique composite index on `(habit_id, completed_at)` to prevent duplicate completions

**habit_goals:**
- Primary key on `id`
- Foreign key index on `habit_id` for joins
- Index on `goal_type` for filtering

## Sample SQL (PostgreSQL/Supabase)

```sql
-- Create habits table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')),
  category VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_habits_category ON habits(category);
CREATE INDEX idx_habits_frequency ON habits(frequency);
CREATE INDEX idx_habits_created_at ON habits(created_at);

-- Create habit_tracking table
CREATE TABLE habit_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_at TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_habit_tracking_habit_id ON habit_tracking(habit_id);
CREATE INDEX idx_habit_tracking_completed_at ON habit_tracking(completed_at);
CREATE UNIQUE INDEX idx_habit_tracking_unique ON habit_tracking(habit_id, completed_at);

-- Create habit_goals table
CREATE TABLE habit_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  target_frequency INTEGER NOT NULL CHECK (target_frequency > 0),
  goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_habit_goals_habit_id ON habit_goals(habit_id);
CREATE INDEX idx_habit_goals_goal_type ON habit_goals(goal_type);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_goals_updated_at
  BEFORE UPDATE ON habit_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Common Queries

### Get habit with current streak
```sql
-- Calculate current streak for a habit
WITH daily_completions AS (
  SELECT
    DATE(completed_at) as completion_date
  FROM habit_tracking
  WHERE habit_id = $1
  ORDER BY completion_date DESC
),
streak_calc AS (
  SELECT
    completion_date,
    completion_date - ROW_NUMBER() OVER (ORDER BY completion_date DESC)::INTEGER as streak_group
  FROM daily_completions
)
SELECT COUNT(*) as current_streak
FROM streak_calc
WHERE streak_group = (SELECT streak_group FROM streak_calc LIMIT 1);
```

### Get goal progress
```sql
-- Calculate progress for a weekly goal
SELECT
  g.*,
  COUNT(t.id) as current_progress,
  (COUNT(t.id)::FLOAT / g.target_frequency * 100)::INTEGER as percentage,
  COUNT(t.id) >= g.target_frequency as is_achieved
FROM habit_goals g
LEFT JOIN habit_tracking t ON t.habit_id = g.habit_id
  AND t.completed_at >= date_trunc('week', NOW())
  AND t.completed_at < date_trunc('week', NOW()) + INTERVAL '1 week'
WHERE g.goal_type = 'weekly'
  AND g.habit_id = $1
GROUP BY g.id;
```

### Get habit history for calendar view
```sql
-- Get all completions for a habit in a specific month
SELECT
  DATE(completed_at) as date,
  COUNT(*) as completion_count,
  STRING_AGG(notes, '; ') as notes
FROM habit_tracking
WHERE habit_id = $1
  AND completed_at >= date_trunc('month', $2::DATE)
  AND completed_at < date_trunc('month', $2::DATE) + INTERVAL '1 month'
GROUP BY DATE(completed_at)
ORDER BY date;
```

## Visual Diagram

To visualize this schema:
1. Go to https://dbdiagram.io
2. Copy the DBML code block above (lines between ```dbml ... ```)
3. Paste into the editor
4. The visual diagram will be generated automatically

Alternatively, use this direct link with the schema encoded:
https://dbdiagram.io/d (paste the DBML code)
