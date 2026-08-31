import { useState } from 'react'
import ExerciseModal from '../exercises/ExerciseModal'
import ActivityModal from './ActivityModal'
import ActivityPickerModal from './ActivityPickerModal'
import Tabs from '../../shared/Tabs'
import type { TabItem } from '../../shared/Tabs'
import {
  getExerciseById,
  REST_SECONDS_BETWEEN_LIFTS,
  WARMUP_ACTIVITIES,
  COOLDOWN_ACTIVITIES,
} from '../../data/workouts'
import type { LiftingWorkout, WorkoutActivity } from '../../data/workouts'
import type { Exercise } from '../../data/exercises'
import './WorkoutDetailPage.css'

// Full detail page for one workout: Warmup / Lifts / Cooldown tabs, plus an
// Edit mode that lets the user remove (and, for warmup/cooldown, add) items.
//
// Editing works on a "draft" copy of whichever list is being edited, so
// changes are only saved to the real workout when the user clicks Save.
// Switching tabs while editing discards the draft instead of saving it.

type EditableSection = 'warmup' | 'lifts' | 'cooldown'

interface WorkoutDetailPageProps {
  workout: LiftingWorkout
  onBack: () => void
  // Lets the caller change what the back button says - e.g. "Back to
  // calendar" instead of "Back to lifting workouts" when the workout was
  // opened from a calendar event.
  backLabel?: string
  onAddExercise: (workoutId: string) => void
  onAddExerciseToWorkout: (workoutId: string, exerciseId: string) => void
  onUpdateWarmup: (workoutId: string, warmup: WorkoutActivity[]) => void
  onUpdateCooldown: (workoutId: string, cooldown: WorkoutActivity[]) => void
  onUpdateExerciseIds: (workoutId: string, exerciseIds: string[]) => void
}

