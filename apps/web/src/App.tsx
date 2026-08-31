import { useState } from 'react'
import GetStartedPage from './features/auth/GetStartedPage'
import LoginPage from './features/auth/LoginPage'
import SignUpWizard from './features/auth/SignUpWizard'
import HomePage from './features/home/HomePage'
import CalendarPage from './features/calendar/CalendarPage'
import AccountPage from './features/account/AccountPage'
import SideNav from './shared/SideNav'
import BlankPage from './shared/BlankPage'
import type { PageKey } from './types'
import './App.css'

// Root component. There's no backend yet and no router: `stage` switches
// between the welcome page and the sign-up/log-in flows, and (once signed
// in) `activePage` - driven by the side nav - switches between the main
// app's pages. Only Home, Calendar, and Account have real pages built so
// far; every other nav destination is still a BlankPage placeholder.
type Stage = 'welcome' | 'signup' | 'login' | 'home'

// Page titles for the nav destinations that don't have a real page yet.
const BLANK_PAGE_TITLES: Record<Exclude<PageKey, 'home' | 'calendar' | 'account'>, string> = {
  runs: 'Runs',
  lifting: 'Lifting Workouts',
  exercises: 'Exercise List',
}

function App() {
  const [stage, setStage] = useState<Stage>('welcome')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [activePage, setActivePage] = useState<PageKey>('home')

  function handleSignUpComplete(userEmail: string, userPassword: string) {
    setEmail(userEmail)
    setPassword(userPassword)
    setStage('home')
  }

  function handleLogIn(userEmail: string, userPassword: string) {
    setEmail(userEmail)
    setPassword(userPassword)
    setStage('home')
  }

  // Logging out just returns to the welcome page - there's no backend
  // session to end, so this is purely local state.
  function handleLogout() {
    setStage('welcome')
    setActivePage('home')
    setEmail('')
    setPassword('')
  }

  // Deleting the account is functionally the same as logging out for now -
  // there's no backend record to actually delete yet.
  function handleDeleteAccount() {
    handleLogout()
  }

  // Display name is whatever's before the @ in the email.
  const name = email ? email.split('@')[0] : 'Athlete'

  return (
    <div className="app-shell">
      {stage === 'welcome' && (
        <GetStartedPage onSignUp={() => setStage('signup')} onLogIn={() => setStage('login')} />
      )}

      {stage === 'login' && (
        <LoginPage
          onBack={() => setStage('welcome')}
          onLogIn={(userEmail, userPassword) => handleLogIn(userEmail, userPassword)}
        />
      )}

      {stage === 'signup' && (
        <div className="centered">
          <SignUpWizard
            onComplete={(userEmail, userPassword) => handleSignUpComplete(userEmail, userPassword)}
            onBack={() => setStage('welcome')}
          />
        </div>
      )}

      {stage === 'home' && (
        <div className="app-layout">
          <SideNav active={activePage} onNavigate={setActivePage} />
          <main className="app-main">
            {activePage === 'home' && (
              <HomePage name={name} onStartWorkout={() => setActivePage('lifting')} />
            )}
            {activePage === 'calendar' && (
              <CalendarPage
                onStartLiftingWorkout={() => setActivePage('lifting')}
                onStartRun={() => setActivePage('runs')}
              />
            )}
            {activePage === 'account' && (
              <AccountPage
                name={name}
                email={email}
                password={password}
                onLogout={handleLogout}
                onDelete={handleDeleteAccount}
              />
            )}
            {activePage !== 'home' && activePage !== 'calendar' && activePage !== 'account' && (
              <BlankPage title={BLANK_PAGE_TITLES[activePage]} />
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default App
