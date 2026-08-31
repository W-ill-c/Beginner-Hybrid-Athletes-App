import { useEffect, useState } from 'react'
import RunCompleteModal from './RunCompleteModal'
import './RunTimerPage.css'

// Guided timer for a single run: warm up, run (with rest breaks), then cool
// down. Progress is drawn as a single semicircular gauge, split into one
// coloured arc segment per phase (light grey for warmup, orange for running,
// grey for rest, black for cooldown), with a green overlay arc sweeping
// across on top to show overall progress. The current phase and time
// remaining are shown in the middle of the gauge.
//
// This mirrors the redesigned run page from the project's design file
// (colours, square-cornered "Archivo" look, and the semicircle gauge layout).
//
// The UI below is generic: it just draws one arc segment per entry in the
// `phases` prop, whatever the mix of types, order, or lengths. That matters
// because the backend's dummy run data stands in for what will eventually
// be an AI-generated plan - a real one might have a longer or shorter run,
// more or fewer walk breaks, or a warmup/cooldown of a different length, and
// none of that should require changing this component.

interface RunTimerPageProps {
  runId: number
  // The run's phases, fetched from GET /api/runs by the caller (RunsPage) -
  // this component just draws whatever it's given, so it doesn't care
  // whether that's 10 phases or 3, or how long each one is.
  phases: RunPhase[]
  onBack: () => void
  // Lets the caller change what the back button says - e.g. "Back to
  // calendar" instead of "Back to runs" when the run was opened from a
  // calendar event.
  backLabel?: string
  onComplete: (runId: number) => void
}

type TimerStatus = 'idle' | 'running' | 'paused' | 'complete'
type PhaseType = 'warmup' | 'run' | 'rest' | 'cooldown'

interface RunPhase {
  type: PhaseType
  durationSeconds: number
}

const PHASE_LABELS: Record<PhaseType, string> = {
  warmup: 'Warmup',
  run: 'Run',
  rest: 'Rest',
  cooldown: 'Cooldown',
}

// Colours straight from the design file's run page.
const PHASE_COLORS: Record<PhaseType, string> = {
  warmup: '#f9f9f9',
  run: '#e85002',
  rest: '#a7a7a7',
  cooldown: '#000000',
}

const PROGRESS_COLOR = '#628b35'

// The gauge is a semicircle (180deg, flat side down) drawn inside a
// 420x220 viewBox.
const ARC_CX = 210
const ARC_CY = 210
const ARC_R = 165
const ARC_VIEW_BOX = '0 0 420 220'
const OVERLAY_LENGTH = ARC_R * Math.PI

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

// Describes an SVG arc path along the gauge's circle between two angles
// (0deg = 3 o'clock, 180deg = 9 o'clock, sweeping over the top).
function describeArc(startAngle: number, endAngle: number) {
  const start = polarToCartesian(ARC_CX, ARC_CY, ARC_R, startAngle)
  const end = polarToCartesian(ARC_CX, ARC_CY, ARC_R, endAngle)
  const largeArc = Math.abs(startAngle - endAngle) > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${ARC_R} ${ARC_R} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

// Splits the semicircle into one arc segment per phase, sized proportionally
// to that phase's share of the total run time.
function buildSegments(phases: RunPhase[], totalSeconds: number) {
  let cursor = 180
  return phases.map((phase) => {
    const sweepDeg = 180 * (phase.durationSeconds / totalSeconds)
    const startDeg = cursor
    const endDeg = cursor - sweepDeg
    cursor = endDeg
    return { d: describeArc(startDeg, endDeg), color: PHASE_COLORS[phase.type] }
  })
}

// Given how many seconds have elapsed, works out which phase we're
// currently in.
function getCurrentPhaseIndex(elapsedSeconds: number, phases: RunPhase[]) {
  let remaining = elapsedSeconds
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i]
    const isLastPhase = i === phases.length - 1
    if (remaining < phase.durationSeconds || isLastPhase) {
      return i
    }
    remaining -= phase.durationSeconds
  }
  return phases.length - 1
}

const OVERLAY_D = describeArc(180, 0)

