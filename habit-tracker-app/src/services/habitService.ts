import { apiClient } from './api'
import type { Habit, CreateHabitDto, UpdateHabitDto } from '../types/habit'

export const habitService = {
  getAll: async (): Promise<Habit[]> => {
    const response = await apiClient.get('/habits')
    return response.data
  },

  getById: async (id: string): Promise<Habit> => {
    const response = await apiClient.get(`/habits/${id}`)
    return response.data
  },

  create: async (data: CreateHabitDto): Promise<Habit> => {
    const response = await apiClient.post('/habits', data)
    return response.data
  },

  update: async (id: string, data: UpdateHabitDto): Promise<Habit> => {
    const response = await apiClient.put(`/habits/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/habits/${id}`)
  },
}
