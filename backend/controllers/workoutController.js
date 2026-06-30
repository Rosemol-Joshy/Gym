// backend/controllers/workoutController.js
// Handles all workout HTTP request logic using Mongoose (async/await).
// Plan-exercises are embedded subdocuments inside WorkoutPlan — see model file.

const { Exercise, WorkoutPlan, MemberWorkoutAssignment } = require('../models/workoutModel');

// ═══════════════════════════════════════════════════════════
//  EXERCISE LIBRARY
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/workout/exercises
 * Query: search, category, difficulty, page, limit
 */
const getExercises = async (req, res) => {
    const { search = '', category = '', difficulty = '', page = 1, limit = 20 } = req.query;

    try {
        const filter = { isActive: true };
        if (category)   filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [{ name: regex }, { muscleGroup: regex }, { equipment: regex }];
        }

        const total = await Exercise.countDocuments(filter);
        const rows = await Exercise.find(filter)
            .sort({ category: 1, name: 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        return res.status(200).json({
            success: true,
            data: { rows: rows.map(formatExercise), total, page: Number(page), limit: Number(limit) },
        });
    } catch (err) {
        console.error('getExercises error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * GET /api/workout/exercises/all — lightweight list for dropdowns
 */
const getAllExercises = async (req, res) => {
    try {
        const rows = await Exercise.find({ isActive: true })
            .select('name category difficulty muscleGroup equipment')
            .sort({ category: 1, name: 1 })
            .lean();
        return res.status(200).json({ success: true, data: rows.map(formatExercise) });
    } catch (err) {
        console.error('getAllExercises error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * GET /api/workout/exercises/:id
 */
const getExerciseById = async (req, res) => {
    try {
        const ex = await Exercise.findOne({ _id: req.params.id, isActive: true }).lean();
        if (!ex) return res.status(404).json({ success: false, message: 'Exercise not found.' });
        return res.status(200).json({ success: true, data: formatExercise(ex) });
    } catch (err) {
        console.error('getExerciseById error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * POST /api/workout/exercises
 */
const createExercise = async (req, res) => {
    const { name, category, difficulty } = req.body;
    if (!name || !category || !difficulty) {
        return res.status(400).json({ success: false, message: 'name, category, and difficulty are required.' });
    }

    try {
        const ex = await Exercise.create(mapExerciseInput(req.body));
        return res.status(201).json({ success: true, message: 'Exercise created successfully.', id: ex._id });
    } catch (err) {
        console.error('createExercise error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create exercise.' });
    }
};

/**
 * PUT /api/workout/exercises/:id
 */
const updateExercise = async (req, res) => {
    const { name, category, difficulty } = req.body;
    if (!name || !category || !difficulty) {
        return res.status(400).json({ success: false, message: 'name, category, and difficulty are required.' });
    }

    try {
        const ex = await Exercise.findByIdAndUpdate(req.params.id, mapExerciseInput(req.body), { new: true });
        if (!ex) return res.status(404).json({ success: false, message: 'Exercise not found.' });
        return res.status(200).json({ success: true, message: 'Exercise updated successfully.' });
    } catch (err) {
        console.error('updateExercise error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update exercise.' });
    }
};

/**
 * DELETE /api/workout/exercises/:id (soft delete)
 */
const deleteExercise = async (req, res) => {
    try {
        const ex = await Exercise.findByIdAndUpdate(req.params.id, { isActive: false });
        if (!ex) return res.status(404).json({ success: false, message: 'Exercise not found.' });
        return res.status(200).json({ success: true, message: 'Exercise deleted successfully.' });
    } catch (err) {
        console.error('deleteExercise error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete exercise.' });
    }
};

// ═══════════════════════════════════════════════════════════
//  WORKOUT PLANS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/workout/plans
 * Query: search, goal, difficulty, page, limit
 */
const getWorkoutPlans = async (req, res) => {
    const { search = '', goal = '', difficulty = '', page = 1, limit = 10 } = req.query;

    try {
        const filter = { isActive: true };
        if (goal)       filter.goal = goal;
        if (difficulty) filter.difficulty = difficulty;
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [{ name: regex }, { description: regex }];
        }

        const total = await WorkoutPlan.countDocuments(filter);
        const plans = await WorkoutPlan.find(filter)
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        // Active assignment counts per plan
        const planIds = plans.map(p => p._id);
        const assignmentCounts = await MemberWorkoutAssignment.aggregate([
            { $match: { workoutPlan: { $in: planIds }, status: 'Active' } },
            { $group: { _id: '$workoutPlan', count: { $sum: 1 } } },
        ]);
        const countMap = {};
        assignmentCounts.forEach(c => { countMap[c._id.toString()] = c.count; });

        const rows = plans.map(p => ({
            id: p._id,
            name: p.name,
            description: p.description,
            goal: p.goal,
            difficulty: p.difficulty,
            duration_weeks: p.durationWeeks,
            days_per_week: p.daysPerWeek,
            created_by_name: p.createdBy ? `${p.createdBy.firstName} ${p.createdBy.lastName}` : null,
            exercise_count: p.exercises?.length || 0,
            active_assignments: countMap[p._id.toString()] || 0,
            created_at: p.createdAt,
        }));

        return res.status(200).json({ success: true, data: { rows, total, page: Number(page), limit: Number(limit) } });
    } catch (err) {
        console.error('getWorkoutPlans error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * GET /api/workout/plans/:id
 */
const getWorkoutPlanById = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findOne({ _id: req.params.id, isActive: true })
            .populate('createdBy', 'firstName lastName')
            .populate('exercises.exercise', 'name category difficulty muscleGroup equipment description videoUrl imageUrl')
            .lean();

        if (!plan) return res.status(404).json({ success: false, message: 'Workout plan not found.' });

        const formatted = {
            id: plan._id,
            name: plan.name,
            description: plan.description,
            goal: plan.goal,
            difficulty: plan.difficulty,
            duration_weeks: plan.durationWeeks,
            days_per_week: plan.daysPerWeek,
            created_by_name: plan.createdBy ? `${plan.createdBy.firstName} ${plan.createdBy.lastName}` : null,
            exercises: (plan.exercises || [])
                .sort((a, b) => a.dayNumber - b.dayNumber || a.orderIndex - b.orderIndex)
                .map(pe => ({
                    id: pe._id,
                    exercise_id: pe.exercise?._id,
                    exercise_name: pe.exercise?.name,
                    exercise_category: pe.exercise?.category,
                    exercise_difficulty: pe.exercise?.difficulty,
                    muscle_group: pe.exercise?.muscleGroup,
                    equipment: pe.exercise?.equipment,
                    exercise_description: pe.exercise?.description,
                    video_url: pe.exercise?.videoUrl,
                    image_url: pe.exercise?.imageUrl,
                    sets: pe.sets,
                    reps: pe.reps,
                    duration_secs: pe.durationSecs,
                    rest_secs: pe.restSecs,
                    day_number: pe.dayNumber,
                    order_index: pe.orderIndex,
                    notes: pe.notes,
                })),
        };

        return res.status(200).json({ success: true, data: formatted });
    } catch (err) {
        console.error('getWorkoutPlanById error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * POST /api/workout/plans
 */
const createWorkoutPlan = async (req, res) => {
    const { name, goal, difficulty, duration_weeks, days_per_week } = req.body;
    if (!name || !goal || !difficulty || !duration_weeks || !days_per_week) {
        return res.status(400).json({
            success: false,
            message: 'name, goal, difficulty, duration_weeks, and days_per_week are required.',
        });
    }

    try {
        const plan = await WorkoutPlan.create({
            name,
            description: req.body.description || null,
            goal,
            difficulty,
            durationWeeks: Number(duration_weeks),
            daysPerWeek: Number(days_per_week),
            createdBy: req.body.created_by || null,
        });
        return res.status(201).json({ success: true, message: 'Workout plan created successfully.', id: plan._id });
    } catch (err) {
        console.error('createWorkoutPlan error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create workout plan.' });
    }
};

/**
 * PUT /api/workout/plans/:id
 */
const updateWorkoutPlan = async (req, res) => {
    const { name, goal, difficulty, duration_weeks, days_per_week } = req.body;
    if (!name || !goal || !difficulty || !duration_weeks || !days_per_week) {
        return res.status(400).json({
            success: false,
            message: 'name, goal, difficulty, duration_weeks, and days_per_week are required.',
        });
    }

    try {
        const plan = await WorkoutPlan.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description: req.body.description || null,
                goal,
                difficulty,
                durationWeeks: Number(duration_weeks),
                daysPerWeek: Number(days_per_week),
            },
            { new: true }
        );
        if (!plan) return res.status(404).json({ success: false, message: 'Workout plan not found.' });
        return res.status(200).json({ success: true, message: 'Workout plan updated successfully.' });
    } catch (err) {
        console.error('updateWorkoutPlan error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update workout plan.' });
    }
};

/**
 * DELETE /api/workout/plans/:id (soft delete)
 */
const deleteWorkoutPlan = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, { isActive: false });
        if (!plan) return res.status(404).json({ success: false, message: 'Workout plan not found.' });
        return res.status(200).json({ success: true, message: 'Workout plan deleted successfully.' });
    } catch (err) {
        console.error('deleteWorkoutPlan error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete workout plan.' });
    }
};

// ═══════════════════════════════════════════════════════════
//  PLAN EXERCISES (embedded subdocuments)
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/workout/plans/:planId/exercises
 */
const getPlanExercises = async (req, res) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.planId)
            .populate('exercises.exercise', 'name category difficulty muscleGroup equipment imageUrl')
            .lean();

        if (!plan) return res.status(404).json({ success: false, message: 'Workout plan not found.' });

        const rows = (plan.exercises || [])
            .sort((a, b) => a.dayNumber - b.dayNumber || a.orderIndex - b.orderIndex)
            .map(pe => ({
                id: pe._id,
                exercise_id: pe.exercise?._id,
                exercise_name: pe.exercise?.name,
                category: pe.exercise?.category,
                difficulty: pe.exercise?.difficulty,
                muscle_group: pe.exercise?.muscleGroup,
                equipment: pe.exercise?.equipment,
                image_url: pe.exercise?.imageUrl,
                sets: pe.sets,
                reps: pe.reps,
                duration_secs: pe.durationSecs,
                rest_secs: pe.restSecs,
                day_number: pe.dayNumber,
                order_index: pe.orderIndex,
                notes: pe.notes,
            }));

        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('getPlanExercises error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * POST /api/workout/plans/:planId/exercises
 * Body: { exercise_id, sets, reps?, duration_secs?, rest_secs, day_number, order_index, notes? }
 */
const addExerciseToPlan = async (req, res) => {
    const { exercise_id, sets, day_number } = req.body;
    if (!exercise_id || !sets || !day_number) {
        return res.status(400).json({ success: false, message: 'exercise_id, sets, and day_number are required.' });
    }

    try {
        const plan = await WorkoutPlan.findById(req.params.planId);
        if (!plan) return res.status(404).json({ success: false, message: 'Workout plan not found.' });

        plan.exercises.push({
            exercise: exercise_id,
            sets: Number(sets),
            reps: req.body.reps ? Number(req.body.reps) : null,
            durationSecs: req.body.duration_secs ? Number(req.body.duration_secs) : null,
            restSecs: req.body.rest_secs ? Number(req.body.rest_secs) : 60,
            dayNumber: Number(day_number),
            orderIndex: req.body.order_index ? Number(req.body.order_index) : 1,
            notes: req.body.notes || null,
        });

        await plan.save();
        const added = plan.exercises[plan.exercises.length - 1];

        return res.status(201).json({ success: true, message: 'Exercise added to plan.', id: added._id });
    } catch (err) {
        console.error('addExerciseToPlan error:', err);
        return res.status(500).json({ success: false, message: 'Failed to add exercise to plan.' });
    }
};

/**
 * PUT /api/workout/plan-exercises/:id
 * NOTE: since plan-exercises are subdocuments, the route also needs the parent
 * plan's ID. We accept it as `plan_id` in the body to locate the subdocument.
 */
const updatePlanExercise = async (req, res) => {
    const { plan_id, sets, reps, duration_secs, rest_secs, day_number, order_index, notes } = req.body;

    if (!plan_id) {
        return res.status(400).json({ success: false, message: 'plan_id is required in the request body.' });
    }

    try {
        const plan = await WorkoutPlan.findById(plan_id);
        if (!plan) return res.status(404).json({ success: false, message: 'Workout plan not found.' });

        const subdoc = plan.exercises.id(req.params.id);
        if (!subdoc) return res.status(404).json({ success: false, message: 'Plan exercise not found.' });

        subdoc.sets = Number(sets);
        subdoc.reps = reps ? Number(reps) : null;
        subdoc.durationSecs = duration_secs ? Number(duration_secs) : null;
        subdoc.restSecs = Number(rest_secs);
        subdoc.dayNumber = Number(day_number);
        subdoc.orderIndex = Number(order_index);
        subdoc.notes = notes || null;

        await plan.save();
        return res.status(200).json({ success: true, message: 'Exercise updated successfully.' });
    } catch (err) {
        console.error('updatePlanExercise error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update exercise.' });
    }
};

/**
 * DELETE /api/workout/plan-exercises/:id
 * Query: ?plan_id=... (needed to locate the parent plan)
 */
const removeExerciseFromPlan = async (req, res) => {
    const { plan_id } = req.query;
    if (!plan_id) {
        return res.status(400).json({ success: false, message: 'plan_id query parameter is required.' });
    }

    try {
        const plan = await WorkoutPlan.findById(plan_id);
        if (!plan) return res.status(404).json({ success: false, message: 'Workout plan not found.' });

        const subdoc = plan.exercises.id(req.params.id);
        if (!subdoc) return res.status(404).json({ success: false, message: 'Plan exercise not found.' });

        subdoc.deleteOne();
        await plan.save();

        return res.status(200).json({ success: true, message: 'Exercise removed from plan.' });
    } catch (err) {
        console.error('removeExerciseFromPlan error:', err);
        return res.status(500).json({ success: false, message: 'Failed to remove exercise.' });
    }
};

// ═══════════════════════════════════════════════════════════
//  ASSIGNMENTS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/workout/assignments
 * Query: memberId, status, page, limit
 */
const getAssignments = async (req, res) => {
    const { memberId = '', status = '', page = 1, limit = 10 } = req.query;

    try {
        const filter = {};
        if (memberId) filter.member = memberId;
        if (status)   filter.status = status;

        const total = await MemberWorkoutAssignment.countDocuments(filter);
        const rows = await MemberWorkoutAssignment.find(filter)
            .populate('member', 'firstName lastName email profileImage')
            .populate('workoutPlan', 'name goal difficulty durationWeeks')
            .populate('assignedBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        return res.status(200).json({
            success: true,
            data: { rows: rows.map(formatAssignment), total, page: Number(page), limit: Number(limit) },
        });
    } catch (err) {
        console.error('getAssignments error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * GET /api/workout/assignments/:id
 */
const getAssignmentById = async (req, res) => {
    try {
        const a = await MemberWorkoutAssignment.findById(req.params.id)
            .populate('member', 'firstName lastName email')
            .populate('workoutPlan', 'name goal difficulty durationWeeks daysPerWeek')
            .populate('assignedBy', 'firstName lastName')
            .lean();

        if (!a) return res.status(404).json({ success: false, message: 'Assignment not found.' });
        return res.status(200).json({ success: true, data: formatAssignment(a) });
    } catch (err) {
        console.error('getAssignmentById error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * GET /api/workout/assignments/member/:memberId
 */
const getMemberAssignments = async (req, res) => {
    try {
        const rows = await MemberWorkoutAssignment.find({ member: req.params.memberId })
            .populate('workoutPlan', 'name goal difficulty durationWeeks daysPerWeek')
            .sort({ createdAt: -1 })
            .lean();

        const formatted = rows.map(a => ({
            id: a._id,
            status: a.status,
            start_date: a.startDate,
            end_date: a.endDate,
            notes: a.notes,
            plan_name: a.workoutPlan?.name,
            plan_goal: a.workoutPlan?.goal,
            plan_difficulty: a.workoutPlan?.difficulty,
            duration_weeks: a.workoutPlan?.durationWeeks,
            days_per_week: a.workoutPlan?.daysPerWeek,
        }));

        return res.status(200).json({ success: true, data: formatted });
    } catch (err) {
        console.error('getMemberAssignments error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * POST /api/workout/assignments
 * Body: { member_id, workout_plan_id, assigned_by?, start_date, end_date?, notes? }
 */
const assignWorkout = async (req, res) => {
    const { member_id, workout_plan_id, start_date } = req.body;
    if (!member_id || !workout_plan_id || !start_date) {
        return res.status(400).json({
            success: false,
            message: 'member_id, workout_plan_id, and start_date are required.',
        });
    }

    try {
        const a = await MemberWorkoutAssignment.create({
            member: member_id,
            workoutPlan: workout_plan_id,
            assignedBy: req.body.assigned_by || null,
            startDate: new Date(start_date),
            endDate: req.body.end_date ? new Date(req.body.end_date) : null,
            notes: req.body.notes || null,
        });
        return res.status(201).json({ success: true, message: 'Workout assigned successfully.', id: a._id });
    } catch (err) {
        console.error('assignWorkout error:', err);
        return res.status(500).json({ success: false, message: 'Failed to assign workout.' });
    }
};

/**
 * PUT /api/workout/assignments/:id
 * Body: { status, start_date, end_date?, notes? }
 */
const updateAssignment = async (req, res) => {
    const { status, start_date } = req.body;
    if (!status || !start_date) {
        return res.status(400).json({ success: false, message: 'status and start_date are required.' });
    }

    try {
        const a = await MemberWorkoutAssignment.findByIdAndUpdate(
            req.params.id,
            {
                status,
                startDate: new Date(start_date),
                endDate: req.body.end_date ? new Date(req.body.end_date) : null,
                notes: req.body.notes || null,
            },
            { new: true }
        );
        if (!a) return res.status(404).json({ success: false, message: 'Assignment not found.' });
        return res.status(200).json({ success: true, message: 'Assignment updated successfully.' });
    } catch (err) {
        console.error('updateAssignment error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update assignment.' });
    }
};

/**
 * DELETE /api/workout/assignments/:id
 */
const deleteAssignment = async (req, res) => {
    try {
        const a = await MemberWorkoutAssignment.findByIdAndDelete(req.params.id);
        if (!a) return res.status(404).json({ success: false, message: 'Assignment not found.' });
        return res.status(200).json({ success: true, message: 'Assignment deleted successfully.' });
    } catch (err) {
        console.error('deleteAssignment error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete assignment.' });
    }
};

// ═══════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/workout/stats/dashboard
 */
const getDashboardStats = async (req, res) => {
    try {
        const [totalPlans, totalExercises, activeAssignments, completedAssignments] = await Promise.all([
            WorkoutPlan.countDocuments({ isActive: true }),
            Exercise.countDocuments({ isActive: true }),
            MemberWorkoutAssignment.countDocuments({ status: 'Active' }),
            MemberWorkoutAssignment.countDocuments({ status: 'Completed' }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                total_plans: totalPlans,
                total_exercises: totalExercises,
                active_assignments: activeAssignments,
                completed_assignments: completedAssignments,
            },
        });
    } catch (err) {
        console.error('getDashboardStats error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

// ─────────────────────────────────────────────────────────────
// Helpers — flatten Mongo documents to the shape the existing
// frontend already expects, so no frontend files need to change.
// ─────────────────────────────────────────────────────────────

function formatExercise(e) {
    return {
        id: e._id,
        name: e.name,
        category: e.category,
        muscle_group: e.muscleGroup,
        equipment: e.equipment,
        difficulty: e.difficulty,
        description: e.description,
        instructions: e.instructions,
        video_url: e.videoUrl,
        image_url: e.imageUrl,
    };
}

function mapExerciseInput(body) {
    return {
        name: body.name,
        category: body.category,
        muscleGroup: body.muscle_group || null,
        equipment: body.equipment || null,
        difficulty: body.difficulty,
        description: body.description || null,
        instructions: body.instructions || null,
        videoUrl: body.video_url || null,
        imageUrl: body.image_url || null,
    };
}

function formatAssignment(a) {
    return {
        id: a._id,
        member_id: a.member?._id,
        member_name: a.member ? `${a.member.firstName} ${a.member.lastName}` : null,
        member_email: a.member?.email,
        member_image: a.member?.profileImage,
        workout_plan_id: a.workoutPlan?._id,
        plan_name: a.workoutPlan?.name,
        plan_goal: a.workoutPlan?.goal,
        plan_difficulty: a.workoutPlan?.difficulty,
        duration_weeks: a.workoutPlan?.durationWeeks,
        assigned_by_name: a.assignedBy ? `${a.assignedBy.firstName} ${a.assignedBy.lastName}` : null,
        start_date: a.startDate,
        end_date: a.endDate,
        status: a.status,
        notes: a.notes,
    };
}

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