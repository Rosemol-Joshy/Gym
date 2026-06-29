// backend/models/workoutModel.js
// All workout-related database operations using callback-based mysql2.

const db = require('../config/db');

// ═══════════════════════════════════════════════════════════
//  EXERCISE LIBRARY
// ═══════════════════════════════════════════════════════════

/**
 * Paginated list with optional search / filter.
 */
const getExercises = (filters, callback) => {
    const { search, category, difficulty, page, limit } = filters;
    const offset = (page - 1) * limit;
    const params = [];

    let sql = `
        SELECT * FROM exercises WHERE is_active = 1
    `;

    if (search) {
        sql += ` AND (name LIKE ? OR muscle_group LIKE ? OR equipment LIKE ?)`;
        const like = `%${search}%`;
        params.push(like, like, like);
    }
    if (category) {
        sql += ` AND category = ?`;
        params.push(category);
    }
    if (difficulty) {
        sql += ` AND difficulty = ?`;
        params.push(difficulty);
    }

    const countSql = `SELECT COUNT(*) AS total FROM (${sql}) AS sub`;

    db.query(countSql, params, (err, countResult) => {
        if (err) return callback(err);
        const total = countResult[0].total;

        sql += ` ORDER BY category, name LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        db.query(sql, params, (err2, rows) => {
            if (err2) return callback(err2);
            callback(null, { rows, total, page, limit });
        });
    });
};

const getAllExercises = (callback) => {
    db.query(
        'SELECT id, name, category, difficulty, muscle_group, equipment FROM exercises WHERE is_active = 1 ORDER BY category, name',
        [],
        callback
    );
};

const getExerciseById = (id, callback) => {
    db.query('SELECT * FROM exercises WHERE id = ? AND is_active = 1 LIMIT 1', [id], callback);
};

const createExercise = (data, callback) => {
    const { name, category, muscle_group, equipment, difficulty, description, instructions, video_url, image_url } = data;
    const sql = `
        INSERT INTO exercises (name, category, muscle_group, equipment, difficulty, description, instructions, video_url, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [name, category, muscle_group, equipment, difficulty, description, instructions, video_url, image_url], callback);
};

const updateExercise = (id, data, callback) => {
    const { name, category, muscle_group, equipment, difficulty, description, instructions, video_url, image_url } = data;
    const sql = `
        UPDATE exercises
        SET name = ?, category = ?, muscle_group = ?, equipment = ?,
            difficulty = ?, description = ?, instructions = ?,
            video_url = ?, image_url = ?
        WHERE id = ?
    `;
    db.query(sql, [name, category, muscle_group, equipment, difficulty, description, instructions, video_url, image_url, id], callback);
};

const deleteExercise = (id, callback) => {
    // Soft delete
    db.query('UPDATE exercises SET is_active = 0 WHERE id = ?', [id], callback);
};

// ═══════════════════════════════════════════════════════════
//  WORKOUT PLANS
// ═══════════════════════════════════════════════════════════

const getWorkoutPlans = (filters, callback) => {
    const { search, goal, difficulty, page, limit } = filters;
    const offset = (page - 1) * limit;
    const params = [];

    let sql = `
        SELECT
            wp.*,
            CONCAT(u.first_name, ' ', u.last_name) AS created_by_name,
            (SELECT COUNT(*) FROM workout_plan_exercises wpe WHERE wpe.workout_plan_id = wp.id) AS exercise_count,
            (SELECT COUNT(*) FROM member_workout_assignments mwa WHERE mwa.workout_plan_id = wp.id AND mwa.status = 'Active') AS active_assignments
        FROM workout_plans wp
        LEFT JOIN users u ON wp.created_by = u.id
        WHERE wp.is_active = 1
    `;

    if (search) {
        sql += ` AND (wp.name LIKE ? OR wp.description LIKE ?)`;
        const like = `%${search}%`;
        params.push(like, like);
    }
    if (goal) {
        sql += ` AND wp.goal = ?`;
        params.push(goal);
    }
    if (difficulty) {
        sql += ` AND wp.difficulty = ?`;
        params.push(difficulty);
    }

    const countSql = `SELECT COUNT(*) AS total FROM (${sql}) AS sub`;

    db.query(countSql, params, (err, countResult) => {
        if (err) return callback(err);
        const total = countResult[0].total;

        sql += ` ORDER BY wp.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        db.query(sql, params, (err2, rows) => {
            if (err2) return callback(err2);
            callback(null, { rows, total, page, limit });
        });
    });
};

const getWorkoutPlanById = (id, callback) => {
    const sql = `
        SELECT
            wp.*,
            CONCAT(u.first_name, ' ', u.last_name) AS created_by_name
        FROM workout_plans wp
        LEFT JOIN users u ON wp.created_by = u.id
        WHERE wp.id = ? AND wp.is_active = 1
        LIMIT 1
    `;
    db.query(sql, [id], (err, planRows) => {
        if (err) return callback(err);
        if (planRows.length === 0) return callback(null, null);

        // Also fetch exercises for this plan
        const exerciseSql = `
            SELECT
                wpe.*,
                e.name          AS exercise_name,
                e.category      AS exercise_category,
                e.difficulty    AS exercise_difficulty,
                e.muscle_group,
                e.equipment,
                e.description   AS exercise_description,
                e.video_url,
                e.image_url
            FROM workout_plan_exercises wpe
            INNER JOIN exercises e ON wpe.exercise_id = e.id
            WHERE wpe.workout_plan_id = ?
            ORDER BY wpe.day_number, wpe.order_index
        `;
        db.query(exerciseSql, [id], (err2, exRows) => {
            if (err2) return callback(err2);
            const plan = planRows[0];
            plan.exercises = exRows;
            callback(null, plan);
        });
    });
};

const createWorkoutPlan = (data, callback) => {
    const { name, description, goal, difficulty, duration_weeks, days_per_week, created_by } = data;
    const sql = `
        INSERT INTO workout_plans (name, description, goal, difficulty, duration_weeks, days_per_week, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [name, description, goal, difficulty, duration_weeks, days_per_week, created_by || null], callback);
};

const updateWorkoutPlan = (id, data, callback) => {
    const { name, description, goal, difficulty, duration_weeks, days_per_week } = data;
    const sql = `
        UPDATE workout_plans
        SET name = ?, description = ?, goal = ?, difficulty = ?,
            duration_weeks = ?, days_per_week = ?
        WHERE id = ?
    `;
    db.query(sql, [name, description, goal, difficulty, duration_weeks, days_per_week, id], callback);
};

const deleteWorkoutPlan = (id, callback) => {
    db.query('UPDATE workout_plans SET is_active = 0 WHERE id = ?', [id], callback);
};

// ═══════════════════════════════════════════════════════════
//  WORKOUT PLAN EXERCISES (junction)
// ═══════════════════════════════════════════════════════════

const addExerciseToPlan = (data, callback) => {
    const { workout_plan_id, exercise_id, sets, reps, duration_secs, rest_secs, day_number, order_index, notes } = data;
    const sql = `
        INSERT INTO workout_plan_exercises
            (workout_plan_id, exercise_id, sets, reps, duration_secs, rest_secs, day_number, order_index, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [workout_plan_id, exercise_id, sets, reps || null, duration_secs || null, rest_secs || 60, day_number || 1, order_index || 1, notes || null], callback);
};

const updatePlanExercise = (id, data, callback) => {
    const { sets, reps, duration_secs, rest_secs, day_number, order_index, notes } = data;
    const sql = `
        UPDATE workout_plan_exercises
        SET sets = ?, reps = ?, duration_secs = ?, rest_secs = ?,
            day_number = ?, order_index = ?, notes = ?
        WHERE id = ?
    `;
    db.query(sql, [sets, reps || null, duration_secs || null, rest_secs, day_number, order_index, notes || null, id], callback);
};

const removeExerciseFromPlan = (id, callback) => {
    db.query('DELETE FROM workout_plan_exercises WHERE id = ?', [id], callback);
};

const getPlanExercises = (planId, callback) => {
    const sql = `
        SELECT
            wpe.*,
            e.name       AS exercise_name,
            e.category,
            e.difficulty,
            e.muscle_group,
            e.equipment,
            e.image_url
        FROM workout_plan_exercises wpe
        INNER JOIN exercises e ON wpe.exercise_id = e.id
        WHERE wpe.workout_plan_id = ?
        ORDER BY wpe.day_number, wpe.order_index
    `;
    db.query(sql, [planId], callback);
};

// ═══════════════════════════════════════════════════════════
//  MEMBER WORKOUT ASSIGNMENTS
// ═══════════════════════════════════════════════════════════

const getAssignments = (filters, callback) => {
    const { memberId, status, page, limit } = filters;
    const offset = (page - 1) * limit;
    const params = [];

    let sql = `
        SELECT
            mwa.*,
            CONCAT(m.first_name, ' ', m.last_name)  AS member_name,
            m.email                                  AS member_email,
            m.profile_image                          AS member_image,
            wp.name                                  AS plan_name,
            wp.goal                                  AS plan_goal,
            wp.difficulty                            AS plan_difficulty,
            wp.duration_weeks,
            CONCAT(u.first_name, ' ', u.last_name)  AS assigned_by_name
        FROM member_workout_assignments mwa
        INNER JOIN members m ON mwa.member_id = m.id
        INNER JOIN workout_plans wp ON mwa.workout_plan_id = wp.id
        LEFT JOIN users u ON mwa.assigned_by = u.id
        WHERE 1=1
    `;

    if (memberId) {
        sql += ` AND mwa.member_id = ?`;
        params.push(memberId);
    }
    if (status) {
        sql += ` AND mwa.status = ?`;
        params.push(status);
    }

    const countSql = `SELECT COUNT(*) AS total FROM (${sql}) AS sub`;
    db.query(countSql, params, (err, countResult) => {
        if (err) return callback(err);
        const total = countResult[0].total;

        sql += ` ORDER BY mwa.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        db.query(sql, params, (err2, rows) => {
            if (err2) return callback(err2);
            callback(null, { rows, total, page, limit });
        });
    });
};

const getAssignmentById = (id, callback) => {
    const sql = `
        SELECT
            mwa.*,
            CONCAT(m.first_name, ' ', m.last_name)  AS member_name,
            m.email                                  AS member_email,
            wp.name                                  AS plan_name,
            wp.goal                                  AS plan_goal,
            wp.difficulty                            AS plan_difficulty,
            wp.duration_weeks,
            wp.days_per_week,
            CONCAT(u.first_name, ' ', u.last_name)  AS assigned_by_name
        FROM member_workout_assignments mwa
        INNER JOIN members m ON mwa.member_id = m.id
        INNER JOIN workout_plans wp ON mwa.workout_plan_id = wp.id
        LEFT JOIN users u ON mwa.assigned_by = u.id
        WHERE mwa.id = ?
        LIMIT 1
    `;
    db.query(sql, [id], callback);
};

const getMemberAssignments = (memberId, callback) => {
    const sql = `
        SELECT
            mwa.*,
            wp.name         AS plan_name,
            wp.goal         AS plan_goal,
            wp.difficulty   AS plan_difficulty,
            wp.duration_weeks,
            wp.days_per_week,
            (SELECT COUNT(*) FROM workout_plan_exercises wpe WHERE wpe.workout_plan_id = wp.id) AS exercise_count
        FROM member_workout_assignments mwa
        INNER JOIN workout_plans wp ON mwa.workout_plan_id = wp.id
        WHERE mwa.member_id = ?
        ORDER BY mwa.created_at DESC
    `;
    db.query(sql, [memberId], callback);
};

const assignWorkout = (data, callback) => {
    const { member_id, workout_plan_id, assigned_by, start_date, end_date, notes } = data;
    const sql = `
        INSERT INTO member_workout_assignments
            (member_id, workout_plan_id, assigned_by, start_date, end_date, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [member_id, workout_plan_id, assigned_by || null, start_date, end_date || null, notes || null], callback);
};

const updateAssignment = (id, data, callback) => {
    const { status, start_date, end_date, notes } = data;
    const sql = `
        UPDATE member_workout_assignments
        SET status = ?, start_date = ?, end_date = ?, notes = ?
        WHERE id = ?
    `;
    db.query(sql, [status, start_date, end_date || null, notes || null, id], callback);
};

const deleteAssignment = (id, callback) => {
    db.query('DELETE FROM member_workout_assignments WHERE id = ?', [id], callback);
};

// ═══════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════════════════════

const getWorkoutDashboardStats = (callback) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM workout_plans WHERE is_active = 1)                           AS total_plans,
            (SELECT COUNT(*) FROM exercises WHERE is_active = 1)                               AS total_exercises,
            (SELECT COUNT(*) FROM member_workout_assignments WHERE status = 'Active')          AS active_assignments,
            (SELECT COUNT(*) FROM member_workout_assignments WHERE status = 'Completed')       AS completed_assignments
    `;
    db.query(sql, [], callback);
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
    addExerciseToPlan,
    updatePlanExercise,
    removeExerciseFromPlan,
    getPlanExercises,
    // Assignments
    getAssignments,
    getAssignmentById,
    getMemberAssignments,
    assignWorkout,
    updateAssignment,
    deleteAssignment,
    // Stats
    getWorkoutDashboardStats,
};
