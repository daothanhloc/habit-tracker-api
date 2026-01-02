// Using localStorage for refresh token (accessible approach)
// Access token will be stored in Zustand (in-memory)

const REFRESH_TOKEN_KEY = 'habitTracker_refreshToken'

export const tokenStorage = {
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },

  clearRefreshToken: (): void => {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  hasRefreshToken: (): boolean => {
    return !!localStorage.getItem(REFRESH_TOKEN_KEY)
  },
}
