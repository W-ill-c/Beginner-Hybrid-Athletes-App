import { useState } from 'react'
import './LoginPage.css'

// Log-in card, taken from the project's design file. Submitting calls the
// backend's POST /api/auth/login - on success the caller gets the matching
// user record, on failure (wrong email/password) the error is shown here so
// the user can try again.

interface LoginPageProps {
  onBack: () => void
  onLogIn: (email: string, password: string) => Promise<void>
}

function LoginPage({ onBack, onLogIn }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canLogIn = email.trim() !== '' && password.trim() !== ''

  async function handleLogInClick() {
    if (!canLogIn || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onLogIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <button type="button" className="login-back" onClick={onBack}>
          &larr; Back
        </button>

        <h2>Log in</h2>
        <p className="login-subtitle">Welcome back &mdash; pick up where you left off.</p>

        <label className="login-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </label>

        {error && <span className="login-error">{error}</span>}

        <button
          type="button"
          className="btn btn-primary login-submit"
          disabled={!canLogIn || submitting}
          onClick={handleLogInClick}
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </div>
    </div>
  )
}

export default LoginPage
