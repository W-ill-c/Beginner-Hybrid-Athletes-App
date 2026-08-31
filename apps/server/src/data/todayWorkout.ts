import { getWorkouts } from './workouts.js'
import { getExercises } from './exercises.js'

export interface TodayWorkout {
  workoutId: string
  type: string
  title: string
  duration: string
  exercises: string[]
}

// No real scheduling yet - always the "Upper Body Strength" workout, same
// placeholder behavior as before the database existed.
export async function buildTodayWorkout(): Promise<TodayWorkout> {
  const [workouts, exercises] = await Promise.all([getWorkouts(), getExercises()])
  const workout = workouts.find((w) => w.id === 'upper-body') ?? workouts[0]
  const exerciseNames = new Map(exercises.map((exercise) => [exercise.id, exercise.name]))

  return {
    workoutId: workout.id,
    type: 'Lift',
    title: workout.title,
    duration: '45 min',
    exercises: workout.exerciseIds.map((id) => exerciseNames.get(id) ?? id),
  }
}
