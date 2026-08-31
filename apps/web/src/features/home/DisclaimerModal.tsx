import './DisclaimerModal.css'

// Shown once, right after the onboarding wizard closes. The user has to
// click "I Understand and Agree" to dismiss it - there's no backdrop-click
// or close button, since this is a safety disclaimer they should read.

interface DisclaimerModalProps {
  onAcknowledge: () => void
}

function DisclaimerModal({ onAcknowledge }: DisclaimerModalProps) {
  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-card">
        <h2>Before you start</h2>
        <p className="disclaimer-text">
          This programme is generated automatically from the information you provide. It has not
          been reviewed by a qualified trainer, physiotherapist or medical professional, and it is
          not medical advice.
        </p>
        <p className="disclaimer-text">Please confirm:</p>
        <ul className="disclaimer-list">
          <li>I am 18 or over</li>
          <li>
            I have no heart condition, chest pain, dizziness on exertion, or other condition that
            makes exercise unsafe for me
          </li>
          <li>I am not pregnant, recovering from surgery, or recovering from an injury</li>
          <li>
            I have answered the setup questions accurately, and I understand my plan is built
            from those answers
          </li>
        </ul>
        <p className="disclaimer-text">
          If you can&apos;t confirm all of the above, speak to your doctor before starting.
        </p>
        <p className="disclaimer-text">
          Follow the plan as written &mdash; don&apos;t skip ahead or add volume. Stop and seek
          medical attention if you experience chest pain, dizziness, or joint pain that
          doesn&apos;t settle with rest.
        </p>
        <p className="disclaimer-text">
          Running and strength training carry a risk of injury. I understand this risk and choose
          to take part. (Nothing here affects your legal rights.)
        </p>
        <div className="disclaimer-actions">
          <button type="button" className="btn-acknowledge" onClick={onAcknowledge}>
            I Understand and Agree
          </button>
        </div>
      </div>
    </div>
  )
}

export default DisclaimerModal
