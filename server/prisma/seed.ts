import { PrismaClient, Equipment, MuscleGroup, MovementType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const exercises = [
  // CHEST
  { name: 'Bench Press', nameEs: 'Press banca plano', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Incline Bench Press', nameEs: 'Press banca inclinado', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Decline Bench Press', nameEs: 'Press banca declinado', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Dumbbell Fly', nameEs: 'Aperturas mancuerna', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Chest Dips', nameEs: 'Fondos pecho', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH },
  { name: 'Cable Crossover', nameEs: 'Crossover polea', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Dumbbell Press', nameEs: 'Press con mancuernas', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH },

  // BACK
  { name: 'Deadlift', nameEs: 'Peso muerto convencional', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.HINGE },
  { name: 'Barbell Row', nameEs: 'Remo barra', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.PULL },
  { name: 'Dumbbell Row', nameEs: 'Remo mancuerna', muscleGroup: MuscleGroup.BACK, equipment: Equipment.DUMBBELL, movementType: MovementType.PULL },
  { name: 'Pull-up', nameEs: 'Dominadas', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL },
  { name: 'Lat Pulldown', nameEs: 'Pull-down polea', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL },
  { name: 'Cable Row', nameEs: 'Remo en polea', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL },
  { name: 'Face Pull', nameEs: 'Face pull', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL },
  { name: 'T-Bar Row', nameEs: 'Remo T-bar', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.PULL },

  // LEGS
  { name: 'Back Squat', nameEs: 'Sentadilla libre', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT },
  { name: 'Front Squat', nameEs: 'Sentadilla frontal', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT },
  { name: 'Leg Press', nameEs: 'Leg press', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.MACHINE, movementType: MovementType.SQUAT },
  { name: 'Leg Extension', nameEs: 'Extensión cuádriceps', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION },
  { name: 'Leg Curl', nameEs: 'Curl femoral', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION },
  { name: 'Hip Thrust', nameEs: 'Hip thrust', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.BARBELL, movementType: MovementType.HINGE },
  { name: 'Romanian Deadlift', nameEs: 'Peso muerto rumano', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.HINGE },
  { name: 'Lunges', nameEs: 'Zancadas', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT },
  { name: 'Incline Leg Press', nameEs: 'Prensa inclinada', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.MACHINE, movementType: MovementType.SQUAT },
  { name: 'Calf Raise', nameEs: 'Elevación de gemelos', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION },

  // SHOULDERS
  { name: 'Barbell Overhead Press', nameEs: 'Press militar barra', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Dumbbell Overhead Press', nameEs: 'Press militar mancuernas', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH },
  { name: 'Lateral Raise', nameEs: 'Elevaciones laterales', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Front Raise', nameEs: 'Elevaciones frontales', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Arnold Press', nameEs: 'Arnold press', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH },
  { name: 'Rear Delt Fly', nameEs: 'Vuelo posterior', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },

  // BICEPS
  { name: 'Barbell Curl', nameEs: 'Curl barra recta', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'EZ Bar Curl', nameEs: 'Curl barra Z', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Alternating Dumbbell Curl', nameEs: 'Curl mancuerna alternado', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Hammer Curl', nameEs: 'Curl martillo', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Concentration Curl', nameEs: 'Curl concentrado', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Cable Curl', nameEs: 'Curl en polea', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },

  // TRICEPS
  { name: 'French Press', nameEs: 'Press francés', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Triceps Pushdown', nameEs: 'Extensión tríceps polea', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Close Grip Bench Press', nameEs: 'Press cerrado', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Triceps Dips', nameEs: 'Fondos tríceps', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH },
  { name: 'Triceps Kickback', nameEs: 'Patada de tríceps', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Overhead Triceps Extension', nameEs: 'Extensión tríceps sobre cabeza', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },

  // CORE
  { name: 'Plank', nameEs: 'Plancha', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.CARRY },
  { name: 'Crunch', nameEs: 'Crunch', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Cable Crunch', nameEs: 'Crunch en polea', muscleGroup: MuscleGroup.CORE, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Ab Wheel Rollout', nameEs: 'Rueda abdominal', muscleGroup: MuscleGroup.CORE, equipment: Equipment.OTHER, movementType: MovementType.ISOLATION },
  { name: 'Hanging Leg Raise', nameEs: 'Elevación de piernas colgado', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Russian Twist', nameEs: 'Russian twist', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },

  // GLUTES
  { name: 'Glute Bridge', nameEs: 'Puente de glúteos', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.BODYWEIGHT, movementType: MovementType.HINGE },
  { name: 'Cable Kickback', nameEs: 'Patada glúteo polea', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },

  // FOREARMS
  { name: 'Wrist Curl', nameEs: 'Curl de muñeca', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Reverse Curl', nameEs: 'Curl inverso', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },

  // FULL_BODY
  { name: 'Clean and Press', nameEs: 'Clean and press', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Thruster', nameEs: 'Thruster', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT },
  { name: 'Kettlebell Swing', nameEs: 'Swing con kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.HINGE },
  { name: 'Burpee', nameEs: 'Burpee', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH },
];

async function main() {
  console.log('Seeding exercises...');

  await prisma.exercise.createMany({
    data: exercises.map(e => ({
      ...e,
      isGlobal: true,
      secondaryMuscles: [],
      userId: null,
    })),
    skipDuplicates: true,
  });

  console.log(`Seeded ${exercises.length} exercises`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
