import { EXERCISES } from './exercises'
import type { Exercise } from './exercises'

// Dummy workout data: the lifting workouts (with their warmup/cooldown
// activities) that ship with the app, plus standalone warmup/cooldown
// catalogs used when a user wants to add an extra activity to a workout.

export interface WorkoutActivity {
  name: string
  description: string
}

export interface LiftingWorkout {
  id: string
  title: string
  exerciseIds: string[]
  warmup: WorkoutActivity[]
  cooldown: WorkoutActivity[]
}

export const REST_SECONDS_BETWEEN_LIFTS = 90

export const WARMUP_ACTIVITIES: WorkoutActivity[] = [
  { name: 'Arm Circles', description: '30 seconds forward, 30 seconds backward to loosen the shoulders.' },
  { name: 'Band Pull-Aparts', description: '2 sets of 15 reps to activate the upper back.' },
  {
    name: 'Push-Up to Downward Dog',
    description: '10 slow reps to warm up the chest and shoulders.',
  },
  {
    name: 'Bodyweight Squats',
    description: '2 sets of 15 reps to warm up the hips and knees.',
  },
  { name: 'Leg Swings', description: '10 swings per leg, forward and lateral.' },
  { name: 'Walking Lunges', description: '10 reps per leg at an easy pace.' },
  { name: 'Jumping Jacks', description: '1 minute to raise your heart rate before training.' },
  { name: 'Hip Circles', description: '10 circles each direction to loosen the hips.' },
]

export const COOLDOWN_ACTIVITIES: WorkoutActivity[] = [
  { name: 'Chest Doorway Stretch', description: 'Hold 30 seconds per side.' },
  { name: 'Cross-Body Shoulder Stretch', description: 'Hold 30 seconds per side.' },
  { name: 'Triceps Overhead Stretch', description: 'Hold 30 seconds per side.' },
  { name: 'Quad Stretch', description: 'Hold 30 seconds per side.' },
  { name: 'Hamstring Stretch', description: 'Hold 30 seconds per side.' },
  { name: "Child's Pose", description: 'Hold for 45 seconds to release the lower back.' },
  { name: 'Cat-Cow Stretch', description: '10 slow reps to release the spine.' },
  {
    name: 'Standing Forward Fold',
    description: 'Hold for 30 seconds to release the hamstrings and back.',
  },
]

export const INITIAL_WORKOUTS: LiftingWorkout[] = [
  {
    id: 'upper-body',
    title: 'Upper Body Strength',
    exerciseIds: ['bench-press', 'overhead-press', 'lat-pulldown', 'bicep-curl'],
    warmup: [
      { name: 'Arm Circles', description: '30 seconds forward, 30 seconds backward.' },
      { name: 'Band Pull-Aparts', description: '2 sets of 15 reps to activate the upper back.' },
      { name: 'Push-Up to Downward Dog', description: '10 slow reps to warm up the chest and shoulders.' },
    ],
    cooldown: [
      { name: 'Chest Doorway Stretch', description: 'Hold 30 seconds per side.' },
      { name: 'Cross-Body Shoulder Stretch', description: 'Hold 30 seconds per side.' },
      { name: 'Triceps Overhead Stretch', description: 'Hold 30 seconds per side.' },
    ],
  },
  {
    id: 'lower-body',
    title: 'Lower Body Strength',
    exerciseIds: ['squat', 'lunges', 'leg-press'],
    warmup: [
      { name: 'Bodyweight Squats', description: '2 sets of 15 reps to warm up the hips and knees.' },
      { name: 'Leg Swings', description: '10 swings per leg, forward and lateral.' },
      { name: 'Walking Lunges', description: '10 reps per leg at an easy pace.' },
    ],
    cooldown: [
      { name: 'Quad Stretch', description: 'Hold 30 seconds per side.' },
      { name: 'Hamstring Stretch', description: 'Hold 30 seconds per side.' },
      { name: "Child's Pose", description: 'Hold for 45 seconds to release the lower back.' },
    ],
  },
]

// Looks up the full Exercise record for a given exercise id, since workouts
// only store ids (see LiftingWorkout.exerciseIds above) rather than copies
// of the exercise data.
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((exercise) => exercise.id === id)
}
