import { Router } from 'express'
import { exerciseExists, getExercises } from '../data/exercises.js'
import { createExerciseLog, getExerciseLogs } from '../data/exerciseLogs.js'
import { findUserById } from '../data/users.js'

// 7. Returning the exercise catalog, and 8. logging/reading a user's sets
// for one exercise (the Exercise modal's Logging tab).

const router = Router()

router.get('/', async (_req, res) => {
  res.json({ exercises: await getExercises() })
})

router.get('/:id/logs', async (req, res) => {
  const exerciseId = req.params.id
  const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }
  if (!(await exerciseExists(exerciseId))) {
    return res.status(404).json({ error: 'Exercise not found' })
  }
  if (!(await findUserById(userId))) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json({ logs: await getExerciseLogs(userId, exerciseId) })
})

router.post('/:id/logs', async (req, res) => {
  const exerciseId = req.params.id
  const { userId, weight, reps } = req.body ?? {}

  if (typeof userId !== 'string' || userId.trim() === '') {
    return res.status(400).json({ error: 'userId is required' })
  }
  if (typeof weight !== 'number' || weight <= 0 || typeof reps !== 'number' || reps <= 0) {
    return res.status(400).json({ error: 'weight and reps must be positive numbers' })
  }
  if (!(await exerciseExists(exerciseId))) {
    return res.status(404).json({ error: 'Exercise not found' })
  }
  if (!(await findUserById(userId))) {
    return res.status(404).json({ error: 'User not found' })
  }

  const log = await createExerciseLog(userId, exerciseId, weight, reps)
  res.status(201).json(log)
})

export default router
