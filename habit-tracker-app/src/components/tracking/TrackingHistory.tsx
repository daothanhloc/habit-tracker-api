import React from 'react'
import { format } from 'date-fns'
import type { HabitTracking } from '../../types/tracking'
import { Card } from '../common/Card'

interface TrackingHistoryProps {
  history: HabitTracking[]
}

export const TrackingHistory: React.FC<TrackingHistoryProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No tracking history yet. Start tracking to see your progress!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {history.map((tracking) => (
        <Card key={tracking.id} className="p-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-gray-900">
                {format(new Date(tracking.completedAt), 'MMM d, yyyy')}
              </div>
              {tracking.notes && (
                <p className="text-sm text-gray-600 mt-1">{tracking.notes}</p>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {format(new Date(tracking.completedAt), 'h:mm a')}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
