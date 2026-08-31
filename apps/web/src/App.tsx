import { useState } from 'react'
import GetStartedPage from './features/auth/GetStartedPage'
import LoginPage from './features/auth/LoginPage'
import SignUpWizard from './features/auth/SignUpWizard'
import HomePage from './features/home/HomePage'
import CalendarPage from './features/calendar/CalendarPage'
import AccountPage from './features/account/AccountPage'
import LiftingWorkoutsPage from './features/workouts/LiftingWorkoutsPage'
import WorkoutDetailPage from './features/workouts/WorkoutDetailPage'
import ExerciseListPage from './features/exercises/ExerciseListPage'
import SideNav from './shared/SideNav'
import BlankPage from './shared/BlankPage'
import { INITIAL_WORKOUTS } from './data/workouts'
import type { LiftingWorkout, WorkoutActivity } from './data/workouts'
import { EXERCISES } from './data/exercises'
import type { PageKey } from './types'
import './App.css'

// Root component. There's no backend yet and no router: `stage` switches
// between the welcome page and the sign-up/log-in flows, and (once signed
// in) `activePage` - driven by the side nav - switches between the main
// app's pages. Home, Calendar, Account, Lifting Workouts, and Exercise
// List all have real pages built; Runs is still a BlankPage placeholder.
type Stage = 'welcome' | 'signup' | 'login' | 'home'

// Page titles for the nav destinations that don't have a real page yet.
const BLANK_PAGE_TITLES: Record<Exclude<PageKey, 'home' | 'calendar' | 'account' | 'lifting' | 'exercises'>, string> = {
  runs: 'Runs',
}

