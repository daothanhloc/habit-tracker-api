import React, { useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { useHabitStore } from '../../store/habitStore'
import { useTrackingStore } from '../../store/trackingStore'
import { HabitCard } from './HabitCard'
import { HabitForm } from './HabitForm'
import { HabitDetail } from './HabitDetail'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { Habit } from '../../types/habit'

export const HabitList: React.FC = () => {
  const { habits, loading, error, addHabit, updateHabit, deleteHabit } = useHabitStore()
  const { trackHabit } = useTrackingStore()
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)

  const handleTrack = async (habitId: string) => {
    const now = new Date().toISOString()
    console.log('Tracking habit:', habitId, 'at', now)
    await trackHabit(habitId, { completedAt: now })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(id)
    }
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowForm(true)
  }

  const handleFormSubmit = async (data: any) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data)
    } else {
      await addHabit(data)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingHabit(null)
  }

  if (loading && habits.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="relative pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Habits
          </h2>
          <p className="text-gray-600 mt-1">
            {habits.length} {habits.length === 1 ? 'habit' : 'habits'} in progress
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="hidden sm:flex">
          <Plus size={20} />
          Add Habit
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg animate-slide-in">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {habits.length === 0 && !loading ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
            <Sparkles className="text-indigo-600" size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Journey</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            No habits yet. Create your first habit and begin building better routines today!
          </p>
          <Button onClick={() => setShowForm(true)} size="lg">
            <Plus size={24} />
            Create Your First Habit
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTrack={handleTrack}
              onViewDetails={setSelectedHabitId}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setShowForm(true)}
        className="sm:hidden fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
      >
        <Plus size={28} />
      </button>

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
      >
        <HabitForm
          habit={editingHabit || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
        />
      </Modal>

      {selectedHabitId && (
        <Modal
          isOpen={!!selectedHabitId}
          onClose={() => setSelectedHabitId(null)}
          title="Habit Details"
        >
          <HabitDetail habitId={selectedHabitId} />
        </Modal>
      )}
    </div>
  )
}
