// backend/controllers/attendanceController.js
// Handles all attendance HTTP request logic. Clean separation from model/routes.

const AttendanceModel = require('../models/attendanceModel');

// ─────────────────────────────────────────────────────────────
// CHECK-IN
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/attendance/checkin
 * Body: { member_id, notes? }
 */
const checkIn = (req, res) => {
    const { member_id, notes } = req.body;

    if (!member_id) {
        return res.status(400).json({ success: false, message: 'member_id is required.' });
    }

    // Prevent duplicate check-in for today
    AttendanceModel.findTodayAttendance(member_id, (err, existing) => {
        if (err) {
            console.error('checkIn - findTodayAttendance error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Member has already checked in today.',
                attendance: existing[0],
            });
        }

        AttendanceModel.checkIn(member_id, notes, (err2, result) => {
            if (err2) {
                console.error('checkIn - insert error:', err2);
                return res.status(500).json({ success: false, message: 'Failed to check in.' });
            }

            AttendanceModel.getAttendanceById(result.insertId, (err3, rows) => {
                if (err3 || rows.length === 0) {
                    return res.status(201).json({ success: true, message: 'Check-in successful.' });
                }
                return res.status(201).json({
                    success: true,
                    message: 'Check-in successful.',
                    attendance: rows[0],
                });
            });
        });
    });
};

// ─────────────────────────────────────────────────────────────
// CHECK-OUT
// ─────────────────────────────────────────────────────────────

/**
 * PUT /api/attendance/checkout/:memberId
 */
const checkOut = (req, res) => {
    const memberId = req.params.memberId;

    AttendanceModel.findOpenAttendance(memberId, (err, rows) => {
        if (err) {
            console.error('checkOut - findOpenAttendance error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No open check-in found for this member today.',
            });
        }

        const attendanceId = rows[0].id;

        AttendanceModel.checkOut(attendanceId, (err2, result) => {
            if (err2) {
                console.error('checkOut - update error:', err2);
                return res.status(500).json({ success: false, message: 'Failed to check out.' });
            }
            if (result.affectedRows === 0) {
                return res.status(400).json({ success: false, message: 'Already checked out.' });
            }

            AttendanceModel.getAttendanceById(attendanceId, (err3, updated) => {
                return res.status(200).json({
                    success: true,
                    message: 'Check-out successful.',
                    attendance: updated[0] || null,
                });
            });
        });
    });
};

// ─────────────────────────────────────────────────────────────
// LISTING / HISTORY
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/attendance
 * Query: search, date, startDate, endDate, memberId, page, limit
 */
const getAttendanceList = (req, res) => {
    const filters = {
        search:    req.query.search    || '',
        date:      req.query.date      || '',
        startDate: req.query.startDate || '',
        endDate:   req.query.endDate   || '',
        memberId:  req.query.memberId  || '',
        page:      parseInt(req.query.page)  || 1,
        limit:     parseInt(req.query.limit) || 20,
    };

    AttendanceModel.getAttendanceList(filters, (err, data) => {
        if (err) {
            console.error('getAttendanceList error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data });
    });
};

/**
 * GET /api/attendance/member/:memberId
 */
const getMemberHistory = (req, res) => {
    const { memberId } = req.params;
    AttendanceModel.getMemberAttendanceHistory(memberId, (err, rows) => {
        if (err) {
            console.error('getMemberHistory error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data: rows });
    });
};

/**
 * GET /api/attendance/:id
 */
const getAttendanceById = (req, res) => {
    AttendanceModel.getAttendanceById(req.params.id, (err, rows) => {
        if (err) {
            console.error('getAttendanceById error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Attendance record not found.' });
        }
        return res.status(200).json({ success: true, data: rows[0] });
    });
};

// ─────────────────────────────────────────────────────────────
// MANUAL ENTRY / UPDATE / DELETE
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/attendance/manual
 * Body: { member_id, check_in, check_out?, date, notes? }
 */
const createManual = (req, res) => {
    const { member_id, check_in, check_out, date, notes } = req.body;

    if (!member_id || !check_in || !date) {
        return res.status(400).json({
            success: false,
            message: 'member_id, check_in, and date are required.',
        });
    }

    AttendanceModel.createManualAttendance({ member_id, check_in, check_out, date, notes }, (err, result) => {
        if (err) {
            console.error('createManual error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'Attendance record already exists for this member on that date.',
                });
            }
            return res.status(500).json({ success: false, message: 'Failed to create attendance record.' });
        }
        return res.status(201).json({
            success: true,
            message: 'Manual attendance record created.',
            id: result.insertId,
        });
    });
};

/**
 * PUT /api/attendance/:id
 * Body: { check_in, check_out?, notes? }
 */
const updateAttendance = (req, res) => {
    const { id } = req.params;
    const { check_in, check_out, notes } = req.body;

    if (!check_in) {
        return res.status(400).json({ success: false, message: 'check_in is required.' });
    }

    AttendanceModel.updateAttendance(id, { check_in, check_out, notes }, (err, result) => {
        if (err) {
            console.error('updateAttendance error:', err);
            return res.status(500).json({ success: false, message: 'Failed to update attendance.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Attendance record not found.' });
        }
        return res.status(200).json({ success: true, message: 'Attendance updated successfully.' });
    });
};

/**
 * DELETE /api/attendance/:id
 */
const deleteAttendance = (req, res) => {
    AttendanceModel.deleteAttendance(req.params.id, (err, result) => {
        if (err) {
            console.error('deleteAttendance error:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete attendance.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Attendance record not found.' });
        }
        return res.status(200).json({ success: true, message: 'Attendance record deleted.' });
    });
};

// ─────────────────────────────────────────────────────────────
// STATISTICS
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/attendance/stats/daily?date=YYYY-MM-DD
 */
const getDailyStats = (req, res) => {
    const date = req.query.date || null;
    AttendanceModel.getDailyStats(date, (err, rows) => {
        if (err) {
            console.error('getDailyStats error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data: rows[0] });
    });
};

/**
 * GET /api/attendance/stats/monthly?year=YYYY&month=MM
 */
const getMonthlyStats = (req, res) => {
    const year  = req.query.year  || new Date().getFullYear();
    const month = req.query.month || (new Date().getMonth() + 1);

    AttendanceModel.getMonthlyStats(year, month, (err, daily) => {
        if (err) {
            console.error('getMonthlyStats error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }

        AttendanceModel.getTopMembersByMonth(year, month, 5, (err2, topMembers) => {
            if (err2) return res.status(500).json({ success: false, message: 'Database error.' });

            return res.status(200).json({ success: true, data: { daily, topMembers } });
        });
    });
};

/**
 * GET /api/attendance/stats/weekly
 */
const getWeeklyTrend = (req, res) => {
    AttendanceModel.getWeeklyTrend((err, rows) => {
        if (err) {
            console.error('getWeeklyTrend error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data: rows });
    });
};

/**
 * GET /api/attendance/stats/peak-hours
 */
const getPeakHours = (req, res) => {
    AttendanceModel.getPeakHours((err, rows) => {
        if (err) {
            console.error('getPeakHours error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        return res.status(200).json({ success: true, data: rows });
    });
};

/**
 * GET /api/attendance/stats/dashboard
 * Aggregates daily + weekly into one call for the dashboard.
 */
const getDashboardStats = (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    AttendanceModel.getDailyStats(today, (err, dailyRows) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });

        AttendanceModel.getWeeklyTrend((err2, weeklyRows) => {
            if (err2) return res.status(500).json({ success: false, message: 'Database error.' });

            AttendanceModel.getPeakHours((err3, peakRows) => {
                if (err3) return res.status(500).json({ success: false, message: 'Database error.' });

                return res.status(200).json({
                    success: true,
                    data: {
                        daily:     dailyRows[0],
                        weekly:    weeklyRows,
                        peakHours: peakRows,
                    },
                });
            });
        });
    });
};

module.exports = {
    checkIn,
    checkOut,
    getAttendanceList,
    getMemberHistory,
    getAttendanceById,
    createManual,
    updateAttendance,
    deleteAttendance,
    getDailyStats,
    getMonthlyStats,
    getWeeklyTrend,
    getPeakHours,
    getDashboardStats,
};
