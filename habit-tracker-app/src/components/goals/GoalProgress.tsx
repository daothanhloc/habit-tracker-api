import React from 'react'
import type { GoalProgress as GoalProgressType } from '../../types/goal'
import { CheckCircle2, Circle } from 'lucide-react'

interface GoalProgressProps {
  progress: GoalProgressType
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ progress }) => {
  const { goal, currentProgress, percentage, isAchieved } = progress

  return (
    <div className={`p-4 rounded-lg border-2 ${isAchieved ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            {isAchieved ? (
              <CheckCircle2 className="text-green-600" size={20} />
            ) : (
              <Circle className="text-gray-400" size={20} />
            )}
            <h4 className="font-semibold text-gray-900">
              {goal.targetFrequency} times {goal.goalType}
            </h4>
          </div>
        </div>
        <span className={`text-sm font-medium ${isAchieved ? 'text-green-600' : 'text-gray-600'}`}>
          {currentProgress}/{goal.targetFrequency}
        </span>
      </div>

      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full transition-all ${
            isAchieved ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="mt-2 text-right text-sm text-gray-600">
        {percentage.toFixed(0)}% complete
      </div>
    </div>
  )
}
