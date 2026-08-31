import { useState } from 'react'
import GetStartedPage from './features/auth/GetStartedPage'
import LoginPage from './features/auth/LoginPage'
import SignUpWizard from './features/auth/SignUpWizard'
import BlankPage from './shared/BlankPage'
import './App.css'

// Root component. There's no backend yet and no router: `stage` switches
// between the welcome page and the sign-up/log-in flows. Either one
// completing lands the user on a blank placeholder page - the rest of the
// app (home, onboarding, etc.) lands on top of this shell in later
// branches.
type Stage = 'welcome' | 'signup' | 'login' | 'done'

function App() {
  const [stage, setStage] = useState<Stage>('welcome')

  function handleSignUpComplete() {
    setStage('done')
  }

  function handleLogIn() {
    setStage('done')
  }

  return (
    <div className="app-shell">
      {stage === 'welcome' && (
        <GetStartedPage onSignUp={() => setStage('signup')} onLogIn={() => setStage('login')} />
      )}

      {stage === 'login' && <LoginPage onBack={() => setStage('welcome')} onLogIn={handleLogIn} />}

      {stage === 'signup' && (
        <div className="centered">
          <SignUpWizard onComplete={handleSignUpComplete} onBack={() => setStage('welcome')} />
        </div>
      )}

      {stage === 'done' && <BlankPage title="Welcome" />}
    </div>
  )
}

export default App
