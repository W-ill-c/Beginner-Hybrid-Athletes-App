// Thin fetch wrapper for the backend (apps/server). In dev, Vite proxies
// /api/* to the server (see vite.config.ts) so these calls can just use a
// relative path - no base URL or CORS setup needed.

export interface OnboardingAnswers {
  duration: '0-30' | '31-60' | '60-90' | '90+'
  daysPerWeek: number
  activityLevel: string
  priority: 'running' | 'lifting' | 'both'
}

export interface ApiUser {
  id: string
  email: string
  password: string
  plan: 'basic' | 'premium' | null
  firstName: string
  lastName: string
  height: string
  weight: string
  onboarding: OnboardingAnswers | null
  riskAcknowledgedAt: string | null
}

export type ApiRunPhaseType = 'warmup' | 'run' | 'walk' | 'cooldown'

export interface ApiRunPhase {
  type: ApiRunPhaseType
  durationSeconds: number
}

export interface ApiRun {
  id: number
  phases: ApiRunPhase[]
  completed: boolean
}

export interface ApiWorkoutActivity {
  name: string
  description: string
}

export interface ApiLiftingWorkout {
  id: string
  title: string
  exerciseIds: string[]
  warmup: ApiWorkoutActivity[]
  cooldown: ApiWorkoutActivity[]
}

export interface ApiExercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  description: string
  recommendedReps: string
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body
        ? String((body as { error: unknown }).error)
        : 'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return body as T
}

export function createUser(
  email: string,
  password: string,
  plan: 'basic' | 'premium' | null,
): Promise<ApiUser> {
  return request<ApiUser>('/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, plan }),
  })
}

export function login(email: string, password: string): Promise<ApiUser> {
  return request<ApiUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export interface TodayWorkout {
  workoutId: string
  type: string
  title: string
  duration: string
  exercises: string[]
}

export interface UserDetails extends ApiUser {
  todayWorkout: TodayWorkout | null
}

export function fetchUser(userId: string): Promise<UserDetails> {
  return request<UserDetails>(`/users/${userId}`)
}

export interface OnboardingSubmission extends OnboardingAnswers {
  firstName: string
  lastName: string
  height: string
  weight: string
}

export function submitOnboarding(
  userId: string,
  submission: OnboardingSubmission,
): Promise<{ todayWorkout: TodayWorkout; user: ApiUser }> {
  return request('/onboarding', {
    method: 'POST',
    body: JSON.stringify({ userId, ...submission }),
  })
}

// Records that the user acknowledged the injury-risk disclaimer shown right
// after onboarding.
export function acknowledgeRisk(userId: string): Promise<ApiUser> {
  return request<ApiUser>(`/users/${userId}/risk-acknowledgement`, { method: 'POST' })
}

// `userId` is optional so the runs grid still loads before a user is known;
// pass it to get each run's real completed status back.
export function fetchRuns(userId?: string): Promise<{ runs: ApiRun[] }> {
  return request(`/runs${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`)
}

// Marks a run done for the given user - called once its timer finishes.
export function completeRun(userId: string, runId: number): Promise<void> {
  return request(`/runs/${runId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
}

export function fetchWorkouts(): Promise<{ workouts: ApiLiftingWorkout[] }> {
  return request('/workouts')
}

// Saves an edit to a workout (exercises added/removed, warmup/cooldown
// changed) - called from every place the frontend lets a workout be edited.
export function updateWorkout(
  workoutId: string,
  data: { exerciseIds: string[]; warmup: ApiWorkoutActivity[]; cooldown: ApiWorkoutActivity[] },
): Promise<ApiLiftingWorkout> {
  return request<ApiLiftingWorkout>(`/workouts/${workoutId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function fetchExercises(): Promise<{ exercises: ApiExercise[] }> {
  return request('/exercises')
}

export interface ApiExerciseLog {
  id: string
  weight: number
  reps: number
  loggedAt: string
}

export function fetchExerciseLogs(
  exerciseId: string,
  userId: string,
): Promise<{ logs: ApiExerciseLog[] }> {
  return request(`/exercises/${exerciseId}/logs?userId=${encodeURIComponent(userId)}`)
}

export function createExerciseLog(
  exerciseId: string,
  userId: string,
  weight: number,
  reps: number,
): Promise<ApiExerciseLog> {
  return request<ApiExerciseLog>(`/exercises/${exerciseId}/logs`, {
    method: 'POST',
    body: JSON.stringify({ userId, weight, reps }),
  })
}
