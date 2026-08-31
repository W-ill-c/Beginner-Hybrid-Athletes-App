import { Router } from 'express'
import { findUserById, updateUserOnboarding } from '../data/users.js'
import type { OnboardingAnswers } from '../data/users.js'
import { buildTodayWorkout } from '../data/todayWorkout.js'

// 4. Receiving the onboarding wizard's answers and using them to generate a
// (dummy) workout plan. There's no real plan-generation logic yet - no AI -
// so this just stores the answers on the user and hands back today's
// workout for the homepage, the same way the frontend already hardcoded it
// before this endpoint existed.

const router = Router()

router.post('/', async (req, res) => {
  const {
    userId,
    duration,
    daysPerWeek,
    activityLevel,
    priority,
    firstName,
    lastName,
    height,
    weight,
  } = req.body ?? {}

  const user = typeof userId === 'string' ? await findUserById(userId) : undefined
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const validDurations = ['0-30', '31-60', '60-90', '90+']
  const validPriorities = ['running', 'lifting', 'both']
  if (
    !validDurations.includes(duration) ||
    typeof daysPerWeek !== 'number' ||
    typeof activityLevel !== 'string' ||
    !validPriorities.includes(priority) ||
    typeof firstName !== 'string' ||
    firstName.trim() === ''
  ) {
    return res.status(400).json({ error: 'Missing or invalid onboarding answers' })
  }

  const answers: OnboardingAnswers = { duration, daysPerWeek, activityLevel, priority }
  const updatedUser = await updateUserOnboarding(user.id, {
    onboarding: answers,
    firstName,
    lastName: typeof lastName === 'string' ? lastName : '',
    height: typeof height === 'string' ? height : '',
    weight: typeof weight === 'string' ? weight : '',
  })

  res.json({ todayWorkout: await buildTodayWorkout(), user: updatedUser })
})

export default router
