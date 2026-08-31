import { useState } from 'react'
import './ActivityModal.css'
import WorkoutPickerModal from '../exercises/WorkoutPickerModal'
import type { WorkoutActivity, LiftingWorkout } from '../../data/workouts'

// "How to" popup for a single warmup/cooldown activity - with, in some
// contexts, a button for adding it to a workout.

// Passed in only when the modal should let the user add this activity to
// any of their workouts (used from the Exercise List page's warmup/cooldown
// categories).
interface WorkoutPickerConfig {
  workouts: LiftingWorkout[]
  isAlreadyAdded: (workout: LiftingWorkout) => boolean
  onAddToWorkout: (workoutId: string) => void
}

interface ActivityModalProps {
  activity: WorkoutActivity
  onClose: () => void
  workoutPicker?: WorkoutPickerConfig
}

function ActivityModal({ activity, onClose, workoutPicker }: ActivityModalProps) {
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false)

  function handleWorkoutPickerDone(workoutId: string) {
    workoutPicker?.onAddToWorkout(workoutId)
    setShowWorkoutPicker(false)
  }

  return (
    <>
      <div className="activity-modal-overlay" onClick={onClose}>
        <div className="activity-modal-card" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="activity-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>

          <h2>{activity.name}</h2>
          <p className="activity-modal-description">{activity.description}</p>

          {workoutPicker && (
            <div className="activity-modal-actions">
              <button
                type="button"
                className="workout-picker-trigger"
                onClick={() => setShowWorkoutPicker(true)}
              >
                + Add
              </button>
            </div>
          )}
        </div>
      </div>

      {showWorkoutPicker && workoutPicker && (
        <WorkoutPickerModal
          workouts={workoutPicker.workouts}
          isAlreadyAdded={workoutPicker.isAlreadyAdded}
          onCancel={() => setShowWorkoutPicker(false)}
          onDone={handleWorkoutPickerDone}
        />
      )}
    </>
  )
}

export default ActivityModal
