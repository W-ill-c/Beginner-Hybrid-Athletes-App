import { Fragment, useEffect, useState } from 'react'
import RunTimerPage from './RunTimerPage'
import './RunsPage.css'

// Overview grid of all the user's runs, laid out as a "snake" path (left to
// right, down, right to left, down, and so on) with up to 3 nodes per row on
// wide screens, fewer on narrower ones. Clicking a node opens RunTimerPage
// for that run; finishing a run there marks its node done back here.

interface RunNode {
  id: number
  done: boolean
}

const TOTAL_RUNS = 9

function createInitialRuns(): RunNode[] {
  return Array.from({ length: TOTAL_RUNS }, (_, index) => ({
    id: index + 1,
    done: false,
  }))
}

// How many run nodes fit in a row at the current screen width.
function getNodesPerRow(width: number) {
  if (width >= 900) return 3
  if (width >= 600) return 2
  return 1
}

// Odd-numbered rows (2nd, 4th, ...) are displayed in reverse order, which is
// what makes the grid read as a snake instead of plain left-to-right rows.
function getDisplayRow(row: RunNode[], rowIndex: number, nodesPerRow: number) {
  const isReversedRow = nodesPerRow > 1 && rowIndex % 2 === 1
  return isReversedRow ? [...row].reverse() : row
}

interface RunsPageProps {
  // Set when the user should be dropped straight into a specific run's
  // timer (e.g. arriving here via "Workout Now" on a calendar event) rather
  // than seeing the grid first.
  initialRunId?: number | null
  // Whether that initial run was reached via the calendar - if so, its back
  // button returns to the calendar (and says so) instead of to the grid.
  cameFromCalendar?: boolean
  onBackToCalendar?: () => void
}

function RunsPage({ initialRunId = null, cameFromCalendar = false, onBackToCalendar }: RunsPageProps) {
  const [nodesPerRow, setNodesPerRow] = useState(() =>
    typeof window !== 'undefined' ? getNodesPerRow(window.innerWidth) : 3,
  )
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null)
  // Whether the CURRENTLY selected run was reached via the calendar hand-off
  // rather than by clicking a node in the grid - tracked separately from the
  // `cameFromCalendar` prop so picking a different run directly from the
  // grid afterwards doesn't inherit a stale "from calendar" back button.
  const [selectedViaCalendar, setSelectedViaCalendar] = useState(false)
  const [runs, setRuns] = useState<RunNode[]>(createInitialRuns)

  useEffect(() => {
    const handleResize = () => setNodesPerRow(getNodesPerRow(window.innerWidth))
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (initialRunId !== null) {
      setSelectedRunId(initialRunId)
      setSelectedViaCalendar(cameFromCalendar)
    }
    // Only re-run when a new initial run id arrives - `cameFromCalendar` is
    // read alongside it, not tracked independently.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRunId])

  function handleSelectRun(runId: number) {
    setSelectedRunId(runId)
    setSelectedViaCalendar(false)
  }

  function handleBackToGrid() {
    if (selectedViaCalendar && onBackToCalendar) {
      onBackToCalendar()
      return
    }
    setSelectedRunId(null)
  }

  // Marks a run as done and returns to the grid once RunTimerPage reports
  // that the user finished it.
  function handleRunComplete(runId: number) {
    setRuns((prev) => prev.map((run) => (run.id === runId ? { ...run, done: true } : run)))
    setSelectedRunId(null)
    setSelectedViaCalendar(false)
  }

  // While a run is selected, show its timer page instead of the grid.
  if (selectedRunId !== null) {
    return (
      <RunTimerPage
        runId={selectedRunId}
        onBack={handleBackToGrid}
        onComplete={handleRunComplete}
        backLabel={selectedViaCalendar ? 'Back to calendar' : 'Back to runs'}
      />
    )
  }

  // Split the flat list of runs into rows of `nodesPerRow` for rendering.
  const rows: RunNode[][] = []
  for (let i = 0; i < runs.length; i += nodesPerRow) {
    rows.push(runs.slice(i, i + nodesPerRow))
  }

  return (
    <div className="runs-page">
      <h1>Runs</h1>
      <p className="page-subtitle">Track your progress through the run plan.</p>

      <div className="run-progress">
        {rows.map((row, rowIndex) => {
          const isReversedRow = nodesPerRow > 1 && rowIndex % 2 === 1
          const displayRow = getDisplayRow(row, rowIndex, nodesPerRow)
          const isLastRow = rowIndex === rows.length - 1

          // Which side of the row the path exits from, so the connector
          // down to the next row lines up underneath it.
          const turnAlign = nodesPerRow === 1 ? 'center' : isReversedRow ? 'left' : 'right'

          const nextRow = rows[rowIndex + 1]
          const nextDisplayRow = nextRow ? getDisplayRow(nextRow, rowIndex + 1, nodesPerRow) : null
          const isTurnDone =
            displayRow[displayRow.length - 1].done && Boolean(nextDisplayRow?.[0]?.done)

          return (
            <div key={rowIndex} className="run-row-wrapper">
              <div className="run-row">
                {displayRow.map((run, i) => (
                  <Fragment key={run.id}>
                    <button
                      type="button"
                      className={`run-node ${run.done ? 'done' : ''}`}
                      onClick={() => handleSelectRun(run.id)}
                    >
                      {run.done ? <i className="fa-solid fa-check"></i> : run.id}
                    </button>
                    {i < displayRow.length - 1 && (
                      <div
                        className={`run-connector ${
                          run.done && displayRow[i + 1].done ? 'done' : ''
                        }`}
                      />
                    )}
                  </Fragment>
                ))}
              </div>

              {!isLastRow && (
                <div className={`run-turn align-${turnAlign}`}>
                  <div className={`run-turn-line ${isTurnDone ? 'done' : ''}`} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RunsPage
