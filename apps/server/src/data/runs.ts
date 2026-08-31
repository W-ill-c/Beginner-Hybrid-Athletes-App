import { prisma } from './users.js'

// The running plan, assembled from the Run/RunPhase tables (seeded via
// prisma/seed.ts). Each run's phases are stored as their own ordered rows
// rather than fixed columns, since runs vary in how many warmup/run/walk/
// cooldown segments they have and how long each one is.

export type RunPhaseType = 'warmup' | 'run' | 'walk' | 'cooldown'

export interface RunPhase {
  type: RunPhaseType
  durationSeconds: number
}

export interface Run {
  id: number
  phases: RunPhase[]
  completed: boolean
}

// `userId` is optional so GET /api/runs still works before a user is known
// (every run just comes back not-completed in that case).
export async function getRuns(userId?: string): Promise<Run[]> {
  const [rows, completedRunIds] = await Promise.all([
    prisma.run.findMany({
      orderBy: { id: 'asc' },
      include: { phases: { orderBy: { order: 'asc' } } },
    }),
    userId
      ? prisma.runCompletion.findMany({ where: { userId }, select: { runId: true } })
      : Promise.resolve([]),
  ])
  const completed = new Set(completedRunIds.map((c) => c.runId))

  return rows.map((row) => ({
    id: row.id,
    phases: row.phases.map((phase) => ({
      type: phase.type as RunPhaseType,
      durationSeconds: phase.durationSeconds,
    })),
    completed: completed.has(row.id),
  }))
}

export async function runExists(runId: number): Promise<boolean> {
  return (await prisma.run.findUnique({ where: { id: runId }, select: { id: true } })) !== null
}

// Marks a run done for a user (idempotent - completing an already-done run
// just bumps completedAt rather than erroring or duplicating).
export async function markRunComplete(userId: string, runId: number): Promise<void> {
  await prisma.runCompletion.upsert({
    where: { userId_runId: { userId, runId } },
    create: { userId, runId },
    update: { completedAt: new Date() },
  })
}
