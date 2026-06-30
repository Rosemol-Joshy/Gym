// backend/seed/seedExercises.js
// One-time script to populate the exercise library with starter data.
// Run with: node backend/seed/seedExercises.js

require('dotenv').config();
const mongoose = require('mongoose');
const { Exercise } = require('../models/workoutModel');

const exercises = [
    { name: 'Push-Up',           category: 'Chest',     muscleGroup: 'Pectorals, Triceps',     equipment: 'None',        difficulty: 'Beginner',     description: 'Classic bodyweight chest exercise' },
    { name: 'Pull-Up',           category: 'Back',      muscleGroup: 'Latissimus Dorsi',        equipment: 'Pull-up Bar', difficulty: 'Intermediate', description: 'Compound back and bicep movement' },
    { name: 'Squat',             category: 'Legs',      muscleGroup: 'Quadriceps, Glutes',      equipment: 'None',        difficulty: 'Beginner',     description: 'Fundamental lower body movement' },
    { name: 'Deadlift',          category: 'Back',      muscleGroup: 'Hamstrings, Lower Back',  equipment: 'Barbell',     difficulty: 'Advanced',     description: 'Full body posterior chain exercise' },
    { name: 'Bench Press',       category: 'Chest',     muscleGroup: 'Pectorals, Triceps',      equipment: 'Barbell',     difficulty: 'Intermediate', description: 'Primary chest strength exercise' },
    { name: 'Overhead Press',    category: 'Shoulders', muscleGroup: 'Deltoids, Triceps',       equipment: 'Barbell',     difficulty: 'Intermediate', description: 'Vertical pushing movement' },
    { name: 'Barbell Row',       category: 'Back',      muscleGroup: 'Rhomboids, Biceps',       equipment: 'Barbell',     difficulty: 'Intermediate', description: 'Horizontal pulling movement' },
    { name: 'Lunges',            category: 'Legs',      muscleGroup: 'Quadriceps, Glutes',      equipment: 'None',        difficulty: 'Beginner',     description: 'Unilateral leg strength exercise' },
    { name: 'Plank',             category: 'Core',      muscleGroup: 'Abdominals, Obliques',    equipment: 'None',        difficulty: 'Beginner',     description: 'Isometric core stability exercise' },
    { name: 'Dumbbell Curl',     category: 'Arms',      muscleGroup: 'Biceps',                  equipment: 'Dumbbell',    difficulty: 'Beginner',     description: 'Isolated bicep curl' },
    { name: 'Tricep Dip',        category: 'Arms',      muscleGroup: 'Triceps',                 equipment: 'Bench',       difficulty: 'Beginner',     description: 'Bodyweight tricep exercise' },
    { name: 'Leg Press',         category: 'Legs',      muscleGroup: 'Quadriceps',              equipment: 'Machine',     difficulty: 'Beginner',     description: 'Machine-based quad exercise' },
    { name: 'Lat Pulldown',      category: 'Back',      muscleGroup: 'Latissimus Dorsi',        equipment: 'Cable',       difficulty: 'Beginner',     description: 'Cable machine back exercise' },
    { name: 'Cable Fly',         category: 'Chest',     muscleGroup: 'Pectorals',               equipment: 'Cable',       difficulty: 'Intermediate', description: 'Isolation chest fly' },
    { name: 'Treadmill Run',     category: 'Cardio',    muscleGroup: 'Full Body',               equipment: 'Treadmill',   difficulty: 'Beginner',     description: 'Cardiovascular endurance training' },
    { name: 'Burpee',            category: 'Full Body', muscleGroup: 'Full Body',               equipment: 'None',        difficulty: 'Intermediate', description: 'High intensity full body movement' },
    { name: 'Mountain Climber',  category: 'Core',      muscleGroup: 'Core, Shoulders',         equipment: 'None',        difficulty: 'Intermediate', description: 'Dynamic core and cardio exercise' },
    { name: 'Romanian Deadlift', category: 'Legs',      muscleGroup: 'Hamstrings, Glutes',      equipment: 'Barbell',     difficulty: 'Intermediate', description: 'Hip hinge hamstring exercise' },
    { name: 'Face Pull',         category: 'Shoulders', muscleGroup: 'Rear Deltoids, Rotator',  equipment: 'Cable',       difficulty: 'Beginner',     description: 'Shoulder health and posture exercise' },
    { name: 'Calf Raise',        category: 'Legs',      muscleGroup: 'Gastrocnemius, Soleus',   equipment: 'None',        difficulty: 'Beginner',     description: 'Isolated calf strengthening' },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        for (const ex of exercises) {
            // upsert by name so re-running this script doesn't create duplicates
            await Exercise.findOneAndUpdate(
                { name: ex.name },
                { $setOnInsert: ex },
                { upsert: true, new: true }
            );
        }

        console.log(`✅ Seeded/verified ${exercises.length} exercises`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seed();