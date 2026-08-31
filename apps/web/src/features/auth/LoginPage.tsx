import { useState } from 'react'
import './LoginPage.css'

// Log-in card, taken from the project's design file. There's no real
// backend to check credentials against, so submitting just hands the email
// and password up to the caller - App treats any non-empty login as a
// returning user and drops them straight into the app.

interface LoginPageProps {
  onBack: () => void
  onLogIn: (email: string, password: string) => void
}

function LoginPage({ onBack, onLogIn }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const canLogIn = email.trim() !== '' && password.trim() !== ''

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

        <button
          type="button"
          className="btn btn-primary login-submit"
          disabled={!canLogIn}
          onClick={() => onLogIn(email, password)}
        >
          Log in
        </button>
      </div>
    </div>
  )
}

export default LoginPage
