// backend/controllers/attendanceController.js
// Handles all attendance HTTP request logic using Mongoose (async/await).
// Note: model layer logic now lives directly here since Mongoose models
// are themselves the data-access layer — there's no separate callback-based
// model file needed (Attendance.js IS the model).

const Attendance = require('../models/attendanceModel');

const todayStr = () => new Date().toISOString().split('T')[0];

// ─────────────────────────────────────────────────────────────
// CHECK-IN
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/attendance/checkin
 * Body: { member_id, notes? }
 */
const checkIn = async (req, res) => {
    const { member_id, notes } = req.body;

    if (!member_id) {
        return res.status(400).json({ success: false, message: 'member_id is required.' });
    }

    try {
        const date = todayStr();

        const existing = await Attendance.findOne({ member: member_id, date });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Member has already checked in today.',
                attendance: existing,
            });
        }

        const record = await Attendance.create({
            member: member_id,
            checkIn: new Date(),
            date,
            notes: notes || null,
        });

        const populated = await record.populate('member', 'firstName lastName email profileImage phone');

        return res.status(201).json({
            success: true,
            message: 'Check-in successful.',
            attendance: populated,
        });
    } catch (err) {
        console.error('checkIn error:', err);
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'Member has already checked in today.' });
        }
        return res.status(500).json({ success: false, message: 'Failed to check in.' });
    }
};

// ─────────────────────────────────────────────────────────────
// CHECK-OUT
// ─────────────────────────────────────────────────────────────

/**
 * PUT /api/attendance/checkout/:memberId
 */
const checkOut = async (req, res) => {
    const { memberId } = req.params;

    try {
        const record = await Attendance.findOne({
            member: memberId,
            date: todayStr(),
            checkOut: null,
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'No open check-in found for this member today.',
            });
        }

        record.checkOut = new Date();
        await record.save();

        const populated = await record.populate('member', 'firstName lastName email profileImage phone');

        return res.status(200).json({
            success: true,
            message: 'Check-out successful.',
            attendance: populated,
        });
    } catch (err) {
        console.error('checkOut error:', err);
        return res.status(500).json({ success: false, message: 'Failed to check out.' });
    }
};

// ─────────────────────────────────────────────────────────────
// LISTING / HISTORY
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/attendance
 * Query: search, date, startDate, endDate, memberId, page, limit
 */
