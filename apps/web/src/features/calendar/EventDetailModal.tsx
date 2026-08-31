import { format } from 'date-fns'
import './EventDetailModal.css'
import type { CalendarWorkout } from './CalendarPage'

// Shows the details for one calendar event (name, short description, date
// and time) with a "Workout Now" button that jumps straight to that event's
// workout or run.

interface EventDetailModalProps {
  event: CalendarWorkout
  onClose: () => void
  onStartWorkout: () => void
}

function EventDetailModal({ event, onClose, onStartWorkout }: EventDetailModalProps) {
  return (
    <div className="event-detail-overlay" onClick={onClose}>
      <div className="event-detail-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="event-detail-close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <span className={`event-detail-tag ${event.type}`}>
          {event.type === 'lift' ? 'Lift' : 'Run'}
        </span>

        <h2>{event.title}</h2>
        <p className="event-detail-description">{event.description}</p>

        <div className="event-detail-meta">
          <span>{format(event.date, 'EEEE, MMM d')}</span>
          <span>{event.time}</span>
        </div>

        <button type="button" className="btn-workout-now" onClick={onStartWorkout}>
          Workout Now
        </button>
      </div>
    </div>
  )
}

export default EventDetailModal
