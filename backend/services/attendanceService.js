// frontend/src/services/attendanceService.js
// All axios calls for the Attendance module.

import axios from 'axios';

const BASE = '/api/attendance';

const attendanceService = {
    // ── Check-in / Check-out ──────────────────────────────
    checkIn: (memberId, notes = '') =>
        axios.post(`${BASE}/checkin`, { member_id: memberId, notes }),

    checkOut: (memberId) =>
        axios.put(`${BASE}/checkout/${memberId}`),

    // ── Listing ───────────────────────────────────────────
    getList: (params = {}) =>
        axios.get(BASE, { params }),

    getMemberHistory: (memberId) =>
        axios.get(`${BASE}/member/${memberId}`),

    getById: (id) =>
        axios.get(`${BASE}/${id}`),

    // ── Manual entry / update / delete ───────────────────
    createManual: (data) =>
        axios.post(`${BASE}/manual`, data),

    update: (id, data) =>
        axios.put(`${BASE}/${id}`, data),

    remove: (id) =>
        axios.delete(`${BASE}/${id}`),

    // ── Stats ─────────────────────────────────────────────
    getDashboardStats: () =>
        axios.get(`${BASE}/stats/dashboard`),

    getDailyStats: (date) =>
        axios.get(`${BASE}/stats/daily`, { params: { date } }),

    getMonthlyStats: (year, month) =>
        axios.get(`${BASE}/stats/monthly`, { params: { year, month } }),

    getWeeklyTrend: () =>
        axios.get(`${BASE}/stats/weekly`),

    getPeakHours: () =>
        axios.get(`${BASE}/stats/peak-hours`),
};

export default attendanceService;