function WorkoutDetailPage({
  workout,
  onBack,
  backLabel = 'Back to lifting workouts',
  onAddExercise,
  onAddExerciseToWorkout,
  onUpdateWarmup,
  onUpdateCooldown,
  onUpdateExerciseIds,
}: WorkoutDetailPageProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<WorkoutActivity | null>(null)
  const [activeTabKey, setActiveTabKey] = useState('warmup')

  // Which section (if any) is currently being edited, and the in-progress
  // draft copy of its list. Only one section can be edited at a time.
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null)
  const [draftWarmup, setDraftWarmup] = useState<WorkoutActivity[] | null>(null)
  const [draftCooldown, setDraftCooldown] = useState<WorkoutActivity[] | null>(null)
  const [draftExerciseIds, setDraftExerciseIds] = useState<string[] | null>(null)

  const [showAddActivityPicker, setShowAddActivityPicker] = useState(false)

  // Throws away whatever draft is in progress and turns edit mode off,
  // without saving anything.
  function discardEdit() {
    setEditingSection(null)
    setDraftWarmup(null)
    setDraftCooldown(null)
    setDraftExerciseIds(null)
    setShowAddActivityPicker(false)
  }

  function handleTabChange(key: string) {
    if (editingSection) {
      discardEdit()
    }
    setActiveTabKey(key)
  }

  // Copies whichever list belongs to the currently active tab into its
  // draft state, and marks that section as being edited.
  function handleStartEdit() {
    if (activeTabKey === 'warmup') {
      setDraftWarmup([...workout.warmup])
      setEditingSection('warmup')
    } else if (activeTabKey === 'cooldown') {
      setDraftCooldown([...workout.cooldown])
      setEditingSection('cooldown')
    } else if (activeTabKey === 'lifts') {
      setDraftExerciseIds([...workout.exerciseIds])
      setEditingSection('lifts')
    }
  }

  // Sends whichever draft is in progress back up to the real workout data,
  // then turns edit mode off.
  function handleSaveEdit() {
    if (editingSection === 'warmup' && draftWarmup) {
      onUpdateWarmup(workout.id, draftWarmup)
    } else if (editingSection === 'cooldown' && draftCooldown) {
      onUpdateCooldown(workout.id, draftCooldown)
    } else if (editingSection === 'lifts' && draftExerciseIds) {
      onUpdateExerciseIds(workout.id, draftExerciseIds)
    }
    discardEdit()
  }

  function handleCloseExerciseModal() {
    setSelectedExercise(null)
  }

  function handleCloseActivityModal() {
    setSelectedActivity(null)
  }

  function handleOpenAddActivityPicker() {
    setShowAddActivityPicker(true)
  }

  function handleCloseAddActivityPicker() {
    setShowAddActivityPicker(false)
  }

  function handleRemoveDraftWarmupActivity(activityName: string) {
    setDraftWarmup((prev) => (prev ? prev.filter((item) => item.name !== activityName) : prev))
  }

  function handleRemoveDraftCooldownActivity(activityName: string) {
    setDraftCooldown((prev) => (prev ? prev.filter((item) => item.name !== activityName) : prev))
  }

  function handleRemoveDraftExercise(exerciseId: string) {
    setDraftExerciseIds((prev) => (prev ? prev.filter((id) => id !== exerciseId) : prev))
  }

  function handleAddDraftWarmupActivity(activity: WorkoutActivity) {
    setDraftWarmup((prev) => (prev ? [...prev, activity] : prev))
    setShowAddActivityPicker(false)
  }

  function handleAddDraftCooldownActivity(activity: WorkoutActivity) {
    setDraftCooldown((prev) => (prev ? [...prev, activity] : prev))
    setShowAddActivityPicker(false)
  }

  // While editing a section, show its draft list; otherwise show the real,
  // saved list. This is what makes unsaved edits disappear when you switch
  // tabs away without hitting Save.
  const displayedWarmup = editingSection === 'warmup' && draftWarmup ? draftWarmup : workout.warmup
  const displayedCooldown =
    editingSection === 'cooldown' && draftCooldown ? draftCooldown : workout.cooldown
  const displayedExerciseIds =
    editingSection === 'lifts' && draftExerciseIds ? draftExerciseIds : workout.exerciseIds
  const displayedLiftExercises = displayedExerciseIds
    .map((id) => getExerciseById(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise))

  // --- Tab content ---------------------------------------------------

  function renderWarmupTab() {
    return (
      <ul className="activity-list">
        {displayedWarmup.map((activity) => (
          <li key={activity.name} className="activity-row">
            <button
              type="button"
              className="activity-button"
              onClick={() => setSelectedActivity(activity)}
            >
              <span className="activity-name">{activity.name}</span>
              <span className="activity-description">{activity.description}</span>
            </button>
            {editingSection === 'warmup' && (
              <button
                type="button"
                className="delete-btn"
                aria-label={`Delete ${activity.name}`}
                onClick={() => handleRemoveDraftWarmupActivity(activity.name)}
              >
                &times;
              </button>
            )}
          </li>
        ))}
        {displayedWarmup.length === 0 && <li className="workout-empty">No warmup activities.</li>}
      </ul>
    )
  }

  function renderLiftsTab() {
    return (
      <ul className="lift-list">
        {displayedLiftExercises.map((exercise, index) => {
          const isLastExercise = index === displayedLiftExercises.length - 1
          return (
            <li key={exercise.id} className="lift-item">
              <div className="lift-row-wrap">
                <button
                  type="button"
                  className="lift-row"
                  onClick={() => setSelectedExercise(exercise)}
                >
                  <span className="exercise-name">{exercise.name}</span>
                  <span className="exercise-equipment">{exercise.equipment}</span>
                </button>
                {editingSection === 'lifts' && (
                  <button
                    type="button"
                    className="delete-btn"
                    aria-label={`Delete ${exercise.name}`}
                    onClick={() => handleRemoveDraftExercise(exercise.id)}
                  >
                    &times;
                  </button>
                )}
              </div>
              <div className="rep-range-row">Recommended: {exercise.recommendedReps}</div>
              <div className="lift-item-footer">
                {!isLastExercise && (
                  <div className="rest-row">Rest {REST_SECONDS_BETWEEN_LIFTS}s</div>
                )}
                <button
                  type="button"
                  className="start-logging-btn"
                  onClick={() => setSelectedExercise(exercise)}
                >
                  Start Logging
                </button>
              </div>
            </li>
          )
        })}
        {displayedLiftExercises.length === 0 && <li className="workout-empty">No lifts yet.</li>}
      </ul>
    )
  }

  function renderCooldownTab() {
    return (
      <ul className="activity-list">
        {displayedCooldown.map((activity) => (
          <li key={activity.name} className="activity-row">
            <button
              type="button"
              className="activity-button"
              onClick={() => setSelectedActivity(activity)}
            >
              <span className="activity-name">{activity.name}</span>
              <span className="activity-description">{activity.description}</span>
            </button>
            {editingSection === 'cooldown' && (
              <button
                type="button"
                className="delete-btn"
                aria-label={`Delete ${activity.name}`}
                onClick={() => handleRemoveDraftCooldownActivity(activity.name)}
              >
                &times;
              </button>
            )}
          </li>
        ))}
        {displayedCooldown.length === 0 && (
          <li className="workout-empty">No cooldown activities.</li>
        )}
      </ul>
    )
  }

  const tabs: TabItem[] = [
    { key: 'warmup', label: 'Warmup', content: renderWarmupTab() },
    { key: 'lifts', label: 'Lifts', content: renderLiftsTab() },
    { key: 'cooldown', label: 'Cooldown', content: renderCooldownTab() },
  ]

  return (
    <div className="workout-detail-page">
      <button type="button" className="back-button" onClick={onBack}>
        &larr; {backLabel}
      </button>

      <h1>{workout.title}</h1>

      <div className="detail-card">
        <Tabs tabs={tabs} onChange={handleTabChange} />

        <div className="detail-card-footer">
          {/* On the Lifts tab, "+ Add" hands off to the Exercise List page. */}
          {editingSection === 'lifts' && (
            <button type="button" className="add-btn" onClick={() => onAddExercise(workout.id)}>
              + Add
            </button>
          )}
          {/* On Warmup/Cooldown, "+ Add" opens a picker of activities right
              here instead, since there's no separate catalog page for
              those. */}
          {(editingSection === 'warmup' || editingSection === 'cooldown') && (
            <button type="button" className="add-btn" onClick={handleOpenAddActivityPicker}>
              + Add
            </button>
          )}
          <button
            type="button"
            className="edit-btn"
            onClick={editingSection ? handleSaveEdit : handleStartEdit}
          >
            {editingSection ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={handleCloseExerciseModal}
          quickAddWorkout={{
            isExerciseAdded: (exerciseId) => workout.exerciseIds.includes(exerciseId),
            onAdd: (exerciseId) => onAddExerciseToWorkout(workout.id, exerciseId),
          }}
        />
      )}

      {selectedActivity && (
        <ActivityModal activity={selectedActivity} onClose={handleCloseActivityModal} />
      )}

      {showAddActivityPicker && editingSection === 'warmup' && (
        <ActivityPickerModal
          title="Add warmup activity"
          activities={WARMUP_ACTIVITIES}
          existingNames={(draftWarmup ?? []).map((activity) => activity.name)}
          onCancel={handleCloseAddActivityPicker}
          onAdd={handleAddDraftWarmupActivity}
        />
      )}

      {showAddActivityPicker && editingSection === 'cooldown' && (
        <ActivityPickerModal
          title="Add cooldown activity"
          activities={COOLDOWN_ACTIVITIES}
          existingNames={(draftCooldown ?? []).map((activity) => activity.name)}
          onCancel={handleCloseAddActivityPicker}
          onAdd={handleAddDraftCooldownActivity}
        />
      )}
    </div>
  )
}

export default WorkoutDetailPage
