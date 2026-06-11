import { PrismaClient, Equipment, MuscleGroup, MovementType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const EXERCISE_IMAGE_URLS: Record<string, string> = {
  'Bench Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg',
  'Incline Bench Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg',
  'Dumbbell Fly': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Dumbbell_Flyes/0.jpg',
  'Cable Crossover': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg',
  'Dumbbell Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg',
  'Incline Dumbbell Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg',
  'Incline Dumbbell Fly': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes/0.jpg',
  'Machine Fly': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/0.jpg',
  'Svend Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Svend_Press/0.jpg',
  'Floor Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Floor_Press/0.jpg',
  'Push Up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clock_Push-Up/0.jpg',
  'Deadlift': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Axle_Deadlift/0.jpg',
  'Barbell Row': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg',
  'Dumbbell Row': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg',
  'Pull-up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Assisted_Pull-Up/0.jpg',
  'Lat Pulldown': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg',
  'Cable Row': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elevated_Cable_Rows/0.jpg',
  'Face Pull': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg',
  'T-Bar Row': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/0.jpg',
  'Deficit Deadlift': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Deficit_Deadlift/0.jpg',
  'Rack Pull': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rack_Pull_with_Bands/0.jpg',
  'High Row': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/High_Row/0.jpg',
  'Straight Arm Pulldown': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight_Arm_Pulldown/0.jpg',
  'Wide Grip Pulldown': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Pulldown/0.jpg',
  'Chin-up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg',
  'Superman': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Superman/0.jpg',
  'Back Extension': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Back_Extensions/0.jpg',
  'Front Squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/0.jpg',
  'Leg Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg',
  'Leg Extension': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg',
  'Leg Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Curls/0.jpg',
  'Hip Thrust': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg',
  'Romanian Deadlift': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg',
  'Lunges': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg',
  'Incline Leg Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Leg_Press/0.jpg',
  'Calf Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg',
  'Hack Squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/0.jpg',
  'Goblet Squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg',
  'Box Squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Squat/0.jpg',
  'Sissy Squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sissy_Squat/0.jpg',
  'Leg Press Calf Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press_Calf_Raise/0.jpg',
  'Walking Lunge': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Walking_Lunges/0.jpg',
  'Reverse Lunge': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Lunges/0.jpg',
  'Pistol Squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pistol_Squat/0.jpg',
  'Jefferson Squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jefferson_Squats/0.jpg',
  'Lateral Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise/0.jpg',
  'Front Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Raise/0.jpg',
  'Arnold Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg',
  'Rear Delt Fly': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rear_Delt_Fly/0.jpg',
  'Cable Lateral Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Lateral_Raise/0.jpg',
  'Cable Front Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Front_Raise/0.jpg',
  'Machine Lateral Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Lateral_Raise/0.jpg',
  'Push Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Push_Press/0.jpg',
  'Z Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Z_Press/0.jpg',
  'Bradford Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bradford_Press/0.jpg',
  'Y Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Y_Raise/0.jpg',
  'W Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/W_Raise/0.jpg',
  'Around The World': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Around_The_Worlds/0.jpg',
  'Upright Row': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Row/0.jpg',
  'Cable Upright Row': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Upright_Row/0.jpg',
  'Landmine Lateral Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Landmine_Lateral_Raise/0.jpg',
  'Trap Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trap_Raise/0.jpg',
  'Barbell Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg',
  'EZ Bar Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Curl/0.jpg',
  'Alternating Dumbbell Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Dumbbell_Curl/0.jpg',
  'Hammer Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curl/0.jpg',
  'Concentration Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curl/0.jpg',
  'Cable Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Curl/0.jpg',
  'Incline Dumbbell Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/0.jpg',
  'Preacher Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg',
  'Spider Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spider_Curl/0.jpg',
  'Drag Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Drag_Curl/0.jpg',
  'Waiter Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Waiter_Curl/0.jpg',
  'Cross Body Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cross_Body_Curl/0.jpg',
  'French Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/French_Press/0.jpg',
  'Triceps Pushdown': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg',
  'Close Grip Bench Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Bench_Press/0.jpg',
  'Triceps Dips': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Dips/0.jpg',
  'Triceps Kickback': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Kickback/0.jpg',
  'Overhead Triceps Extension': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Triceps_Extension/0.jpg',
  'JM Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/JM_Press/0.jpg',
  'Cable Overhead Triceps': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Overhead_Triceps/0.jpg',
  'Reverse Grip Pushdown': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Grip_Pushdown/0.jpg',
  'Lying Triceps Extension': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Extension/0.jpg',
  'Single Arm Triceps Extension': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Arm_Triceps_Extension/0.jpg',
  'Plank': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg',
  'Crunch': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunch/0.jpg',
  'Cable Crunch': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg',
  'Ab Wheel Rollout': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Wheel_Rollout/0.jpg',
  'Hanging Leg Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg',
  'Russian Twist': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg',
  'Dead Bug': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dead_Bug/0.jpg',
  'Bird Dog': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bird_Dog/0.jpg',
  'Side Plank': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Plank/0.jpg',
  'V-Up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/V-Up/0.jpg',
  'Toe to Bar': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Toe_to_Bar/0.jpg',
  'Windshield Wiper': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Windshield_Wiper/0.jpg',
  'L-Sit': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/L-Sit/0.jpg',
  'Dragon Flag': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dragon_Flag/0.jpg',
  'Cable Woodchop': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Woodchop/0.jpg',
  'Pallof Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press/0.jpg',
  'Mountain Climber': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climber/0.jpg',
  'Hollow Body Hold': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hollow_Body_Hold/0.jpg',
  'Bicycle Crunch': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycle_Crunch/0.jpg',
  'Leg Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Raise/0.jpg',
  'Glute Bridge': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Glute_Bridge/0.jpg',
  'Cable Kickback': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Kickback/0.jpg',
  'Bulgarian Split Squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bulgarian_Split_Squat/0.jpg',
  'Step Up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Step-Up/0.jpg',
  'Sumo Squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sumo_Squat/0.jpg',
  'Seated Calf Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg',
  'Standing Calf Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raise/0.jpg',
  'Donkey Calf Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raise/0.jpg',
  'Single Leg Calf Raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Leg_Calf_Raise/0.jpg',
  'Wrist Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wrist_Curl/0.jpg',
  'Reverse Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Curl/0.jpg',
  'Reverse Wrist Curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Wrist_Curl/0.jpg',
  'Farmer Carry': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Farmer_Carry/0.jpg',
  'Plate Pinch': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plate_Pinch/0.jpg',
  'Towel Pull-up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Towel_Pull-Up/0.jpg',
  'Running': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Running/0.jpg',
  'Walking': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Walking/0.jpg',
  'Cycling': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cycling/0.jpg',
  'Swimming': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Swimming/0.jpg',
  'Rowing Machine': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rowing_Machine/0.jpg',
  'Elliptical': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elliptical/0.jpg',
  'Stair Climber': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stair_Climber/0.jpg',
  'Jump Rope': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jump_Rope/0.jpg',
  'Sprint': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sprint/0.jpg',
  'Hiking': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hiking/0.jpg',
  'Treadmill Run': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Treadmill_Run/0.jpg',
  'Treadmill Walk': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Treadmill_Walk/0.jpg',
  'Stationary Bike': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stationary_Bike/0.jpg',
  'Spin Bike': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Spin_Bike/0.jpg',
  'Indoor Cycling': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Indoor_Cycling/0.jpg',
  'Outdoor Cycling': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Outdoor_Cycling/0.jpg',
  'Trail Running': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Trail_Running/0.jpg',
  'HIIT': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/HIIT/0.jpg',
  'Tabata': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tabata/0.jpg',
  'Circuit Training': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Circuit_Training/0.jpg',
  'Aerobics': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Aerobics/0.jpg',
  'Dance': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dance/0.jpg',
  'Yoga': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Yoga/0.jpg',
  'Pilates': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pilates/0.jpg',
  'Stretching': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stretching/0.jpg',
  'Mobility': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mobility/0.jpg',
  'Foam Rolling': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Foam_Rolling/0.jpg',
  'Swimming Laps': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Swimming_Laps/0.jpg',
  'Open Water Swim': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Open_Water_Swim/0.jpg',
  'Water Aerobics': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Water_Aerobics/0.jpg',
  'Clean and Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean_and_Press/0.jpg',
  'Thruster': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thruster/0.jpg',
  'Kettlebell Swing': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Swing/0.jpg',
  'Burpee': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Burpee/0.jpg',
  'Turkish Get Up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Turkish_Get_Up/0.jpg',
  'Snatch': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Snatch/0.jpg',
  'Clean': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Clean/0.jpg',
  'Jerk': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Jerk/0.jpg',
  'Muscle Up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Muscle_Up/0.jpg',
  'Box Jump': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Box_Jump/0.jpg',
  'Broad Jump': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Broad_Jump/0.jpg',
  'Medicine Ball Slam': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Medicine_Ball_Slam/0.jpg',
  'Battle Ropes': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Battle_Ropes/0.jpg',
  'Sled Push': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Push/0.jpg',
  'Sled Pull': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Sled_Pull/0.jpg',
  'Wall Ball': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wall_Ball/0.jpg',
  'Kettlebell Clean': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Clean/0.jpg',
  'Kettlebell Snatch': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Snatch/0.jpg',
  'Kettlebell Press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Press/0.jpg',
  'Single Arm Swing': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Single_Arm_Swing/0.jpg',
  'Goblet Clean': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Clean/0.jpg',
  'Double Kettlebell Swing': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Double_Kettlebell_Swing/0.jpg',
  'Kettlebell Squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Kettlebell_Squat/0.jpg',
  'Overhead Squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Overhead_Squat/0.jpg',
  'Incline Chest-Supported Dumbbell Row': 'https://wger.de/media/exercise-images/1283/e7262f70-7512-408a-8d00-4c499ef632fc.jpg',
  'Overhead Barbell Press': 'https://wger.de/media/exercise-images/1893/7dbad19e-0616-41fd-9d7d-3e21649c0eea.png',
};


const exercises = [
  // CHEST
  { name: 'Bench Press', nameEs: 'Press banca plano', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Bench Press'] },
  { name: 'Incline Bench Press', nameEs: 'Press banca inclinado', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Incline Bench Press'] },
  { name: 'Decline Bench Press', nameEs: 'Press banca declinado', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Bench Press'] },
  { name: 'Dumbbell Fly', nameEs: 'Aperturas mancuerna', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Dumbbell Fly'] },
  { name: 'Chest Dips', nameEs: 'Fondos pecho', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Triceps Dips'] },
  { name: 'Cable Crossover', nameEs: 'Crossover polea', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Cable Crossover'] },
  { name: 'Dumbbell Press', nameEs: 'Press con mancuernas', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Dumbbell Press'] },
  { name: 'Incline Dumbbell Press', nameEs: 'Press inclinado mancuernas', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Incline Dumbbell Press'] },
  { name: 'Decline Dumbbell Press', nameEs: 'Press declinado mancuernas', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Dumbbell Press'] },
  { name: 'Incline Dumbbell Fly', nameEs: 'Aperturas inclinadas mancuerna', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Incline Dumbbell Fly'] },
  { name: 'Machine Fly', nameEs: 'Aperturas máquina', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Machine Fly'] },
  { name: 'Pec Deck', nameEs: 'Pec deck', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Machine Fly'] },
  { name: 'Svend Press', nameEs: 'Press Svend', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Svend Press'] },
  { name: 'Landmine Press', nameEs: 'Press landmine', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Bench Press'] },
  { name: 'Floor Press', nameEs: 'Press suelo', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Floor Press'] },
  { name: 'Push Up', nameEs: 'Flexión', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Push Up'] },
  { name: 'Diamond Push Up', nameEs: 'Flexión diamante', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Push Up'] },
  { name: 'Wide Grip Bench Press', nameEs: 'Press banca agarre ancho', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Bench Press'] },
  { name: 'Reverse Grip Bench Press', nameEs: 'Press banca agarre invertido', muscleGroup: MuscleGroup.CHEST, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Bench Press'] },

  // BACK
  { name: 'Deadlift', nameEs: 'Peso muerto convencional', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.HINGE, imageUrl: EXERCISE_IMAGE_URLS['Deadlift'] },
  { name: 'Barbell Row', nameEs: 'Remo barra', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Barbell Row'] },
  { name: 'Dumbbell Row', nameEs: 'Remo mancuerna', muscleGroup: MuscleGroup.BACK, equipment: Equipment.DUMBBELL, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Dumbbell Row'] },
  { name: 'Pull-up', nameEs: 'Dominadas', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Pull-up'] },
  { name: 'Lat Pulldown', nameEs: 'Pull-down polea', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Lat Pulldown'] },
  { name: 'Cable Row', nameEs: 'Remo en polea', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Cable Row'] },
  { name: 'Face Pull', nameEs: 'Face pull', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Face Pull'] },
  { name: 'T-Bar Row', nameEs: 'Remo T-bar', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['T-Bar Row'] },
  { name: 'Snatch Grip Deadlift', nameEs: 'Peso muerto agarre ancho', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.HINGE, imageUrl: null },
  { name: 'Deficit Deadlift', nameEs: 'Peso muerto en déficit', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.HINGE, imageUrl: EXERCISE_IMAGE_URLS['Deficit Deadlift'] },
  { name: 'Rack Pull', nameEs: 'Rack pull', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.HINGE, imageUrl: EXERCISE_IMAGE_URLS['Rack Pull'] },
  { name: 'Pendlay Row', nameEs: 'Remo Pendlay', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Barbell Row'] },
  { name: 'Seal Row', nameEs: 'Remo seal', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BARBELL, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Barbell Row'] },
  { name: 'Chest Supported Row', nameEs: 'Remo con soporte pecho', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Incline Chest-Supported Dumbbell Row'] },
  { name: 'High Row', nameEs: 'Remo alto', muscleGroup: MuscleGroup.BACK, equipment: Equipment.MACHINE, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['High Row'] },
  { name: 'Low Row', nameEs: 'Remo bajo', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Bench Press'] },
  { name: 'Straight Arm Pulldown', nameEs: 'Pull-down brazo recto', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Straight Arm Pulldown'] },
  { name: 'Wide Grip Pulldown', nameEs: 'Pull-down agarre ancho', muscleGroup: MuscleGroup.BACK, equipment: Equipment.CABLE, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Wide Grip Pulldown'] },
  { name: 'Chin-up', nameEs: 'Chin-up', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Chin-up'] },
  { name: 'Neutral Grip Pull-up', nameEs: 'Dominada agarre neutro', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Pull-up'] },
  { name: 'Commando Pull-up', nameEs: 'Dominada comando', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Pull-up'] },
  { name: 'Superman', nameEs: 'Superman', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Superman'] },
  { name: 'Back Extension', nameEs: 'Extensión de espalda', muscleGroup: MuscleGroup.BACK, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Back Extension'] },

  // LEGS
  { name: 'Back Squat', nameEs: 'Sentadilla libre', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Back Extension'] },
  { name: 'Front Squat', nameEs: 'Sentadilla frontal', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Front Squat'] },
  { name: 'Leg Press', nameEs: 'Leg press', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.MACHINE, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Leg Press'] },
  { name: 'Leg Extension', nameEs: 'Extensión cuádriceps', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Leg Extension'] },
  { name: 'Leg Curl', nameEs: 'Curl femoral', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Leg Curl'] },
  { name: 'Hip Thrust', nameEs: 'Hip thrust', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.BARBELL, movementType: MovementType.HINGE, imageUrl: EXERCISE_IMAGE_URLS['Hip Thrust'] },
  { name: 'Romanian Deadlift', nameEs: 'Peso muerto rumano', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.HINGE, imageUrl: EXERCISE_IMAGE_URLS['Romanian Deadlift'] },
  { name: 'Lunges', nameEs: 'Zancadas', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Lunges'] },
  { name: 'Incline Leg Press', nameEs: 'Prensa inclinada', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.MACHINE, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Incline Leg Press'] },
  { name: 'Calf Raise', nameEs: 'Elevación de gemelos', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Calf Raise'] },
  { name: 'Hack Squat', nameEs: 'Sentadilla hack', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.MACHINE, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Hack Squat'] },
  { name: 'Goblet Squat', nameEs: 'Sentadilla goblet', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Goblet Squat'] },
  { name: 'Box Squat', nameEs: 'Sentadilla en caja', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Box Squat'] },
  { name: 'Pause Squat', nameEs: 'Sentadilla pausada', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Front Squat'] },
  { name: 'Tempo Squat', nameEs: 'Sentadilla tempo', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Front Squat'] },
  { name: 'Pin Squat', nameEs: 'Sentadilla pin', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Front Squat'] },
  { name: 'Sissy Squat', nameEs: 'Sentadilla sissy', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Sissy Squat'] },
  { name: 'Nordic Hamstring Curl', nameEs: 'Curl femoral nórdico', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Leg Curl'] },
  { name: 'Leg Press Calf Raise', nameEs: 'Elevación de gemelos en leg press', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Leg Press Calf Raise'] },
  { name: 'Walking Lunge', nameEs: 'Zancada caminando', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Walking Lunge'] },
  { name: 'Reverse Lunge', nameEs: 'Zancada inversa', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Reverse Lunge'] },
  { name: 'Lateral Lunge', nameEs: 'Zancada lateral', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Lunges'] },
  { name: 'Curtsy Lunge', nameEs: 'Zancada cortesía', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Lunges'] },
  { name: 'Pistol Squat', nameEs: 'Sentadilla pistola', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Pistol Squat'] },
  { name: 'Shrimp Squat', nameEs: 'Sentadilla camarón', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Front Squat'] },
  { name: 'Cyclist Squat', nameEs: 'Sentadilla ciclista', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Front Squat'] },
  { name: 'Jefferson Squat', nameEs: 'Sentadilla Jefferson', muscleGroup: MuscleGroup.LEGS, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Jefferson Squat'] },

  // SHOULDERS
  { name: 'Barbell Overhead Press', nameEs: 'Press militar barra', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Overhead Barbell Press'] },
  { name: 'Dumbbell Overhead Press', nameEs: 'Press militar mancuernas', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Dumbbell Press'] },
  { name: 'Lateral Raise', nameEs: 'Elevaciones laterales', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Lateral Raise'] },
  { name: 'Front Raise', nameEs: 'Elevaciones frontales', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Front Raise'] },
  { name: 'Arnold Press', nameEs: 'Arnold press', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Arnold Press'] },
  { name: 'Rear Delt Fly', nameEs: 'Vuelo posterior', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Rear Delt Fly'] },
  { name: 'Cable Lateral Raise', nameEs: 'Elevaciones laterales polea', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Cable Lateral Raise'] },
  { name: 'Cable Front Raise', nameEs: 'Elevaciones frontales polea', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Cable Front Raise'] },
  { name: 'Machine Lateral Raise', nameEs: 'Elevaciones laterales máquina', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Machine Lateral Raise'] },
  { name: 'Push Press', nameEs: 'Push press', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Push Press'] },
  { name: 'Z Press', nameEs: 'Press Z', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Z Press'] },
  { name: 'Bradford Press', nameEs: 'Press Bradford', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Bradford Press'] },
  { name: 'Y Raise', nameEs: 'Elevación Y', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Y Raise'] },
  { name: 'W Raise', nameEs: 'Elevación W', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['W Raise'] },
  { name: 'Around The World', nameEs: 'Alrededor del mundo', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Around The World'] },
  { name: 'Upright Row', nameEs: 'Remo vertical', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Upright Row'] },
  { name: 'Cable Upright Row', nameEs: 'Remo vertical polea', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Cable Upright Row'] },
  { name: 'Landmine Lateral Raise', nameEs: 'Elevación lateral landmine', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Landmine Lateral Raise'] },
  { name: 'Trap Raise', nameEs: 'Elevación trapecio', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Trap Raise'] },

  // BICEPS
  { name: 'Barbell Curl', nameEs: 'Curl barra recta', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Barbell Curl'] },
  { name: 'EZ Bar Curl', nameEs: 'Curl barra Z', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['EZ Bar Curl'] },
  { name: 'Alternating Dumbbell Curl', nameEs: 'Curl mancuerna alternado', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Alternating Dumbbell Curl'] },
  { name: 'Hammer Curl', nameEs: 'Curl martillo', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Hammer Curl'] },
  { name: 'Concentration Curl', nameEs: 'Curl concentrado', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Concentration Curl'] },
  { name: 'Cable Curl', nameEs: 'Curl en polea', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Cable Curl'] },
  { name: 'Incline Dumbbell Curl', nameEs: 'Curl mancuerna inclinado', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Incline Dumbbell Curl'] },
  { name: 'Preacher Curl', nameEs: 'Curl predicador', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Preacher Curl'] },
  { name: 'Spider Curl', nameEs: 'Curl araña', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Spider Curl'] },
  { name: 'Drag Curl', nameEs: 'Curl de arrastre', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Drag Curl'] },
  { name: 'Waiter Curl', nameEs: 'Curl camarero', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Waiter Curl'] },
  { name: 'Cross Body Curl', nameEs: 'Curl cruzado', muscleGroup: MuscleGroup.BICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Cross Body Curl'] },

  // TRICEPS
  { name: 'French Press', nameEs: 'Press francés', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['French Press'] },
  { name: 'Triceps Pushdown', nameEs: 'Extensión tríceps polea', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Triceps Pushdown'] },
  { name: 'Close Grip Bench Press', nameEs: 'Press cerrado', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Close Grip Bench Press'] },
  { name: 'Triceps Dips', nameEs: 'Fondos tríceps', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Triceps Dips'] },
  { name: 'Triceps Kickback', nameEs: 'Patada de tríceps', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Triceps Kickback'] },
  { name: 'Overhead Triceps Extension', nameEs: 'Extensión tríceps sobre cabeza', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.DUMBBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Overhead Triceps Extension'] },
  { name: 'JM Press', nameEs: 'Press JM', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['JM Press'] },
  { name: 'Cable Overhead Triceps', nameEs: 'Extensión tríceps polea alta', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Cable Overhead Triceps'] },
  { name: 'Reverse Grip Pushdown', nameEs: 'Extensión tríceps agarre invertido', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Reverse Grip Pushdown'] },
  { name: 'Lying Triceps Extension', nameEs: 'Extensión tríceps acostado', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Lying Triceps Extension'] },
  { name: 'Single Arm Triceps Extension', nameEs: 'Extensión tríceps un brazo', muscleGroup: MuscleGroup.TRICEPS, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Single Arm Triceps Extension'] },

  // CORE
  { name: 'Plank', nameEs: 'Plancha', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Plank'] },
  { name: 'Crunch', nameEs: 'Crunch', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Crunch'] },
  { name: 'Cable Crunch', nameEs: 'Crunch en polea', muscleGroup: MuscleGroup.CORE, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Cable Crunch'] },
  { name: 'Ab Wheel Rollout', nameEs: 'Rueda abdominal', muscleGroup: MuscleGroup.CORE, equipment: Equipment.OTHER, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Ab Wheel Rollout'] },
  { name: 'Hanging Leg Raise', nameEs: 'Elevación de piernas colgado', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Hanging Leg Raise'] },
  { name: 'Russian Twist', nameEs: 'Russian twist', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Russian Twist'] },
  { name: 'Dead Bug', nameEs: 'Bicho muerto', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Dead Bug'] },
  { name: 'Bird Dog', nameEs: 'Pájaro perro', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Bird Dog'] },
  { name: 'Side Plank', nameEs: 'Plancha lateral', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Side Plank'] },
  { name: 'V-Up', nameEs: 'V-up', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['V-Up'] },
  { name: 'Toe to Bar', nameEs: 'Pie a barra', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Toe to Bar'] },
  { name: 'Windshield Wiper', nameEs: 'Limpia parabrisas', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Windshield Wiper'] },
  { name: 'L-Sit', nameEs: 'L-sit', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['L-Sit'] },
  { name: 'Dragon Flag', nameEs: 'Bandera dragón', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Dragon Flag'] },
  { name: 'Cable Woodchop', nameEs: 'Tala de madera polea', muscleGroup: MuscleGroup.CORE, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Cable Woodchop'] },
  { name: 'Pallof Press', nameEs: 'Press Pallof', muscleGroup: MuscleGroup.CORE, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Pallof Press'] },
  { name: 'Mountain Climber', nameEs: 'Escalador de montaña', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Mountain Climber'] },
  { name: 'Hollow Body Hold', nameEs: 'Posición hueca', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Hollow Body Hold'] },
  { name: 'Bicycle Crunch', nameEs: 'Crunch bicicleta', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Bicycle Crunch'] },
  { name: 'Leg Raise', nameEs: 'Elevación de piernas', muscleGroup: MuscleGroup.CORE, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Leg Raise'] },

  // GLUTES
  { name: 'Glute Bridge', nameEs: 'Puente de glúteos', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.BODYWEIGHT, movementType: MovementType.HINGE, imageUrl: EXERCISE_IMAGE_URLS['Glute Bridge'] },
  { name: 'Cable Kickback', nameEs: 'Patada glúteo polea', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.CABLE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Cable Kickback'] },
  { name: 'Bulgarian Split Squat', nameEs: 'Sentadilla búlgara', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Bulgarian Split Squat'] },
  { name: 'Step Up', nameEs: 'Step up', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Step Up'] },
  { name: 'Sumo Squat', nameEs: 'Sentadilla sumo', muscleGroup: MuscleGroup.GLUTES, equipment: Equipment.DUMBBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Sumo Squat'] },

  // CALVES
  { name: 'Seated Calf Raise', nameEs: 'Elevación de gemelos sentado', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Seated Calf Raise'] },
  { name: 'Standing Calf Raise', nameEs: 'Elevación de gemelos de pie', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.MACHINE, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Standing Calf Raise'] },
  { name: 'Donkey Calf Raise', nameEs: 'Elevación de gemelos burro', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Donkey Calf Raise'] },
  { name: 'Single Leg Calf Raise', nameEs: 'Elevación de gemelos una pierna', muscleGroup: MuscleGroup.CALVES, equipment: Equipment.BODYWEIGHT, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Single Leg Calf Raise'] },

  // FOREARMS
  { name: 'Wrist Curl', nameEs: 'Curl de muñeca', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Wrist Curl'] },
  { name: 'Reverse Curl', nameEs: 'Curl inverso', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Reverse Curl'] },
  { name: 'Reverse Wrist Curl', nameEs: 'Curl de muñeca inverso', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.BARBELL, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Reverse Wrist Curl'] },
  { name: 'Farmer Carry', nameEs: 'Caminata del granjero', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.DUMBBELL, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Farmer Carry'] },
  { name: 'Plate Pinch', nameEs: 'Pinza de disco', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.OTHER, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Plate Pinch'] },
  { name: 'Towel Pull-up', nameEs: 'Dominada con toalla', muscleGroup: MuscleGroup.FOREARMS, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Towel Pull-up'] },

  // CARDIO
  { name: 'Running', nameEs: 'Correr', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Running'] },
  { name: 'Walking', nameEs: 'Caminar', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Walking'] },
  { name: 'Cycling', nameEs: 'Ciclismo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Cycling'] },
  { name: 'Swimming', nameEs: 'Natación', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Swimming'] },
  { name: 'Rowing Machine', nameEs: 'Remo ergómetro', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Rowing Machine'] },
  { name: 'Elliptical', nameEs: 'Elíptica', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Elliptical'] },
  { name: 'Stair Climber', nameEs: 'Escalera', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Stair Climber'] },
  { name: 'Jump Rope', nameEs: 'Cuerda de saltar', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Jump Rope'] },
  { name: 'Sprint', nameEs: 'Sprint', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Sprint'] },
  { name: 'Hiking', nameEs: 'Senderismo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Hiking'] },
  { name: 'Treadmill Run', nameEs: 'Cinta de correr', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Treadmill Run'] },
  { name: 'Treadmill Walk', nameEs: 'Cinta de caminar', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Treadmill Walk'] },
  { name: 'Stationary Bike', nameEs: 'Bicicleta estática', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Stationary Bike'] },
  { name: 'Spin Bike', nameEs: 'Spinning', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Spin Bike'] },
  { name: 'Indoor Cycling', nameEs: 'Ciclismo indoor', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Indoor Cycling'] },
  { name: 'Outdoor Cycling', nameEs: 'Ciclismo outdoor', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Outdoor Cycling'] },
  { name: 'Trail Running', nameEs: 'Trail running', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Trail Running'] },
  { name: 'HIIT', nameEs: 'HIIT', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['HIIT'] },
  { name: 'Tabata', nameEs: 'Tabata', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Tabata'] },
  { name: 'Circuit Training', nameEs: 'Circuito', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Circuit Training'] },
  { name: 'Aerobics', nameEs: 'Aeróbicos', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Aerobics'] },
  { name: 'Dance', nameEs: 'Danza', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Dance'] },
  { name: 'Yoga', nameEs: 'Yoga', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Yoga'] },
  { name: 'Pilates', nameEs: 'Pilates', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Pilates'] },
  { name: 'Stretching', nameEs: 'Estiramiento', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Stretching'] },
  { name: 'Mobility', nameEs: 'Movilidad', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Mobility'] },
  { name: 'Foam Rolling', nameEs: 'Rodillo de espuma', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Foam Rolling'] },
  { name: 'Swimming Laps', nameEs: 'Largos de natación', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Swimming Laps'] },
  { name: 'Open Water Swim', nameEs: 'Natación aguas abiertas', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Open Water Swim'] },
  { name: 'Water Aerobics', nameEs: 'Aeróbicos acuáticos', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Water Aerobics'] },

  // FULL_BODY
  { name: 'Clean and Press', nameEs: 'Clean and press', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Clean and Press'] },
  { name: 'Thruster', nameEs: 'Thruster', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Thruster'] },
  { name: 'Kettlebell Swing', nameEs: 'Swing con kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.HINGE, imageUrl: EXERCISE_IMAGE_URLS['Kettlebell Swing'] },
  { name: 'Burpee', nameEs: 'Burpee', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Burpee'] },
  { name: 'Turkish Get Up', nameEs: 'Levantamiento turco', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.CARRY, imageUrl: EXERCISE_IMAGE_URLS['Turkish Get Up'] },
  { name: 'Snatch', nameEs: 'Snatch', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Snatch'] },
  { name: 'Clean', nameEs: 'Clean', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Clean'] },
  { name: 'Jerk', nameEs: 'Jerk', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Jerk'] },
  { name: 'Muscle Up', nameEs: 'Muscle up', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BODYWEIGHT, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Muscle Up'] },
  { name: 'Box Jump', nameEs: 'Salto a caja', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BODYWEIGHT, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Box Jump'] },
  { name: 'Broad Jump', nameEs: 'Salto largo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BODYWEIGHT, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Broad Jump'] },
  { name: 'Medicine Ball Slam', nameEs: 'Lanzamiento de balón medicinal', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Medicine Ball Slam'] },
  { name: 'Battle Ropes', nameEs: 'Cuerdas de batalla', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.ISOLATION, imageUrl: EXERCISE_IMAGE_URLS['Battle Ropes'] },
  { name: 'Sled Push', nameEs: 'Empuje de trineo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Sled Push'] },
  { name: 'Sled Pull', nameEs: 'Arrastre de trineo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Sled Pull'] },
  { name: 'Wall Ball', nameEs: 'Balón a pared', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.OTHER, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Wall Ball'] },
  { name: 'Kettlebell Clean', nameEs: 'Clean con kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Kettlebell Clean'] },
  { name: 'Kettlebell Snatch', nameEs: 'Snatch con kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Kettlebell Snatch'] },
  { name: 'Kettlebell Press', nameEs: 'Press con kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.PUSH, imageUrl: EXERCISE_IMAGE_URLS['Kettlebell Press'] },
  { name: 'Single Arm Swing', nameEs: 'Swing un brazo', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.HINGE, imageUrl: EXERCISE_IMAGE_URLS['Single Arm Swing'] },
  { name: 'Goblet Clean', nameEs: 'Clean goblet', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.PULL, imageUrl: EXERCISE_IMAGE_URLS['Goblet Clean'] },
  { name: 'Double Kettlebell Swing', nameEs: 'Swing doble kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.HINGE, imageUrl: EXERCISE_IMAGE_URLS['Double Kettlebell Swing'] },
  { name: 'Kettlebell Squat', nameEs: 'Sentadilla con kettlebell', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.KETTLEBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Kettlebell Squat'] },
  { name: 'Overhead Squat', nameEs: 'Sentadilla sobre cabeza', muscleGroup: MuscleGroup.FULL_BODY, equipment: Equipment.BARBELL, movementType: MovementType.SQUAT, imageUrl: EXERCISE_IMAGE_URLS['Overhead Squat'] },
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

  // Update image URLs for all global exercises
  console.log('Updating exercise images...');
  let updatedImages = 0;
  for (const ex of exercises) {
    if (ex.imageUrl) {
      const result = await prisma.exercise.updateMany({
        where: { name: ex.name, isGlobal: true },
        data: { imageUrl: ex.imageUrl },
      });
      if (result.count > 0) {
        updatedImages += result.count;
      }
    }
  }
  console.log(`✅ Updated ${updatedImages} exercise images`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
