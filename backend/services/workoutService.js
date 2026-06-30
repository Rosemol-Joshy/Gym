// frontend/src/services/workoutService.js
// All axios calls for the Workout module.

import axios from 'axios';

const BASE = '/api/workout';

const workoutService = {
    // ── Exercises ─────────────────────────────────────────
    getExercises: (params = {}) =>
        axios.get(`${BASE}/exercises`, { params }),

    getAllExercises: () =>
        axios.get(`${BASE}/exercises/all`),

    getExerciseById: (id) =>
        axios.get(`${BASE}/exercises/${id}`),

    createExercise: (data) =>
        axios.post(`${BASE}/exercises`, data),

    updateExercise: (id, data) =>
        axios.put(`${BASE}/exercises/${id}`, data),

    deleteExercise: (id) =>
        axios.delete(`${BASE}/exercises/${id}`),

    // ── Workout Plans ─────────────────────────────────────
    getPlans: (params = {}) =>
        axios.get(`${BASE}/plans`, { params }),

    getPlanById: (id) =>
        axios.get(`${BASE}/plans/${id}`),

    createPlan: (data) =>
        axios.post(`${BASE}/plans`, data),

    updatePlan: (id, data) =>
        axios.put(`${BASE}/plans/${id}`, data),

    deletePlan: (id) =>
        axios.delete(`${BASE}/plans/${id}`),

    // ── Plan Exercises ────────────────────────────────────
    getPlanExercises: (planId) =>
        axios.get(`${BASE}/plans/${planId}/exercises`),

    addExerciseToPlan: (planId, data) =>
        axios.post(`${BASE}/plans/${planId}/exercises`, data),

    updatePlanExercise: (id, planId, data) =>
        axios.put(`${BASE}/plan-exercises/${id}`, { ...data, plan_id: planId }),

    removeExerciseFromPlan: (id, planId) =>
        axios.delete(`${BASE}/plan-exercises/${id}`, { params: { plan_id: planId } }),

    // ── Assignments ───────────────────────────────────────
    getAssignments: (params = {}) =>
        axios.get(`${BASE}/assignments`, { params }),

    getAssignmentById: (id) =>
        axios.get(`${BASE}/assignments/${id}`),

    getMemberAssignments: (memberId) =>
        axios.get(`${BASE}/assignments/member/${memberId}`),

    assignWorkout: (data) =>
        axios.post(`${BASE}/assignments`, data),

    updateAssignment: (id, data) =>
        axios.put(`${BASE}/assignments/${id}`, data),

    deleteAssignment: (id) =>
        axios.delete(`${BASE}/assignments/${id}`),

    // ── Stats ─────────────────────────────────────────────
    getDashboardStats: () =>
        axios.get(`${BASE}/stats/dashboard`),
};

export default workoutService;