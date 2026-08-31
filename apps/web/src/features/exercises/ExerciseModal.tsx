import { useEffect, useState } from 'react'
import { format, isToday } from 'date-fns'
import './ExerciseModal.css'
import Tabs from '../../shared/Tabs'
import type { TabItem } from '../../shared/Tabs'
import WorkoutPickerModal from './WorkoutPickerModal'
import type { Exercise } from '../../data/exercises'
import type { LiftingWorkout } from '../../data/workouts'
import { createExerciseLog, fetchExerciseLogs } from '../../api/client'
import type { ApiExerciseLog } from '../../api/client'
import { addCachedLog, getCachedLogs, setCachedLogs } from './exerciseLogStore'

// Pop-up modal that shows the full details for a single exercise: how to do
// it, a place to log today's sets, related exercises, and (in some contexts)
// buttons for adding it to a workout.
//
// Logged sets persist via GET/POST /api/exercises/:id/logs, but only ever
// get fetched once per exercise per session - see exerciseLogStore.ts.

// Passed in only when the modal should let the user add this exercise to
// any of their workouts (used from the Exercise List page).
interface WorkoutPickerConfig {
  workouts: LiftingWorkout[]
  onAddToWorkout: (workoutId: string) => void
}

// Passed in only when the modal is being viewed from inside a specific
// workout already (used from that workout's Lifts tab) - lets a related
// exercise be added straight to that same workout, with no picker needed
// since there's only one workout in play. The root exercise itself is
// already part of the workout, so `isExerciseAdded` naturally keeps the
// button off its own modal and only shows it on not-yet-added related ones.
interface QuickAddConfig {
  isExerciseAdded: (exerciseId: string) => boolean
  onAdd: (exerciseId: string) => void
}

interface ExerciseModalProps {
  exercise: Exercise
  // The full exercise catalog, for the Related Exercises tab. Fetched once
  // at login (see App.tsx) rather than by this modal itself.
  exercises: Exercise[]
  // Whose logs to fetch/save - null before sign-up/login finishes, in which
  // case the Logging tab just can't save anything yet.
  userId: string | null
  onClose: () => void
  showAddControls?: boolean
  isAdded?: boolean
  onAdd?: () => void
  onRemove?: () => void
  onNavigateRelated?: (exercise: Exercise) => void
  workoutPicker?: WorkoutPickerConfig
  quickAddWorkout?: QuickAddConfig
}

// Turns "legs" into "Legs" so muscle group tags read nicely.
function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Grabs just the first sentence of a longer description, for the short
// preview shown above the logging form.
function getFirstSentence(description: string): string {
  const firstSentence = description.split('. ')[0]
  return firstSentence.endsWith('.') ? firstSentence : `${firstSentence}.`
}

