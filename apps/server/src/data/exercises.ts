import { prisma } from './users.js'

// The exercise catalog, from the Exercise table (seeded via prisma/seed.ts).

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  description: string
  recommendedReps: string
}

export async function getExercises(): Promise<Exercise[]> {
  return prisma.exercise.findMany({ orderBy: { name: 'asc' } })
}

export async function exerciseExists(id: string): Promise<boolean> {
  return (await prisma.exercise.findUnique({ where: { id }, select: { id: true } })) !== null
}

export async function allExercisesExist(ids: string[]): Promise<boolean> {
  const uniqueIds = new Set(ids)
  if (uniqueIds.size === 0) return true
  const count = await prisma.exercise.count({ where: { id: { in: [...uniqueIds] } } })
  return count === uniqueIds.size
}
