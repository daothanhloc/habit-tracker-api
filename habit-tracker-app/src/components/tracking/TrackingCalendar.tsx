import React, { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, isToday } from 'date-fns'
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

  const firstDayOfMonth = getDay(startOfMonth(currentMonth))
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-lg"
              style={{ backgroundColor: habitColor }}
            ></div>
            <span className="text-gray-600">Completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">
            {day}
          </div>
        ))}

        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const completed = isCompleted(day)
          const today = isToday(day)

          return (
            <div
              key={day.toISOString()}
              className={`
                aspect-square flex items-center justify-center rounded-xl text-sm font-semibold
                transition-all duration-300 cursor-pointer relative
                ${completed
                  ? 'text-white shadow-lg scale-105'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:scale-105'
                }
                ${today && !completed ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
              `}
              style={completed ? {
                backgroundColor: habitColor,
                boxShadow: `0 4px 14px ${habitColor}40`
              } : {}}
            >
              {/* Today indicator */}
              {today && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
              )}
              {format(day, 'd')}
            </div>
          )
        })}
      </div>

      {/* Stats summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {trackingHistory.filter(t => isSameDay(new Date(t.completedAt), new Date()) || new Date(t.completedAt).getMonth() === currentMonth.getMonth()).length}
          </div>
          <div className="text-xs text-gray-600 mt-1">This Month</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {Math.round((trackingHistory.filter(t => new Date(t.completedAt).getMonth() === currentMonth.getMonth()).length / days.length) * 100) || 0}%
          </div>
          <div className="text-xs text-gray-600 mt-1">Completion</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {days.length - new Date().getDate()}
          </div>
          <div className="text-xs text-gray-600 mt-1">Days Left</div>
        </div>
      </div>
    </div>
  )
}
