import React, { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useGoalStore } from '../../store/goalStore'
import { GoalForm } from './GoalForm'
import { GoalProgress } from './GoalProgress'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Card } from '../common/Card'

interface GoalListProps {
  habitId: string
}

export const GoalList: React.FC<GoalListProps> = ({ habitId }) => {
  const { goals, goalProgress, createGoal, deleteGoal, fetchGoalProgress } = useGoalStore()
  const [showForm, setShowForm] = useState(false)

  const habitGoals = goals[habitId] || []

  useEffect(() => {
    habitGoals.forEach((goal) => {
      fetchGoalProgress(habitId, goal.id)
    })
  }, [habitGoals.length, habitId, fetchGoalProgress])

  const handleCreateGoal = async (data: any) => {
    await createGoal(habitId, data)
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(habitId, goalId)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Goals</h3>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus size={16} className="mr-1" />
          Add Goal
        </Button>
      </div>

      {habitGoals.length === 0 ? (
        <Card className="p-4 text-center text-gray-600">
          No goals set. Create a goal to track your consistency!
        </Card>
      ) : (
        <div className="space-y-3">
          {habitGoals.map((goal) => {
            const progress = goalProgress[goal.id]
            return (
              <div key={goal.id} className="relative">
                {progress ? (
                  <GoalProgress progress={progress} />
                ) : (
                  <Card className="p-4">
                    <div className="font-medium">
                      {goal.targetFrequency} times {goal.goalType}
                    </div>
                  </Card>
                )}
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="absolute top-2 right-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Create New Goal"
      >
        <GoalForm
          onSubmit={handleCreateGoal}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  )
}
