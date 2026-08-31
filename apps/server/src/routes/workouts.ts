import { Router } from 'express'
import { getWorkouts, updateWorkout } from '../data/workouts.js'
import { allExercisesExist } from '../data/exercises.js'

// 6. Returning all workout lifts, and 9. saving edits to one (exercises
// added/removed, warmup/cooldown changed) - called from every place the
// frontend lets a workout be edited (Exercise List, Lifting Workouts, and
// Workout Detail pages).

const router = Router()

router.get('/', async (_req, res) => {
  res.json({ workouts: await getWorkouts() })
})

function isActivityList(value: unknown): value is { name: string; description: string }[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as Record<string, unknown>).name === 'string' &&
        typeof (item as Record<string, unknown>).description === 'string',
    )
  )
}

router.put('/:id', async (req, res) => {
  const { exerciseIds, warmup, cooldown } = req.body ?? {}

  if (!Array.isArray(exerciseIds) || !exerciseIds.every((id: unknown) => typeof id === 'string')) {
    return res.status(400).json({ error: 'exerciseIds must be an array of strings' })
  }
  if (!isActivityList(warmup) || !isActivityList(cooldown)) {
    return res.status(400).json({ error: 'warmup and cooldown must be arrays of { name, description }' })
  }
  if (!(await allExercisesExist(exerciseIds))) {
    return res.status(400).json({ error: 'One or more exerciseIds do not exist' })
  }

  const updated = await updateWorkout(req.params.id, { exerciseIds, warmup, cooldown })
  if (!updated) {
    return res.status(404).json({ error: 'Workout not found' })
  }
  res.json(updated)
})

export default router
