import type { ApiRun } from '../../api/client'

// Session-scoped cache of the run plan (including each run's completed
// status), so re-opening the Runs page doesn't re-fetch GET /api/runs every
// time - only the first visit after login hits the backend. Cleared on
// logout (see App.tsx) so a different account starts fresh; a full page
// refresh clears it for free since it's just JS memory.

let cachedRuns: ApiRun[] | null = null

export function getCachedRuns(): ApiRun[] | null {
  return cachedRuns
}

export function setCachedRuns(runs: ApiRun[]): void {
  cachedRuns = runs
}

export function markCachedRunComplete(runId: number): void {
  if (!cachedRuns) return
  cachedRuns = cachedRuns.map((run) => (run.id === runId ? { ...run, completed: true } : run))
}

export function clearRunsCache(): void {
  cachedRuns = null
}
