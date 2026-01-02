import React, { useState } from 'react'
import type { CreateGoalDto } from '../../types/goal'
import { Input } from '../common/Input'
import { Button } from '../common/Button'

interface GoalFormProps {
  onSubmit: (data: CreateGoalDto) => Promise<void>
  onCancel: () => void
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateGoalDto>({
    targetFrequency: 5,
    goalType: 'weekly',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onSubmit(formData)
      onCancel()
    } catch (err) {
      setError('Failed to create goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Target Frequency"
        type="number"
        min="1"
        value={formData.targetFrequency}
        onChange={(e) => setFormData({ ...formData, targetFrequency: parseInt(e.target.value) })}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Goal Type
        </label>
        <select
          value={formData.goalType}
          onChange={(e) => setFormData({ ...formData, goalType: e.target.value as 'weekly' | 'monthly' | 'yearly' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Creating...' : 'Create Goal'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
