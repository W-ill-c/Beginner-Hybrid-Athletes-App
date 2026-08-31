import { useState } from 'react'
import './RunCompleteModal.css'

// "Well done!" dialog shown once a run finishes, whether by the countdown
// reaching 0 or the user clicking Finish - styled to match the design
// file's dialog exactly. It's only ever rendered inside RunTimerPage, so it
// reuses that page's --rt-* colour tokens and .btn classes rather than
// defining its own.
//
// The feedback textarea doesn't do anything yet (no AI, no backend) - it's
// just captured in local state, standing in for where that text would
// eventually be sent off to adjust the rest of the running plan.

interface RunCompleteModalProps {
  runId: number
  onClose: () => void
}

function RunCompleteModal({ runId, onClose }: RunCompleteModalProps) {
  const [feedback, setFeedback] = useState('')

  return (
    <div className="run-complete-backdrop">
      <div className="run-complete-dialog">
        <div className="run-complete-badge">
          <i className="fa-solid fa-check"></i>
        </div>
        <div className="run-complete-title">Well done!</div>
        <div className="run-complete-body">You&apos;ve completed Run {runId}.</div>

        <label className="run-complete-feedback-field">
          <span>How did you find this run?</span>
          <span>
            Any comments will be fed back to the AI which will update the rest of the running plan
            based on how you felt.
          </span>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="The run was too difficult as the rest times the rests weren't frequent enough..."
            rows={3}
          />
        </label>

        <div className="run-complete-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default RunCompleteModal
