import { useMemo, useState } from 'react'
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import EventDetailModal from './EventDetailModal'
import './CalendarPage.css'

// Month/week calendar showing the user's scheduled workouts. There's no
// backend yet, so the workouts shown are generated from a fixed weekly
// template (see WORKOUT_TEMPLATES) for whatever date range is on screen,
// rather than being real saved data. Clicking an event opens a modal with
// its details and a "Workout Now" button that jumps straight to it.

type ViewMode = 'month' | 'week'
type WorkoutType = 'lift' | 'run'

export interface CalendarWorkout {
  date: Date
  type: WorkoutType
  title: string
  description: string
  time: string
  // Which real workout/run this event points to, so "Workout Now" knows
  // where to send the user. Lift events reference a LiftingWorkout id from
  // data/workouts.ts; run events reference a run number from RunsPage.
  workoutId?: string
  runId?: number
  // There's no real completion tracking yet (no backend), so this is just
  // stubbed as "anything before today counts as done" for demo purposes.
  completed: boolean
}

interface CalendarPageProps {
  onStartLiftingWorkout: (workoutId: string) => void
  onStartRun: (runId: number) => void
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface WorkoutTemplate {
  weekday: number
  type: WorkoutType
  title: string
  description: string
  time: string
  workoutId?: string
  runId?: number
}

// Dummy plan: 4 workouts a week, alternating lift/run days.
const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    weekday: 1,
    type: 'lift',
    title: 'Upper Body Strength',
    description: 'Chest, shoulders, back, and arms.',
    time: '6:00 AM',
    workoutId: 'upper-body',
  },
  {
    weekday: 3,
    type: 'run',
    title: 'Easy Run',
    description: 'A relaxed, conversational pace to build your aerobic base.',
    time: '6:30 AM',
    runId: 1,
  },
  {
    weekday: 5,
    type: 'lift',
    title: 'Lower Body Strength',
    description: 'Quads, hamstrings, glutes, and calves.',
    time: '6:00 AM',
    workoutId: 'lower-body',
  },
  {
    weekday: 6,
    type: 'run',
    title: 'Long Run',
    description: 'A longer, steady effort to build endurance.',
    time: '8:00 AM',
    runId: 2,
  },
]

// Generates a dummy workout for every day in the given range that matches
// one of the weekly templates above. There's no real completion tracking
// (no backend), so - just to have something to show - any day before today
// is treated as completed and anything from today onward isn't.
function buildWorkouts(rangeStart: Date, rangeEnd: Date): CalendarWorkout[] {
  const today = startOfDay(new Date())
  return eachDayOfInterval({ start: rangeStart, end: rangeEnd }).reduce<CalendarWorkout[]>(
    (workouts, day) => {
      const template = WORKOUT_TEMPLATES.find((t) => t.weekday === day.getDay())
      if (template) {
        workouts.push({
          date: day,
          type: template.type,
          title: template.title,
          description: template.description,
          time: template.time,
          workoutId: template.workoutId,
          runId: template.runId,
          completed: isBefore(day, today) ? true : false,
        })
      }
      return workouts
    },
    [],
  )
}

function CalendarPage({ onStartLiftingWorkout, onStartRun }: CalendarPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarWorkout | null>(null)

  // Month view shows the full weeks that make up the current month (so it
  // may include a few days from the month before/after to fill the grid).
  const monthStart = startOfMonth(anchorDate)
  const monthEnd = endOfMonth(anchorDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  // Week view shows just the week containing anchorDate.
  const weekStart = startOfWeek(anchorDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(anchorDate, { weekStartsOn: 1 })

  const rangeStart = viewMode === 'month' ? gridStart : weekStart
  const rangeEnd = viewMode === 'month' ? gridEnd : weekEnd

  const days = useMemo(
    () => eachDayOfInterval({ start: rangeStart, end: rangeEnd }),
    [rangeStart, rangeEnd],
  )
  const workouts = useMemo(() => buildWorkouts(rangeStart, rangeEnd), [rangeStart, rangeEnd])

  function getWorkoutsForDay(day: Date) {
    return workouts.filter((workout) => isSameDay(workout.date, day))
  }

  // Moves back one month (in month view) or one week (in week view).
  function handlePrev() {
    setAnchorDate((prev) => (viewMode === 'month' ? subMonths(prev, 1) : subWeeks(prev, 1)))
  }

  // Moves forward one month (in month view) or one week (in week view).
  function handleNext() {
    setAnchorDate((prev) => (viewMode === 'month' ? addMonths(prev, 1) : addWeeks(prev, 1)))
  }

  function handleShowToday() {
    setAnchorDate(new Date())
  }

  function handleCloseEventDetail() {
    setSelectedEvent(null)
  }

  // Sends the user straight to the selected event's workout or run.
  function handleStartSelectedEvent() {
    if (!selectedEvent) return
    if (selectedEvent.type === 'lift' && selectedEvent.workoutId) {
      onStartLiftingWorkout(selectedEvent.workoutId)
    } else if (selectedEvent.type === 'run' && selectedEvent.runId !== undefined) {
      onStartRun(selectedEvent.runId)
    }
  }

  const title =
    viewMode === 'month'
      ? format(anchorDate, 'MMMM yyyy')
      : `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`

  return (
    <div className="calendar-page">
      <h1>Calendar</h1>
      <p className="page-subtitle">Your upcoming lifts and runs.</p>

      <div className="calendar-toolbar">
        <div className="calendar-view-toggle">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
        </div>

        <div className="calendar-nav">
          <button
            type="button"
            className="calendar-nav-btn"
            onClick={handlePrev}
            aria-label="Previous"
          >
            &larr;
          </button>
          <span className="calendar-title">{title}</span>
          <button type="button" className="calendar-nav-btn" onClick={handleNext} aria-label="Next">
            &rarr;
          </button>
        </div>

        <button type="button" className="calendar-today-btn" onClick={handleShowToday}>
          Today
        </button>
      </div>

      <div className="calendar-weekday-header">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="calendar-weekday">
            {label}
          </div>
        ))}
      </div>

      <div className={`calendar-grid ${viewMode}`}>
        {days.map((day) => {
          const dayWorkouts = getWorkoutsForDay(day)
          const inCurrentMonth = viewMode === 'week' || isSameMonth(day, anchorDate)
          return (
            <div
              key={day.toISOString()}
              className={`calendar-day ${inCurrentMonth ? '' : 'outside'} ${
                isToday(day) ? 'today' : ''
              }`}
            >
              <span className="calendar-day-number">{format(day, 'd')}</span>
              <div className="calendar-day-workouts">
                {dayWorkouts.map((workout) => (
                  <button
                    key={workout.title}
                    type="button"
                    className={`calendar-workout-pill ${workout.type}`}
                    onClick={() => setSelectedEvent(workout)}
                  >
                    <span className="calendar-workout-pill-title">{workout.title}</span>
                    {workout.completed && <i className="fa-solid fa-check"></i>}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={handleCloseEventDetail}
          onStartWorkout={handleStartSelectedEvent}
        />
      )}
    </div>
  )
}

export default CalendarPage
