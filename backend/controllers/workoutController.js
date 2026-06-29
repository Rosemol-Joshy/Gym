// backend/controllers/workoutController.js
// Handles all workout HTTP request logic. Clean separation from model/routes.

const WorkoutModel = require('../models/workoutModel');

// ═══════════════════════════════════════════════════════════
//  EXERCISE LIBRARY
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/workout/exercises
 * Query: search, category, difficulty, page, limit
 */
const getExercises = (req, res) => {
    const filters = {
        search:     req.query.search     || '',
        category:   req.query.category   || '',
        difficulty: req.query.difficulty || '',
        page:       parseInt(req.query.page)  || 1,
        limit:      parseInt(req.query.limit) || 20,
    };

    WorkoutModel.getExercises(filters, (err, data) => {
        if (err) {
            console.error('getExercises error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data });
    });
};

/**
 * GET /api/workout/exercises/all  — lightweight list for dropdowns
 */
const getAllExercises = (req, res) => {
    WorkoutModel.getAllExercises((err, rows) => {
        if (err) {
            console.error('getAllExercises error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data: rows });
    });
};

/**
 * GET /api/workout/exercises/:id
 */
const getExerciseById = (req, res) => {
    WorkoutModel.getExerciseById(req.params.id, (err, rows) => {
        if (err) {
            console.error('getExerciseById error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Exercise not found.' });
        }
        return res.status(200).json({ success: true, data: rows[0] });
    });
};

/**
 * POST /api/workout/exercises
 * Body: { name, category, muscle_group, equipment, difficulty, description, instructions, video_url, image_url }
 */
const createExercise = (req, res) => {
    const { name, category, difficulty } = req.body;

    if (!name || !category || !difficulty) {
        return res.status(400).json({
            success: false,
            message: 'name, category, and difficulty are required.',
        });
    }

    WorkoutModel.createExercise(req.body, (err, result) => {
        if (err) {
            console.error('createExercise error:', err);
            return res.status(500).json({ success: false, message: 'Failed to create exercise.' });
        }
        return res.status(201).json({
            success: true,
            message: 'Exercise created successfully.',
            id: result.insertId,
        });
    });
};

/**
 * PUT /api/workout/exercises/:id
 */
const updateExercise = (req, res) => {
    const { name, category, difficulty } = req.body;

    if (!name || !category || !difficulty) {
        return res.status(400).json({
            success: false,
            message: 'name, category, and difficulty are required.',
        });
    }

    WorkoutModel.updateExercise(req.params.id, req.body, (err, result) => {
        if (err) {
            console.error('updateExercise error:', err);
            return res.status(500).json({ success: false, message: 'Failed to update exercise.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Exercise not found.' });
        }
        return res.status(200).json({ success: true, message: 'Exercise updated successfully.' });
    });
};

/**
 * DELETE /api/workout/exercises/:id  (soft delete)
 */
const deleteExercise = (req, res) => {
    WorkoutModel.deleteExercise(req.params.id, (err, result) => {
        if (err) {
            console.error('deleteExercise error:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete exercise.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Exercise not found.' });
        }
        return res.status(200).json({ success: true, message: 'Exercise deleted successfully.' });
    });
};

// ═══════════════════════════════════════════════════════════
//  WORKOUT PLANS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/workout/plans
 * Query: search, goal, difficulty, page, limit
 */
const getWorkoutPlans = (req, res) => {
    const filters = {
        search:     req.query.search     || '',
        goal:       req.query.goal       || '',
        difficulty: req.query.difficulty || '',
        page:       parseInt(req.query.page)  || 1,
        limit:      parseInt(req.query.limit) || 10,
    };

    WorkoutModel.getWorkoutPlans(filters, (err, data) => {
        if (err) {
            console.error('getWorkoutPlans error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data });
    });
};

/**
 * GET /api/workout/plans/:id
 */
const getWorkoutPlanById = (req, res) => {
    WorkoutModel.getWorkoutPlanById(req.params.id, (err, plan) => {
        if (err) {
            console.error('getWorkoutPlanById error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Workout plan not found.' });
        }
        return res.status(200).json({ success: true, data: plan });
    });
};

/**
 * POST /api/workout/plans
 * Body: { name, description, goal, difficulty, duration_weeks, days_per_week, created_by? }
 */
const createWorkoutPlan = (req, res) => {
    const { name, goal, difficulty, duration_weeks, days_per_week } = req.body;

    if (!name || !goal || !difficulty || !duration_weeks || !days_per_week) {
        return res.status(400).json({
            success: false,
            message: 'name, goal, difficulty, duration_weeks, and days_per_week are required.',
        });
    }

    WorkoutModel.createWorkoutPlan(req.body, (err, result) => {
        if (err) {
            console.error('createWorkoutPlan error:', err);
            return res.status(500).json({ success: false, message: 'Failed to create workout plan.' });
        }
        return res.status(201).json({
            success: true,
            message: 'Workout plan created successfully.',
            id: result.insertId,
        });
    });
};

/**
 * PUT /api/workout/plans/:id
 */
const updateWorkoutPlan = (req, res) => {
    const { name, goal, difficulty, duration_weeks, days_per_week } = req.body;

    if (!name || !goal || !difficulty || !duration_weeks || !days_per_week) {
        return res.status(400).json({
            success: false,
            message: 'name, goal, difficulty, duration_weeks, and days_per_week are required.',
        });
    }

    WorkoutModel.updateWorkoutPlan(req.params.id, req.body, (err, result) => {
        if (err) {
            console.error('updateWorkoutPlan error:', err);
            return res.status(500).json({ success: false, message: 'Failed to update workout plan.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Workout plan not found.' });
        }
        return res.status(200).json({ success: true, message: 'Workout plan updated successfully.' });
    });
};

/**
 * DELETE /api/workout/plans/:id  (soft delete)
 */
const deleteWorkoutPlan = (req, res) => {
    WorkoutModel.deleteWorkoutPlan(req.params.id, (err, result) => {
        if (err) {
            console.error('deleteWorkoutPlan error:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete workout plan.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Workout plan not found.' });
        }
        return res.status(200).json({ success: true, message: 'Workout plan deleted successfully.' });
    });
};

// ═══════════════════════════════════════════════════════════
//  PLAN EXERCISES (junction)
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/workout/plans/:planId/exercises
 */
const getPlanExercises = (req, res) => {
    WorkoutModel.getPlanExercises(req.params.planId, (err, rows) => {
        if (err) {
            console.error('getPlanExercises error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data: rows });
    });
};

/**
 * POST /api/workout/plans/:planId/exercises
 * Body: { exercise_id, sets, reps?, duration_secs?, rest_secs, day_number, order_index, notes? }
 */
const addExerciseToPlan = (req, res) => {
    const { exercise_id, sets, day_number } = req.body;

    if (!exercise_id || !sets || !day_number) {
        return res.status(400).json({
            success: false,
            message: 'exercise_id, sets, and day_number are required.',
        });
    }

    const data = { ...req.body, workout_plan_id: req.params.planId };

    WorkoutModel.addExerciseToPlan(data, (err, result) => {
        if (err) {
            console.error('addExerciseToPlan error:', err);
            return res.status(500).json({ success: false, message: 'Failed to add exercise to plan.' });
        }
        return res.status(201).json({
            success: true,
            message: 'Exercise added to plan.',
            id: result.insertId,
        });
    });
};

/**
 * PUT /api/workout/plan-exercises/:id
 */
const updatePlanExercise = (req, res) => {
    WorkoutModel.updatePlanExercise(req.params.id, req.body, (err, result) => {
        if (err) {
            console.error('updatePlanExercise error:', err);
            return res.status(500).json({ success: false, message: 'Failed to update exercise.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Plan exercise not found.' });
        }
        return res.status(200).json({ success: true, message: 'Exercise updated successfully.' });
    });
};

/**
 * DELETE /api/workout/plan-exercises/:id
 */
const removeExerciseFromPlan = (req, res) => {
    WorkoutModel.removeExerciseFromPlan(req.params.id, (err, result) => {
        if (err) {
            console.error('removeExerciseFromPlan error:', err);
            return res.status(500).json({ success: false, message: 'Failed to remove exercise.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Plan exercise not found.' });
        }
        return res.status(200).json({ success: true, message: 'Exercise removed from plan.' });
    });
};

// ═══════════════════════════════════════════════════════════
//  ASSIGNMENTS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/workout/assignments
 * Query: memberId, status, page, limit
 */
const getAssignments = (req, res) => {
    const filters = {
        memberId: req.query.memberId || '',
        status:   req.query.status   || '',
        page:     parseInt(req.query.page)  || 1,
        limit:    parseInt(req.query.limit) || 10,
    };

    WorkoutModel.getAssignments(filters, (err, data) => {
        if (err) {
            console.error('getAssignments error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data });
    });
};

/**
 * GET /api/workout/assignments/:id
 */
const getAssignmentById = (req, res) => {
    WorkoutModel.getAssignmentById(req.params.id, (err, rows) => {
        if (err) {
            console.error('getAssignmentById error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Assignment not found.' });
        }
        return res.status(200).json({ success: true, data: rows[0] });
    });
};

/**
 * GET /api/workout/assignments/member/:memberId
 */
const getMemberAssignments = (req, res) => {
    WorkoutModel.getMemberAssignments(req.params.memberId, (err, rows) => {
        if (err) {
            console.error('getMemberAssignments error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data: rows });
    });
};

/**
 * POST /api/workout/assignments
 * Body: { member_id, workout_plan_id, assigned_by?, start_date, end_date?, notes? }
 */
const assignWorkout = (req, res) => {
    const { member_id, workout_plan_id, start_date } = req.body;

    if (!member_id || !workout_plan_id || !start_date) {
        return res.status(400).json({
            success: false,
            message: 'member_id, workout_plan_id, and start_date are required.',
        });
    }

    WorkoutModel.assignWorkout(req.body, (err, result) => {
        if (err) {
            console.error('assignWorkout error:', err);
            return res.status(500).json({ success: false, message: 'Failed to assign workout.' });
        }
        return res.status(201).json({
            success: true,
            message: 'Workout assigned successfully.',
            id: result.insertId,
        });
    });
};

/**
 * PUT /api/workout/assignments/:id
 * Body: { status, start_date, end_date?, notes? }
 */
const updateAssignment = (req, res) => {
    const { status, start_date } = req.body;

    if (!status || !start_date) {
        return res.status(400).json({
            success: false,
            message: 'status and start_date are required.',
        });
    }

    WorkoutModel.updateAssignment(req.params.id, req.body, (err, result) => {
        if (err) {
            console.error('updateAssignment error:', err);
            return res.status(500).json({ success: false, message: 'Failed to update assignment.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Assignment not found.' });
        }
        return res.status(200).json({ success: true, message: 'Assignment updated successfully.' });
    });
};

/**
 * DELETE /api/workout/assignments/:id
 */
const deleteAssignment = (req, res) => {
    WorkoutModel.deleteAssignment(req.params.id, (err, result) => {
        if (err) {
            console.error('deleteAssignment error:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete assignment.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Assignment not found.' });
        }
        return res.status(200).json({ success: true, message: 'Assignment deleted successfully.' });
    });
};

// ═══════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/workout/stats/dashboard
 */
const getDashboardStats = (req, res) => {
    WorkoutModel.getWorkoutDashboardStats((err, rows) => {
        if (err) {
            console.error('getDashboardStats error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data: rows[0] });
    });
};

module.exports = {
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
};
