import prisma from './prisma.js';

const initialExercises = [
  {
    name: 'Barbell Bench Press',
    description: 'A classic chest compound exercise that builds strength and muscle mass in the pectorals, shoulders, and triceps.',
    muscleGroup: 'Chest',
    difficulty: 'INTERMEDIATE',
    equipment: 'Barbell, Bench',
    instructions: 'Lay flat on the bench. Grip the barbell slightly wider than shoulder-width. Lower the bar slowly to your mid-chest. Push the bar back up until your arms are fully extended, maintaining a tight core and stable feet.'
  },
  {
    name: 'Dumbbell Incline Chest Press',
    description: 'Targets the upper portion of the pectoral muscles with dumbbells for a greater range of motion.',
    muscleGroup: 'Chest',
    difficulty: 'INTERMEDIATE',
    equipment: 'Dumbbells, Incline Bench',
    instructions: 'Set the bench to a 30-45 degree incline. Sit back holding dumbbells at chest level. Press the dumbbells straight up above your chest. Lower them slowly to the starting position.'
  },
  {
    name: 'Push-ups',
    description: 'A foundational bodyweight exercise for chest, shoulders, triceps, and core stability.',
    muscleGroup: 'Chest',
    difficulty: 'BEGINNER',
    equipment: 'Bodyweight',
    instructions: 'Get into a high plank position. Lower your body until your chest nearly touches the floor. Push yourself back up to the starting position.'
  },
  {
    name: 'Barbell Squat',
    description: 'The king of lower body exercises, targeting quads, hamstrings, glutes, and core.',
    muscleGroup: 'Legs',
    difficulty: 'INTERMEDIATE',
    equipment: 'Barbell, Squat Rack',
    instructions: 'Place the barbell on your upper back. Stand with feet shoulder-width apart. Sit back and down as if sitting in a chair, keeping your chest up. Drive through your heels to return to standing.'
  },
  {
    name: 'Deadlift',
    description: 'A powerful full-body compound lift targeting the posterior chain, including hamstrings, glutes, back, and core.',
    muscleGroup: 'Back',
    difficulty: 'ADVANCED',
    equipment: 'Barbell',
    instructions: 'Stand with feet mid-foot under the bar. Bend over and grab the bar. Bend your knees until your shins touch. Lift the bar by standing up, keeping the bar close to your body and back flat.'
  },
  {
    name: 'Pull-ups',
    description: 'An excellent bodyweight exercise targeting the latissimus dorsi, upper back, and biceps.',
    muscleGroup: 'Back',
    difficulty: 'INTERMEDIATE',
    equipment: 'Pull-up Bar',
    instructions: 'Grip the pull-up bar with palms facing away, wider than shoulder-width. Pull your chest up toward the bar by driving your elbows down. Lower yourself back down slowly.'
  },
  {
    name: 'Dumbbell Lateral Raise',
    description: 'An isolation movement targeting the lateral (side) deltoids to build shoulder width.',
    muscleGroup: 'Shoulders',
    difficulty: 'BEGINNER',
    equipment: 'Dumbbells',
    instructions: 'Stand holding dumbbells at your sides. Keeping a slight bend in your elbows, raise the weights out to the sides until your arms are parallel to the floor. Lower slowly.'
  },
  {
    name: 'Overhead Barbell Press',
    description: 'Builds size and strength in the shoulders, triceps, and upper back.',
    muscleGroup: 'Shoulders',
    difficulty: 'INTERMEDIATE',
    equipment: 'Barbell',
    instructions: 'Hold the barbell at shoulder height. Press the bar straight up overhead, locking out your arms at the top. Lower the bar back down control to shoulder height.'
  },
  {
    name: 'Dumbbell Bicep Curl',
    description: 'A classic isolation exercise for the biceps brachii.',
    muscleGroup: 'Arms',
    difficulty: 'BEGINNER',
    equipment: 'Dumbbells',
    instructions: 'Stand with dumbbells at your sides, palms facing forward. Curl the weights up while keeping your elbows stationary. Squeeze at the top, then lower slowly.'
  },
  {
    name: 'Tricep Rope Pushdown',
    description: 'Isolates the triceps brachii using a cable machine.',
    muscleGroup: 'Arms',
    difficulty: 'BEGINNER',
    equipment: 'Cable Machine',
    instructions: 'Grip the rope attachment on a high pulley. Pull your elbows down to your sides. Push the rope down, spreading the ends at the bottom, then return slowly.'
  },
  {
    name: 'Plank',
    description: 'An isometric core strength exercise that improves posture and abdominal stability.',
    muscleGroup: 'Core',
    difficulty: 'BEGINNER',
    equipment: 'Bodyweight',
    instructions: 'Support your weight on your forearms and toes. Keep your body in a straight line, contract your abdomen, and hold for the target duration.'
  },
  {
    name: 'Treadmill Running',
    description: 'Cardio exercise that burns calories and improves cardiovascular endurance.',
    muscleGroup: 'Cardio',
    difficulty: 'BEGINNER',
    equipment: 'Treadmill',
    instructions: 'Select your speed and incline on the treadmill. Maintain an upright running posture, landing mid-foot, and breathing rhythmically.'
  }
];

export const seedExercises = async () => {
  try {
    const count = await prisma.exercise.count();
    if (count === 0) {
      console.log('Seeding initial exercises into Exercise Library...');
      await prisma.exercise.createMany({
        data: initialExercises
      });
      console.log('Exercise library seeded successfully!');
    }
  } catch (err) {
    console.error('Error seeding initial exercises:', err);
  }
};
