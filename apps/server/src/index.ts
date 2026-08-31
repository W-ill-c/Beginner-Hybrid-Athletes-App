import express from 'express'
import cors from 'cors'
import usersRouter from './routes/users.js'
import authRouter from './routes/auth.js'
import onboardingRouter from './routes/onboarding.js'
import runsRouter from './routes/runs.js'
import workoutsRouter from './routes/workouts.js'
import exercisesRouter from './routes/exercises.js'

// Backend for the Hybrid Athlete app. Persists to a local SQLite database
// via Prisma (see apps/server/prisma/schema.prisma) - user accounts,
// onboarding answers, and the exercise/workout/run catalogs all live there
// now (see the README for the full endpoint list). The frontend dev server
// proxies /api requests here (see apps/web/vite.config.ts), so in
// development it's reached at http://localhost:5173/api/... rather than
// needing a second origin.

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/users', usersRouter)
app.use('/api/auth', authRouter)
app.use('/api/onboarding', onboardingRouter)
app.use('/api/runs', runsRouter)
app.use('/api/workouts', workoutsRouter)
app.use('/api/exercises', exercisesRouter)

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
