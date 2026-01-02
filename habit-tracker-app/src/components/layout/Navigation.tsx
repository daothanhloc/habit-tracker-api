import React from 'react'
import { Home, Target, Bell } from 'lucide-react'

interface NavigationProps {
  currentView: 'habits' | 'goals' | 'notifications'
  onViewChange: (view: 'habits' | 'goals' | 'notifications') => void
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'habits' as const, label: 'Habits', icon: Home },
    { id: 'goals' as const, label: 'Goals', icon: Target },
    { id: 'notifications' as const, label: 'Reminders', icon: Bell },
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`
                relative flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200
                min-w-[120px] justify-center
                ${
                  currentView === id
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Icon size={20} />
              <span>{label}</span>

              {/* Active indicator */}
              {currentView === id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full"></div>
              )}

              {/* Hover effect */}
              {currentView !== id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 opacity-0 hover:opacity-100 transition-opacity rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
