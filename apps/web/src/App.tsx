import { useState } from 'react'
import GetStartedPage from './features/auth/GetStartedPage'
import LoginPage from './features/auth/LoginPage'
import SignUpWizard from './features/auth/SignUpWizard'
import HomePage from './features/home/HomePage'
import CalendarPage from './features/calendar/CalendarPage'
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
// app's pages. Only Home, Calendar, and Lifting Workouts have real pages
// built so far; every other nav destination is still a BlankPage
// placeholder.
type Stage = 'welcome' | 'signup' | 'login' | 'home'

// Page titles for the nav destinations that don't have a real page yet.
const BLANK_PAGE_TITLES: Record<Exclude<PageKey, 'home' | 'calendar' | 'lifting'>, string> = {
  runs: 'Runs',
  exercises: 'Exercise List',
// app's pages. Only Home, Calendar, and Exercise List have real pages built
// so far; every other nav destination is still a BlankPage placeholder.
type Stage = 'welcome' | 'signup' | 'login' | 'home'

// Page titles for the nav destinations that don't have a real page yet.
const BLANK_PAGE_TITLES: Record<Exclude<PageKey, 'home' | 'calendar' | 'exercises'>, string> = {
  runs: 'Runs',
  lifting: 'Lifting Workouts',
  account: 'Account',
}

function App() {
  const [stage, setStage] = useState<Stage>('welcome')
  const [email, setEmail] = useState('')
  const [activePage, setActivePage] = useState<PageKey>('home')
  const [workouts, setWorkouts] = useState<LiftingWorkout[]>(INITIAL_WORKOUTS)

  // Which workout's detail page is showing within Lifting Workouts, if any
  // (null shows the workout list instead).
  const [viewingWorkoutId, setViewingWorkoutId] = useState<string | null>(null)

  // The exercise catalog is static (no backend yet), but workouts are
  // mutable - the Exercise List page can add/remove exercises and
  // warmup/cooldown activities on them.
  const [workouts, setWorkouts] = useState<LiftingWorkout[]>(INITIAL_WORKOUTS)

  function handleSignUpComplete(userEmail: string) {
    setEmail(userEmail)
    setStage('home')
  }

  function handleLogIn(userEmail: string) {
    setEmail(userEmail)
    setStage('home')
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

  // Hands off to the Exercise List page - not built yet, so this just lands
  // on its BlankPage placeholder for now.
  function handleAddExerciseClick() {
    setActivePage('exercises')
  }

  function handleNavigate(page: PageKey) {
    if (page !== 'lifting') {
      setViewingWorkoutId(null)
    }
    setActivePage(page)
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

  // Display name is whatever's before the @ in the email.
  const name = email ? email.split('@')[0] : 'Athlete'

  const viewingWorkout = viewingWorkoutId
    ? (workouts.find((workout) => workout.id === viewingWorkoutId) ?? null)
    : null

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
            {activePage !== 'home' && activePage !== 'calendar' && activePage !== 'lifting' && (
            {activePage === 'exercises' && (
              <ExerciseListPage
                addTargetWorkoutId={null}
                workouts={workouts}
                exercises={EXERCISES}
                onAddExerciseToWorkout={handleAddExerciseToWorkout}
                onRemoveExerciseFromWorkout={handleRemoveExerciseFromWorkout}
                onAddActivityToWorkout={handleAddActivityToWorkout}
                returnWorkoutTitle={null}
                onReturnToWorkout={() => setActivePage('lifting')}
              />
            )}
            {activePage !== 'home' && activePage !== 'calendar' && activePage !== 'exercises' && (
              <BlankPage title={BLANK_PAGE_TITLES[activePage]} />
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default App
