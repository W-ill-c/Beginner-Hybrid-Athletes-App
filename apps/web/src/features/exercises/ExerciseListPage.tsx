import { useState } from 'react'
import ExerciseModal from './ExerciseModal'
import ActivityModal from '../workouts/ActivityModal'
import { MUSCLE_GROUPS } from '../../data/exercises'
import type { MuscleGroup, Exercise } from '../../data/exercises'
import { WARMUP_ACTIVITIES, COOLDOWN_ACTIVITIES } from '../../data/workouts'
import type { LiftingWorkout, WorkoutActivity } from '../../data/workouts'
import './ExerciseListPage.css'

// Lets the user browse exercises by muscle group, or browse the warmup and
// cooldown activity catalogs. Has three "screens" controlled by local state:
//   - the root grid (no group/category selected)
//   - a muscle group's exercise list
//   - a warmup/cooldown category's activity list
// When arrived at from a workout's "add exercise" flow (addTargetWorkoutId
// is set), exercise cards also grow Add/Remove buttons and a back link that
// jumps straight back to that workout.

type ActivityCategoryKey = 'warmup' | 'cooldown'

interface ActivityCategory {
  key: ActivityCategoryKey
  label: string
  activities: WorkoutActivity[]
}

const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  { key: 'warmup', label: 'Warmup', activities: WARMUP_ACTIVITIES },
  { key: 'cooldown', label: 'Cooldown', activities: COOLDOWN_ACTIVITIES },
]

interface ExerciseListPageProps {
  addTargetWorkoutId: string | null
  workouts: LiftingWorkout[]
  exercises: Exercise[]
  onAddExerciseToWorkout: (workoutId: string, exerciseId: string) => void
  onRemoveExerciseFromWorkout: (workoutId: string, exerciseId: string) => void
  onAddActivityToWorkout: (
    workoutId: string,
    category: ActivityCategoryKey,
    activity: WorkoutActivity,
  ) => void
  returnWorkoutTitle: string | null
  onReturnToWorkout: () => void
}

function ExerciseListPage({
  addTargetWorkoutId,
  workouts,
  exercises,
  onAddExerciseToWorkout,
  onRemoveExerciseFromWorkout,
  onAddActivityToWorkout,
  returnWorkoutTitle,
  onReturnToWorkout,
}: ExerciseListPageProps) {
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<ActivityCategoryKey | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<WorkoutActivity | null>(null)

  const groupLabel = MUSCLE_GROUPS.find((group) => group.key === selectedGroup)?.label ?? ''
  const groupExercises = exercises.filter((exercise) => exercise.muscleGroup === selectedGroup)

  const selectedCategory =
    ACTIVITY_CATEGORIES.find((category) => category.key === selectedCategoryKey) ?? null

  // The workout we're currently adding an exercise to, if any.
  const targetWorkout = addTargetWorkoutId
    ? (workouts.find((workout) => workout.id === addTargetWorkoutId) ?? null)
    : null

  // Whether a given exercise is already part of the target workout above.
  function isExerciseAdded(exerciseId: string): boolean {
    return targetWorkout ? targetWorkout.exerciseIds.includes(exerciseId) : false
  }

  // Leaves both the muscle-group and activity-category screens, returning
  // to the root grid.
  function handleBackToCategories() {
    setSelectedGroup(null)
    setSelectedCategoryKey(null)
  }

  function handleCloseExerciseModal() {
    setSelectedExercise(null)
  }

  function handleCloseActivityModal() {
    setSelectedActivity(null)
  }

  return (
    <div className="exercise-list-page">
      {(returnWorkoutTitle || selectedGroup || selectedCategory) && (
        <div className="back-link-group">
          {returnWorkoutTitle && (
            <button type="button" className="back-link" onClick={onReturnToWorkout}>
              &larr; Back to {returnWorkoutTitle}
            </button>
          )}
          {(selectedGroup || selectedCategory) && (
            <button type="button" className="back-link" onClick={handleBackToCategories}>
              &larr; Back to Categories
            </button>
          )}
        </div>
      )}

      {!selectedGroup && !selectedCategory && (
        <>
          <h1>Exercise List</h1>
          <p className="page-subtitle">
            Browse exercises by muscle group, or check warmup and cooldown activities.
          </p>

          <div className="muscle-grid">
            {MUSCLE_GROUPS.map((group) => (
              <button
                key={group.key}
                type="button"
                className="muscle-card"
                onClick={() => setSelectedGroup(group.key)}
              >
                {group.label}
              </button>
            ))}
            {ACTIVITY_CATEGORIES.map((category) => (
              <button
                key={category.key}
                type="button"
                className="muscle-card"
                onClick={() => setSelectedCategoryKey(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedGroup && (
        <>
          <h1 className="group-title">{groupLabel}</h1>

          <div className="exercise-grid">
            {groupExercises.map((exercise) => {
              const added = isExerciseAdded(exercise.id)
              return (
                <div key={exercise.id} className="exercise-card">
                  <button
                    type="button"
                    className="exercise-card-main"
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    <span className="exercise-name">{exercise.name}</span>
                    <span className="exercise-equipment">{exercise.equipment}</span>
                  </button>

                  {/* Quick add/remove buttons - only shown while adding an
                      exercise to a specific workout. */}
                  {addTargetWorkoutId && (
                    <div className="exercise-card-actions">
                      <button
                        type="button"
                        className="btn-add-small"
                        disabled={added}
                        onClick={() => onAddExerciseToWorkout(addTargetWorkoutId, exercise.id)}
                      >
                        {added ? 'Added' : 'Add'}
                      </button>
                      {added && (
                        <button
                          type="button"
                          className="btn-remove-small"
                          onClick={() =>
                            onRemoveExerciseFromWorkout(addTargetWorkoutId, exercise.id)
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {selectedCategory && (
        <>
          <h1>{selectedCategory.label}</h1>

          <div className="exercise-grid">
            {selectedCategory.activities.map((activity) => (
              <button
                key={activity.name}
                type="button"
                className="exercise-card"
                onClick={() => setSelectedActivity(activity)}
              >
                <span className="exercise-name">{activity.name}</span>
                <span className="activity-card-description">{activity.description}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={handleCloseExerciseModal}
          showAddControls={addTargetWorkoutId !== null}
          isAdded={isExerciseAdded(selectedExercise.id)}
          onAdd={() =>
            addTargetWorkoutId && onAddExerciseToWorkout(addTargetWorkoutId, selectedExercise.id)
          }
          onRemove={() =>
            addTargetWorkoutId &&
            onRemoveExerciseFromWorkout(addTargetWorkoutId, selectedExercise.id)
          }
          workoutPicker={{
            workouts,
            onAddToWorkout: (workoutId) =>
              onAddExerciseToWorkout(workoutId, selectedExercise.id),
          }}
        />
      )}

      {selectedActivity && selectedCategoryKey && (
        <ActivityModal
          activity={selectedActivity}
          onClose={handleCloseActivityModal}
          workoutPicker={{
            workouts,
            isAlreadyAdded: (workout) =>
              workout[selectedCategoryKey].some((a) => a.name === selectedActivity.name),
            onAddToWorkout: (workoutId) =>
              onAddActivityToWorkout(workoutId, selectedCategoryKey, selectedActivity),
          }}
        />
      )}
    </div>
  )
}

export default ExerciseListPage
