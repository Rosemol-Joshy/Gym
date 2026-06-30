// backend/routes/attendanceRoutes.js
// All /api/attendance routes. Mount in server.js with:
//   const attendanceRoutes = require('./routes/attendanceRoutes');
//   app.use('/api/attendance', attendanceRoutes);

const express = require('express');
const router  = express.Router();
const {
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
} = require('../controllers/attendanceController');

// ── Statistics (declare before /:id to avoid route collision) ──
router.get('/stats/dashboard',   getDashboardStats);
router.get('/stats/daily',       getDailyStats);
router.get('/stats/monthly',     getMonthlyStats);
router.get('/stats/weekly',      getWeeklyTrend);
router.get('/stats/peak-hours',  getPeakHours);

// ── Member-specific history ──
router.get('/member/:memberId',  getMemberHistory);

// ── Check-in / Check-out ──
router.post('/checkin',             checkIn);
router.put('/checkout/:memberId',   checkOut);

// ── Manual entry ──
router.post('/manual', createManual);

// ── General CRUD ──
router.get('/',     getAttendanceList);
router.get('/:id',  getAttendanceById);
router.put('/:id',  updateAttendance);
router.delete('/:id', deleteAttendance);

module.exports = router;