import './HomePage.css'
import type { TodayWorkout } from '../../api/client'

// The default landing page after login: greets the user and shows a card
// for today's scheduled workout, fetched from the backend (either straight
// from the onboarding endpoint's response for a first-time user, or as part
// of fetching user details for a returning one).

interface HomePageProps {
  name: string
  todayWorkout: TodayWorkout | null
  onStartWorkout: (workoutId: string) => void
}

function HomePage({ name, todayWorkout, onStartWorkout }: HomePageProps) {
  return (
    <div className="home-page">
      <header className="home-header">
        <p className="home-greeting">Welcome back,</p>
        <h1>{name}</h1>
      </header>

      {todayWorkout ? (
        <section className="today-card">
          <span className="today-label">Today</span>
          <h2>{todayWorkout.title}</h2>
          <p className="today-meta">
            {todayWorkout.type} day &middot; {todayWorkout.duration}
          </p>
          <ul className="exercise-list">
            {todayWorkout.exercises.map((exercise) => (
              <li key={exercise}>{exercise}</li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onStartWorkout(todayWorkout.workoutId)}
          >
            Start workout
          </button>
        </section>
      ) : (
        <section className="today-card">
          <span className="today-label">Today</span>
          <p className="today-meta">Finish onboarding to see today's workout here.</p>
        </section>
      )}
    </div>
  )
}

export default HomePage
