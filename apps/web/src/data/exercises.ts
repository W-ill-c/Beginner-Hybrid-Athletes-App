// Dummy exercise catalog used throughout the app (Exercise List page, workout
// details, etc). There's no backend yet, so this is the single source of
// truth for what exercises exist.

export type MuscleGroup = 'legs' | 'arms' | 'chest' | 'shoulders' | 'abs' | 'back'

export interface Exercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: string
  description: string
  recommendedReps: string
}

export const MUSCLE_GROUPS: { key: MuscleGroup; label: string }[] = [
  { key: 'legs', label: 'Legs' },
  { key: 'arms', label: 'Arms' },
  { key: 'chest', label: 'Chest' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'abs', label: 'Abs' },
  { key: 'back', label: 'Back' },
]

export const EXERCISES: Exercise[] = [
  {
    id: 'squat',
    name: 'Squat',
    muscleGroup: 'legs',
    equipment: 'Barbell',
    description:
      'A compound lower-body lift. Stand with feet shoulder-width apart, bend at the hips and knees to lower into a squat, then drive back up to standing.',
    recommendedReps: '5-8 reps',
  },
  {
    id: 'lunges',
    name: 'Lunges',
    muscleGroup: 'legs',
    equipment: 'Dumbbells',
    description:
      'Step forward into a lunge position, lowering the back knee toward the floor, then push back to the starting position. Alternate legs.',
    recommendedReps: '8-12 reps per leg',
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'legs',
    equipment: 'Machine',
    description:
      'Sit in the leg press machine and push the platform away by extending the knees, then return under control.',
    recommendedReps: '10-12 reps',
  },
  {
    id: 'bicep-curl',
    name: 'Bicep Curl',
    muscleGroup: 'arms',
    equipment: 'Dumbbells',
    description:
      'Hold a dumbbell in each hand with arms extended. Curl the weights up toward your shoulders, then lower slowly.',
    recommendedReps: '10-15 reps',
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    muscleGroup: 'arms',
    equipment: 'Cable Machine',
    description:
      'Using a cable machine with a bar attachment, push the bar down by extending your elbows, keeping upper arms still.',
    recommendedReps: '10-15 reps',
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    muscleGroup: 'arms',
    equipment: 'Dumbbells',
    description:
      'Like a bicep curl but with palms facing each other throughout the movement, targeting the brachialis and forearms.',
    recommendedReps: '10-15 reps',
  },
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroup: 'chest',
    equipment: 'Barbell',
    description:
      'Lie on a flat bench, lower the barbell to your chest with control, then press it back up to full arm extension.',
    recommendedReps: '5-8 reps',
  },
  {
    id: 'push-up',
    name: 'Push-Up',
    muscleGroup: 'chest',
    equipment: 'Bodyweight',
    description:
      'Start in a plank position and lower your chest to the floor by bending the elbows, then push back up.',
    recommendedReps: '10-15 reps',
  },
  {
    id: 'chest-fly',
    name: 'Chest Fly',
    muscleGroup: 'chest',
    equipment: 'Dumbbells',
    description:
      'Lying on a bench, open your arms out to the sides with a slight elbow bend, then bring the dumbbells back together above your chest.',
    recommendedReps: '10-15 reps',
  },
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscleGroup: 'shoulders',
    equipment: 'Barbell',
    description:
      'Standing with the bar at shoulder height, press it straight overhead until your arms are fully extended, then lower with control.',
    recommendedReps: '6-10 reps',
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    muscleGroup: 'shoulders',
    equipment: 'Dumbbells',
    description:
      'With a dumbbell in each hand at your sides, raise your arms out to shoulder height, then lower slowly.',
    recommendedReps: '12-15 reps',
  },
  {
    id: 'face-pull',
    name: 'Face Pull',
    muscleGroup: 'shoulders',
    equipment: 'Cable Machine',
    description:
      'Using a rope attachment at head height, pull the rope toward your face, flaring your elbows out wide.',
    recommendedReps: '12-15 reps',
  },
  {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'abs',
    equipment: 'Bodyweight',
    description:
      'Hold a straight-body position supported on your forearms and toes, keeping your core braced throughout.',
    recommendedReps: '30-45 sec hold',
  },
  {
    id: 'crunches',
    name: 'Crunches',
    muscleGroup: 'abs',
    equipment: 'Bodyweight',
    description:
      'Lying on your back with knees bent, curl your shoulders off the floor toward your knees, then lower back down.',
    recommendedReps: '15-20 reps',
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'abs',
    equipment: 'Pull-Up Bar',
    description:
      'Hang from a pull-up bar and raise your legs up in front of you, keeping them straight, then lower with control.',
    recommendedReps: '10-15 reps',
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'back',
    equipment: 'Cable Machine',
    description:
      'Sit at a lat pulldown machine and pull the bar down to your upper chest, then let it rise back up under control.',
    recommendedReps: '8-12 reps',
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'back',
    equipment: 'Barbell',
    description:
      'Hinge at the hips to grip the bar, then stand up by driving through your legs and extending your hips, keeping your back straight.',
    recommendedReps: '5-8 reps',
  },
  {
    id: 'seated-row',
    name: 'Seated Row',
    muscleGroup: 'back',
    equipment: 'Cable Machine',
    description:
      'Sit at a cable row station and pull the handle toward your torso, squeezing your shoulder blades together.',
    recommendedReps: '8-12 reps',
  },
]
