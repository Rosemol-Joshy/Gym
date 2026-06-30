// backend/models/workoutModel.js
// All Mongoose schemas for the Workout module: Exercise library,
// WorkoutPlan (with embedded plan-exercise subdocuments), and
// MemberWorkoutAssignment. Combined into one file to match the
// original MVC naming convention (workoutModel.js).

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ═══════════════════════════════════════════════════════════
//  EXERCISE LIBRARY
// ═══════════════════════════════════════════════════════════

const exerciseSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        category: {
            type: String,
            required: true,
            enum: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body', 'Flexibility'],
            default: 'Full Body',
        },
        muscleGroup: {
            type: String,
            default: null,
            maxlength: 100,
        },
        equipment: {
            type: String,
            default: null,
            maxlength: 100,
        },
        difficulty: {
            type: String,
            required: true,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
        description: {
            type: String,
            default: null,
        },
        instructions: {
            type: String,
            default: null,
        },
        videoUrl: {
            type: String,
            default: null,
        },
        imageUrl: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

exerciseSchema.index({ category: 1 });
exerciseSchema.index({ difficulty: 1 });
exerciseSchema.index({ name: 'text', muscleGroup: 'text', equipment: 'text' }); // for search

const Exercise = mongoose.model('Exercise', exerciseSchema);

// ═══════════════════════════════════════════════════════════
//  WORKOUT PLANS (with embedded plan-exercise subdocuments)
// ═══════════════════════════════════════════════════════════

// Subdocument: an exercise as it appears inside a plan.
// Replaces the old workout_plan_exercises junction table —
// since plan-exercises always belong to exactly one plan and
// are always fetched together with it, they're embedded here
// instead of living in their own collection.
const planExerciseSchema = new Schema(
    {
        exercise: {
            type: Schema.Types.ObjectId,
            ref: 'Exercise',
            required: true,
        },
        sets: {
            type: Number,
            required: true,
            default: 3,
            min: 1,
        },
        reps: {
            type: Number,
            default: null, // null when timed
        },
        durationSecs: {
            type: Number,
            default: null, // null when rep-based
        },
        restSecs: {
            type: Number,
            default: 60,
        },
        dayNumber: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
            max: 7,
        },
        orderIndex: {
            type: Number,
            required: true,
            default: 1,
        },
        notes: {
            type: String,
            default: null,
            maxlength: 255,
        },
    },
    { timestamps: true, _id: true } // each subdocument keeps its own _id for individual update/delete
);

const workoutPlanSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        description: {
            type: String,
            default: null,
        },
        goal: {
            type: String,
            required: true,
            enum: ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness', 'Strength'],
            default: 'General Fitness',
        },
        difficulty: {
            type: String,
            required: true,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner',
        },
        durationWeeks: {
            type: Number,
            required: true,
            default: 4,
            min: 1,
            max: 52,
        },
        daysPerWeek: {
            type: Number,
            required: true,
            default: 3,
            min: 1,
            max: 7,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User', // assumes Auth module exports a 'User' model
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        exercises: {
            type: [planExerciseSchema],
            default: [],
        },
    },
    { timestamps: true }
);

workoutPlanSchema.index({ name: 'text', description: 'text' });
workoutPlanSchema.index({ goal: 1 });
workoutPlanSchema.index({ difficulty: 1 });

// Virtual: total exercise count
workoutPlanSchema.virtual('exerciseCount').get(function () {
    return this.exercises?.length || 0;
});

workoutPlanSchema.set('toJSON', { virtuals: true });
workoutPlanSchema.set('toObject', { virtuals: true });

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

// ═══════════════════════════════════════════════════════════
//  MEMBER WORKOUT ASSIGNMENTS
// ═══════════════════════════════════════════════════════════
// Kept as a separate collection since a member can have many
// assignments over time, and each assignment has its own
// lifecycle/status independent of the plan itself.

const memberWorkoutAssignmentSchema = new Schema(
    {
        member: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
        },
        workoutPlan: {
            type: Schema.Types.ObjectId,
            ref: 'WorkoutPlan',
            required: true,
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ['Active', 'Completed', 'Paused', 'Cancelled'],
            default: 'Active',
        },
        notes: {
            type: String,
            default: null,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

memberWorkoutAssignmentSchema.index({ member: 1 });
memberWorkoutAssignmentSchema.index({ workoutPlan: 1 });
memberWorkoutAssignmentSchema.index({ status: 1 });

const MemberWorkoutAssignment = mongoose.model('MemberWorkoutAssignment', memberWorkoutAssignmentSchema);

// ═══════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════
// workoutController.js imports these three models from this single file:
//   const { Exercise, WorkoutPlan, MemberWorkoutAssignment } = require('../models/workoutModel');

module.exports = {
    Exercise,
    WorkoutPlan,
    MemberWorkoutAssignment,
};