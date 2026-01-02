export interface HabitGoal {
  id: string
  habitId: string
  targetFrequency: number
  goalType: 'weekly' | 'monthly' | 'yearly'
  createdAt: string
  updatedAt: string
}

export interface GoalProgress {
  goal: HabitGoal
  currentProgress: number
  percentage: number
  isAchieved: boolean
}

export interface CreateGoalDto {
  targetFrequency: number
  goalType: 'weekly' | 'monthly' | 'yearly'
}

export interface UpdateGoalDto extends Partial<CreateGoalDto> {}
