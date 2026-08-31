import { useState } from 'react'
import './ActivityPickerModal.css'
import type { WorkoutActivity } from '../../data/workouts'

// Modal for picking a warmup or cooldown activity to add to a workout's
// draft list (see WorkoutDetailPage). Activities already in that list are
// shown but disabled, same pattern as WorkoutPickerModal.

interface ActivityPickerModalProps {
  title: string
  activities: WorkoutActivity[]
  existingNames: string[]
  onCancel: () => void
  onAdd: (activity: WorkoutActivity) => void
}

function ActivityPickerModal({
  title,
  activities,
  existingNames,
  onCancel,
  onAdd,
}: ActivityPickerModalProps) {
  const [selectedName, setSelectedName] = useState<string | null>(null)

  const selectedActivity = activities.find((activity) => activity.name === selectedName) ?? null

  function handleAddClick() {
    if (selectedActivity) {
      onAdd(selectedActivity)
    }
  }

  return (
    <div className="activity-picker-overlay" onClick={onCancel}>
      <div className="activity-picker-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="activity-picker-close"
          onClick={onCancel}
          aria-label="Close"
        >
          &times;
        </button>

        <h2>{title}</h2>

        <ul className="activity-picker-list">
          {activities.map((activity) => {
            const alreadyAdded = existingNames.includes(activity.name)
            return (
              <li key={activity.name}>
                <button
                  type="button"
                  className={`activity-picker-option ${
                    selectedName === activity.name ? 'selected' : ''
                  }`}
                  disabled={alreadyAdded}
                  onClick={() => setSelectedName(activity.name)}
                >
                  <span>{activity.name}</span>
                  {alreadyAdded && (
                    <span className="activity-picker-option-note">Already added</span>
                  )}
                </button>
              </li>
            )
          })}
          {activities.length === 0 && (
            <li className="activity-picker-empty">No activities available.</li>
          )}
        </ul>

        <div className="activity-picker-actions">
          <button
            type="button"
            className="btn-add-activity"
            disabled={!selectedActivity}
            onClick={handleAddClick}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActivityPickerModal
