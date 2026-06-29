// backend/models/attendanceModel.js
// All attendance-related database operations using callback-based mysql2

const db = require('../config/db');

// ─────────────────────────────────────────────────────────────
// CHECK-IN
// ─────────────────────────────────────────────────────────────

/**
 * Check if a member has already checked in today.
 */
const findTodayAttendance = (memberId, callback) => {
    const sql = `
        SELECT * FROM attendance
        WHERE member_id = ? AND date = CURDATE()
        LIMIT 1
    `;
    db.query(sql, [memberId], callback);
};

/**
 * Create a new check-in record.
 */
const checkIn = (memberId, notes, callback) => {
    const sql = `
        INSERT INTO attendance (member_id, check_in, date, notes)
        VALUES (?, NOW(), CURDATE(), ?)
    `;
    db.query(sql, [memberId, notes || null], callback);
};

// ─────────────────────────────────────────────────────────────
// CHECK-OUT
// ─────────────────────────────────────────────────────────────

/**
 * Set check-out time for a specific attendance record.
 */
const checkOut = (attendanceId, callback) => {
    const sql = `
        UPDATE attendance
        SET check_out = NOW()
        WHERE id = ? AND check_out IS NULL
    `;
    db.query(sql, [attendanceId], callback);
};

/**
 * Find an open (no check-out) attendance record for a member today.
 */
const findOpenAttendance = (memberId, callback) => {
    const sql = `
        SELECT * FROM attendance
        WHERE member_id = ? AND date = CURDATE() AND check_out IS NULL
        LIMIT 1
    `;
    db.query(sql, [memberId], callback);
};

// ─────────────────────────────────────────────────────────────
// HISTORY & LISTING
// ─────────────────────────────────────────────────────────────

/**
 * Paginated attendance list with optional member search and date filter.
 */
const getAttendanceList = (filters, callback) => {
    const { search, date, startDate, endDate, memberId, page, limit } = filters;
    const offset = (page - 1) * limit;
    const params = [];

    let sql = `
        SELECT
            a.id,
            a.member_id,
            CONCAT(m.first_name, ' ', m.last_name) AS member_name,
            m.email                                 AS member_email,
            m.phone                                 AS member_phone,
            m.profile_image                         AS member_image,
            a.check_in,
            a.check_out,
            a.date,
            a.notes,
            TIMESTAMPDIFF(MINUTE, a.check_in, COALESCE(a.check_out, NOW())) AS duration_minutes
        FROM attendance a
        INNER JOIN members m ON a.member_id = m.id
        WHERE 1=1
    `;

    if (search) {
        sql += ` AND (m.first_name LIKE ? OR m.last_name LIKE ? OR m.email LIKE ?)`;
        const like = `%${search}%`;
        params.push(like, like, like);
    }
    if (memberId) {
        sql += ` AND a.member_id = ?`;
        params.push(memberId);
    }
    if (date) {
        sql += ` AND a.date = ?`;
        params.push(date);
    }
    if (startDate) {
        sql += ` AND a.date >= ?`;
        params.push(startDate);
    }
    if (endDate) {
        sql += ` AND a.date <= ?`;
        params.push(endDate);
    }

    // Count query
    const countSql = `SELECT COUNT(*) AS total FROM (${sql}) AS sub`;

    db.query(countSql, params, (err, countResult) => {
        if (err) return callback(err);
        const total = countResult[0].total;

        sql += ` ORDER BY a.check_in DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        db.query(sql, params, (err2, rows) => {
            if (err2) return callback(err2);
            callback(null, { rows, total, page, limit });
        });
    });
};

/**
 * Get all attendance records for a specific member.
 */
const getMemberAttendanceHistory = (memberId, callback) => {
    const sql = `
        SELECT
            a.*,
            TIMESTAMPDIFF(MINUTE, a.check_in, COALESCE(a.check_out, NOW())) AS duration_minutes
        FROM attendance a
        WHERE a.member_id = ?
        ORDER BY a.check_in DESC
    `;
    db.query(sql, [memberId], callback);
};

/**
 * Get a single attendance record by ID.
 */
const getAttendanceById = (id, callback) => {
    const sql = `
        SELECT
            a.*,
            CONCAT(m.first_name, ' ', m.last_name) AS member_name,
            m.email                                 AS member_email,
            TIMESTAMPDIFF(MINUTE, a.check_in, COALESCE(a.check_out, NOW())) AS duration_minutes
        FROM attendance a
        INNER JOIN members m ON a.member_id = m.id
        WHERE a.id = ?
        LIMIT 1
    `;
    db.query(sql, [id], callback);
};

// ─────────────────────────────────────────────────────────────
// MANUAL ENTRY
// ─────────────────────────────────────────────────────────────

/**
 * Manually insert an attendance record (admin use).
 */
const createManualAttendance = (data, callback) => {
    const { member_id, check_in, check_out, date, notes } = data;
    const sql = `
        INSERT INTO attendance (member_id, check_in, check_out, date, notes)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [member_id, check_in, check_out || null, date, notes || null], callback);
};

/**
 * Update an existing attendance record.
 */
const updateAttendance = (id, data, callback) => {
    const { check_in, check_out, notes } = data;
    const sql = `
        UPDATE attendance
        SET check_in = ?, check_out = ?, notes = ?
        WHERE id = ?
    `;
    db.query(sql, [check_in, check_out || null, notes || null, id], callback);
};

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────

const deleteAttendance = (id, callback) => {
    db.query('DELETE FROM attendance WHERE id = ?', [id], callback);
};

// ─────────────────────────────────────────────────────────────
// STATISTICS
// ─────────────────────────────────────────────────────────────

/**
 * Dashboard stats: today's count, checked-in now, avg duration.
 */
const getDailyStats = (date, callback) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const sql = `
        SELECT
            COUNT(*)                                                             AS total_checkins,
            SUM(CASE WHEN check_out IS NULL THEN 1 ELSE 0 END)                 AS currently_in,
            SUM(CASE WHEN check_out IS NOT NULL THEN 1 ELSE 0 END)             AS checked_out,
            ROUND(AVG(TIMESTAMPDIFF(MINUTE, check_in, check_out)), 0)          AS avg_duration_minutes,
            MAX(TIMESTAMPDIFF(MINUTE, check_in, check_out))                    AS max_duration_minutes
        FROM attendance
        WHERE date = ?
    `;
    db.query(sql, [targetDate], callback);
};

/**
 * Monthly statistics: daily breakdown for a given month.
 */
const getMonthlyStats = (year, month, callback) => {
    const sql = `
        SELECT
            DATE(check_in)                                                       AS day,
            COUNT(*)                                                             AS total_checkins,
            ROUND(AVG(TIMESTAMPDIFF(MINUTE, check_in, check_out)), 0)          AS avg_duration_minutes
        FROM attendance
        WHERE YEAR(date) = ? AND MONTH(date) = ?
        GROUP BY DATE(check_in)
        ORDER BY day ASC
    `;
    db.query(sql, [year, month], callback);
};

/**
 * Top attending members for a given month.
 */
const getTopMembersByMonth = (year, month, limit, callback) => {
    const sql = `
        SELECT
            m.id,
            CONCAT(m.first_name, ' ', m.last_name) AS member_name,
            m.email,
            m.profile_image,
            COUNT(a.id)                            AS visits
        FROM attendance a
        INNER JOIN members m ON a.member_id = m.id
        WHERE YEAR(a.date) = ? AND MONTH(a.date) = ?
        GROUP BY m.id
        ORDER BY visits DESC
        LIMIT ?
    `;
    db.query(sql, [year, month, limit || 5], callback);
};

/**
 * Weekly check-in counts for the last 7 days.
 */
const getWeeklyTrend = (callback) => {
    const sql = `
        SELECT
            DATE(check_in)  AS day,
            DAYNAME(check_in) AS day_name,
            COUNT(*)        AS total
        FROM attendance
        WHERE check_in >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(check_in)
        ORDER BY day ASC
    `;
    db.query(sql, [], callback);
};

/**
 * Peak hours analysis.
 */
const getPeakHours = (callback) => {
    const sql = `
        SELECT
            HOUR(check_in)  AS hour,
            COUNT(*)        AS total
        FROM attendance
        WHERE check_in >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY HOUR(check_in)
        ORDER BY hour ASC
    `;
    db.query(sql, [], callback);
};

module.exports = {
    findTodayAttendance,
    checkIn,
    checkOut,
    findOpenAttendance,
    getAttendanceList,
    getMemberAttendanceHistory,
    getAttendanceById,
    createManualAttendance,
    updateAttendance,
    deleteAttendance,
    getDailyStats,
    getMonthlyStats,
    getTopMembersByMonth,
    getWeeklyTrend,
    getPeakHours,
};
