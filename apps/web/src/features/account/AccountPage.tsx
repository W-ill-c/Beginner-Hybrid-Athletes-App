import { useState } from 'react'
import DeleteAccountModal from './DeleteAccountModal'
import './AccountPage.css'

// Shows the signed-in user's details as read-only fields (no editing wired
// up yet) plus Log out / Delete account actions.

interface AccountPageProps {
  name: string
  email: string
  password: string
  onLogout: () => void
  onDelete: () => void
}

function AccountPage({ name, email, password, onLogout, onDelete }: AccountPageProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  function handleOpenDeleteModal() {
    setShowDeleteModal(true)
  }

  function handleCloseDeleteModal() {
    setShowDeleteModal(false)
  }

  return (
    <div className="account-page">
      <h1>Account</h1>

      <label className="field">
        <span>Name</span>
        <input type="text" value={name} disabled />
      </label>

      <label className="field">
        <span>Email</span>
        <input type="email" value={email} disabled />
      </label>

      <label className="field">
        <span>Password</span>
        <div className="field-with-icon">
          <input type="password" value={password} disabled />
          <button type="button" className="icon-btn" disabled aria-label="Edit password">
            <i className="fa-solid fa-pencil"></i>
          </button>
        </div>
      </label>

      <div className="account-actions">
        <button type="button" className="btn-delete" onClick={handleOpenDeleteModal}>
          Delete account
        </button>
        <button type="button" className="btn-logout" onClick={onLogout}>
          Log out
        </button>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal onCancel={handleCloseDeleteModal} onConfirm={onDelete} />
      )}
    </div>
  )
}

export default AccountPage
