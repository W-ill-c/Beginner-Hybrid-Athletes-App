import type { ApiExerciseLog } from '../../api/client'

// Session-scoped cache of exercise logs, keyed by exercise id. Only one user
// is ever logged in at a time in this app, so a plain module-level cache
// (rather than a per-user keyed one) is enough - it's what lets a modal
// re-opened for the same exercise skip re-fetching. Cleared on logout (see
// App.tsx) so a different account starts fresh; a full page refresh clears
// it for free since it's just JS memory.

const cache = new Map<string, ApiExerciseLog[]>()

export function getCachedLogs(exerciseId: string): ApiExerciseLog[] | undefined {
  return cache.get(exerciseId)
}

export function setCachedLogs(exerciseId: string, logs: ApiExerciseLog[]): void {
  cache.set(exerciseId, logs)
}

export function addCachedLog(exerciseId: string, log: ApiExerciseLog): void {
  cache.set(exerciseId, [log, ...(cache.get(exerciseId) ?? [])])
}

export function clearExerciseLogCache(): void {
  cache.clear()
}
