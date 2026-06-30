// backend/routes/workoutRoutes.js
// All /api/workout routes. Mount in server.js with:
//   const workoutRoutes = require('./routes/workoutRoutes');
//   app.use('/api/workout', workoutRoutes);

const express = require('express');
const router  = express.Router();
const {
    // Exercises
    getExercises,
    getAllExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise,
    // Plans
    getWorkoutPlans,
    getWorkoutPlanById,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    // Plan exercises
    getPlanExercises,
    addExerciseToPlan,
    updatePlanExercise,
    removeExerciseFromPlan,
    // Assignments
    getAssignments,
    getAssignmentById,
    getMemberAssignments,
    assignWorkout,
    updateAssignment,
    deleteAssignment,
    // Stats
    getDashboardStats,
} = require('../controllers/workoutController');

// ── Dashboard ──────────────────────────────────────────────
router.get('/stats/dashboard', getDashboardStats);

// ── Exercise Library ───────────────────────────────────────
router.get('/exercises/all',    getAllExercises);   // lightweight dropdown list
router.get('/exercises',        getExercises);
router.get('/exercises/:id',    getExerciseById);
router.post('/exercises',       createExercise);
router.put('/exercises/:id',    updateExercise);
router.delete('/exercises/:id', deleteExercise);

// ── Workout Plans ──────────────────────────────────────────
router.get('/plans',        getWorkoutPlans);
router.get('/plans/:id',    getWorkoutPlanById);
router.post('/plans',       createWorkoutPlan);
router.put('/plans/:id',    updateWorkoutPlan);
router.delete('/plans/:id', deleteWorkoutPlan);

// ── Plan Exercises (nested) ────────────────────────────────
router.get('/plans/:planId/exercises',  getPlanExercises);
router.post('/plans/:planId/exercises', addExerciseToPlan);

// ── Plan Exercise (individual update / remove) ─────────────
// NOTE: Mongo stores plan-exercises as embedded subdocuments inside
// WorkoutPlan, so these calls must also pass the parent plan_id
// (in the body for PUT, as a query param for DELETE) to locate it.
router.put('/plan-exercises/:id',    updatePlanExercise);
router.delete('/plan-exercises/:id', removeExerciseFromPlan);

// ── Assignments ────────────────────────────────────────────
router.get('/assignments/member/:memberId', getMemberAssignments);  // before /:id
router.get('/assignments',        getAssignments);
router.get('/assignments/:id',    getAssignmentById);
router.post('/assignments',       assignWorkout);
router.put('/assignments/:id',    updateAssignment);
router.delete('/assignments/:id', deleteAssignment);

module.exports = router;