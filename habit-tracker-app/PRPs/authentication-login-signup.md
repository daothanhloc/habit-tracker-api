# PRP: Authentication - Login, Signup, and Logout with Automatic Token Refresh

## Project Overview

Implement a complete authentication system for the Habit Tracker app including login, signup, logout screens, and automatic token refresh functionality. The implementation must integrate seamlessly with the existing React + TypeScript + Zustand + Tailwind CSS architecture and provide a secure, modern user experience.

### Feature Requirements (from login.md)

1. **Login Screen**: Allow users to authenticate with email and password
2. **Signup/Register Screen**: Allow new users to create accounts
3. **Logout Functionality**: Allow users to sign out and clear authentication state
4. **Automatic Token Refresh**: Silently refresh access tokens when they expire
5. **Protected Routes**: Restrict access to app features for unauthenticated users
6. **Persistent Sessions**: Keep users logged in across page refreshes

### Technology Stack

- **Framework**: React 18 with TypeScript
- **State Management**: Zustand (already in use)
- **HTTP Client**: Axios (already in use)
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **API Base URL**: Configured via `VITE_API_URL` environment variable

---

## Critical Context & Documentation

### API Endpoints (from login.md)

All authentication endpoints are already implemented on the backend:

**1. Signup**
```bash
POST /auth/signup
Body: { email: string, password: string, name: string }
Response: { accessToken: string, refreshToken: string, user: { id, email, name } }
```

**2. Login**
```bash
POST /auth/login
Body: { email: string, password: string }
Response: { accessToken: string, refreshToken: string, user: { id, email, name } }
```

**3. Refresh Token**
```bash
POST /auth/refresh
Body: { refreshToken: string }
Response: { accessToken: string, refreshToken: string }
```

**4. Logout**
```bash
POST /auth/logout
Headers: { Authorization: "Bearer ACCESS_TOKEN" }
Body: { refreshToken: string }
Response: 204 No Content
```

**5. Protected Routes Example**
```bash
GET /habits
Headers: { Authorization: "Bearer ACCESS_TOKEN" }
Response: Array of habits or 401 Unauthorized
```

### Existing Codebase Patterns to Follow

**Service Pattern** (from `src/services/habitService.ts`):
```typescript
// All services use apiClient and return typed responses
export const habitService = {
  getAll: async (): Promise<Habit[]> => {
    const response = await apiClient.get('/habits')
    return response.data
  },
}
```

**Zustand Store Pattern** (from `src/store/habitStore.ts`):
```typescript
// Stores manage state, loading, and errors with async actions
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
}))
```

**Component Pattern** (from `src/components/common/Input.tsx` & `Button.tsx`):
- Use existing `Input` and `Button` components for consistency
- Follow the gradient-based modern UI style with animations
- Use Tailwind classes matching the existing design system

**API Client** (from `src/services/api.ts`):
```typescript
// Centralized axios instance with interceptors
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})
```

**App Structure** (from `src/App.tsx`):
- No React Router - uses conditional rendering based on view state
- Views managed via local state: `const [currentView, setCurrentView] = useState<View>('habits')`
- Main app wrapped in Layout component

### External Documentation & Best Practices (2025)