function RunTimerPage({
  runId,
  phases,
  onBack,
  backLabel = 'Back to runs',
  onComplete,
}: RunTimerPageProps) {
  const totalSeconds = phases.reduce((sum, phase) => sum + phase.durationSeconds, 0)

  const [status, setStatus] = useState<TimerStatus>('idle')
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [instantFill, setInstantFill] = useState(false)

  // The actual countdown: ticks once a second while running.
  useEffect(() => {
    if (status !== 'running') return
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setStatus('complete')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [status])

  // Whenever the run finishes - either the clock reaching 0 or the user
  // clicking Finish - show the "Well Done" modal.
  useEffect(() => {
    if (status === 'complete') {
      setShowCompleteModal(true)
    }
  }, [status])

  // While true, the progress overlay's CSS transition is switched off so the
  // jump to fully filled on Finish renders in a single frame instead of
  // sweeping across the gauge.
  useEffect(() => {
    if (!instantFill) return
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setInstantFill(false))
    })
    return () => cancelAnimationFrame(raf)
  }, [instantFill])

  function handleRestart() {
    setStatus('idle')
    setSecondsRemaining(totalSeconds)
  }

  function handleFinish() {
    setInstantFill(true)
    setSecondsRemaining(0)
    setStatus('complete')
  }

  function handleCompleteModalClose() {
    setShowCompleteModal(false)
    onComplete(runId)
  }

  const elapsedSeconds = totalSeconds - secondsRemaining
  const currentPhaseIndex = getCurrentPhaseIndex(elapsedSeconds, phases)
  const currentPhaseLabel = PHASE_LABELS[phases[currentPhaseIndex].type]

  const segments = buildSegments(phases, totalSeconds)
  const overlayOffset = OVERLAY_LENGTH - OVERLAY_LENGTH * (elapsedSeconds / totalSeconds)

  // The legend should list each phase type once, even though `phases` can
  // contain several rows of the same type (multiple 1-minute run rows).
  const legendPhaseTypes = Array.from(new Set(phases.map((phase) => phase.type)))

  return (
    <div className="run-timer-page">
      <div className="run-timer-page-inner">
        <button type="button" className="back-button" onClick={onBack}>
          &larr; {backLabel}
        </button>

        <h1>Run {runId}</h1>

        <div className="run-timer-legend">
          {legendPhaseTypes.map((phaseType) => (
            <span key={phaseType} className="run-timer-legend-item">
              <span
                className="run-timer-legend-swatch"
                style={{ background: PHASE_COLORS[phaseType] }}
              />
              {PHASE_LABELS[phaseType]}
            </span>
          ))}
        </div>

        <div className="run-timer-arc-wrap">
          <svg viewBox={ARC_VIEW_BOX} className="run-timer-arc-svg">
            <path
              d={OVERLAY_D}
              stroke="rgba(0, 0, 0, 0.18)"
              strokeWidth={32}
              fill="none"
              strokeLinecap="butt"
            />
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.d}
                stroke={segment.color}
                strokeWidth={30}
                fill="none"
                strokeLinecap="butt"
              />
            ))}
            <path
              d={OVERLAY_D}
              stroke={PROGRESS_COLOR}
              strokeWidth={30}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={OVERLAY_LENGTH}
              strokeDashoffset={overlayOffset}
              className={`run-timer-arc-progress ${instantFill ? 'no-transition' : ''}`}
            />
          </svg>
          <div className="run-timer-arc-center">
            <span className="run-timer-phase-tag">{currentPhaseLabel}</span>
            <span className="run-timer-countdown-text">{formatTime(secondsRemaining)}</span>
          </div>
        </div>

        <div className="run-timer-buttons">
          <div className="run-timer-buttons-group">
            {status === 'idle' && (
              <button type="button" className="btn btn-primary run-timer-start" onClick={() => setStatus('running')}>
                Start
              </button>
            )}

            {(status === 'running' || status === 'paused') && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary run-timer-pause"
                  onClick={() => setStatus(status === 'running' ? 'paused' : 'running')}
                >
                  {status === 'running' ? 'Pause' : 'Resume'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleRestart}>
                  Restart
                </button>
                <button type="button" className="btn btn-primary" onClick={handleFinish}>
                  Finish
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showCompleteModal && <RunCompleteModal runId={runId} onClose={handleCompleteModalClose} />}
    </div>
  )
}

export default RunTimerPage
