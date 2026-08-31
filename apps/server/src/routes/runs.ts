import { Router } from 'express'
import { getRuns, markRunComplete, runExists } from '../data/runs.js'
import { findUserById } from '../data/users.js'

// 5. Returning the running plan: every numbered run, each with its
// warmup/run/walk/cooldown sections. When called with ?userId=, each run
// also says whether that user has already completed it.

const router = Router()

router.get('/', async (req, res) => {
  const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined
  res.json({ runs: await getRuns(userId) })
})

// Marks a run done for the given user, once its timer finishes. The Runs
// page doesn't need the result of this call itself - it already flips the
// node to "done" locally - but it re-fetches GET /api/runs?userId=... the
// next time it's opened, which is what makes completion stick around
// instead of resetting on navigation/reload like the old client-only state.
router.post('/:id/complete', async (req, res) => {
  const runId = Number(req.params.id)
  const { userId } = req.body ?? {}

  if (!Number.isInteger(runId)) {
    return res.status(400).json({ error: 'Invalid run id' })
  }
  if (typeof userId !== 'string' || userId.trim() === '') {
    return res.status(400).json({ error: 'userId is required' })
  }
  if (!(await findUserById(userId))) {
    return res.status(404).json({ error: 'User not found' })
  }
  if (!(await runExists(runId))) {
    return res.status(404).json({ error: 'Run not found' })
  }

  await markRunComplete(userId, runId)
  res.status(204).end()
})

export default router