const getAttendanceList = async (req, res) => {
    const {
        search = '', date = '', startDate = '', endDate = '',
        memberId = '', page = 1, limit = 20,
    } = req.query;

    try {
        const filter = {};

        if (memberId) filter.member = memberId;
        if (date) filter.date = date;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = startDate;
            if (endDate) filter.date.$lte = endDate;
        }

        let query = Attendance.find(filter).populate('member', 'firstName lastName email profileImage phone');

        // Search by member name/email requires filtering populated fields in-memory,
        // since Mongoose can't filter a $lookup-style populate directly.
        if (search) {
            const all = await query.sort({ checkIn: -1 }).lean();
            const regex = new RegExp(search, 'i');
            const filtered = all.filter(r =>
                r.member && (
                    regex.test(r.member.firstName) ||
                    regex.test(r.member.lastName) ||
                    regex.test(r.member.email)
                )
            );
            const total = filtered.length;
            const start = (page - 1) * limit;
            const rows = filtered.slice(start, start + Number(limit)).map(formatAttendance);

            return res.status(200).json({ success: true, data: { rows, total, page: Number(page), limit: Number(limit) } });
        }

        const total = await Attendance.countDocuments(filter);
        const rows = await query
            .sort({ checkIn: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        return res.status(200).json({
            success: true,
            data: { rows: rows.map(formatAttendance), total, page: Number(page), limit: Number(limit) },
        });
    } catch (err) {
        console.error('getAttendanceList error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * GET /api/attendance/member/:memberId
 */
const getMemberHistory = async (req, res) => {
    try {
        const rows = await Attendance.find({ member: req.params.memberId })
            .sort({ checkIn: -1 })
            .lean();
        return res.status(200).json({ success: true, data: rows.map(formatAttendance) });
    } catch (err) {
        console.error('getMemberHistory error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * GET /api/attendance/:id
 */
const getAttendanceById = async (req, res) => {
    try {
        const record = await Attendance.findById(req.params.id)
            .populate('member', 'firstName lastName email profileImage phone')
            .lean();

        if (!record) {
            return res.status(404).json({ success: false, message: 'Attendance record not found.' });
        }
        return res.status(200).json({ success: true, data: formatAttendance(record) });
    } catch (err) {
        console.error('getAttendanceById error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

// ─────────────────────────────────────────────────────────────
// MANUAL ENTRY / UPDATE / DELETE
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/attendance/manual
 * Body: { member_id, check_in, check_out?, date, notes? }
 */
const createManual = async (req, res) => {
    const { member_id, check_in, check_out, date, notes } = req.body;

    if (!member_id || !check_in || !date) {
        return res.status(400).json({
            success: false,
            message: 'member_id, check_in, and date are required.',
        });
    }

    try {
        const record = await Attendance.create({
            member: member_id,
            checkIn: new Date(check_in),
            checkOut: check_out ? new Date(check_out) : null,
            date,
            notes: notes || null,
        });

        return res.status(201).json({
            success: true,
            message: 'Manual attendance record created.',
            id: record._id,
        });
    } catch (err) {
        console.error('createManual error:', err);
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Attendance record already exists for this member on that date.',
            });
        }
        return res.status(500).json({ success: false, message: 'Failed to create attendance record.' });
    }
};

/**
 * PUT /api/attendance/:id
 * Body: { check_in, check_out?, notes? }
 */
const updateAttendance = async (req, res) => {
    const { id } = req.params;
    const { check_in, check_out, notes } = req.body;

    if (!check_in) {
        return res.status(400).json({ success: false, message: 'check_in is required.' });
    }

    try {
        const record = await Attendance.findByIdAndUpdate(
            id,
            {
                checkIn: new Date(check_in),
                checkOut: check_out ? new Date(check_out) : null,
                notes: notes || null,
            },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({ success: false, message: 'Attendance record not found.' });
        }
        return res.status(200).json({ success: true, message: 'Attendance updated successfully.' });
    } catch (err) {
        console.error('updateAttendance error:', err);
        return res.status(500).json({ success: false, message: 'Failed to update attendance.' });
    }
};

/**
 * DELETE /api/attendance/:id
 */
const deleteAttendance = async (req, res) => {
    try {
        const record = await Attendance.findByIdAndDelete(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Attendance record not found.' });
        }
        return res.status(200).json({ success: true, message: 'Attendance record deleted.' });
    } catch (err) {
        console.error('deleteAttendance error:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete attendance.' });
    }
};

// ─────────────────────────────────────────────────────────────
// STATISTICS
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/attendance/stats/daily?date=YYYY-MM-DD
 */
const getDailyStats = async (req, res) => {
    try {
        const date = req.query.date || todayStr();

        const records = await Attendance.find({ date }).lean();
        const total = records.length;
        const currentlyIn = records.filter(r => !r.checkOut).length;
        const checkedOut = total - currentlyIn;

        const durations = records
            .filter(r => r.checkOut)
            .map(r => Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / 60000));

        const avgDuration = durations.length
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : null;
        const maxDuration = durations.length ? Math.max(...durations) : null;

        return res.status(200).json({
            success: true,
            data: {
                total_checkins: total,
                currently_in: currentlyIn,
                checked_out: checkedOut,
                avg_duration_minutes: avgDuration,
                max_duration_minutes: maxDuration,
            },
        });
    } catch (err) {
        console.error('getDailyStats error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * GET /api/attendance/stats/monthly?year=YYYY&month=MM
 */
const getMonthlyStats = async (req, res) => {
    try {
        const year  = parseInt(req.query.year)  || new Date().getFullYear();
        const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
        const monthStr = String(month).padStart(2, '0');
        const prefix = `${year}-${monthStr}`;

        const records = await Attendance.find({ date: { $regex: `^${prefix}` } })
            .populate('member', 'firstName lastName email profileImage')
            .lean();

        // Group by day
        const dayMap = {};
        records.forEach(r => {
            if (!dayMap[r.date]) dayMap[r.date] = [];
            dayMap[r.date].push(r);
        });

        const daily = Object.keys(dayMap).sort().map(day => {
            const dayRecords = dayMap[day];
            const durations = dayRecords
                .filter(r => r.checkOut)
                .map(r => Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / 60000));
            return {
                day,
                total_checkins: dayRecords.length,
                avg_duration_minutes: durations.length
                    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
                    : null,
            };
        });

        // Top members
        const memberMap = {};
        records.forEach(r => {
            if (!r.member) return;
            const id = r.member._id.toString();
            if (!memberMap[id]) {
                memberMap[id] = {
                    id,
                    member_name: `${r.member.firstName} ${r.member.lastName}`,
                    email: r.member.email,
                    profile_image: r.member.profileImage,
                    visits: 0,
                };
            }
            memberMap[id].visits += 1;
        });
        const topMembers = Object.values(memberMap)
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 5);

        return res.status(200).json({ success: true, data: { daily, topMembers } });
    } catch (err) {
        console.error('getMonthlyStats error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * GET /api/attendance/stats/weekly
 */
const getWeeklyTrend = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

        const records = await Attendance.find({ date: { $gte: sevenDaysAgoStr } }).lean();

        const dayMap = {};
        records.forEach(r => {
            if (!dayMap[r.date]) dayMap[r.date] = 0;
            dayMap[r.date] += 1;
        });

        const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const rows = Object.keys(dayMap).sort().map(day => ({
            day,
            day_name: dayNames[new Date(day).getDay()],
            total: dayMap[day],
        }));

        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('getWeeklyTrend error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * GET /api/attendance/stats/peak-hours
 */
const getPeakHours = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const records = await Attendance.find({ checkIn: { $gte: thirtyDaysAgo } }).lean();

        const hourMap = {};
        records.forEach(r => {
            const hour = new Date(r.checkIn).getHours();
            hourMap[hour] = (hourMap[hour] || 0) + 1;
        });

        const rows = Object.keys(hourMap)
            .map(h => ({ hour: Number(h), total: hourMap[h] }))
            .sort((a, b) => a.hour - b.hour);

        return res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error('getPeakHours error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

/**
 * GET /api/attendance/stats/dashboard
 */
const getDashboardStats = async (req, res) => {
    try {
        const date = todayStr();
        const records = await Attendance.find({ date }).lean();
        const total = records.length;
        const currentlyIn = records.filter(r => !r.checkOut).length;
        const checkedOut = total - currentlyIn;
        const durations = records
            .filter(r => r.checkOut)
            .map(r => Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / 60000));
        const avgDuration = durations.length
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : null;

        // Weekly
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const weeklyRecords = await Attendance.find({
            date: { $gte: sevenDaysAgo.toISOString().split('T')[0] },
        }).lean();
        const dayMap = {};
        weeklyRecords.forEach(r => { dayMap[r.date] = (dayMap[r.date] || 0) + 1; });
        const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const weekly = Object.keys(dayMap).sort().map(day => ({
            day,
            day_name: dayNames[new Date(day).getDay()],
            total: dayMap[day],
        }));

        // Peak hours
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthRecords = await Attendance.find({ checkIn: { $gte: thirtyDaysAgo } }).lean();
        const hourMap = {};
        monthRecords.forEach(r => {
            const hour = new Date(r.checkIn).getHours();
            hourMap[hour] = (hourMap[hour] || 0) + 1;
        });
        const peakHours = Object.keys(hourMap)
            .map(h => ({ hour: Number(h), total: hourMap[h] }))
            .sort((a, b) => a.hour - b.hour);

        return res.status(200).json({
            success: true,
            data: {
                daily: {
                    total_checkins: total,
                    currently_in: currentlyIn,
                    checked_out: checkedOut,
                    avg_duration_minutes: avgDuration,
                },
                weekly,
                peakHours,
            },
        });
    } catch (err) {
        console.error('getDashboardStats error:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
};

// ─────────────────────────────────────────────────────────────
// Helper: flatten populated member fields into the shape the
// frontend already expects (so AttendanceTable.jsx needs no changes)
// ─────────────────────────────────────────────────────────────
function formatAttendance(r) {
    const member = r.member && typeof r.member === 'object' ? r.member : null;
    return {
        id: r._id,
        member_id: member ? member._id : r.member,
        member_name: member ? `${member.firstName} ${member.lastName}` : null,
        member_email: member ? member.email : null,
        member_phone: member ? member.phone : null,
        member_image: member ? member.profileImage : null,
        check_in: r.checkIn,
        check_out: r.checkOut,
        date: r.date,
        notes: r.notes,
        duration_minutes: r.checkOut
            ? Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / 60000)
            : Math.round((Date.now() - new Date(r.checkIn)) / 60000),
    };
}

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