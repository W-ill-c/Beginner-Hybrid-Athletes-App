import { Router } from 'express'
import { findUserByEmail } from '../data/users.js'

// 2. Logging in. There's no real session/token mechanism yet (no auth
// library wired up) - on success this just hands back the matching user
// record, which the frontend holds onto to identify the "logged in" user
// for later requests (fetching user details, etc).

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' })
  }

  const user = await findUserByEmail(email)
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  res.json(user)
})

export default router
