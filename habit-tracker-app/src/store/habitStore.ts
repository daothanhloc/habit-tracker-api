import { create } from 'zustand'
import type { Habit, CreateHabitDto, UpdateHabitDto } from '../types/habit'
import { habitService } from '../services/habitService'

interface HabitState {
  habits: Habit[]
  loading: boolean
  error: string | null
  fetchHabits: () => Promise<void>
  addHabit: (data: CreateHabitDto) => Promise<void>
  updateHabit: (id: string, data: UpdateHabitDto) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  loading: false,
  error: null,

  fetchHabits: async () => {
    set({ loading: true, error: null })
    try {
      const habits = await habitService.getAll()
      set({ habits, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch habits', loading: false })
    }
  },

  addHabit: async (data) => {
    set({ loading: true, error: null })
    try {
      const newHabit = await habitService.create(data)
      set((state) => ({
        habits: [...state.habits, newHabit],
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to create habit', loading: false })
    }
  },

  updateHabit: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const updatedHabit = await habitService.update(id, data)
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? updatedHabit : h)),
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to update habit', loading: false })
    }
  },

  deleteHabit: async (id) => {
    set({ loading: true, error: null })
    try {
      await habitService.delete(id)
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to delete habit', loading: false })
    }
  },
}))
