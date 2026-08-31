import { useState } from 'react'
import './SignUpWizard.css'

// Four-step sign-up flow, taken from the project's design file: 1) choose a
// plan, 2) email + password, 3) "we sent you a code" notice, 4) enter the
// 4-digit code. There's no real backend or billing, so choosing a plan,
// "sending" the email, and "verifying" the code are all just simulated by
// moving between steps.

type Step = 1 | 2 | 3 | 4
type Plan = 'basic' | 'premium'

interface SignUpWizardProps {
  onComplete: (email: string, password: string, plan: Plan) => void
  // Leaves the sign-up flow entirely (from the first step, choosing a plan)
  // and returns to the welcome page.
  onBack: () => void
}

// Password must be at least 8 characters and include a number, a lowercase
// letter, an uppercase letter, and a special character.
function isValidPassword(value: string): boolean {
  return (
    value.length >= 8 &&
    /[0-9]/.test(value) &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  )
}

function SignUpWizard({ onComplete, onBack }: SignUpWizardProps) {
  const [step, setStep] = useState<Step>(1)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState<string[]>(['', '', '', ''])

  const canCreate =
    email.trim().length > 0 && isValidPassword(password) && confirmPassword === password
  const codeComplete = code.every((digit) => digit.length === 1)

  // Updates a single digit box and, once the user types a digit, moves focus
  // to the next box automatically so they can type the whole code without
  // reaching for Tab.
  function handleCodeDigitChange(index: number, value: string) {
    const digit = value.replace(/[^0-9]/g, '').slice(-1)
    const updatedCode = [...code]
    updatedCode[index] = digit
    setCode(updatedCode)

    const isLastBox = index === code.length - 1
    if (digit && !isLastBox) {
      document.getElementById(`code-${index + 1}`)?.focus()
    }
  }

  const stepDots = (
    <div className="wizard-steps">
      <span className={`step-dot ${step >= 1 ? 'active' : ''}`} />
      <span className={`step-dot ${step >= 2 ? 'active' : ''}`} />
      <span className={`step-dot ${step >= 3 ? 'active' : ''}`} />
      <span className={`step-dot ${step >= 4 ? 'active' : ''}`} />
    </div>
  )

  // Step 1 - choosing a plan - is a wide, three-card layout rather than the
  // narrow single-column card the other steps use.
  if (step === 1) {
    return (
      <div className="plan-wrap">
        {stepDots}
        <h1>Choose your plan</h1>
        <p className="wizard-subtitle">
          Pick how you&apos;d like to train for the next three months &mdash; you can change this
          later. Once you&apos;ve completed your training and your first 5k, you can continue to
          use our app to guide your training.
        </p>

        <div className="plan-row">
          <div className="plan-card plan-card-info">
            <div className="plan-kicker">14-Day Free Trial</div>
            <div className="plan-title">Included with every plan</div>
            <p className="plan-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua:
            </p>
            <ul className="plan-list">
              <li>Ut enim ad minim veniam, quis nostrud exercitation.</li>
              <li>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</li>
            </ul>
            <p className="plan-footnote">The free trial is included in either plan you choose.</p>
          </div>

          <button
            type="button"
            className={`plan-card plan-card-select ${selectedPlan === 'basic' ? 'selected' : ''}`}
            onClick={() => setSelectedPlan('basic')}
          >
            <div className="plan-kicker">Basic</div>
            <div className="plan-title">Lorem ipsum</div>
            <p className="plan-description">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
          </button>

          <button
            type="button"
            className={`plan-card plan-card-select ${selectedPlan === 'premium' ? 'selected' : ''}`}
            onClick={() => setSelectedPlan('premium')}
          >
            <div className="plan-kicker">Premium</div>
            <div className="plan-title">Lorem ipsum</div>
            <p className="plan-description">Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
          </button>
        </div>

        <div className="wizard-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!selectedPlan}
            onClick={() => setStep(2)}
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="wizard-card">
      {stepDots}

      {step === 2 && (
        <>
          <h1>Create your account</h1>
          <p className="wizard-subtitle">Start your hybrid running + lifting journey.</p>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <span className="field-hint">
              8+ characters, upper &amp; lower case, a number, and a special character.
            </span>
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
            />
            {confirmPassword.length > 0 && confirmPassword !== password && (
              <span className="field-hint field-error">Passwords don&apos;t match.</span>
            )}
          </label>

          <div className="wizard-actions">
            <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!canCreate}
              onClick={() => setStep(3)}
            >
              Create
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1>Verify your email</h1>
          <p className="wizard-subtitle">
            We'll send a 4-digit code to <strong>{email}</strong> to confirm it's you.
          </p>

          <div className="wizard-actions">
            <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
              Back
            </button>
            <button type="button" className="btn-primary" onClick={() => setStep(4)}>
              Next
            </button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h1>Enter your code</h1>
          <p className="wizard-subtitle">
            Enter the 4-digit code we sent to <strong>{email}</strong>.
          </p>

          <div className="code-inputs">
            {code.map((digit, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeDigitChange(i, e.target.value)}
                className="code-input"
              />
            ))}
          </div>

          <div className="wizard-actions">
            <button type="button" className="btn-secondary" onClick={() => setStep(3)}>
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!codeComplete || !selectedPlan}
              onClick={() => selectedPlan && onComplete(email, password, selectedPlan)}
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default SignUpWizard
