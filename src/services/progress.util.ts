import { HabitGoalType } from '@prisma/client';

interface TaskValueLike {
  value: number | null;
}

// Callers pass only DONE tasks (see HabitService.progressFor); this sums
// `value` / counts `value >= dailyMinValue` over whatever it is given.
// See PRPs/HABIT_TRACKER_V2_SCHEMA_API.md section 4 and section 8.
export function computeProgress(
  goalType: HabitGoalType,
  targetValue: number | null,
  dailyMinValue: number | null,
  targetDays: number | null,
  tasks: TaskValueLike[]
): { current: number; target: number } {
  if (goalType === 'SUM') {
    const current = tasks.reduce((sum, t) => sum + (t.value ?? 0), 0);
    return { current, target: targetValue ?? 0 };
  }

  // THRESHOLD_COUNT: a day counts if its value meets the daily minimum
  const current = tasks.filter(
    (t) => dailyMinValue !== null && t.value !== null && t.value >= dailyMinValue
  ).length;
  return { current, target: targetDays ?? 0 };
}
