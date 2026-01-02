export interface Habit {
  id: string
  name: string
  description: string
  frequency: 'daily' | 'weekly' | 'custom'
  category: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface CreateHabitDto {
  name: string
  description: string
  frequency: string
  category: string
  color: string
}

export interface UpdateHabitDto extends Partial<CreateHabitDto> {}
