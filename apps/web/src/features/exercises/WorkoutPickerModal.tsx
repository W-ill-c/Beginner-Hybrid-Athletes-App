import { useState } from 'react'
import './WorkoutPickerModal.css'
import type { LiftingWorkout } from '../../data/workouts'

// Modal for picking which workout to add something (an exercise, or a
// warmup/cooldown activity) to. Shown on top of ExerciseModal or
// ActivityModal when the user clicks its "+ Add" button. Which workouts
// already contain the thing being added - and so should be shown disabled -
// is entirely up to the caller, via `isAlreadyAdded`, so this same picker
// works for both.

interface WorkoutPickerModalProps {
  workouts: LiftingWorkout[]
  isAlreadyAdded: (workout: LiftingWorkout) => boolean
  onCancel: () => void
  onDone: (workoutId: string) => void
}

function WorkoutPickerModal({
  workouts,
  isAlreadyAdded,
  onCancel,
  onDone,
}: WorkoutPickerModalProps) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)

  function handleDoneClick() {
    if (selectedWorkoutId) {
      onDone(selectedWorkoutId)
    }
  }

  return (
    <div className="workout-picker-overlay" onClick={onCancel}>
      <div className="workout-picker-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="workout-picker-close"
          onClick={onCancel}
          aria-label="Close"
        >
          &times;
        </button>

        <h2>Add to workout</h2>

        <ul className="workout-picker-list">
          {workouts.map((workout) => {
            const alreadyAdded = isAlreadyAdded(workout)
            return (
              <li key={workout.id}>
                <button
                  type="button"
                  className={`workout-picker-option ${
                    selectedWorkoutId === workout.id ? 'selected' : ''
                  }`}
                  disabled={alreadyAdded}
                  onClick={() => setSelectedWorkoutId(workout.id)}
                >
                  <span>{workout.title}</span>
                  {alreadyAdded && (
                    <span className="workout-picker-option-note">Already added</span>
                  )}
                </button>
              </li>
            )
          })}
          {workouts.length === 0 && <li className="workout-picker-empty">No workouts yet.</li>}
        </ul>

        <div className="workout-picker-actions">
          <button
            type="button"
            className="btn-done"
            disabled={!selectedWorkoutId}
            onClick={handleDoneClick}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default WorkoutPickerModal
