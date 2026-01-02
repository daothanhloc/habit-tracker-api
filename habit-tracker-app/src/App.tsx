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

  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const fetchHabits = useHabitStore((state) => state.fetchHabits)

  // Expose auth store to window for axios interceptors (solve circular dependency)
  useEffect(() => {
    ;(window as any).__authStore__ = {
      get accessToken() {
        return useAuthStore.getState().accessToken
      },
      set accessToken(token: string | null) {
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
