import { useState } from 'react'
import './DeleteAccountModal.css'

// Two-step "are you sure" confirmation for deleting an account:
//   1. A plain Yes/No question.
//   2. The user must type the word "delete" before the Confirm button
//      enables, as a stronger safeguard against accidental clicks.

type Step = 1 | 2

interface DeleteAccountModalProps {
  onCancel: () => void
  onConfirm: () => void
}

function DeleteAccountModal({ onCancel, onConfirm }: DeleteAccountModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [confirmText, setConfirmText] = useState('')

  // Case-insensitive match against the word "delete".
  const canConfirm = confirmText.trim().toLowerCase() === 'delete'

  function handleProceedToConfirmStep() {
    setStep(2)
  }

  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="delete-modal-close" onClick={onCancel} aria-label="Close">
          &times;
        </button>

        {step === 1 && (
          <>
            <h2>Delete your account?</h2>
            <p className="delete-modal-text">
              This will permanently delete your account and all your workout data. This can't be
              undone.
            </p>
            <div className="delete-modal-actions">
              <button type="button" className="btn-no" onClick={onCancel}>
                No
              </button>
              <button type="button" className="btn-yes" onClick={handleProceedToConfirmStep}>
                Yes
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Type "delete" to confirm</h2>
            <p className="delete-modal-text">
              This is your last chance to back out. Type <strong>delete</strong> below to
              permanently delete your account.
            </p>
            <input
              type="text"
              className="delete-modal-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
              autoFocus
            />
            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn-confirm"
                disabled={!canConfirm}
                onClick={onConfirm}
              >
                Confirm
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DeleteAccountModal
