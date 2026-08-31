import { useState } from 'react'
import GetStartedPage from './features/auth/GetStartedPage'
import LoginPage from './features/auth/LoginPage'
import SignUpWizard from './features/auth/SignUpWizard'
import HomePage from './features/home/HomePage'
import SideNav from './shared/SideNav'
import BlankPage from './shared/BlankPage'
import type { PageKey } from './types'
import './App.css'

// Root component. There's no backend yet and no router: `stage` switches
// between the welcome page and the sign-up/log-in flows, and (once signed
// in) `activePage` - driven by the side nav - switches between the main
// app's pages. Only Home has a real page built so far; every other nav
// destination is still a BlankPage placeholder.
type Stage = 'welcome' | 'signup' | 'login' | 'home'

// Page titles for the nav destinations that don't have a real page yet.
const BLANK_PAGE_TITLES: Record<Exclude<PageKey, 'home'>, string> = {
  calendar: 'Calendar',
  runs: 'Runs',
  lifting: 'Lifting Workouts',
  exercises: 'Exercise List',
  account: 'Account',
}

function App() {
  const [stage, setStage] = useState<Stage>('welcome')
  const [email, setEmail] = useState('')
  const [activePage, setActivePage] = useState<PageKey>('home')

  function handleSignUpComplete(userEmail: string) {
    setEmail(userEmail)
    setStage('home')
  }

  function handleLogIn(userEmail: string) {
    setEmail(userEmail)
    setStage('home')
  }

  // Display name is whatever's before the @ in the email.
  const name = email ? email.split('@')[0] : 'Athlete'

  return (
    <div className="app-shell">
      {stage === 'welcome' && (
        <GetStartedPage onSignUp={() => setStage('signup')} onLogIn={() => setStage('login')} />
      )}

      {stage === 'login' && (
        <LoginPage onBack={() => setStage('welcome')} onLogIn={(userEmail) => handleLogIn(userEmail)} />
      )}

      {stage === 'signup' && (
        <div className="centered">
          <SignUpWizard
            onComplete={(userEmail) => handleSignUpComplete(userEmail)}
            onBack={() => setStage('welcome')}
          />
        </div>
      )}

      {stage === 'home' && (
        <div className="app-layout">
          <SideNav active={activePage} onNavigate={setActivePage} />
          <main className="app-main">
            {activePage === 'home' ? (
              <HomePage name={name} onStartWorkout={() => setActivePage('lifting')} />
            ) : (
              <BlankPage title={BLANK_PAGE_TITLES[activePage]} />
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default App
