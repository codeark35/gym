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
  { name: 'Incline Dumbbell Press', nameEs: 'Press inclinado mancuernas', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH },
  { name: 'Decline Dumbbell Press', nameEs: 'Press declinado mancuernas', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH },
  { name: 'Incline Dumbbell Fly', nameEs: 'Aperturas inclinadas mancuerna', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Machine Fly', nameEs: 'Aperturas máquina', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION },
  { name: 'Pec Deck', nameEs: 'Pec deck', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION },
  { name: 'Svend Press', nameEs: 'Press Svend', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Landmine Press', nameEs: 'Press landmine', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Floor Press', nameEs: 'Press suelo', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Push Up', nameEs: 'Flexión', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH },
  { name: 'Diamond Push Up', nameEs: 'Flexión diamante', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH },
  { name: 'Wide Grip Bench Press', nameEs: 'Press banca agarre ancho', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Reverse Grip Bench Press', nameEs: 'Press banca agarre invertido', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },

  // BACK
  { name: 'Deadlift', nameEs: 'Peso muerto convencional', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.HINGE },
  { name: 'Barbell Row', nameEs: 'Remo barra', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.PULL },
  { name: 'Dumbbell Row', nameEs: 'Remo mancuerna', muscleGroup: MuscleGroup.BACK, equipment: Equipment.DUMBBELL, movementType: MovementType.PULL },
  { name: 'Pull-up', nameEs: 'Dominadas', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL },
  { name: 'Lat Pulldown', nameEs: 'Pull-down polea', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL },
  { name: 'Cable Row', nameEs: 'Remo en polea', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL },
  { name: 'Face Pull', nameEs: 'Face pull', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL },
  { name: 'T-Bar Row', nameEs: 'Remo T-bar', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.PULL },
  { name: 'Snatch Grip Deadlift', nameEs: 'Peso muerto agarre ancho', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.HINGE },
  { name: 'Deficit Deadlift', nameEs: 'Peso muerto en déficit', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.HINGE },
  { name: 'Rack Pull', nameEs: 'Rack pull', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.HINGE },
  { name: 'Pendlay Row', nameEs: 'Remo Pendlay', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.PULL },
  { name: 'Seal Row', nameEs: 'Remo seal', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.PULL },
  { name: 'Chest Supported Row', nameEs: 'Remo con soporte pecho', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE, movementType: MovementType.PULL },
  { name: 'High Row', nameEs: 'Remo alto', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE, movementType: MovementType.PULL },
  { name: 'Low Row', nameEs: 'Remo bajo', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL },
  { name: 'Straight Arm Pulldown', nameEs: 'Pull-down brazo recto', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL },
  { name: 'Wide Grip Pulldown', nameEs: 'Pull-down agarre ancho', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL },
  { name: 'Chin-up', nameEs: 'Chin-up', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL },
  { name: 'Neutral Grip Pull-up', nameEs: 'Dominada agarre neutro', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL },
  { name: 'Commando Pull-up', nameEs: 'Dominada comando', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL },
  { name: 'Superman', nameEs: 'Superman', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Back Extension', nameEs: 'Extensión de espalda', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },

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
  { name: 'Hack Squat', nameEs: 'Sentadilla hack', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.MACHINE, movementType: MovementType.SQUAT },
  { name: 'Goblet Squat', nameEs: 'Sentadilla goblet', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT },
  { name: 'Box Squat', nameEs: 'Sentadilla en caja', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT },
  { name: 'Pause Squat', nameEs: 'Sentadilla pausada', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT },
  { name: 'Tempo Squat', nameEs: 'Sentadilla tempo', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT },
  { name: 'Pin Squat', nameEs: 'Sentadilla pin', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT },
  { name: 'Sissy Squat', nameEs: 'Sentadilla sissy', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.SQUAT },
  { name: 'Nordic Hamstring Curl', nameEs: 'Curl femoral nórdico', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Leg Press Calf Raise', nameEs: 'Elevación de gemelos en leg press', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION },
  { name: 'Walking Lunge', nameEs: 'Zancada caminando', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT },
  { name: 'Reverse Lunge', nameEs: 'Zancada inversa', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT },
  { name: 'Lateral Lunge', nameEs: 'Zancada lateral', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT },
  { name: 'Curtsy Lunge', nameEs: 'Zancada cortesía', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT },
  { name: 'Pistol Squat', nameEs: 'Sentadilla pistola', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.SQUAT },
  { name: 'Shrimp Squat', nameEs: 'Sentadilla camarón', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.SQUAT },
  { name: 'Cyclist Squat', nameEs: 'Sentadilla ciclista', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT },
  { name: 'Jefferson Squat', nameEs: 'Sentadilla Jefferson', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT },

  // SHOULDERS
  { name: 'Barbell Overhead Press', nameEs: 'Press militar barra', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Dumbbell Overhead Press', nameEs: 'Press militar mancuernas', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH },
  { name: 'Lateral Raise', nameEs: 'Elevaciones laterales', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Front Raise', nameEs: 'Elevaciones frontales', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Arnold Press', nameEs: 'Arnold press', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH },
  { name: 'Rear Delt Fly', nameEs: 'Vuelo posterior', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Cable Lateral Raise', nameEs: 'Elevaciones laterales polea', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Cable Front Raise', nameEs: 'Elevaciones frontales polea', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Machine Lateral Raise', nameEs: 'Elevaciones laterales máquina', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION },
  { name: 'Push Press', nameEs: 'Push press', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Z Press', nameEs: 'Press Z', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Bradford Press', nameEs: 'Press Bradford', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Y Raise', nameEs: 'Elevación Y', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'W Raise', nameEs: 'Elevación W', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Around The World', nameEs: 'Alrededor del mundo', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Upright Row', nameEs: 'Remo vertical', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.PULL },
  { name: 'Cable Upright Row', nameEs: 'Remo vertical polea', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE, movementType: MovementType.PULL },
  { name: 'Landmine Lateral Raise', nameEs: 'Elevación lateral landmine', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Trap Raise', nameEs: 'Elevación trapecio', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },

  // BICEPS
  { name: 'Barbell Curl', nameEs: 'Curl barra recta', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'EZ Bar Curl', nameEs: 'Curl barra Z', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Alternating Dumbbell Curl', nameEs: 'Curl mancuerna alternado', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Hammer Curl', nameEs: 'Curl martillo', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Concentration Curl', nameEs: 'Curl concentrado', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Cable Curl', nameEs: 'Curl en polea', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Incline Dumbbell Curl', nameEs: 'Curl mancuerna inclinado', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Preacher Curl', nameEs: 'Curl predicador', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Spider Curl', nameEs: 'Curl araña', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Drag Curl', nameEs: 'Curl de arrastre', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Waiter Curl', nameEs: 'Curl camarero', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Cross Body Curl', nameEs: 'Curl cruzado', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },

  // TRICEPS
  { name: 'French Press', nameEs: 'Press francés', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Triceps Pushdown', nameEs: 'Extensión tríceps polea', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Close Grip Bench Press', nameEs: 'Press cerrado', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Triceps Dips', nameEs: 'Fondos tríceps', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH },
  { name: 'Triceps Kickback', nameEs: 'Patada de tríceps', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'Overhead Triceps Extension', nameEs: 'Extensión tríceps sobre cabeza', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION },
  { name: 'JM Press', nameEs: 'Press JM', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Cable Overhead Triceps', nameEs: 'Extensión tríceps polea alta', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Reverse Grip Pushdown', nameEs: 'Extensión tríceps agarre invertido', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Lying Triceps Extension', nameEs: 'Extensión tríceps acostado', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Single Arm Triceps Extension', nameEs: 'Extensión tríceps un brazo', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },

  // CORE
  { name: 'Plank', nameEs: 'Plancha', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.CARRY },
  { name: 'Crunch', nameEs: 'Crunch', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Cable Crunch', nameEs: 'Crunch en polea', muscleGroup: MuscleGroup.CORE, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Ab Wheel Rollout', nameEs: 'Rueda abdominal', muscleGroup: MuscleGroup.CORE, equipment: Equipment.OTHER, movementType: MovementType.ISOLATION },
  { name: 'Hanging Leg Raise', nameEs: 'Elevación de piernas colgado', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Russian Twist', nameEs: 'Russian twist', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Dead Bug', nameEs: 'Bicho muerto', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Bird Dog', nameEs: 'Pájaro perro', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Side Plank', nameEs: 'Plancha lateral', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.CARRY },
  { name: 'V-Up', nameEs: 'V-up', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Toe to Bar', nameEs: 'Pie a barra', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Windshield Wiper', nameEs: 'Limpia parabrisas', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'L-Sit', nameEs: 'L-sit', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Dragon Flag', nameEs: 'Bandera dragón', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Cable Woodchop', nameEs: 'Tala de madera polea', muscleGroup: MuscleGroup.CORE, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Pallof Press', nameEs: 'Press Pallof', muscleGroup: MuscleGroup.CORE, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Mountain Climber', nameEs: 'Escalador de montaña', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Hollow Body Hold', nameEs: 'Posición hueca', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Bicycle Crunch', nameEs: 'Crunch bicicleta', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Leg Raise', nameEs: 'Elevación de piernas', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },

  // GLUTES
  { name: 'Glute Bridge', nameEs: 'Puente de glúteos', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.BODYWEIGHT, movementType: MovementType.HINGE },
  { name: 'Cable Kickback', nameEs: 'Patada glúteo polea', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION },
  { name: 'Bulgarian Split Squat', nameEs: 'Sentadilla búlgara', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT },
  { name: 'Step Up', nameEs: 'Step up', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT },
  { name: 'Sumo Squat', nameEs: 'Sentadilla sumo', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT },

  // CALVES
  { name: 'Seated Calf Raise', nameEs: 'Elevación de gemelos sentado', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION },
  { name: 'Standing Calf Raise', nameEs: 'Elevación de gemelos de pie', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION },
  { name: 'Donkey Calf Raise', nameEs: 'Elevación de gemelos burro', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },
  { name: 'Single Leg Calf Raise', nameEs: 'Elevación de gemelos una pierna', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION },

  // FOREARMS
  { name: 'Wrist Curl', nameEs: 'Curl de muñeca', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Reverse Curl', nameEs: 'Curl inverso', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Reverse Wrist Curl', nameEs: 'Curl de muñeca inverso', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION },
  { name: 'Farmer Carry', nameEs: 'Caminata del granjero', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.DUMBBELL, movementType: MovementType.CARRY },
  { name: 'Plate Pinch', nameEs: 'Pinza de disco', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.OTHER, movementType: MovementType.ISOLATION },
  { name: 'Towel Pull-up', nameEs: 'Dominada con toalla', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL },

  // CARDIO
  { name: 'Running', nameEs: 'Correr', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Walking', nameEs: 'Caminar', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Cycling', nameEs: 'Ciclismo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Swimming', nameEs: 'Natación', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Rowing Machine', nameEs: 'Remo ergómetro', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.PULL },
  { name: 'Elliptical', nameEs: 'Elíptica', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Stair Climber', nameEs: 'Escalera', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Jump Rope', nameEs: 'Cuerda de saltar', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Sprint', nameEs: 'Sprint', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Hiking', nameEs: 'Senderismo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Treadmill Run', nameEs: 'Cinta de correr', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Treadmill Walk', nameEs: 'Cinta de caminar', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Stationary Bike', nameEs: 'Bicicleta estática', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Spin Bike', nameEs: 'Spinning', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Indoor Cycling', nameEs: 'Ciclismo indoor', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Outdoor Cycling', nameEs: 'Ciclismo outdoor', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Trail Running', nameEs: 'Trail running', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'HIIT', nameEs: 'HIIT', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Tabata', nameEs: 'Tabata', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Circuit Training', nameEs: 'Circuito', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Aerobics', nameEs: 'Aeróbicos', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Dance', nameEs: 'Danza', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Yoga', nameEs: 'Yoga', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Pilates', nameEs: 'Pilates', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Stretching', nameEs: 'Estiramiento', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Mobility', nameEs: 'Movilidad', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Foam Rolling', nameEs: 'Rodillo de espuma', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Swimming Laps', nameEs: 'Largos de natación', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Open Water Swim', nameEs: 'Natación aguas abiertas', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },
  { name: 'Water Aerobics', nameEs: 'Aeróbicos acuáticos', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY },

  // FULL_BODY
  { name: 'Clean and Press', nameEs: 'Clean and press', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Thruster', nameEs: 'Thruster', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT },
  { name: 'Kettlebell Swing', nameEs: 'Swing con kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.HINGE },
  { name: 'Burpee', nameEs: 'Burpee', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH },
  { name: 'Turkish Get Up', nameEs: 'Levantamiento turco', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.CARRY },
  { name: 'Snatch', nameEs: 'Snatch', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.PULL },
  { name: 'Clean', nameEs: 'Clean', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.PULL },
  { name: 'Jerk', nameEs: 'Jerk', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.PUSH },
  { name: 'Muscle Up', nameEs: 'Muscle up', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL },
  { name: 'Box Jump', nameEs: 'Salto a caja', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BODYWEIGHT, movementType: MovementType.SQUAT },
  { name: 'Broad Jump', nameEs: 'Salto largo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BODYWEIGHT, movementType: MovementType.SQUAT },
  { name: 'Medicine Ball Slam', nameEs: 'Lanzamiento de balón medicinal', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.PUSH },
  { name: 'Battle Ropes', nameEs: 'Cuerdas de batalla', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.ISOLATION },
  { name: 'Sled Push', nameEs: 'Empuje de trineo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.PUSH },
  { name: 'Sled Pull', nameEs: 'Arrastre de trineo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.PULL },
  { name: 'Wall Ball', nameEs: 'Balón a pared', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.PUSH },
  { name: 'Kettlebell Clean', nameEs: 'Clean con kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.PULL },
  { name: 'Kettlebell Snatch', nameEs: 'Snatch con kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.PULL },
  { name: 'Kettlebell Press', nameEs: 'Press con kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.PUSH },
  { name: 'Single Arm Swing', nameEs: 'Swing un brazo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.HINGE },
  { name: 'Goblet Clean', nameEs: 'Clean goblet', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.PULL },
  { name: 'Double Kettlebell Swing', nameEs: 'Swing doble kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.HINGE },
  { name: 'Kettlebell Squat', nameEs: 'Sentadilla con kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.SQUAT },
  { name: 'Overhead Squat', nameEs: 'Sentadilla sobre cabeza', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT },
];

async function main() {
  console.log('Seeding exercises...');

  // Step 1: Clean up duplicate exercises by name (keep only the first one)
  console.log('Checking for duplicate exercises...');
  const allExercises = await prisma.exercise.findMany({
    where: { isGlobal: true },
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  });

  const nameMap = new Map<string, string>();
  let totalRemoved = 0;

  for (const ex of allExercises) {
    if (nameMap.has(ex.name)) {
      const keepId = nameMap.get(ex.name)!;
      
      // Reassign any sets from duplicate to original
      const updatedSets = await prisma.set.updateMany({
        where: { exerciseId: ex.id },
        data: { exerciseId: keepId },
      });
      if (updatedSets.count > 0) {
        console.log(`  Reassigned ${updatedSets.count} sets from "${ex.name}" duplicate to original`);
      }
      
      // Delete the duplicate
      await prisma.exercise.delete({ where: { id: ex.id } });
      totalRemoved++;
      console.log(`  Removed duplicate: "${ex.name}" (id: ${ex.id})`);
    } else {
      nameMap.set(ex.name, ex.id);
    }
  }

  if (totalRemoved > 0) {
    console.log(`✅ Removed ${totalRemoved} duplicate exercises`);
  } else {
    console.log('✅ No duplicate exercises found');
  }

  // Step 2: Seed new exercises
  const existingNames = new Set(allExercises.map(e => e.name));
  const newExercises = exercises.filter(e => !existingNames.has(e.name));

  if (newExercises.length > 0) {
    await prisma.exercise.createMany({
      data: newExercises.map(e => ({
        ...e,
        isGlobal: true,
        secondaryMuscles: [],
        userId: null,
      })),
      skipDuplicates: true,
    });
    console.log(`✅ Seeded ${newExercises.length} new exercises (${existingNames.size} already existed)`);
  } else {
    console.log(`✅ All ${exercises.length} exercises already exist, no new exercises seeded`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
