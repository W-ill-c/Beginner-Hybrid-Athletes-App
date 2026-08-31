import { PrismaClient } from '@prisma/client'

// Populates the catalog tables (Exercise, LiftingWorkout, Run) with the same
// content that used to live in the frontend's in-memory data/*.ts arrays.
// User accounts and ScheduledWorkout rows aren't seeded - those get created
// for real as people sign up and train.

const prisma = new PrismaClient()

const EXERCISES = [
  { id: 'squat', name: 'Squat', muscleGroup: 'legs', equipment: 'Barbell', description: 'A compound lower-body lift. Stand with feet shoulder-width apart, bend at the hips and knees to lower into a squat, then drive back up to standing.', recommendedReps: '5-8 reps' },
  { id: 'lunges', name: 'Lunges', muscleGroup: 'legs', equipment: 'Dumbbells', description: 'Step forward into a lunge position, lowering the back knee toward the floor, then push back to the starting position. Alternate legs.', recommendedReps: '8-12 reps per leg' },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'legs', equipment: 'Machine', description: 'Sit in the leg press machine and push the platform away by extending the knees, then return under control.', recommendedReps: '10-12 reps' },
  { id: 'bicep-curl', name: 'Bicep Curl', muscleGroup: 'arms', equipment: 'Dumbbells', description: 'Hold a dumbbell in each hand with arms extended. Curl the weights up toward your shoulders, then lower slowly.', recommendedReps: '10-15 reps' },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroup: 'arms', equipment: 'Cable Machine', description: 'Using a cable machine with a bar attachment, push the bar down by extending your elbows, keeping upper arms still.', recommendedReps: '10-15 reps' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscleGroup: 'arms', equipment: 'Dumbbells', description: 'Like a bicep curl but with palms facing each other throughout the movement, targeting the brachialis and forearms.', recommendedReps: '10-15 reps' },
  { id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', equipment: 'Barbell', description: 'Lie on a flat bench, lower the barbell to your chest with control, then press it back up to full arm extension.', recommendedReps: '5-8 reps' },
  { id: 'push-up', name: 'Push-Up', muscleGroup: 'chest', equipment: 'Bodyweight', description: 'Start in a plank position and lower your chest to the floor by bending the elbows, then push back up.', recommendedReps: '10-15 reps' },
  { id: 'chest-fly', name: 'Chest Fly', muscleGroup: 'chest', equipment: 'Dumbbells', description: 'Lying on a bench, open your arms out to the sides with a slight elbow bend, then bring the dumbbells back together above your chest.', recommendedReps: '10-15 reps' },
  { id: 'overhead-press', name: 'Overhead Press', muscleGroup: 'shoulders', equipment: 'Barbell', description: 'Standing with the bar at shoulder height, press it straight overhead until your arms are fully extended, then lower with control.', recommendedReps: '6-10 reps' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscleGroup: 'shoulders', equipment: 'Dumbbells', description: 'With a dumbbell in each hand at your sides, raise your arms out to shoulder height, then lower slowly.', recommendedReps: '12-15 reps' },
  { id: 'face-pull', name: 'Face Pull', muscleGroup: 'shoulders', equipment: 'Cable Machine', description: 'Using a rope attachment at head height, pull the rope toward your face, flaring your elbows out wide.', recommendedReps: '12-15 reps' },
  { id: 'plank', name: 'Plank', muscleGroup: 'abs', equipment: 'Bodyweight', description: 'Hold a straight-body position supported on your forearms and toes, keeping your core braced throughout.', recommendedReps: '30-45 sec hold' },
  { id: 'crunches', name: 'Crunches', muscleGroup: 'abs', equipment: 'Bodyweight', description: 'Lying on your back with knees bent, curl your shoulders off the floor toward your knees, then lower back down.', recommendedReps: '15-20 reps' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'abs', equipment: 'Pull-Up Bar', description: 'Hang from a pull-up bar and raise your legs up in front of you, keeping them straight, then lower with control.', recommendedReps: '10-15 reps' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', equipment: 'Cable Machine', description: 'Sit at a lat pulldown machine and pull the bar down to your upper chest, then let it rise back up under control.', recommendedReps: '8-12 reps' },
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'back', equipment: 'Barbell', description: 'Hinge at the hips to grip the bar, then stand up by driving through your legs and extending your hips, keeping your back straight.', recommendedReps: '5-8 reps' },
  { id: 'seated-row', name: 'Seated Row', muscleGroup: 'back', equipment: 'Cable Machine', description: 'Sit at a cable row station and pull the handle toward your torso, squeezing your shoulder blades together.', recommendedReps: '8-12 reps' },
]

const WORKOUTS = [
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

const TOTAL_RUNS = 9

const RUN_PHASE_TEMPLATE = [
  { type: 'warmup', durationSeconds: 10 },
  { type: 'run', durationSeconds: 60 },
  { type: 'run', durationSeconds: 60 },
  { type: 'walk', durationSeconds: 60 },
  { type: 'run', durationSeconds: 60 },
  { type: 'run', durationSeconds: 60 },
  { type: 'walk', durationSeconds: 60 },
  { type: 'run', durationSeconds: 60 },
  { type: 'run', durationSeconds: 60 },
  { type: 'cooldown', durationSeconds: 10 },
]

async function main() {
  for (const exercise of EXERCISES) {
    await prisma.exercise.upsert({ where: { id: exercise.id }, create: exercise, update: exercise })
  }

  for (const workout of WORKOUTS) {
    await prisma.liftingWorkout.upsert({
      where: { id: workout.id },
      create: { id: workout.id, title: workout.title },
      update: { title: workout.title },
    })

    await prisma.workoutExercise.deleteMany({ where: { workoutId: workout.id } })
    await prisma.workoutExercise.createMany({
      data: workout.exerciseIds.map((exerciseId, order) => ({
        workoutId: workout.id,
        exerciseId,
        order,
      })),
    })

    await prisma.workoutActivity.deleteMany({ where: { workoutId: workout.id } })
    await prisma.workoutActivity.createMany({
      data: [
        ...workout.warmup.map((activity, order) => ({
          workoutId: workout.id,
          phase: 'warmup',
          order,
          ...activity,
        })),
        ...workout.cooldown.map((activity, order) => ({
          workoutId: workout.id,
          phase: 'cooldown',
          order,
          ...activity,
        })),
      ],
    })
  }

  for (let id = 1; id <= TOTAL_RUNS; id++) {
    await prisma.run.upsert({ where: { id }, create: { id }, update: {} })
    await prisma.runPhase.deleteMany({ where: { runId: id } })
    await prisma.runPhase.createMany({
      data: RUN_PHASE_TEMPLATE.map((phase, order) => ({ runId: id, order, ...phase })),
    })
  }

  console.log(
    `Seeded ${EXERCISES.length} exercises, ${WORKOUTS.length} workouts, ${TOTAL_RUNS} runs.`,
  )
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
