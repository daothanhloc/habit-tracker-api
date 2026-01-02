import React from 'react'
import type { Habit } from '../../types/habit'
import { Edit, Trash2, Eye, CheckCircle2 } from 'lucide-react'
import { Button } from '../common/Button'

interface HabitCardProps {
  habit: Habit
  onEdit: (habit: Habit) => void
  onDelete: (id: string) => void
  onTrack: (habitId: string) => void
  onViewDetails: (habitId: string) => void
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onEdit,
  onDelete,
  onTrack,
  onViewDetails,
}) => {
  return (
    <div className="group relative animate-slide-in">
      {/* Gradient glow effect */}
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300"
        style={{
          background: `linear-gradient(135deg, ${habit.color}40, ${habit.color}20)`
        }}
      ></div>

      {/* Main card */}
      <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Color accent bar */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: habit.color }}
        ></div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                {habit.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {habit.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full border-2"
                style={{
                  borderColor: habit.color,
                  color: habit.color,
                  backgroundColor: `${habit.color}10`
                }}
              >
                {habit.frequency}
              </span>
            </div>
          </div>

          {/* Category badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: habit.color }}
              ></div>
              {habit.category}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => onTrack(habit.id)}
              variant="success"
              size="sm"
              className="flex-1"
            >
              <CheckCircle2 size={16} />
              <span className="hidden sm:inline">Track</span>
            </Button>
            <Button
              onClick={() => onViewDetails(habit.id)}
              variant="ghost"
              size="sm"
              className="px-3"
            >
              <Eye size={16} />
            </Button>
            <Button
              onClick={() => onEdit(habit)}
              variant="ghost"
              size="sm"
              className="px-3"
            >
              <Edit size={16} />
            </Button>
            <Button
              onClick={() => onDelete(habit.id)}
              variant="ghost"
              size="sm"
              className="px-3 text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
