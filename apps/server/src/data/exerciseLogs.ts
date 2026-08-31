import { prisma } from './users.js'

// One user's logged sets for one exercise, from the shared ExerciseLog
// table (see prisma/schema.prisma for why it's one table rather than one
// per exercise).

export interface ExerciseLogEntry {
  id: string
  weight: number
  reps: number
  loggedAt: string
}

function toEntry(row: { id: string; weight: number; reps: number; loggedAt: Date }): ExerciseLogEntry {
  return { id: row.id, weight: row.weight, reps: row.reps, loggedAt: row.loggedAt.toISOString() }
}

export async function getExerciseLogs(userId: string, exerciseId: string): Promise<ExerciseLogEntry[]> {
  const rows = await prisma.exerciseLog.findMany({
    where: { userId, exerciseId },
    orderBy: { loggedAt: 'desc' },
  })
  return rows.map(toEntry)
}

export async function createExerciseLog(
  userId: string,
  exerciseId: string,
  weight: number,
  reps: number,
): Promise<ExerciseLogEntry> {
  const row = await prisma.exerciseLog.create({ data: { userId, exerciseId, weight, reps } })
  return toEntry(row)
}
