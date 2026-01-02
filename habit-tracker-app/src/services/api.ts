import axios from 'axios'
import { tokenStorage } from './tokenStorage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Track if we're currently refreshing to avoid concurrent refresh calls
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Request interceptor: Add access token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Get access token from Zustand store (import dynamically to avoid circular dependency)
    const accessToken = (window as any).__authStore__?.accessToken

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: Handle 401 and refresh token automatically
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = tokenStorage.getRefreshToken()

      if (!refreshToken) {
        // No refresh token - clear auth state and redirect to login
        processQueue(error)
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        // Call refresh endpoint
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data

        // Update tokens
        tokenStorage.setRefreshToken(newRefreshToken)

        // Update auth store (use global reference to avoid circular dependency)
        if ((window as any).__authStore__) {
          (window as any).__authStore__.accessToken = newAccessToken
        }

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null)
        isRefreshing = false

        // Retry original request
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        isRefreshing = false
        tokenStorage.clearRefreshToken()

        // Clear auth state
        const authStore = (window as any).__authStore__
        if (authStore) {
          authStore.user = null
          authStore.accessToken = null
          authStore.isAuthenticated = false
        }

        return Promise.reject(refreshError)
      }
    }

    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
