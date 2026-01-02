export interface HabitTracking {
  id: string
  habitId: string
  completedAt: string
  notes?: string
  createdAt: string
}

export interface Streak {
  streak: number
}

export interface TrackHabitDto {
  notes?: string
  completedAt?: string
}