**Authentication & JWT Token Management:**
- [React JWT Storage Guide](https://cybersierra.co/blog/react-jwt-storage-guide/) - Storage security comparison
- [JWT Token Storage Best Practices](https://satvikcoder.hashnode.dev/jwt-token-storage-localstorage-sessionstorage-or-cookies) - localStorage vs sessionStorage vs cookies
- [Developer's Guide to JWT Storage](https://www.descope.com/blog/post/developer-guide-jwt-storage) - Comprehensive security guide
- [JWT in localStorage Security Risks](https://nulldog.com/jwt-in-localstorage-with-react-security-risks-best-practices) - XSS attack vectors

**Automatic Token Refresh with Axios:**
- [axios-auth-refresh NPM package](https://www.npmjs.com/package/axios-auth-refresh) - Library for automatic refresh
- [Handling JWT Access and Refresh Token using Axios](https://blog.theashishmaurya.me/handling-jwt-access-and-refresh-token-using-axios-in-react-app) - Manual implementation guide
- [Token Refresh with Axios Interceptors](https://medium.com/@velja/token-refresh-with-axios-interceptors-for-a-seamless-authentication-experience-854b06064bde) - Seamless UX approach
- [How to Auto-Refresh JWT Tokens](https://blog.codingsprints.com/how-to-auto-refresh-jwt-tokens-in-react-with-axios-interceptors-8feaa74529de) - Step-by-step tutorial
- [Axios Interceptors Refresh Token Tutorial](https://www.bezkoder.com/axios-interceptors-refresh-token/) - Comprehensive guide

**React Authentication Patterns:**
- [JWT Authentication in React 2025](https://www.syncfusion.com/blogs/post/implement-jwt-authentication-in-react) - Recent best practices
- [React Auth with Access & Refresh Tokens](https://dev.to/zeeshanali0704/authentication-in-react-with-jwts-access-refresh-tokens-569i) - Complete guide
- [React Redux Toolkit Refresh Token 2025](https://codevoweb.com/react-redux-toolkit-refresh-token-authentication/) - Modern patterns
- [Handling JWT Tokens using Axios](https://medium.com/@aqeel_ahmad/handling-jwt-access-token-refresh-token-using-axios-in-react-react-native-app-2024-f452c96a83fc) - React Native compatible approach

**UI/UX Design Resources:**
- [Modern Login/Signup Form with Tailwind CSS](https://www.loginradius.com/blog/engineering/guest-post/modern-login-signup-form-tailwindcss-react) - Step-by-step tutorial
- [Tailwind CSS Login Form Examples](https://tw-elements.com/docs/react/forms/login-form/) - Free component library
- [Tailwind UI Sign-in Forms](https://tailwindui.com/components/application-ui/forms/sign-in-forms) - Official examples
- [175+ Free Login Forms in Tailwind](https://tailwindflex.com/tag/login) - Community examples
- [Building a Login Component with React & Tailwind](https://medium.com/@ryaddev/building-a-login-component-with-react-tailwind-css-and-react-icons-12cdcb26ed27) - Modern design patterns

**Protected Routes (without React Router):**
- [React Router Private Routes](https://www.robinwieruch.de/react-router-private-routes/) - Concepts applicable to conditional rendering
- [What are Protected Routes](https://www.geeksforgeeks.org/reactjs/what-are-protected-routes-in-react-js/) - Fundamentals
- [Implementing Protected Routes](https://medium.com/@yogeshmulecraft/implementing-protected-routes-in-react-js-b39583be0740) - Practical guide

---

## Implementation Blueprint

### Phase 1: Types & Interfaces

#### 1.1 Create Authentication Types

**File:** `src/types/auth.ts`

```typescript
export interface User {
  id: string
  email: string
  name: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  name: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  clearError: () => void
}
```

**Purpose:** Type safety for all authentication-related data and operations

---

### Phase 2: Token Storage Service

#### 2.1 Create Secure Token Storage Utility

**File:** `src/services/tokenStorage.ts`

```typescript
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
```

**Security Considerations:**
- Access token stored in memory only (Zustand state) - short-lived, not persistent
- Refresh token in localStorage for persistence across sessions
- While httpOnly cookies are more secure, localStorage is acceptable for refresh tokens with proper precautions
- Short-lived access tokens (typically 15-30 minutes) minimize exposure window
- Backend should implement token rotation and revocation

**Gotcha:** localStorage is vulnerable to XSS attacks - ensure all user input is sanitized and no inline scripts are used. Consider upgrading to httpOnly cookies in future iterations.

---

### Phase 3: Authentication Service

#### 3.1 Create Auth Service

**File:** `src/services/authService.ts`

```typescript
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
```

**Pattern Match:** Follows existing `habitService.ts` structure exactly

---

### Phase 4: Authentication Store

#### 4.1 Create Auth Store with Zustand

**File:** `src/store/authStore.ts`

```typescript
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
```

**Pattern Match:** Follows existing `habitStore.ts` structure with loading states and error handling

---

### Phase 5: Axios Interceptors for Automatic Token Refresh

#### 5.1 Update API Client with Token Injection and Refresh Logic

**File:** `src/services/api.ts` (UPDATE EXISTING FILE)

```typescript
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
        if ((window as any).__authStore__) {
          (window as any).__authStore__.user = null
          (window as any).__authStore__.accessToken = null
          (window as any).__authStore__.isAuthenticated = false
        }

        return Promise.reject(refreshError)
      }
    }

    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
```

**Critical Implementation Notes:**

1. **Preventing Concurrent Refresh Calls:** Uses `isRefreshing` flag and `failedQueue` to ensure only one refresh happens at a time
2. **Queue Failed Requests:** All requests that fail during refresh are queued and retried after successful refresh
3. **Circular Dependency Solution:** Uses global window reference to access auth store state
4. **Retry Logic:** `_retry` flag prevents infinite loops if refresh fails
5. **Direct axios call:** The refresh request bypasses the interceptor to avoid recursion

**Gotcha:** Circular dependency between api.ts and authStore.ts - solve with global reference pattern

---

### Phase 6: Initialize Auth State on App Load

#### 6.1 Create Auth Initialization Hook

**File:** `src/hooks/useAuthInit.ts`

```typescript
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { tokenStorage } from '../services/tokenStorage'

export const useAuthInit = () => {
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    // On app load, check if we have a refresh token
    const hasRefreshToken = tokenStorage.hasRefreshToken()

    if (hasRefreshToken && !isAuthenticated) {
      // Attempt to refresh and restore session
      refreshToken().catch((error) => {
        console.error('Failed to restore session:', error)
      })
    }
  }, []) // Only run once on mount

  return null
}
```

**Purpose:** Automatically restore user session on page refresh if valid refresh token exists

---

### Phase 7: UI Components - Auth Screens

#### 7.1 Login Component

**File:** `src/components/auth/LoginForm.tsx`

```typescript
import React, { useState } from 'react'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { useAuthStore } from '../../store/authStore'
import { LogIn, Mail, Lock } from 'lucide-react'

interface LoginFormProps {
  onSwitchToSignup: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const { login, isLoading, error, clearError } = useAuthStore()

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {}

    if (!email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) return

    try {
      await login({ email, password })
    } catch (err) {
      // Error is handled by the store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4">
              <LogIn className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue tracking your habits</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={validationErrors.email}
                  className="pl-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={validationErrors.password}
                  className="pl-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                disabled={isLoading}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**UI Pattern Match:**
- Uses existing `Input` and `Button` components
- Matches gradient styling from `Header.tsx`
- Uses lucide-react icons (already installed)
- Includes animations from `index.css` (`.animate-scale-in`)

---

#### 7.2 Signup Component

**File:** `src/components/auth/SignupForm.tsx`

```typescript
import React, { useState } from 'react'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { useAuthStore } from '../../store/authStore'
import { UserPlus, Mail, Lock, User } from 'lucide-react'

interface SignupFormProps {
  onSwitchToLogin: () => void
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const { signup, isLoading, error, clearError } = useAuthStore()

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {}

    if (!name || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) return

    try {
      await signup({ email, password, name: name.trim() })
    } catch (err) {
      // Error is handled by the store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4">
              <UserPlus className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">Create Account</h2>
            <p className="text-gray-600">Start your habit tracking journey today</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={validationErrors.name}
                  className="pl-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={validationErrors.email}
                  className="pl-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={validationErrors.password}
                  className="pl-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={validationErrors.confirmPassword}
                  className="pl-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

#### 7.3 Auth Container Component

**File:** `src/components/auth/AuthContainer.tsx`

```typescript
import React, { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

type AuthView = 'login' | 'signup'

export const AuthContainer: React.FC = () => {
  const [view, setView] = useState<AuthView>('login')

  return (
    <>
      {view === 'login' && (
        <LoginForm onSwitchToSignup={() => setView('signup')} />
      )}
      {view === 'signup' && (
        <SignupForm onSwitchToLogin={() => setView('login')} />
      )}
    </>
  )
}
```

**Purpose:** Simple container to toggle between login and signup views

---

### Phase 8: Protected Content & Logout

#### 8.1 Update Header with Logout Button

**File:** `src/components/layout/Header.tsx` (UPDATE EXISTING)

Add logout button when user is authenticated:

```typescript
import React from 'react'
import { Sparkles, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl overflow-hidden">
      {/* ... existing background shapes ... */}

      <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* ... existing title and icon ... */}
          </div>

          {/* User info and logout */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-white/80">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 transition-all duration-200 hover:scale-105"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
```

---

### Phase 9: Update App.tsx with Protected Routes

#### 9.1 Main App Logic with Authentication Guard

**File:** `src/App.tsx` (UPDATE EXISTING)

```typescript
import { useEffect, useState } from 'react'
import { useHabitStore } from './store/habitStore'
import { useAuthStore } from './store/authStore'
import { useAuthInit } from './hooks/useAuthInit'
import { Layout } from './components/layout/Layout'
import { Navigation } from './components/layout/Navigation'
import { HabitList } from './components/habits/HabitList'
import { NotificationSettings } from './components/notifications/NotificationSettings'
import { AuthContainer } from './components/auth/AuthContainer'
import { LoadingSpinner } from './components/common/LoadingSpinner'

type View = 'habits' | 'goals' | 'notifications'

function App() {
  const [currentView, setCurrentView] = useState<View>('habits')

  // Initialize auth on app load
  useAuthInit()

  const { isAuthenticated, isLoading: authLoading, accessToken } = useAuthStore()
  const fetchHabits = useHabitStore((state) => state.fetchHabits)

  // Expose auth store to window for axios interceptors (solve circular dependency)
  useEffect(() => {
    ;(window as any).__authStore__ = {
      get accessToken() {
        return useAuthStore.getState().accessToken
      },
      set accessToken(token: string) {
        useAuthStore.setState({ accessToken: token })
      },
      get user() {
        return useAuthStore.getState().user
      },
      set user(user: any) {
        useAuthStore.setState({ user })
      },
      get isAuthenticated() {
        return useAuthStore.getState().isAuthenticated
      },
      set isAuthenticated(value: boolean) {
        useAuthStore.setState({ isAuthenticated: value })
      },
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchHabits()
    }
  }, [isAuthenticated, fetchHabits])

  // Show loading spinner during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <LoadingSpinner />
      </div>
    )
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return <AuthContainer />
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Layout>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />

        <div className="mt-6">
          {currentView === 'habits' && <HabitList />}

          {currentView === 'goals' && (
            <div className="text-center py-12 text-gray-600">
              <p className="mb-4">Goals are managed within individual habit details.</p>
              <p className="text-sm">Open a habit to view and manage its goals.</p>
            </div>
          )}

          {currentView === 'notifications' && <NotificationSettings />}
        </div>
      </Layout>
    </div>
  )
}

export default App
```

**Key Changes:**
- Calls `useAuthInit()` to restore session on page load
- Shows `LoadingSpinner` during auth initialization
- Conditionally renders `AuthContainer` vs main app based on `isAuthenticated`
- Exposes auth store to window for axios interceptors (solves circular dependency)
- Fetches habits only when authenticated

---

## Error Handling Strategy

### Common Scenarios & Handling

1. **Network Errors:**
   - Display user-friendly error messages in auth forms
   - Use Zustand store's `error` state to show errors

2. **Invalid Credentials:**
   - Backend returns 401 with message
   - Display error in red alert box above form

3. **Token Refresh Failure:**
   - Automatically log out user
   - Clear tokens from storage
   - Redirect to login (via conditional rendering)

4. **Validation Errors:**
   - Client-side validation before API calls
   - Show field-specific errors using Input component's error prop

5. **Concurrent Requests During Refresh:**
   - Queue failed requests using `failedQueue` array
   - Retry all queued requests after successful refresh

---

## Testing Strategy

Since there are no existing tests in the codebase, manual testing will be sufficient:

### Manual Test Checklist

**Authentication Flow:**
```bash
# 1. Test Signup
- Open app (should show signup/login screen)
- Click "Sign up" link
- Fill in name, email, password
- Submit form
- Verify: redirected to main app with habits loaded

# 2. Test Login
- Logout using header button
- Verify: redirected to login screen
- Enter valid credentials
- Submit form
- Verify: redirected to main app

# 3. Test Invalid Credentials
- Enter wrong password
- Verify: error message displayed
- Verify: stays on login screen

# 4. Test Session Persistence
- Login successfully
- Refresh page
- Verify: still logged in (session restored)

# 5. Test Token Refresh (requires backend token expiry)
- Login successfully
- Wait for access token to expire (or manually set short expiry)
- Make API request (e.g., create habit)
- Verify: request succeeds (token refreshed automatically)

# 6. Test Logout
- Click logout button in header
- Verify: redirected to login screen
- Verify: cannot access protected routes
- Verify: refresh token cleared from localStorage

# 7. Test Protected Routes
- Logout completely
- Clear localStorage
- Refresh page
- Verify: login screen shown
- Verify: cannot access habits without auth
```

**Validation Testing:**
```bash
# Login form validation
- Submit empty form → see validation errors
- Enter invalid email → see email error
- Enter short password → see password error

# Signup form validation
- Submit empty form → see all validation errors
- Enter mismatched passwords → see password mismatch error
- Enter name with < 2 chars → see name error
```

**API Integration Testing (using provided curl commands):**
```bash
# Already provided in login.md:
- Test signup endpoint
- Test login endpoint
- Test protected habits endpoint
- Test refresh endpoint
- Test logout endpoint
```

---

## Implementation Tasks (In Order)

1. **Create Types**
   - [ ] Create `src/types/auth.ts` with all auth interfaces

2. **Create Token Storage**
   - [ ] Create `src/services/tokenStorage.ts` with localStorage utilities

3. **Create Auth Service**
   - [ ] Create `src/services/authService.ts` with API calls

4. **Create Auth Store**
   - [ ] Create `src/store/authStore.ts` with Zustand store

5. **Update API Client**
   - [ ] Update `src/services/api.ts` with token injection and refresh interceptors

6. **Create Auth Hook**
   - [ ] Create `src/hooks/useAuthInit.ts` for session restoration

7. **Create Auth UI Components**
   - [ ] Create `src/components/auth/` directory
   - [ ] Create `LoginForm.tsx`
   - [ ] Create `SignupForm.tsx`
   - [ ] Create `AuthContainer.tsx`

8. **Update Existing Components**
   - [ ] Update `src/components/layout/Header.tsx` with logout button
   - [ ] Update `src/App.tsx` with auth guard and conditional rendering

9. **Manual Testing**
   - [ ] Test complete signup flow
   - [ ] Test login flow
   - [ ] Test logout flow
   - [ ] Test session persistence (refresh page)
   - [ ] Test automatic token refresh
   - [ ] Test form validations
   - [ ] Test error handling

---

## Common Gotchas & Solutions

### 1. Circular Dependency (api.ts ↔ authStore.ts)

**Problem:** api.ts needs access to auth store for tokens, but auth store imports api client for requests

**Solution:** Use global window reference to expose minimal auth store interface:
```typescript
// In App.tsx
(window as any).__authStore__ = {
  get accessToken() { return useAuthStore.getState().accessToken },
  set accessToken(token) { useAuthStore.setState({ accessToken: token }) },
}

// In api.ts
const accessToken = (window as any).__authStore__?.accessToken
```

### 2. Concurrent Token Refresh Calls

**Problem:** Multiple failed requests (401) might trigger multiple refresh calls simultaneously

**Solution:** Use `isRefreshing` flag and queue failed requests:
```typescript
let isRefreshing = false
let failedQueue = []

// If already refreshing, queue the request
if (isRefreshing) {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject })
  }).then(() => apiClient(originalRequest))
}
```

### 3. Infinite Refresh Loop

**Problem:** If refresh endpoint also returns 401, it creates infinite loop

**Solution:** Use `_retry` flag on request config:
```typescript
if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true
  // ... refresh logic
}
```

### 4. Token Not Included in First Request After Refresh

**Problem:** Access token in store updates but request interceptor uses old value

**Solution:** Update the original request config before retrying:
```typescript
originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
return apiClient(originalRequest)
```

### 5. XSS Vulnerability with localStorage

**Problem:** localStorage is accessible via JavaScript, vulnerable to XSS attacks

**Mitigation:**
- Store only refresh token in localStorage (long-lived but less used)
- Store access token in memory only (Zustand state, lost on refresh)
- Short-lived access tokens (15-30 min)
- Sanitize all user inputs
- Use Content Security Policy headers
- Consider upgrading to httpOnly cookies in future

### 6. TypeScript Errors with Axios Error Handling

**Problem:** `error.response` might be undefined

**Solution:** Use optional chaining and type guards:
```typescript
catch (error: any) {
  const message = error.response?.data?.message || 'Request failed'
  set({ error: message, isLoading: false })
}
```

---

## Validation Gates (Executable Commands)

Since this is a frontend TypeScript project, validation focuses on TypeScript compilation and linting:

```bash
# 1. TypeScript Compilation Check
npm run build
# Expected: No type errors, successful build

# 2. Linting
npm run lint
# Expected: No linting errors

# 3. Development Server (for manual testing)
npm run dev
# Expected: Server starts on http://localhost:5173

# 4. Manual Testing Checklist
# Follow "Testing Strategy" section above
# All manual tests should pass
```

**Note:** The existing project does not have automated tests configured. All testing will be manual following the test checklist above.

---

## File Structure Summary

```
src/
├── types/
│   └── auth.ts                    # NEW: Auth interfaces
├── services/
│   ├── api.ts                     # UPDATED: Add interceptors
│   ├── authService.ts             # NEW: Auth API calls
│   └── tokenStorage.ts            # NEW: Token persistence
├── store/
│   └── authStore.ts               # NEW: Auth state management
├── hooks/
│   └── useAuthInit.ts             # NEW: Session restoration hook
├── components/
│   ├── auth/                      # NEW DIRECTORY
│   │   ├── LoginForm.tsx          # NEW: Login UI
│   │   ├── SignupForm.tsx         # NEW: Signup UI
│   │   └── AuthContainer.tsx      # NEW: Auth view switcher
│   └── layout/
│       └── Header.tsx             # UPDATED: Add logout button
└── App.tsx                        # UPDATED: Add auth guard
```

---

## Success Criteria

Authentication implementation is complete when:

- ✅ Users can sign up with email, password, and name
- ✅ Users can log in with email and password
- ✅ Users can log out and tokens are cleared
- ✅ Access tokens are automatically refreshed when expired
- ✅ Sessions persist across page refreshes
- ✅ Unauthenticated users cannot access protected content
- ✅ All API requests include valid access tokens
- ✅ Form validation provides clear error messages
- ✅ Loading states display during async operations
- ✅ Error states show user-friendly messages
- ✅ UI matches existing design system (gradients, animations, Tailwind)
- ✅ TypeScript compilation succeeds with no errors
- ✅ All manual test cases pass

---

## Confidence Score: 9/10

**Rationale for High Confidence:**

✅ **Strengths:**
1. Comprehensive research with 20+ documentation sources
2. Follows existing codebase patterns exactly (Zustand, services, components)
3. Detailed pseudocode for all critical logic (interceptors, token refresh)
4. Clear solutions for common gotchas (circular deps, concurrent refreshes)
5. Executable validation gates defined
6. Step-by-step implementation order provided
7. Complete file structure and code examples
8. Security considerations documented
9. Manual testing checklist covers all scenarios

✅ **Why Not 10/10:**
1. No automated tests (manual testing only) - risk of human error
2. localStorage security consideration (XSS vulnerability) - acceptable but not optimal
3. Global window reference for auth store is a workaround (not elegant)
4. Cannot test token refresh without backend configuration (short token expiry)

**Mitigation for -1 point:**
- Manual testing checklist is very thorough
- All common pitfalls documented with solutions
- Code examples are complete and copy-pasteable
- Follows established patterns from existing working code

**Overall:** This PRP provides everything needed for one-pass implementation. The AI agent has clear guidance, complete code examples, and solutions to all known gotchas. Success depends on careful attention to the interceptor logic and avoiding the documented pitfalls.
