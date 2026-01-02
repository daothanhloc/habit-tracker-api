import { create } from 'zustand'
import type { HabitGoal, GoalProgress, CreateGoalDto, UpdateGoalDto } from '../types/goal'
import { goalService } from '../services/goalService'

interface GoalState {
  goals: Record<string, HabitGoal[]>
  goalProgress: Record<string, GoalProgress>
  loading: boolean
  error: string | null
  createGoal: (habitId: string, data: CreateGoalDto) => Promise<void>
  fetchGoals: (habitId: string) => Promise<void>
  fetchGoalProgress: (habitId: string, goalId: string) => Promise<void>
  updateGoal: (habitId: string, goalId: string, data: UpdateGoalDto) => Promise<void>
  deleteGoal: (habitId: string, goalId: string) => Promise<void>
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: {},
  goalProgress: {},
  loading: false,
  error: null,

  createGoal: async (habitId, data) => {
    set({ loading: true, error: null })
    try {
      const newGoal = await goalService.create(habitId, data)
      set((state) => ({
        goals: {
          ...state.goals,
          [habitId]: [...(state.goals[habitId] || []), newGoal],
        },
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to create goal', loading: false })
    }
  },

  fetchGoals: async (habitId) => {
    set({ loading: true, error: null })
    try {
      const goals = await goalService.getAll(habitId)
      set((state) => ({
        goals: {
          ...state.goals,
          [habitId]: goals,
        },
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to fetch goals', loading: false })
    }
  },

  fetchGoalProgress: async (habitId, goalId) => {
    set({ loading: true, error: null })
    try {
      const progress = await goalService.getProgress(habitId, goalId)
      set((state) => ({
        goalProgress: {
          ...state.goalProgress,
          [goalId]: progress,
        },
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to fetch goal progress', loading: false })
    }
  },

  updateGoal: async (habitId, goalId, data) => {
    set({ loading: true, error: null })
    try {
      const updatedGoal = await goalService.update(habitId, goalId, data)
      set((state) => ({
        goals: {
          ...state.goals,
          [habitId]: (state.goals[habitId] || []).map((g) =>
            g.id === goalId ? updatedGoal : g
          ),
        },
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to update goal', loading: false })
    }
  },

  deleteGoal: async (habitId, goalId) => {
    set({ loading: true, error: null })
    try {
      await goalService.delete(habitId, goalId)
      set((state) => ({
        goals: {
          ...state.goals,
          [habitId]: (state.goals[habitId] || []).filter((g) => g.id !== goalId),
        },
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to delete goal', loading: false })
    }
  },
}))
