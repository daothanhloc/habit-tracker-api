# PRP: Habit Tracker Frontend Application

## Project Overview

Build a Progressive Web App (PWA) habit tracker frontend using React, TypeScript, and Tailwind CSS that integrates with an existing Habit Tracker API. The app must work seamlessly on both laptop and mobile devices (via Safari "Add to Home Screen" functionality).

### Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4+ (with @tailwindcss/vite plugin)
- **State Management**: Zustand
- **PWA**: Service Worker + Web App Manifest
- **Notifications**: Web Notifications API
- **API**: RESTful API (documented in `postman_collection.json`)

### Core Features

1. **Habit Management**: Create, read, update, delete habits
2. **Habit Tracking**: Log completions, view history, track streaks
3. **Goal Management**: Set consistency goals, track progress
4. **Reminders**: Notifications to track habits
5. **Mobile-First**: Responsive design, PWA installable on mobile

---

## Critical Context & Documentation

### API Endpoints (from postman_collection.json)

**Habits CRUD:**
- `POST /habits` - Create habit (name, description, frequency, category, color)
- `GET /habits` - Get all habits
- `GET /habits/:id` - Get specific habit
- `PUT /habits/:id` - Update habit
- `DELETE /habits/:id` - Delete habit

**Habit Tracking:**
- `POST /habits/:id/track` - Log completion (notes, completedAt optional)
- `GET /habits/:id/history?limit=30` - Get tracking history
- `GET /habits/:id/streak` - Get current streak

**Habit Goals:**
- `POST /habits/:id/goals` - Create goal (targetFrequency, goalType: weekly/monthly/yearly)
- `GET /habits/:id/goals` - Get all goals for habit
- `GET /habits/:id/goals/:goalId` - Get goal progress
- `PUT /habits/:id/goals/:goalId` - Update goal
- `DELETE /habits/:id/goals/:goalId` - Delete goal

**Base URL**: Configurable via environment variable (default: `http://localhost:3000`)

### External Documentation & Resources

