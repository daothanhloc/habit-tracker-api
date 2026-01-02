import { create } from 'zustand'
import { AuthState, LoginCredentials, SignupCredentials } from '../types/auth'
import { authService } from '../services/authService'
import { tokenStorage } from '../services/tokenStorage'

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authService.login(credentials)
      tokenStorage.setRefreshToken(data.refreshToken)
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  signup: async (credentials: SignupCredentials) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authService.signup(credentials)
      tokenStorage.setRefreshToken(data.refreshToken)
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Signup failed',
        isLoading: false,
      })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null })
    try {
      const { accessToken } = get()
      if (accessToken) {
        await authService.logout(accessToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      tokenStorage.clearRefreshToken()
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  refreshToken: async () => {
    try {
      const data = await authService.refresh()
      tokenStorage.setRefreshToken(data.refreshToken)
      set({
        accessToken: data.accessToken,
      })
    } catch (error) {
      // If refresh fails, log out the user
      tokenStorage.clearRefreshToken()
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: 'Session expired. Please login again.',
      })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
