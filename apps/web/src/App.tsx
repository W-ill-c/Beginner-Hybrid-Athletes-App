import GetStartedPage from './features/auth/GetStartedPage'
import './App.css'

// Root component. The rest of the app lands on top of this shell in later
// branches.
function App() {
  return (
    <div className="app-shell">
      <GetStartedPage onSignUp={() => {}} onLogIn={() => {}} />
    </div>
  )
}

export default App