function ExerciseModal({
  exercise,
  exercises,
  userId,
  onClose,
  showAddControls = false,
  isAdded = false,
  onAdd,
  onRemove,
  onNavigateRelated,
  workoutPicker,
  quickAddWorkout,
}: ExerciseModalProps) {
  // If the user clicks a related exercise, we open a second modal on top of
  // this one to show its details. This tracks which exercise (if any) that is.
  const [childExercise, setChildExercise] = useState<Exercise | null>(null)

  // Controlled inputs for the "log a new set" form on the Logging tab.
  const [weightInput, setWeightInput] = useState('')
  const [repsInput, setRepsInput] = useState('')
  // Seeded synchronously from the cache when available, so a re-opened
  // modal shows its logs immediately with no loading flash at all.
  const [logs, setLogs] = useState<ApiExerciseLog[]>(() => getCachedLogs(exercise.id) ?? [])
  const [logsLoading, setLogsLoading] = useState(() => Boolean(userId) && !getCachedLogs(exercise.id))
  const [logError, setLogError] = useState<string | null>(null)
  const [savingLog, setSavingLog] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Whether the "add this exercise to a workout" picker modal is open.
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false)

  // Fetches this exercise's logs once per session: if another modal already
  // fetched them earlier (see the lazy initial state above), this is a
  // no-op and never hits the backend again (see exerciseLogStore.ts).
  useEffect(() => {
    if (!userId || getCachedLogs(exercise.id)) return
    fetchExerciseLogs(exercise.id, userId)
      .then(({ logs: fetched }) => {
        setCachedLogs(exercise.id, fetched)
        setLogs(fetched)
      })
      .catch((err) => {
        setLogError(err instanceof Error ? err.message : 'Could not load log history.')
      })
      .finally(() => setLogsLoading(false))
  }, [exercise.id, userId])

  // The small "+ Add" button next to the tags only makes sense when we're
  // not already showing the full Add/Added/Remove controls at the bottom.
  const showWorkoutPickerTrigger = Boolean(workoutPicker) && !showAddControls

  const muscleGroupLabel = capitalizeFirstLetter(exercise.muscleGroup)
  const briefDescription = getFirstSentence(exercise.description)

  // Other exercises that target the same muscle group, shown in the
  // "Related Exercises" tab.
  const relatedExercises = exercises.filter(
    (candidate) => candidate.muscleGroup === exercise.muscleGroup && candidate.id !== exercise.id,
  )

  const todayLogs = logs.filter((log) => isToday(new Date(log.loggedAt)))
  const historyLogs = logs.filter((log) => !isToday(new Date(log.loggedAt)))

  // Clicking a related exercise either opens a nested modal (when this modal
  // is the "root" one) or asks the root modal to swap its nested exercise
  // (when this modal is already itself a nested one).
  function handleRelatedExerciseClick(relatedExercise: Exercise) {
    if (onNavigateRelated) {
      onNavigateRelated(relatedExercise)
    } else {
      setChildExercise(relatedExercise)
    }
  }

  // The "Add" button in the logging form only works once both fields have a
  // positive number typed in (and there's a signed-in user to save against).
  const canAddLog =
    Boolean(userId) &&
    !savingLog &&
    weightInput.trim() !== '' &&
    repsInput.trim() !== '' &&
    Number(weightInput) > 0 &&
    Number(repsInput) > 0

  async function handleAddLog() {
    if (!userId) return
    setSavingLog(true)
    setLogError(null)
    try {
      const log = await createExerciseLog(exercise.id, userId, Number(weightInput), Number(repsInput))
      addCachedLog(exercise.id, log)
      setLogs((prev) => [log, ...prev])
      setWeightInput('')
      setRepsInput('')
    } catch (err) {
      setLogError(err instanceof Error ? err.message : 'Could not save that set.')
    } finally {
      setSavingLog(false)
    }
  }

  function handleToggleHistory() {
    setShowHistory((prev) => !prev)
  }

  function handleCloseChildExercise() {
    setChildExercise(null)
  }

  function handleOpenWorkoutPicker() {
    setShowWorkoutPicker(true)
  }

  function handleCloseWorkoutPicker() {
    setShowWorkoutPicker(false)
  }

  // Called when the user picks a workout inside the WorkoutPickerModal.
  function handleWorkoutPickerDone(workoutId: string) {
    workoutPicker?.onAddToWorkout(workoutId)
    setShowWorkoutPicker(false)
  }

  // --- Tab content ---------------------------------------------------
  // Each function below builds the JSX for one tab. Splitting them up like
  // this keeps the `tabs` array further down short and easy to read.

  function renderLoggingTab() {
    return (
      <div className="logging-tab">
        <p className="exercise-brief">{briefDescription}</p>

        <div className="log-entry-form">
          <label className="log-field">
            <span>Weight (kg)</span>
            <input
              type="number"
              min="0"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
            />
          </label>
          <label className="log-field">
            <span>Reps</span>
            <input
              type="number"
              min="0"
              value={repsInput}
              onChange={(e) => setRepsInput(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn-add-log"
            disabled={!canAddLog}
            onClick={handleAddLog}
          >
            Add
          </button>
        </div>

        {logError && <p className="field-hint field-error">{logError}</p>}

        <div className="log-section">
          <h3>Today</h3>
          {logsLoading ? (
            <p className="log-empty">Loading...</p>
          ) : todayLogs.length === 0 ? (
            <p className="log-empty">No sets logged yet.</p>
          ) : (
            <ul className="log-list">
              {todayLogs.map((log) => (
                <li key={log.id}>
                  {log.weight} kg &times; {log.reps} reps
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="button" className="log-history-toggle" onClick={handleToggleHistory}>
          {showHistory ? 'Hide log history' : 'View log history'}
        </button>

        {showHistory && (
          <ul className="log-history-list">
            {historyLogs.map((entry) => (
              <li key={entry.id}>
                <span className="log-history-date">{format(new Date(entry.loggedAt), 'MMM d')}</span>
                <span className="log-history-value">
                  {entry.weight} kg &times; {entry.reps} reps
                </span>
              </li>
            ))}
            {historyLogs.length === 0 && <li className="log-empty">No past sets logged.</li>}
          </ul>
        )}
      </div>
    )
  }

  function renderHowToTab() {
    return <p className="exercise-modal-description">{exercise.description}</p>
  }

  function renderRelatedExercisesTab() {
    return (
      <ul className="related-exercise-list">
        {relatedExercises.map((related) => (
          <li key={related.id}>
            <button
              type="button"
              className="related-exercise-btn"
              onClick={() => handleRelatedExerciseClick(related)}
            >
              {related.name}
            </button>
          </li>
        ))}
        {relatedExercises.length === 0 && (
          <li className="workout-empty">No related exercises.</li>
        )}
      </ul>
    )
  }

  const tabs: TabItem[] = [
    { key: 'logging', label: 'Logging', content: renderLoggingTab() },
    { key: 'how-to', label: 'How To', content: renderHowToTab() },
    { key: 'related', label: 'Related Exercises', content: renderRelatedExercisesTab() },
  ]

  return (
    <>
      <div className="exercise-modal-overlay" onClick={onClose}>
        <div className="exercise-modal-card" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="exercise-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>

          <h2>{exercise.name}</h2>

          <div className="exercise-modal-meta">
            <div className="exercise-modal-tags">
              <span className="exercise-modal-tag">{muscleGroupLabel}</span>
              <span className="exercise-modal-tag">{exercise.equipment}</span>
            </div>
            {showWorkoutPickerTrigger && (
              <button
                type="button"
                className="workout-picker-trigger"
                onClick={handleOpenWorkoutPicker}
              >
                + Add
              </button>
            )}
            {quickAddWorkout && !quickAddWorkout.isExerciseAdded(exercise.id) && (
              <button
                type="button"
                className="workout-picker-trigger"
                onClick={() => quickAddWorkout.onAdd(exercise.id)}
              >
                + Add
              </button>
            )}
          </div>

          <Tabs tabs={tabs} />

          {/* These Add/Added/Remove controls only show when this modal was
              opened specifically to add the exercise to one particular
              workout (see the `showAddControls` prop). */}
          {showAddControls && (
            <div className="exercise-modal-actions">
              {isAdded ? (
                <>
                  <button type="button" className="btn-added" disabled>
                    Added
                  </button>
                  <button type="button" className="btn-remove" onClick={onRemove}>
                    Remove
                  </button>
                </>
              ) : (
                <button type="button" className="btn-add" onClick={onAdd}>
                  Add
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nested modal for a related exercise. Only the "root" modal (the one
          without an onNavigateRelated prop) renders this, so at most two
          modals are ever stacked on top of each other at once. */}
      {!onNavigateRelated && childExercise && (
        <ExerciseModal
          key={childExercise.id}
          exercise={childExercise}
          exercises={exercises}
          userId={userId}
          onClose={handleCloseChildExercise}
          onNavigateRelated={setChildExercise}
          quickAddWorkout={quickAddWorkout}
        />
      )}

      {showWorkoutPicker && workoutPicker && (
        <WorkoutPickerModal
          workouts={workoutPicker.workouts}
          isAlreadyAdded={(workout) => workout.exerciseIds.includes(exercise.id)}
          onCancel={handleCloseWorkoutPicker}
          onDone={handleWorkoutPickerDone}
        />
      )}
    </>
  )
}

export default ExerciseModal