function App() {
  const [stage, setStage] = useState<Stage>('welcome')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [activePage, setActivePage] = useState<PageKey>('home')

  // The exercise catalog is static (no backend yet), but workouts are
  // mutable - Lifting Workouts and Exercise List both add/remove exercises
  // and warmup/cooldown activities on them.
  const [workouts, setWorkouts] = useState<LiftingWorkout[]>(INITIAL_WORKOUTS)

  // Which workout's detail page is showing within Lifting Workouts, if any
  // (null shows the workout list instead).
  const [viewingWorkoutId, setViewingWorkoutId] = useState<string | null>(null)

  // Set while the user is adding an exercise to a specific workout (via a
  // workout's "+ Add" button) - Exercise List reads this to show its
  // Add/Remove controls and the "Back to <workout>" link.
  const [addTargetWorkoutId, setAddTargetWorkoutId] = useState<string | null>(null)

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
    setViewingWorkoutId(null)
    setAddTargetWorkoutId(null)
    setWorkouts(INITIAL_WORKOUTS)
  }

  // Deleting the account is functionally the same as logging out for now -
  // there's no backend record to actually delete yet.
  function handleDeleteAccount() {
    handleLogout()
  }

  function handleAddExerciseToWorkout(workoutId: string, exerciseId: string) {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === workoutId && !workout.exerciseIds.includes(exerciseId)
          ? { ...workout, exerciseIds: [...workout.exerciseIds, exerciseId] }
          : workout,
      ),
    )
  }

  function handleRemoveExerciseFromWorkout(workoutId: string, exerciseId: string) {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === workoutId
          ? { ...workout, exerciseIds: workout.exerciseIds.filter((id) => id !== exerciseId) }
          : workout,
      ),
    )
  }

  function handleAddActivityToWorkout(
    workoutId: string,
    category: 'warmup' | 'cooldown',
    activity: WorkoutActivity,
  ) {
    setWorkouts((prev) =>
      prev.map((workout) => {
        if (workout.id !== workoutId) return workout
        const alreadyAdded = workout[category].some((existing) => existing.name === activity.name)
        return alreadyAdded ? workout : { ...workout, [category]: [...workout[category], activity] }
      }),
    )
  }

  function handleUpdateWorkoutWarmup(workoutId: string, warmup: WorkoutActivity[]) {
    setWorkouts((prev) =>
      prev.map((workout) => (workout.id === workoutId ? { ...workout, warmup } : workout)),
    )
  }

  function handleUpdateWorkoutCooldown(workoutId: string, cooldown: WorkoutActivity[]) {
    setWorkouts((prev) =>
      prev.map((workout) => (workout.id === workoutId ? { ...workout, cooldown } : workout)),
    )
  }

  function handleUpdateWorkoutExerciseIds(workoutId: string, exerciseIds: string[]) {
    setWorkouts((prev) =>
      prev.map((workout) => (workout.id === workoutId ? { ...workout, exerciseIds } : workout)),
    )
  }

  function handleStartWorkout(workoutId: string) {
    setViewingWorkoutId(workoutId)
    setActivePage('lifting')
  }

  function handleViewWorkoutDetails(workoutId: string) {
    setViewingWorkoutId(workoutId)
  }

  function handleBackToWorkouts() {
    setViewingWorkoutId(null)
  }

  // Hands off to the Exercise List page, with addTargetWorkoutId set so it
  // shows Add/Remove controls and a "Back to <workout>" link instead of its
  // normal browse-only view.
  function handleAddExerciseClick(workoutId: string) {
    setAddTargetWorkoutId(workoutId)
    setActivePage('exercises')
  }

  // Leaves the "adding an exercise" flow and returns to the workout that
  // was being edited.
  function handleReturnToWorkout() {
    setAddTargetWorkoutId(null)
    setActivePage('lifting')
  }

  // Clicking a side nav item leaves whichever "in progress" state belonged
  // to the page being left, so it doesn't linger the next time that page is
  // visited.
  function handleNavigate(page: PageKey) {
    if (page !== 'lifting') {
      setViewingWorkoutId(null)
    }
    if (page !== 'exercises') {
      setAddTargetWorkoutId(null)
    }
    setActivePage(page)
  }

  // Display name is whatever's before the @ in the email.
  const name = email ? email.split('@')[0] : 'Athlete'

  const viewingWorkout = viewingWorkoutId
    ? (workouts.find((workout) => workout.id === viewingWorkoutId) ?? null)
    : null
  const addTargetWorkout = addTargetWorkoutId
    ? (workouts.find((workout) => workout.id === addTargetWorkoutId) ?? null)
    : null

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
          <SideNav active={activePage} onNavigate={handleNavigate} />
          <main className="app-main">
            {activePage === 'home' && (
              <HomePage name={name} onStartWorkout={handleStartWorkout} />
            )}
            {activePage === 'calendar' && (
              <CalendarPage
                onStartLiftingWorkout={handleStartWorkout}
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
            {/* Lifting Workouts shows either one workout's detail page (if
                the user drilled into one) or the list of all workouts. */}
            {activePage === 'lifting' && viewingWorkout && (
              <WorkoutDetailPage
                workout={viewingWorkout}
                onBack={handleBackToWorkouts}
                onAddExercise={handleAddExerciseClick}
                onAddExerciseToWorkout={handleAddExerciseToWorkout}
                onUpdateWarmup={handleUpdateWorkoutWarmup}
                onUpdateCooldown={handleUpdateWorkoutCooldown}
                onUpdateExerciseIds={handleUpdateWorkoutExerciseIds}
              />
            )}
            {activePage === 'lifting' && !viewingWorkout && (
              <LiftingWorkoutsPage
                workouts={workouts}
                onAddExercise={handleAddExerciseClick}
                onDeleteExercise={handleRemoveExerciseFromWorkout}
                onViewDetails={handleViewWorkoutDetails}
              />
            )}
            {activePage === 'exercises' && (
              <ExerciseListPage
                addTargetWorkoutId={addTargetWorkoutId}
                workouts={workouts}
                exercises={EXERCISES}
                onAddExerciseToWorkout={handleAddExerciseToWorkout}
                onRemoveExerciseFromWorkout={handleRemoveExerciseFromWorkout}
                onAddActivityToWorkout={handleAddActivityToWorkout}
                returnWorkoutTitle={addTargetWorkout?.title ?? null}
                onReturnToWorkout={handleReturnToWorkout}
              />
            )}
            {activePage === 'runs' && <BlankPage title={BLANK_PAGE_TITLES.runs} />}
          </main>
        </div>
      )}
    </div>
  )
}

export default App
