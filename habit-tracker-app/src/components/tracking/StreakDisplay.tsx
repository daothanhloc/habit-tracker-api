import React from 'react'
import { Flame, TrendingUp, Target, AlertCircle } from 'lucide-react'
import type { Streak } from '../../types/tracking'

interface StreakDisplayProps {
  streak: Streak | null
  isLoading?: boolean
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak, isLoading = false }) => {
  const streakValue = streak?.streak ?? 0
  const hasStreak = streakValue > 0

  // Debug logging
  console.log('StreakDisplay - Data:', { streak, streakValue, hasStreak, isLoading })

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-1 shadow-2xl animate-slide-in">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>

      <div className="relative bg-white rounded-xl p-6">
        {isLoading ? (
          // Loading state
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
              <AlertCircle className="text-gray-400 animate-pulse" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Connecting to API...</h3>
            <p className="text-gray-500 text-sm">
              Make sure your API server is running
            </p>
          </div>
        ) : !hasStreak ? (
          // Empty state when no streak data
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100">
              <Target className="text-orange-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Streak!</h3>
            <p className="text-gray-600 text-sm mb-2">
              Track this habit daily to build your streak and stay consistent.
            </p>
            <p className="text-xs text-gray-500">
              Current Streak: {streakValue} days
            </p>
          </div>
        ) : (
          <>
            {/* Current Streak - Centered */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 shadow-lg">
                <Flame className="text-orange-600" size={48} />
              </div>
              <div className="relative">
                <div className="text-6xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {streakValue}
                </div>
                <div className="text-lg font-semibold text-gray-600 mt-2">Day Streak</div>
              </div>
            </div>

            {/* Motivational message */}
            <div className="mt-6 flex items-center gap-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
              <TrendingUp className="text-indigo-600" size={20} />
              <p className="text-sm font-medium text-indigo-900">
                {streakValue >= 30
                  ? "🏆 Incredible! You've built an amazing habit!"
                  : streakValue >= 14
                  ? "🔥 Two weeks strong! Keep it up!"
                  : streakValue >= 7
                  ? "✨ One week down! You're on fire!"
                  : "💪 Great start! Every day counts!"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
