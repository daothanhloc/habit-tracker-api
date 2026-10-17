-- V2 rebuild: replace the flat Habit/HabitGoal/HabitTracking model with
-- Goal -> Habit -> Task. This is a destructive schema replacement, not a
-- data migration -- the v1 and v2 domain models are not field-compatible
-- (see PRPs/HABIT_TRACKER_V2_SCHEMA_API.md section 7). Any existing
-- Habit/HabitGoal/HabitTracking rows are dropped, not backfilled.

-- DropForeignKey (children first)
ALTER TABLE "HabitTracking" DROP CONSTRAINT IF EXISTS "HabitTracking_habitId_fkey";
ALTER TABLE "HabitTracking" DROP CONSTRAINT IF EXISTS "HabitTracking_userId_fkey";
ALTER TABLE "HabitGoal" DROP CONSTRAINT IF EXISTS "HabitGoal_habitId_fkey";
ALTER TABLE "HabitGoal" DROP CONSTRAINT IF EXISTS "HabitGoal_userId_fkey";
ALTER TABLE "Habit" DROP CONSTRAINT IF EXISTS "Habit_userId_fkey";

-- DropTable
DROP TABLE IF EXISTS "HabitTracking";
DROP TABLE IF EXISTS "HabitGoal";
DROP TABLE IF EXISTS "Habit";

-- DropEnum
DROP TYPE IF EXISTS "Frequency";
DROP TYPE IF EXISTS "GoalType";

-- CreateEnum
CREATE TYPE "HabitGoalType" AS ENUM ('SUM', 'THRESHOLD_COUNT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('DONE', 'NOT_DONE');

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "unit" TEXT,
    "goalType" "HabitGoalType" NOT NULL,
    "targetValue" DOUBLE PRECISION,
    "dailyMinValue" DOUBLE PRECISION,
    "targetDays" INTEGER,
    "frequencyDays" INTEGER[],
    "defaultTaskValue" DOUBLE PRECISION,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "value" DOUBLE PRECISION,
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_DONE',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Goal_userId_idx" ON "Goal"("userId");

-- CreateIndex
CREATE INDEX "Habit_goalId_idx" ON "Habit"("goalId");

-- CreateIndex
CREATE INDEX "Habit_userId_idx" ON "Habit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_habitId_date_key" ON "Task"("habitId", "date");

-- CreateIndex
CREATE INDEX "Task_habitId_date_idx" ON "Task"("habitId", "date");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
