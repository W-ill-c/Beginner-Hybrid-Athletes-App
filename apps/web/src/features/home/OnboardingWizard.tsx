import { useState } from 'react'
import './OnboardingWizard.css'

// Three-step questionnaire shown once, right after sign-up, so we can build
// a (currently dummy) plan around the user's answers:
//   1. How much time/how many days they can train.
//   2. Their current fitness level and goals.
//   3. Their name and (optional) height/weight.
// Hitting "Done" posts all of it to POST /api/onboarding, which stores the
// answers on the user and hands back today's workout for the home page.

type Step = 1 | 2 | 3

type WorkoutDuration = '0-30' | '31-60' | '60-90' | '90+'
type Priority = 'running' | 'lifting' | 'both'

export interface OnboardingSubmission {
  duration: WorkoutDuration
  daysPerWeek: number
  activityLevel: string
  priority: Priority
  firstName: string
  lastName: string
  height: string
  weight: string
}

interface OnboardingWizardProps {
  name: string
  onFinish: (submission: OnboardingSubmission) => Promise<void>
}

const DURATION_OPTIONS: { key: WorkoutDuration; label: string }[] = [
  { key: '0-30', label: '0-30 mins' },
  { key: '31-60', label: '31 mins - 1 hour' },
  { key: '60-90', label: '1 - 1.5 hours' },
  { key: '90+', label: '1.5+ hours' },
]

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7]

const ACTIVITY_OPTIONS = ['Not very active', 'Somewhat active', 'Active', 'Very active']

const PRIORITY_OPTIONS: { key: Priority; label: string }[] = [
  { key: 'running', label: 'Running' },
  { key: 'lifting', label: 'Lifting' },
  { key: 'both', label: 'Both Equal' },
]

function OnboardingWizard({ name, onFinish }: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>(1)

  const [duration, setDuration] = useState<WorkoutDuration | null>(null)
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null)

  const [activityLevel, setActivityLevel] = useState<string | null>(null)
  const [priority, setPriority] = useState<Priority | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const canContinueStep1 = duration !== null && daysPerWeek !== null
  const canContinueStep2 = activityLevel !== null && priority !== null
  const canFinish = firstName.trim() !== ''

  async function handleDoneClick() {
    if (!duration || daysPerWeek === null || !activityLevel || !priority || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onFinish({ duration, daysPerWeek, activityLevel, priority, firstName, lastName, height, weight })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="wizard-steps">
          <span className={`step-dot ${step >= 1 ? 'active' : ''}`} />
          <span className={`step-dot ${step >= 2 ? 'active' : ''}`} />
          <span className={`step-dot ${step >= 3 ? 'active' : ''}`} />
        </div>

        {step === 1 && (
          <>
            <h1>Welcome, {name}!</h1>
            <p className="wizard-subtitle">
              How much time can you dedicate to a single workout?
            </p>
            <div className="option-grid">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`option-pill ${duration === option.key ? 'selected' : ''}`}
                  onClick={() => setDuration(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <p className="wizard-subtitle">How many days a week can you work out?</p>
            <div className="option-grid">
              {DAYS_OPTIONS.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`option-pill ${daysPerWeek === day ? 'selected' : ''}`}
                  onClick={() => setDaysPerWeek(day)}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="wizard-actions">
              <button
                type="button"
                className="btn-primary"
                disabled={!canContinueStep1}
                onClick={() => setStep(2)}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Your current fitness</h1>
            <p className="wizard-subtitle">How active would you say you are?</p>
            <div className="option-grid">
              {ACTIVITY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`option-pill ${activityLevel === option ? 'selected' : ''}`}
                  onClick={() => setActivityLevel(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <p className="wizard-subtitle">Do you want to prioritise running or lifting?</p>
            <div className="option-grid">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`option-pill ${priority === option.key ? 'selected' : ''}`}
                  onClick={() => setPriority(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="wizard-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!canContinueStep2}
                onClick={() => setStep(3)}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1>Almost done</h1>
            <p className="wizard-subtitle">What should we call you?</p>

            <label className="field">
              <span>First name</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </label>
            <label className="field">
              <span>Last name (optional)</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Optional"
              />
            </label>

            <p className="wizard-subtitle">
              The rest are optional, but help us fine-tune your plan.
            </p>

            <label className="field">
              <span>Height (cm)</span>
              <input
                type="number"
                min="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Optional"
              />
            </label>
            <label className="field">
              <span>Weight (kg)</span>
              <input
                type="number"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Optional"
              />
            </label>

            {submitError && <span className="field-hint field-error">{submitError}</span>}

            <div className="wizard-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!canFinish || submitting}
                onClick={handleDoneClick}
              >
                {submitting ? 'Saving...' : 'Done'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OnboardingWizard
