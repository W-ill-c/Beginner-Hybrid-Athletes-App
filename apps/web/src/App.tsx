import { useState } from 'react'
import GetStartedPage from './features/auth/GetStartedPage'
import LoginPage from './features/auth/LoginPage'
import SignUpWizard from './features/auth/SignUpWizard'
import HomePage from './features/home/HomePage'
import OnboardingWizard from './features/home/OnboardingWizard'
import type { OnboardingSubmission } from './features/home/OnboardingWizard'
import DisclaimerModal from './features/home/DisclaimerModal'
import CalendarPage from './features/calendar/CalendarPage'
import AccountPage from './features/account/AccountPage'
import LiftingWorkoutsPage from './features/workouts/LiftingWorkoutsPage'
import WorkoutDetailPage from './features/workouts/WorkoutDetailPage'
import ExerciseListPage from './features/exercises/ExerciseListPage'
import RunsPage from './features/runs/RunsPage'
import SideNav from './shared/SideNav'
import { INITIAL_WORKOUTS } from './data/workouts'
import type { LiftingWorkout, WorkoutActivity } from './data/workouts'
import { EXERCISES } from './data/exercises'
import type { Exercise } from './data/exercises'
import type { PageKey } from './types'
import * as api from './api/client'
import type { TodayWorkout, UserDetails } from './api/client'
import { clearExerciseLogCache } from './features/exercises/exerciseLogStore'
import { clearRunsCache } from './features/runs/runsStore'
import './App.css'

// Root component. There's no router: `stage` switches between the welcome
// page and the sign-up/log-in flows, and (once signed in) `activePage` -
// driven by the side nav - switches between the main app's pages. Account
// details and the workout/exercise catalog come from the backend (apps/
// server, see src/api/client.ts) once signed in; in-session edits (adding
// an exercise to a workout, etc.) update local state immediately and save
// back to the backend best-effort alongside it.
type Stage = 'welcome' | 'signup' | 'login' | 'home'