**2025 Setup Guides:**
- [Tailwind CSS v4 with Vite](https://tailwindcss.com/docs/installation/using-vite) - Official v4 installation
- [Tailwind Vite Plugin](https://www.npmjs.com/package/@tailwindcss/vite) - New plugin for v4
- [How to Setup Tailwind CSS v4 with Vite + React (2025)](https://dev.to/imamifti056/how-to-setup-tailwind-css-v415-with-vite-react-2025-updated-guide-3koc)

**PWA Implementation:**
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) - Recommended for Vite projects
- [MDN: Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
- [PWA Complete Guide 2025 - React](https://void.ma/en/publications/pwa-progressive-web-app-guide-complet-react-2025/)
- [How to Build a Progressive Web App with React in 2025](https://beadaptify.com/blog/how-to-build-a-progressive-web-app-with-react/)

**State Management:**
- [Zustand Documentation](https://github.com/pmndrs/zustand) - Lightweight state management
- [React State Management in 2025: Context API vs Zustand](https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m)
- [State Management in 2025: When to Use Zustand](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)

**Notifications API:**
- [MDN: Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [How to Implement Push Notifications in PWA using React](https://sichii.medium.com/how-to-implement-push-notifications-in-pwa-using-react-fd689f8394d3)
- [MDN: Re-engageable Notifications and Push](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Re-engageable_Notifications_Push)

**Habit Tracker UI Patterns:**
- [How to Build a Habit Tracker Calendar](https://www.rapidnative.com/blogs/habit-tracker-calendar)
- [GitHub: react-habit-tracker](https://github.com/nicopanozo/react-habit-tracker) - Example implementation
- [Creating a Habit Tracker App using Typescript, React, and Tailwind](https://dev.to/zackderose/creating-a-habit-tracker-app-using-typescript-react-and-tailwind-183c)
- [GitHub: habitrack](https://github.com/domhhv/habitrack) - Calendar view example

---

## Implementation Blueprint

### Phase 1: Project Setup & Foundation

#### 1.1 Initialize Vite + React + TypeScript

```bash
npm create vite@latest . -- --template react-ts
npm install
```

#### 1.2 Install & Configure Tailwind CSS v4

**Key Change in 2025**: Tailwind v4+ uses a new setup method with `@tailwindcss/vite` plugin

```bash
npm install tailwindcss@next @tailwindcss/vite
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**src/index.css:**
```css
@import "tailwindcss";
```

**GOTCHA**: Do NOT create `tailwind.config.js` or `postcss.config.js` - v4 doesn't need them!

#### 1.3 Install Additional Dependencies

```bash
# State management
npm install zustand

# PWA support
npm install -D vite-plugin-pwa workbox-window

# API client
npm install axios

# Date handling
npm install date-fns

# Icons (optional but recommended)
npm install lucide-react
```

#### 1.4 Project Structure

```
habit-tracker-app/
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon-192x192.png
│       ├── icon-512x512.png
│       └── apple-touch-icon.png
├── src/
│   ├── components/
│   │   ├── habits/
│   │   │   ├── HabitList.tsx
│   │   │   ├── HabitCard.tsx
│   │   │   ├── HabitForm.tsx
│   │   │   └── HabitDetail.tsx
│   │   ├── tracking/
│   │   │   ├── TrackingCalendar.tsx
│   │   │   ├── StreakDisplay.tsx
│   │   │   └── TrackingHistory.tsx
│   │   ├── goals/
│   │   │   ├── GoalForm.tsx
│   │   │   ├── GoalProgress.tsx
│   │   │   └── GoalList.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Layout.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Card.tsx
│   ├── store/
│   │   ├── habitStore.ts
│   │   ├── trackingStore.ts
│   │   └── goalStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── habitService.ts
│   │   ├── trackingService.ts
│   │   └── goalService.ts
│   ├── utils/
│   │   ├── dateHelpers.ts
│   │   ├── streakCalculator.ts
│   │   └── notifications.ts
│   ├── types/
│   │   ├── habit.ts
│   │   ├── tracking.ts
│   │   └── goal.ts
│   ├── hooks/
│   │   ├── useHabits.ts
│   │   ├── useTracking.ts
│   │   └── useNotifications.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .env
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Phase 2: PWA Configuration

#### 2.1 Configure Vite PWA Plugin

**vite.config.ts (updated):**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Habit Tracker',
        short_name: 'Habits',
        description: 'Track your habits and maintain consistency',
        theme_color: '#3B82F6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
```

**GOTCHA**: Service workers only work over HTTPS (except localhost). For production, ensure HTTPS is enabled.

#### 2.2 Create PWA Icons

Generate icons in these sizes:
- 192x192px (required)
- 512x512px (required)
- 180x180px (apple-touch-icon.png for iOS)

**Tool**: Use https://realfavicongenerator.net/ or similar

### Phase 3: API Integration Layer

#### 3.1 Environment Configuration

**.env.example:**
```
VITE_API_URL=http://localhost:3000
```

**.env:**
```
VITE_API_URL=http://localhost:3000
```

**GOTCHA**: Vite requires `VITE_` prefix for environment variables to be exposed to client code.

#### 3.2 API Client Setup

**src/services/api.ts:**
```typescript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request/response interceptors for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors, API errors, etc.
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
```

#### 3.3 Service Layer Pattern

**src/services/habitService.ts:**
```typescript
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
```

**Pattern**: Create similar services for `trackingService.ts` and `goalService.ts`.

### Phase 4: State Management with Zustand

#### 4.1 Habit Store

**src/store/habitStore.ts:**
```typescript
import { create } from 'zustand'
import type { Habit } from '../types/habit'
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
```

**Why Zustand over Context API**: Better performance (no unnecessary re-renders), simpler boilerplate, and scales better for medium-sized apps.

**Pattern**: Create similar stores for tracking and goals.

### Phase 5: TypeScript Types

**src/types/habit.ts:**
```typescript
export interface Habit {
  id: string
  name: string
  description: string
  frequency: 'daily' | 'weekly' | 'custom'
  category: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface CreateHabitDto {
  name: string
  description: string
  frequency: string
  category: string
  color: string
}

export interface UpdateHabitDto extends Partial<CreateHabitDto> {}
```

**src/types/tracking.ts:**
```typescript
export interface HabitTracking {
  id: string
  habitId: string
  completedAt: string
  notes?: string
  createdAt: string
}

export interface Streak {
  current: number
  longest: number
  lastCompletedAt: string | null
}

export interface TrackHabitDto {
  notes?: string
  completedAt?: string
}
```

**src/types/goal.ts:**
```typescript
export interface HabitGoal {
  id: string
  habitId: string
  targetFrequency: number
  goalType: 'weekly' | 'monthly' | 'yearly'
  createdAt: string
  updatedAt: string
}

export interface GoalProgress {
  goal: HabitGoal
  currentProgress: number
  percentage: number
  isAchieved: boolean
}

export interface CreateGoalDto {
  targetFrequency: number
  goalType: 'weekly' | 'monthly' | 'yearly'
}
```

### Phase 6: Core Components

#### 6.1 Common Components (Tailwind v4 styling)

**src/components/common/Button.tsx:**
```typescript
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'rounded-lg font-medium transition-colors'

  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Mobile-First Tailwind Pattern**: Start with mobile styles, use responsive prefixes (`sm:`, `md:`, `lg:`) for larger screens.

#### 6.2 Habit Components

**src/components/habits/HabitCard.tsx:**
```typescript
import React from 'react'
import type { Habit } from '../../types/habit'

interface HabitCardProps {
  habit: Habit
  onEdit: (habit: Habit) => void
  onDelete: (id: string) => void
  onTrack: (habitId: string) => void
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onEdit,
  onDelete,
  onTrack,
}) => {
  return (
    <div
      className="p-4 rounded-lg border-l-4 bg-white shadow-sm"
      style={{ borderLeftColor: habit.color }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
          <p className="text-sm text-gray-600">{habit.description}</p>
        </div>
        <span className="px-2 py-1 text-xs bg-gray-100 rounded">
          {habit.frequency}
        </span>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onTrack(habit.id)}
          className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Track
        </button>
        <button
          onClick={() => onEdit(habit)}
          className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
```

**Design Pattern**: Card-based UI with color-coded left border for visual habit identification.

#### 6.3 Tracking Calendar Component

**src/components/tracking/TrackingCalendar.tsx:**
```typescript
import React, { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import type { HabitTracking } from '../../types/tracking'

interface TrackingCalendarProps {
  trackingHistory: HabitTracking[]
  habitColor: string
}

export const TrackingCalendar: React.FC<TrackingCalendarProps> = ({
  trackingHistory,
  habitColor,
}) => {
  const currentMonth = new Date()

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    })
  }, [currentMonth])

  const isCompleted = (day: Date) => {
    return trackingHistory.some((tracking) =>
      isSameDay(new Date(tracking.completedAt), day)
    )
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-center text-xs font-semibold text-gray-500">
          {day}
        </div>
      ))}

      {days.map((day) => {
        const completed = isCompleted(day)
        return (
          <div
            key={day.toISOString()}
            className={`
              aspect-square flex items-center justify-center rounded
              text-sm font-medium
              ${completed ? 'text-white' : 'text-gray-700 bg-gray-100'}
            `}
            style={completed ? { backgroundColor: habitColor } : {}}
          >
            {format(day, 'd')}
          </div>
        )
      })}
    </div>
  )
}
```

**UI Pattern**: GitHub-style contribution calendar with date-fns for date handling. Use `useMemo` for performance optimization.

#### 6.4 Streak Display

**src/components/tracking/StreakDisplay.tsx:**
```typescript
import React from 'react'
import type { Streak } from '../../types/tracking'

interface StreakDisplayProps {
  streak: Streak
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak }) => {
  return (
    <div className="flex gap-4 p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg">
      <div className="flex-1 text-center">
        <div className="text-3xl font-bold text-orange-600">
          {streak.current}
        </div>
        <div className="text-sm text-gray-600">Current Streak</div>
      </div>

      <div className="flex-1 text-center border-l border-orange-300 pl-4">
        <div className="text-3xl font-bold text-yellow-600">
          {streak.longest}
        </div>
        <div className="text-sm text-gray-600">Longest Streak</div>
      </div>
    </div>
  )
}
```

**Design Pattern**: Duolingo-inspired streak display with gradient background for visual appeal.

### Phase 7: Notifications Implementation

**src/utils/notifications.ts:**
```typescript
export class NotificationManager {
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return 'denied'
    }

    return await Notification.requestPermission()
  }

  static async showNotification(title: string, options?: NotificationOptions) {
    const permission = await this.requestPermission()

    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options,
      })
    }
  }

  static scheduleHabitReminder(habitName: string, time: string) {
    // Use Web Notifications API for reminders
    // For production, consider using service worker for background notifications
    const targetTime = new Date(time).getTime()
    const now = Date.now()
    const delay = targetTime - now

    if (delay > 0) {
      setTimeout(() => {
        this.showNotification('Habit Reminder', {
          body: `Time to track: ${habitName}`,
          tag: 'habit-reminder',
        })
      }, delay)
    }
  }
}
```

**GOTCHA**: Notifications require user permission. Request it at appropriate times (not immediately on page load).

**Usage in components:**
```typescript
import { NotificationManager } from '../utils/notifications'

// Request permission when user enables reminders
const handleEnableReminders = async () => {
  const permission = await NotificationManager.requestPermission()
  if (permission === 'granted') {
    // Set up reminders
  }
}
```

### Phase 8: Mobile Responsiveness

**Key Tailwind Patterns:**

```typescript
// Mobile-first: base styles for mobile, breakpoints for larger screens
<div className="
  p-4
  sm:p-6
  md:p-8
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  gap-4
">
```

**Touch-friendly interactions:**
```typescript
// Larger tap targets for mobile (min 44x44px)
<button className="min-h-[44px] min-w-[44px] px-4 py-3">
  Track
</button>

// Prevent text selection on double-tap
<div className="select-none">
  Calendar view
</div>
```

**Viewport configuration in index.html:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### Phase 9: Error Handling & Loading States

**Pattern for all async operations:**
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const handleAction = async () => {
  setLoading(true)
  setError(null)

  try {
    await someAsyncOperation()
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Something went wrong')
  } finally {
    setLoading(false)
  }
}
```

**Loading component:**
```typescript
export const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
)
```

---

## Implementation Task Checklist

### Foundation (Complete in Order)

1. **Project Initialization**
   - [ ] Create Vite + React + TypeScript project
   - [ ] Install Tailwind CSS v4 with @tailwindcss/vite plugin
   - [ ] Configure vite.config.ts with React and Tailwind plugins
   - [ ] Set up index.css with `@import "tailwindcss"`
   - [ ] Verify Tailwind is working (test utility classes)

2. **Dependencies Installation**
   - [ ] Install Zustand for state management
   - [ ] Install vite-plugin-pwa and workbox-window
   - [ ] Install axios for API calls
   - [ ] Install date-fns for date handling
   - [ ] Install lucide-react for icons

3. **Project Structure**
   - [ ] Create directory structure (components, services, store, types, utils, hooks)
   - [ ] Set up .env.example and .env files
   - [ ] Configure environment variables (VITE_API_URL)

4. **PWA Configuration**
   - [ ] Update vite.config.ts with VitePWA plugin
   - [ ] Create/generate PWA icons (192x192, 512x512, apple-touch-icon)
   - [ ] Configure manifest.json via plugin
   - [ ] Test PWA installability

### API Integration

5. **API Client Setup**
   - [ ] Create api.ts with axios instance
   - [ ] Configure base URL from environment variable
   - [ ] Add error interceptors
   - [ ] Test API connectivity

6. **TypeScript Types**
   - [ ] Define Habit types (habit.ts)
   - [ ] Define Tracking types (tracking.ts)
   - [ ] Define Goal types (goal.ts)

7. **Service Layer**
   - [ ] Create habitService.ts (CRUD operations)
   - [ ] Create trackingService.ts (track, history, streak)
   - [ ] Create goalService.ts (CRUD, progress)

8. **State Management**
   - [ ] Create habitStore.ts with Zustand
   - [ ] Create trackingStore.ts with Zustand
   - [ ] Create goalStore.ts with Zustand
   - [ ] Test store operations

### UI Components

9. **Common Components**
   - [ ] Create Button component with variants
   - [ ] Create Input component
   - [ ] Create Modal component
   - [ ] Create Card component
   - [ ] Create LoadingSpinner component

10. **Layout Components**
    - [ ] Create Header component
    - [ ] Create Navigation component
    - [ ] Create Layout wrapper
    - [ ] Test responsive layout

11. **Habit Components**
    - [ ] Create HabitList component
    - [ ] Create HabitCard component
    - [ ] Create HabitForm component (create/edit)
    - [ ] Create HabitDetail view
    - [ ] Test habit CRUD operations

12. **Tracking Components**
    - [ ] Create TrackingCalendar component
    - [ ] Create StreakDisplay component
    - [ ] Create TrackingHistory list
    - [ ] Create quick-track button
    - [ ] Test tracking functionality

13. **Goal Components**
    - [ ] Create GoalForm component
    - [ ] Create GoalProgress component
    - [ ] Create GoalList component
    - [ ] Test goal CRUD and progress display

### Features

14. **Notifications**
    - [ ] Create NotificationManager utility
    - [ ] Implement permission request flow
    - [ ] Implement reminder scheduling
    - [ ] Add notification settings UI
    - [ ] Test notifications on mobile

15. **Mobile Optimization**
    - [ ] Ensure all components are touch-friendly (min 44px targets)
    - [ ] Test responsive design on mobile devices
    - [ ] Add viewport meta tag
    - [ ] Test PWA "Add to Home Screen" on Safari (iOS)
    - [ ] Verify offline functionality

16. **Error Handling**
    - [ ] Add error boundaries
    - [ ] Implement loading states for all async operations
    - [ ] Add user-friendly error messages
    - [ ] Test error scenarios (network failure, API errors)

### Documentation & Polish

17. **Environment Setup**
    - [ ] Create comprehensive .env.example
    - [ ] Document all environment variables

18. **README Documentation**
    - [ ] Add project overview
    - [ ] Document setup instructions
    - [ ] Explain how to configure API_URL
    - [ ] Document project structure
    - [ ] Add development commands
    - [ ] Add build/deployment instructions
    - [ ] Include PWA installation guide

19. **Code Quality**
    - [ ] Run TypeScript type checking
    - [ ] Run ESLint (if configured)
    - [ ] Remove console.logs (except intentional)
    - [ ] Test all features end-to-end

---

## Validation Gates

Run these commands in order to validate the implementation:

### 1. Type Checking
```bash
npx tsc --noEmit
```
**Expected**: No type errors

### 2. Build Process
```bash
npm run build
```
**Expected**: Successful build, no errors

### 3. Preview Production Build
```bash
npm run preview
```
**Expected**: App runs successfully

### 4. PWA Validation
Use Chrome DevTools:
1. Open DevTools → Application → Manifest
2. Verify manifest.json loads correctly
3. Check Service Worker registration
4. Verify icons display

**Expected**: All PWA criteria met

### 5. Mobile Testing
```bash
# Start dev server
npm run dev

# Test on mobile device (use local IP)
# Example: http://192.168.1.x:5173
```

**Expected**:
- App loads on mobile
- Touch interactions work
- "Add to Home Screen" available (Safari iOS)
- Responsive layout adapts correctly

### 6. API Integration Test
**Manual**:
1. Create a habit → verify POST request
2. View habits → verify GET request
3. Update habit → verify PUT request
4. Delete habit → verify DELETE request
5. Track habit → verify tracking endpoints
6. View streak → verify streak calculation
7. Create goal → verify goal endpoints

**Expected**: All API calls succeed with correct data

### 7. Notifications Test
1. Enable notifications → permission prompt appears
2. Set reminder → notification fires at scheduled time

**Expected**: Notifications work on supported browsers

---

## Common Gotchas & Solutions

### 1. Tailwind v4 Setup
**Gotcha**: Following old v3 setup instructions (tailwind.config.js, PostCSS)
**Solution**: Use `@tailwindcss/vite` plugin, import in CSS only

### 2. Environment Variables
**Gotcha**: Environment variables not loading
**Solution**: Ensure `VITE_` prefix, restart dev server after changes

### 3. Service Worker Caching
**Gotcha**: Old service worker serving stale content
**Solution**: Use "autoUpdate" registration type, clear cache in DevTools during dev

### 4. iOS PWA Issues
**Gotcha**: PWA features limited on iOS
**Solution**:
- Use apple-touch-icon for iOS icon
- Test "Add to Home Screen" specifically on Safari
- Some features (like push notifications) may not work on iOS

### 5. CORS Errors
**Gotcha**: API requests blocked by CORS
**Solution**: Ensure backend has CORS configured for frontend origin

### 6. Date Handling Across Timezones
**Gotcha**: Streak calculations incorrect due to timezone issues
**Solution**: Use date-fns with consistent timezone handling, store dates in ISO format

### 7. State Management Re-renders
**Gotcha**: Entire component tree re-renders on state change
**Solution**: Use Zustand selectors to subscribe to specific state slices:
```typescript
const habits = useHabitStore((state) => state.habits)
```

### 8. Mobile Touch Delays
**Gotcha**: 300ms click delay on mobile
**Solution**: Use modern browsers (automatic) or add `touch-action: manipulation` CSS

---

## Quality Checklist

- [ ] All features from API spec implemented
- [ ] Mobile-responsive (tested on actual mobile device)
- [ ] PWA installable on mobile (Safari iOS tested)
- [ ] Notifications working (permission flow implemented)
- [ ] .env.example created with all variables
- [ ] README complete with setup instructions
- [ ] Project structure documented
- [ ] TypeScript compilation passes
- [ ] Build process succeeds
- [ ] No console errors in production build
- [ ] Loading states for all async operations
- [ ] Error handling for all API calls
- [ ] Touch targets minimum 44x44px
- [ ] Offline functionality (service worker caching)
- [ ] Calendar view shows tracking history
- [ ] Streak calculations accurate
- [ ] Goal progress displays correctly

---

## Success Criteria

The implementation is complete when:

1. User can create/edit/delete habits
2. User can track habits daily with calendar view
3. User can see current and longest streaks
4. User can set and track consistency goals
5. User receives notifications for habit reminders
6. App is fully responsive on mobile and desktop
7. App can be installed as PWA on mobile (iOS Safari)
8. All validation gates pass
9. README provides clear setup instructions
10. Environment variables documented in .env.example

---

## Implementation Confidence Score: 8.5/10

**Rationale:**

**Strengths (+):**
- Comprehensive API documentation available
- Clear technology stack with 2025 best practices
- Detailed component patterns and code examples
- PWA implementation well-documented
- State management pattern proven (Zustand)
- Mobile-first approach with Tailwind CSS v4

**Potential Challenges (-):**
- iOS PWA limitations (push notifications may not work)
- Service worker debugging can be tricky
- Notifications API browser compatibility varies
- Calendar/streak calculations need careful timezone handling

**Mitigation:**
- Thorough testing on actual mobile devices required
- Use fallbacks for unsupported features (graceful degradation)
- Detailed error handling throughout
- Clear validation gates to catch issues early

With careful attention to the gotchas section and thorough testing, one-pass implementation is highly achievable.
