import { prisma } from './users.js'

// Lifting workouts, assembled from the LiftingWorkout/WorkoutExercise/
// WorkoutActivity tables (seeded via prisma/seed.ts) back into the same
// shape the frontend has always consumed.

export interface WorkoutActivity {
  name: string
  description: string
}

export interface LiftingWorkout {
  id: string
  title: string
  exerciseIds: string[]
  warmup: WorkoutActivity[]
  cooldown: WorkoutActivity[]
}

const workoutInclude = {
  exercises: { orderBy: { order: 'asc' as const } },
  activities: { orderBy: { order: 'asc' as const } },
}

type WorkoutRow = Awaited<ReturnType<typeof prisma.liftingWorkout.findFirstOrThrow<{ include: typeof workoutInclude }>>>

function toWorkout(row: WorkoutRow): LiftingWorkout {
  return {
    id: row.id,
    title: row.title,
    exerciseIds: row.exercises.map((e) => e.exerciseId),
    warmup: row.activities
      .filter((a) => a.phase === 'warmup')
      .map((a) => ({ name: a.name, description: a.description })),
    cooldown: row.activities
      .filter((a) => a.phase === 'cooldown')
      .map((a) => ({ name: a.name, description: a.description })),
  }
}

export async function getWorkouts(): Promise<LiftingWorkout[]> {
  const rows = await prisma.liftingWorkout.findMany({ include: workoutInclude })
  return rows.map(toWorkout)
}

export async function getWorkoutById(id: string): Promise<LiftingWorkout | undefined> {
  const row = await prisma.liftingWorkout.findUnique({ where: { id }, include: workoutInclude })
  return row ? toWorkout(row) : undefined
}

// Replaces a workout's exercise list and warmup/cooldown steps wholesale -
// simpler and less error-prone than diffing against what's already there,
// and matches how the frontend already edits a workout (a full draft list,
// saved all at once). Exercise ids are de-duplicated since the same
// exercise can't appear twice in one workout (see the WorkoutExercise
// unique constraint in schema.prisma).
export async function updateWorkout(
  id: string,
  data: { exerciseIds: string[]; warmup: WorkoutActivity[]; cooldown: WorkoutActivity[] },
): Promise<LiftingWorkout | undefined> {
  const exists = await prisma.liftingWorkout.findUnique({ where: { id }, select: { id: true } })
  if (!exists) return undefined

  const uniqueExerciseIds = [...new Set(data.exerciseIds)]

  await prisma.$transaction([
    prisma.workoutExercise.deleteMany({ where: { workoutId: id } }),
    prisma.workoutExercise.createMany({
      data: uniqueExerciseIds.map((exerciseId, order) => ({ workoutId: id, exerciseId, order })),
    }),
    prisma.workoutActivity.deleteMany({ where: { workoutId: id } }),
    prisma.workoutActivity.createMany({
      data: [
        ...data.warmup.map((activity, order) => ({
          workoutId: id,
          phase: 'warmup',
          order,
          ...activity,
        })),
        ...data.cooldown.map((activity, order) => ({
          workoutId: id,
          phase: 'cooldown',
          order,
          ...activity,
        })),
      ],
    }),
  ])

  return getWorkoutById(id)
}
