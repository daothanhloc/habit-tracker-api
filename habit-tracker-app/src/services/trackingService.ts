import { apiClient } from './api'
import type { HabitTracking, Streak, TrackHabitDto } from '../types/tracking'

export const trackingService = {
  trackHabit: async (habitId: string, data: TrackHabitDto): Promise<HabitTracking> => {
    const response = await apiClient.post(`/habits/${habitId}/track`, data)
    return response.data
  },

  getHistory: async (habitId: string, limit: number = 30): Promise<HabitTracking[]> => {
    const response = await apiClient.get(`/habits/${habitId}/history`, {
      params: { limit }
    })
    return response.data
  },

  getStreak: async (habitId: string): Promise<Streak> => {
    const response = await apiClient.get(`/habits/${habitId}/streak`)
    return response.data
  },
}
