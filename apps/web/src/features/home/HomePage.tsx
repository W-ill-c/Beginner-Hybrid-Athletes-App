import './HomePage.css'

// The default landing page after login: greets the user and shows a card for
// today's scheduled workout. There's no scheduling logic yet, so the "today"
// workout below is just hardcoded dummy data.

interface HomePageProps {
  name: string
  onStartWorkout: (workoutId: string) => void
}

const todayWorkout = {
  workoutId: 'upper-body',
  type: 'Lift',
  title: 'Upper Body Strength',
  duration: '45 min',
  exercises: ['Bench Press', 'Bent-over Row', 'Overhead Press', 'Bicep Curl'],
}

function HomePage({ name, onStartWorkout }: HomePageProps) {
  return (
    <div className="home-page">
      <header className="home-header">
        <p className="home-greeting">Welcome back,</p>
        <h1>{name}</h1>
      </header>

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
    </div>
  )
}

export default HomePage