function App() {
  const [stage, setStage] = useState<Stage>('welcome')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [activePage, setActivePage] = useState<PageKey>('home')

  // The signed-in user's id and details, as returned by the backend - null
  // until sign-up/login succeeds. `todayWorkout` comes along with them
  // (either from the onboarding response for a first-time user, or from
  // fetching user details for a returning one).
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [accountUser, setAccountUser] = useState<UserDetails | null>(null)
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null)

  // Workouts and the exercise catalog start on the local dummy data and get
  // replaced by the backend's copy once signed in (see loadCatalog below) -
  // falling back to staying on the dummy data if that fetch fails, so the
  // app still works if the backend isn't running.
  const [workouts, setWorkouts] = useState<LiftingWorkout[]>(INITIAL_WORKOUTS)
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISES)

  // Which workout's detail page is showing within Lifting Workouts, if any
  // (null shows the workout list instead).
  const [viewingWorkoutId, setViewingWorkoutId] = useState<string | null>(null)

  // Set while the user is adding an exercise to a specific workout (via a
  // workout's "+ Add" button) - Exercise List reads this to show its
  // Add/Remove controls and the "Back to <workout>" link.
  const [addTargetWorkoutId, setAddTargetWorkoutId] = useState<string | null>(null)

  // Set when the user should be dropped straight into a specific run's
  // timer (e.g. via "Workout Now" on a calendar event), instead of landing
  // on the runs grid first.
  const [pendingRunId, setPendingRunId] = useState<number | null>(null)

  // True while viewing a workout or run that was reached via "Workout Now"
  // on a calendar event, so its back button returns to the calendar (and
  // says so) instead of to the workouts/runs list.
  const [returnToCalendar, setReturnToCalendar] = useState(false)

  // Loads the workout and exercise catalogs from the backend once, right
  // when the user first signs up or logs in. Falls back to staying on the
  // local dummy copies (already the initial state) if the request fails.
  async function loadCatalog() {
    try {
      const [{ workouts: fetchedWorkouts }, { exercises: fetchedExercises }] = await Promise.all([
        api.fetchWorkouts(),
        api.fetchExercises(),
      ])
      setWorkouts(fetchedWorkouts)
      // The backend's muscleGroup column is a plain string; the seeded
      // catalog only ever writes MuscleGroup values into it, so this
      // narrowing is safe.
      setExercises(fetchedExercises as Exercise[])
    } catch {
      /* keep the local INITIAL_WORKOUTS/EXERCISES fallbacks */
    }
  }

  async function handleSignUpComplete(userEmail: string, userPassword: string, plan: 'basic' | 'premium') {
    const user = await api.createUser(userEmail, userPassword, plan)
    setEmail(userEmail)
    setPassword(userPassword)
    setCurrentUserId(user.id)
    setStage('home')
    loadCatalog()
  }

  // Logging in checks credentials against the backend, then fetches the
  // full user record - that's what lets the account page show real details
  // for a returning user.
  async function handleLogIn(userEmail: string, userPassword: string) {
    const user = await api.login(userEmail, userPassword)
    setEmail(userEmail)
    setPassword(userPassword)
    setCurrentUserId(user.id)
    setShowOnboarding(false)
    loadCatalog()

    const details = await api.fetchUser(user.id)
    setAccountUser(details)
    setTodayWorkout(details.todayWorkout)

    setStage('home')
  }

  // Submits the onboarding wizard's answers to the backend (POST /api/
  // onboarding), which stores them on the user, updates their profile
  // fields, and hands back today's workout for the home page.
  async function handleOnboardingFinish(submission: OnboardingSubmission) {
    if (!currentUserId) return
    const { todayWorkout: fetchedTodayWorkout, user } = await api.submitOnboarding(
      currentUserId,
      submission,
    )
    setTodayWorkout(fetchedTodayWorkout)
    setAccountUser({ ...user, todayWorkout: fetchedTodayWorkout })
    setShowOnboarding(false)
    setShowDisclaimer(true)
  }

  function handleAcknowledgeDisclaimer() {
    setShowDisclaimer(false)
    if (currentUserId) {
      api.acknowledgeRisk(currentUserId).catch(() => {
        /* best-effort - the disclaimer has already been dismissed either way */
      })
    }
  }

  // Logging out just returns to the welcome page - there's no backend
  // session to end, so this is purely local state.
  function handleLogout() {
    setStage('welcome')
    setActivePage('home')
    setShowOnboarding(true)
    setShowDisclaimer(false)
    setEmail('')
    setPassword('')
    setCurrentUserId(null)
    setAccountUser(null)
    setTodayWorkout(null)
    setViewingWorkoutId(null)
    setAddTargetWorkoutId(null)
    setPendingRunId(null)
    setReturnToCalendar(false)
    setWorkouts(INITIAL_WORKOUTS)
    setExercises(EXERCISES)
    clearExerciseLogCache()
    clearRunsCache()
  }

  // Deleting the account is functionally the same as logging out for now -
  // there's no endpoint yet to actually delete the backend record.
  function handleDeleteAccount() {
    handleLogout()
  }

  // Applies an edit to one workout locally (so the UI updates immediately)
  // and persists it via PUT /api/workouts/:id - called by every handler
  // below, since every place a workout can be edited needs to save back to
  // the backend, not just update local state.
  function applyWorkoutEdit(workoutId: string, updater: (workout: LiftingWorkout) => LiftingWorkout) {
    const current = workouts.find((workout) => workout.id === workoutId)
    if (!current) return
    const updated = updater(current)
    setWorkouts((prev) => prev.map((workout) => (workout.id === workoutId ? updated : workout)))
    api.updateWorkout(workoutId, updated).catch(() => {
      /* best-effort - the UI already reflects the edit locally */
    })
  }

  function handleAddExerciseToWorkout(workoutId: string, exerciseId: string) {
    applyWorkoutEdit(workoutId, (workout) =>
      workout.exerciseIds.includes(exerciseId)
        ? workout
        : { ...workout, exerciseIds: [...workout.exerciseIds, exerciseId] },
    )
  }

  function handleRemoveExerciseFromWorkout(workoutId: string, exerciseId: string) {
    applyWorkoutEdit(workoutId, (workout) => ({
      ...workout,
      exerciseIds: workout.exerciseIds.filter((id) => id !== exerciseId),
    }))
  }

  function handleAddActivityToWorkout(
    workoutId: string,
    category: 'warmup' | 'cooldown',
    activity: WorkoutActivity,
  ) {
    applyWorkoutEdit(workoutId, (workout) => {
      const alreadyAdded = workout[category].some((existing) => existing.name === activity.name)
      return alreadyAdded ? workout : { ...workout, [category]: [...workout[category], activity] }
    })
  }

  function handleUpdateWorkoutWarmup(workoutId: string, warmup: WorkoutActivity[]) {
    applyWorkoutEdit(workoutId, (workout) => ({ ...workout, warmup }))
  }

  function handleUpdateWorkoutCooldown(workoutId: string, cooldown: WorkoutActivity[]) {
    applyWorkoutEdit(workoutId, (workout) => ({ ...workout, cooldown }))
  }

  function handleUpdateWorkoutExerciseIds(workoutId: string, exerciseIds: string[]) {
    applyWorkoutEdit(workoutId, (workout) => ({ ...workout, exerciseIds }))
  }

  function handleStartWorkout(workoutId: string) {
    setViewingWorkoutId(workoutId)
    setReturnToCalendar(false)
    setActivePage('lifting')
  }

  function handleStartWorkoutFromCalendar(workoutId: string) {
    setViewingWorkoutId(workoutId)
    setReturnToCalendar(true)
    setActivePage('lifting')
  }

  function handleStartRunFromCalendar(runId: number) {
    setPendingRunId(runId)
    setReturnToCalendar(true)
    setActivePage('runs')
  }

  function handleViewWorkoutDetails(workoutId: string) {
    setViewingWorkoutId(workoutId)
  }

  function handleBackToWorkouts() {
    if (returnToCalendar) {
      setViewingWorkoutId(null)
      setReturnToCalendar(false)
      setActivePage('calendar')
      return
    }
    setViewingWorkoutId(null)
  }

  function handleBackToCalendarFromRuns() {
    setPendingRunId(null)
    setReturnToCalendar(false)
    setActivePage('calendar')
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
    if (page !== 'runs') {
      setPendingRunId(null)
    }
    if (page !== 'lifting' && page !== 'runs') {
      setReturnToCalendar(false)
    }
    setActivePage(page)
  }

  // Display name prefers the first name collected during onboarding, then
  // falls back to whatever's before the @ in the email.
  const name = accountUser?.firstName || (email ? email.split('@')[0] : 'Athlete')

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
            onComplete={(userEmail, userPassword, plan) =>
              handleSignUpComplete(userEmail, userPassword, plan)
            }
            onBack={() => setStage('welcome')}
          />
        </div>
      )}

      {stage === 'home' && (
        <div className="app-layout">
          <SideNav active={activePage} onNavigate={handleNavigate} />
          <main className="app-main">
            {activePage === 'home' && (
              <HomePage name={name} todayWorkout={todayWorkout} onStartWorkout={handleStartWorkout} />
            )}
            {activePage === 'calendar' && (
              <CalendarPage
                onStartLiftingWorkout={handleStartWorkoutFromCalendar}
                onStartRun={handleStartRunFromCalendar}
              />
            )}
            {activePage === 'account' && (
              <AccountPage
                name={name}
                email={accountUser?.email ?? email}
                password={accountUser?.password ?? password}
                onLogout={handleLogout}
                onDelete={handleDeleteAccount}
              />
            )}
            {/* Lifting Workouts shows either one workout's detail page (if
                the user drilled into one) or the list of all workouts. */}
            {activePage === 'lifting' && viewingWorkout && (
              <WorkoutDetailPage
                workout={viewingWorkout}
                exercises={exercises}
                userId={currentUserId}
                onBack={handleBackToWorkouts}
                backLabel={returnToCalendar ? 'Back to calendar' : 'Back to lifting workouts'}
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
                exercises={exercises}
                userId={currentUserId}
                onAddExercise={handleAddExerciseClick}
                onDeleteExercise={handleRemoveExerciseFromWorkout}
                onViewDetails={handleViewWorkoutDetails}
              />
            )}
            {activePage === 'exercises' && (
              <ExerciseListPage
                addTargetWorkoutId={addTargetWorkoutId}
                workouts={workouts}
                exercises={exercises}
                userId={currentUserId}
                onAddExerciseToWorkout={handleAddExerciseToWorkout}
                onRemoveExerciseFromWorkout={handleRemoveExerciseFromWorkout}
                onAddActivityToWorkout={handleAddActivityToWorkout}
                returnWorkoutTitle={addTargetWorkout?.title ?? null}
                onReturnToWorkout={handleReturnToWorkout}
              />
            )}
            {activePage === 'runs' && (
              <RunsPage
                userId={currentUserId}
                initialRunId={pendingRunId}
                cameFromCalendar={returnToCalendar}
                onBackToCalendar={handleBackToCalendarFromRuns}
              />
            )}
          </main>
          {showOnboarding && (
            <OnboardingWizard name={name} onFinish={handleOnboardingFinish} />
          )}
          {showDisclaimer && <DisclaimerModal onAcknowledge={handleAcknowledgeDisclaimer} />}
        </div>
      )}
    </div>
  )
}

export default App
