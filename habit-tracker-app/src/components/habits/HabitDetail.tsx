import React, { useEffect, useState } from 'react'
import { useTrackingStore } from '../../store/trackingStore'
import { useGoalStore } from '../../store/goalStore'
import { TrackingCalendar } from '../tracking/TrackingCalendar'
import { StreakDisplay } from '../tracking/StreakDisplay'
import { GoalList } from '../goals/GoalList'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useHabitStore } from '../../store/habitStore'

interface HabitDetailProps {
  habitId: string
}

export const HabitDetail: React.FC<HabitDetailProps> = ({ habitId }) => {
  const { habits } = useHabitStore()
  const { trackingHistory, streaks, fetchHistory, fetchStreak, error } = useTrackingStore()
  const { fetchGoals } = useGoalStore()
  const [isLoadingStreak, setIsLoadingStreak] = useState(true)

  const habit = habits.find((h) => h.id === habitId)
  const history = trackingHistory[habitId] || []
  const streak = streaks[habitId]

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingStreak(true)
      try {
        await Promise.all([
          fetchHistory(habitId),
          fetchStreak(habitId),
          fetchGoals(habitId)
        ])
      } catch (err) {
        console.error('Error loading habit details:', err)
      } finally {
        setIsLoadingStreak(false)
      }
    }

    loadData()
  }, [habitId, fetchHistory, fetchStreak, fetchGoals])

  if (!habit) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Habit not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Show loading only initially, then show streak with actual data or defaults */}
      {isLoadingStreak && !streak ? (
        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-2xl">
          <LoadingSpinner />
        </div>
      ) : (
        <StreakDisplay
          streak={streak || null}
          isLoading={!streak}
        />
      )}

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-red-600 text-sm mt-1">Please check if the API is running correctly.</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Activity Calendar</h3>
        <TrackingCalendar trackingHistory={history} habitColor={habit.color} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Goals</h3>
        <GoalList habitId={habitId} />
      </div>
    </div>
  )
}
