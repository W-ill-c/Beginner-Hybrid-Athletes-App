import { Router } from 'express'
import { acknowledgeRisk, createUser, findUserByEmail, findUserById } from '../data/users.js'
import { buildTodayWorkout } from '../data/todayWorkout.js'

// 1. Creating a new user, and 3. fetching user details (called every time
// the user logs in, so the account page has something to show). Fetching a
// user also includes today's workout, if they've been through onboarding -
// that's what lets a *returning* user's home page show today's workout
// without having to redo the wizard (a first-time user gets it straight
// from the onboarding endpoint's response instead).

const router = Router()

router.post('/', async (req, res) => {
  const { email, password, plan } = req.body ?? {}

  if (typeof email !== 'string' || email.trim() === '') {
    return res.status(400).json({ error: 'email is required' })
  }
  if (typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ error: 'password is required' })
  }
  if (await findUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with that email already exists' })
  }

  const user = await createUser(email, password, plan === 'basic' || plan === 'premium' ? plan : null)
  res.status(201).json(user)
})

router.get('/:id', async (req, res) => {
  const user = await findUserById(req.params.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json({ ...user, todayWorkout: user.onboarding ? await buildTodayWorkout() : null })
})

// Records that the user clicked "I Understand and Agree" on the injury-risk
// disclaimer, shown once right after onboarding finishes.
router.post('/:id/risk-acknowledgement', async (req, res) => {
  const user = await findUserById(req.params.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  const updated = await acknowledgeRisk(req.params.id)
  res.json(updated)
})

export default router
