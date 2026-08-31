import { useState } from 'react'
import ExerciseModal from '../exercises/ExerciseModal'
import { getExerciseById } from '../../data/workouts'
import type { LiftingWorkout } from '../../data/workouts'
import type { Exercise } from '../../data/exercises'
import './LiftingWorkoutsPage.css'

// Lists all of the user's lifting workouts as cards. Each card can be
// switched into "edit mode" to reveal delete buttons on its exercises and an
// "+ Add" button (which hands off to the Exercise List page). "Start
// Lifting" opens the full workout detail/timer page for that workout.

interface LiftingWorkoutsPageProps {
  workouts: LiftingWorkout[]
  exercises: Exercise[]
  userId: string | null
  onAddExercise: (workoutId: string) => void
  onDeleteExercise: (workoutId: string, exerciseId: string) => void
  onViewDetails: (workoutId: string) => void
}

function LiftingWorkoutsPage({
  workouts,
  exercises,
  userId,
  onAddExercise,
  onDeleteExercise,
  onViewDetails,
}: LiftingWorkoutsPageProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  // Which workout cards currently have their edit controls (delete buttons,
  // Add button) showing. Each card toggles independently.
  const [editingWorkoutIds, setEditingWorkoutIds] = useState<Set<string>>(new Set())

  function handleToggleEditing(workoutId: string) {
    setEditingWorkoutIds((prev) => {
      const next = new Set(prev)
      if (next.has(workoutId)) {
        next.delete(workoutId)
      } else {
        next.add(workoutId)
      }
      return next
    })
  }

  function handleCloseExerciseModal() {
    setSelectedExercise(null)
  }

  return (
    <div className="lifting-workouts-page">
      <h1>Lifting Workouts</h1>

      <div className="workout-column">
        {workouts.map((workout) => {
          const isEditing = editingWorkoutIds.has(workout.id)

          return (
            <div key={workout.id} className="workout-card">
              <h2>{workout.title}</h2>

              <ul className="workout-exercise-list">
                {workout.exerciseIds.map((exerciseId) => {
                  const exercise = getExerciseById(exercises, exerciseId)
                  if (!exercise) return null
                  return (
                    <li key={exercise.id} className="workout-exercise-row">
                      <button
                        type="button"
                        className="workout-exercise-name"
                        onClick={() => setSelectedExercise(exercise)}
                      >
                        {exercise.name}
                      </button>
                      {isEditing && (
                        <button
                          type="button"
                          className="delete-btn"
                          aria-label={`Delete ${exercise.name}`}
                          onClick={() => onDeleteExercise(workout.id, exercise.id)}
                        >
                          &times;
                        </button>
                      )}
                    </li>
                  )
                })}
                {workout.exerciseIds.length === 0 && (
                  <li className="workout-empty">No exercises yet.</li>
                )}
              </ul>

              <div className="workout-card-footer">
                <button
                  type="button"
                  className="details-btn"
                  onClick={() => onViewDetails(workout.id)}
                >
                  Start Lifting
                </button>

                <div className="workout-card-footer-right">
                  {isEditing && (
                    <button
                      type="button"
                      className="add-btn"
                      onClick={() => onAddExercise(workout.id)}
                    >
                      + Add
                    </button>
                  )}
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => handleToggleEditing(workout.id)}
                  >
                    {isEditing ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          exercises={exercises}
          userId={userId}
          onClose={handleCloseExerciseModal}
        />
      )}
    </div>
  )
}

export default LiftingWorkoutsPage
