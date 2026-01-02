import { apiClient } from './api'
import type { HabitGoal, GoalProgress, CreateGoalDto, UpdateGoalDto } from '../types/goal'

export const goalService = {
  create: async (habitId: string, data: CreateGoalDto): Promise<HabitGoal> => {
    const response = await apiClient.post(`/habits/${habitId}/goals`, data)
    return response.data
  },

  getAll: async (habitId: string): Promise<HabitGoal[]> => {
    const response = await apiClient.get(`/habits/${habitId}/goals`)
    return response.data
  },

  getProgress: async (habitId: string, goalId: string): Promise<GoalProgress> => {
    const response = await apiClient.get(`/habits/${habitId}/goals/${goalId}`)
    return response.data
  },

  update: async (habitId: string, goalId: string, data: UpdateGoalDto): Promise<HabitGoal> => {
    const response = await apiClient.put(`/habits/${habitId}/goals/${goalId}`, data)
    return response.data
  },

  delete: async (habitId: string, goalId: string): Promise<void> => {
    await apiClient.delete(`/habits/${habitId}/goals/${goalId}`)
  },
}
