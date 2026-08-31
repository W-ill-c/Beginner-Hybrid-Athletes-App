import './GetStartedPage.css'

// Landing page shown before sign-up/login, split into a dark hero half
// (pitch) and a light "Get started" panel - taken from the project's design
// file. There's no real login flow yet (no backend), so "Log in" just drops
// straight into the app as a returning user, skipping onboarding.

interface GetStartedPageProps {
  onSignUp: () => void
  onLogIn: () => void
}

function GetStartedPage({ onSignUp, onLogIn }: GetStartedPageProps) {
  return (
    <div className="get-started-page">
      <div className="get-started-hero">
        <div className="get-started-kicker">Hybrid Basics</div>
        <h1>The app for beginner hybrid athletes.</h1>
        <p>
          Structured lifting and running plan built for gym newbies getting into hybrid training
          for the first time. No guesswork &mdash; just an AI powered plan to get you started.
        </p>
        <p>
          Log your lifts, complete your runs, and follow a clear plan. Many beginners are running
          their first 5k within three months.
        </p>
      </div>

      <div className="get-started-panel">
        <div className="get-started-panel-inner">
          <h2>Get started</h2>
          <p className="get-started-subtitle">
            View our plans and create an account, or log back in to pick up your plan.
          </p>
          <button type="button" className="btn btn-primary btn-block" onClick={onSignUp}>
            Sign up
          </button>
          <button type="button" className="btn btn-secondary btn-block" onClick={onLogIn}>
            Log in
          </button>
        </div>
      </div>
    </div>
  )
}

export default GetStartedPage
