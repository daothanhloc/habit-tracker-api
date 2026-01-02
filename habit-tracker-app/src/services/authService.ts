import { apiClient } from './api'
import { AuthResponse, LoginCredentials, SignupCredentials } from '../types/auth'
import { tokenStorage } from './tokenStorage'

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', credentials)
    return response.data
  },

  refresh: async (): Promise<{ accessToken: string; refreshToken: string }> => {
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post('/auth/refresh', { refreshToken })
    return response.data
  },

  logout: async (accessToken: string): Promise<void> => {
    const refreshToken = tokenStorage.getRefreshToken()
    await apiClient.post(
      '/auth/logout',
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
  },
}
