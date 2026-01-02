import { create } from 'zustand'
import type { HabitTracking, Streak, TrackHabitDto } from '../types/tracking'
import { trackingService } from '../services/trackingService'

interface TrackingState {
  trackingHistory: Record<string, HabitTracking[]>
  streaks: Record<string, Streak>
  loading: boolean
  error: string | null
  trackHabit: (habitId: string, data: TrackHabitDto) => Promise<void>
  fetchHistory: (habitId: string, limit?: number) => Promise<void>
  fetchStreak: (habitId: string) => Promise<void>
}

export const useTrackingStore = create<TrackingState>((set) => ({
  trackingHistory: {},
  streaks: {},
  loading: false,
  error: null,

  trackHabit: async (habitId, data) => {
    set({ loading: true, error: null })
    try {
      console.log('trackHabit called with:', { habitId, data })
      const tracking = await trackingService.trackHabit(habitId, data)
      console.log('Tracking successful:', tracking)

      set((state) => ({
        trackingHistory: {
          ...state.trackingHistory,
          [habitId]: [tracking, ...(state.trackingHistory[habitId] || [])],
        },
        loading: false,
      }))

      // Refresh streak after tracking
      console.log('Refreshing streak after tracking...')
      const streak = await trackingService.getStreak(habitId)
      console.log('Streak refreshed after tracking:', streak)
      set((state) => ({
        streaks: {
          ...state.streaks,
          [habitId]: streak,
        },
      }))
    } catch (error) {
      console.error('Track habit error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error details:', errorMessage)
      set({ error: 'Failed to track habit: ' + errorMessage, loading: false })
    }
  },

  fetchHistory: async (habitId, limit = 30) => {
    set({ loading: true, error: null })
    try {
      const history = await trackingService.getHistory(habitId, limit)
      console.log('Fetched history for habit', habitId, ':', history)
      set((state) => ({
        trackingHistory: {
          ...state.trackingHistory,
          [habitId]: history,
        },
        loading: false,
      }))
    } catch (error) {
      console.error('Fetch history error:', error)
      set({ error: 'Failed to fetch tracking history', loading: false })
    }
  },

  fetchStreak: async (habitId) => {
    set({ loading: true, error: null })
    try {
      const streak = await trackingService.getStreak(habitId)
      console.log('Fetched streak for habit', habitId, ':', streak)
      set((state) => ({
        streaks: {
          ...state.streaks,
          [habitId]: streak,
        },
        loading: false,
      }))
    } catch (error) {
      console.error('Fetch streak error:', error)
      set({ error: 'Failed to fetch streak. Check if API is running.', loading: false })
    }
  },
}))
