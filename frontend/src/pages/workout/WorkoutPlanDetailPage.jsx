// frontend/src/pages/workout/WorkoutPlanDetailPage.jsx
// Shows full plan details: metadata, exercises grouped by day, and assignment management.

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import workoutService from '../../services/workoutService';
import AddExerciseModal  from '../../components/workout/AddExerciseModal';
import AssignWorkoutModal from '../../components/workout/AssignWorkoutModal';

const DIFFICULTY_COLOR = {
    Beginner:     { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
    Intermediate: { bg: 'rgba(234,179,8,0.12)',  color: '#eab308' },
    Advanced:     { bg: 'rgba(225,29,72,0.12)',  color: '#E11D48' },
};

export default function WorkoutPlanDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [plan,     setPlan]     = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [toast,    setToast]    = useState(null);
    const [showAddEx,    setShowAddEx]    = useState(false);
    const [showAssign,   setShowAssign]   = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadPlan = useCallback(() => {
        setLoading(true);
        workoutService.getPlanById(id)
            .then(r => setPlan(r.data.data))
            .catch(() => showToast('Failed to load plan.', 'error'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => { loadPlan(); }, [loadPlan]);

    const handleRemoveExercise = async (wpeId) => {
        if (!window.confirm('Remove this exercise from the plan?')) return;
        try {
            await workoutService.removeExerciseFromPlan(wpeId);
            showToast('Exercise removed.');
            loadPlan();
        } catch {
            showToast('Failed to remove exercise.', 'error');
        }
    };

    if (loading) return (
        <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={styles.spinner} />
        </div>
    );

    if (!plan) return (
        <div style={{ ...styles.page, textAlign: 'center', paddingTop: '4rem' }}>
            <p style={{ color: '#71717A' }}>Plan not found.</p>
            <button style={styles.btnGhost} onClick={() => navigate('/workout')}>← Back</button>
        </div>
    );

    // Group exercises by day
    const byDay = {};
    (plan.exercises || []).forEach(ex => {
        const d = ex.day_number;
        if (!byDay[d]) byDay[d] = [];
        byDay[d].push(ex);
    });

    const dc = DIFFICULTY_COLOR[plan.difficulty] || {};

    return (
        <div style={styles.page}>
            {toast && (
                <div style={{ ...styles.toast, background: toast.type === 'error' ? '#7f1d1d' : '#14532d' }}>
                    <span>{toast.type === 'error' ? '✕' : '✓'}</span> {toast.message}
                </div>
            )}

            {/* Back */}
            <button style={styles.backBtn} onClick={() => navigate('/workout')}>← Back to Plans</button>

            {/* Header */}
            <div style={styles.planHeader}>
                <div style={{ flex: 1 }}>
                    <div style={styles.planMeta}>
                        <span style={{ ...styles.badge, ...dc }}>
                            {plan.difficulty}
                        </span>
                        <span style={styles.metaText}>📅 {plan.duration_weeks} weeks</span>
                        <span style={styles.metaText}>📆 {plan.days_per_week} days/week</span>
                        {plan.created_by_name && (
                            <span style={styles.metaText}>👤 {plan.created_by_name}</span>
                        )}
                    </div>
                    <h1 style={styles.planName}>{plan.name}</h1>
                    <div style={styles.goalBadge}>🎯 {plan.goal}</div>
                    {plan.description && <p style={styles.planDesc}>{plan.description}</p>}
                </div>
                <div style={styles.planActions}>
                    <button style={styles.btnSecondary} onClick={() => setShowAssign(true)}>
                        📋 Assign to Member
                    </button>
                    <button style={styles.btnPrimary} onClick={() => setShowAddEx(true)}>
                        + Add Exercise
                    </button>
                </div>
            </div>

            {/* Exercise count banner */}
            <div style={styles.exBanner}>
                <span style={styles.exCount}>{plan.exercises?.length || 0}</span>
                <span style={{ color: '#A1A1AA' }}>exercises across {Object.keys(byDay).length} training days</span>
            </div>

            {/* Exercises by day */}
            {Object.keys(byDay).length === 0 ? (
                <div style={styles.emptyEx}>
                    <span style={{ fontSize: '2.5rem' }}>🏋️</span>
                    <p style={{ color: '#71717A', margin: 0 }}>No exercises added yet.</p>
                    <button style={styles.btnPrimary} onClick={() => setShowAddEx(true)}>Add First Exercise</button>
                </div>
            ) : (
                Object.keys(byDay).sort((a, b) => a - b).map(day => (
                    <div key={day} style={styles.dayCard}>
                        <div style={styles.dayHeader}>
                            <div style={styles.dayBadge}>Day {day}</div>
                            <span style={styles.dayCount}>{byDay[day].length} exercise{byDay[day].length !== 1 ? 's' : ''}</span>
                        </div>
                        <div style={styles.exerciseList}>
                            {byDay[day].map((ex, idx) => (
                                <div key={ex.id} style={styles.exerciseRow}>
                                    <div style={styles.exOrder}>{idx + 1}</div>
                                    <div style={styles.exInfo}>
                                        <div style={styles.exName}>{ex.exercise_name}</div>
                                        <div style={styles.exMeta}>
                                            <span style={styles.exTag}>{ex.category}</span>
                                            <span style={styles.exTag}>{ex.muscle_group}</span>
                                            <span style={styles.exTag}>{ex.equipment}</span>
                                        </div>
                                    </div>
                                    <div style={styles.exStats}>
                                        <div style={styles.exStat}>
                                            <span style={styles.exStatLabel}>Sets</span>
                                            <span style={styles.exStatValue}>{ex.sets}</span>
                                        </div>
                                        {ex.reps && (
                                            <div style={styles.exStat}>
                                                <span style={styles.exStatLabel}>Reps</span>
                                                <span style={styles.exStatValue}>{ex.reps}</span>
                                            </div>
                                        )}
                                        {ex.duration_secs && (
                                            <div style={styles.exStat}>
                                                <span style={styles.exStatLabel}>Time</span>
                                                <span style={styles.exStatValue}>{ex.duration_secs}s</span>
                                            </div>
                                        )}
                                        <div style={styles.exStat}>
                                            <span style={styles.exStatLabel}>Rest</span>
                                            <span style={styles.exStatValue}>{ex.rest_secs}s</span>
                                        </div>
                                    </div>
                                    <button
                                        style={styles.removeBtn}
                                        onClick={() => handleRemoveExercise(ex.id)}
                                        title="Remove exercise"
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Modals */}
            {showAddEx && (
                <AddExerciseModal
                    planId={id}
                    daysPerWeek={plan.days_per_week}
                    onClose={() => setShowAddEx(false)}
                    onSuccess={() => { setShowAddEx(false); showToast('Exercise added.'); loadPlan(); }}
                    showToast={showToast}
                />
            )}
            {showAssign && (
                <AssignWorkoutModal
                    plan={plan}
                    onClose={() => setShowAssign(false)}
                    onSuccess={() => { setShowAssign(false); showToast('Workout assigned successfully!'); }}
                    showToast={showToast}
                />
            )}
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#18181B', color: '#F4F4F5', padding: '2rem', fontFamily: "'Inter', sans-serif", position: 'relative' },
    spinner: { width: 40, height: 40, borderRadius: '50%', border: '4px solid #3F3F46', borderTopColor: '#E11D48', animation: 'spin 0.8s linear infinite' },
    backBtn: { background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: '0.875rem', padding: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' },
    planHeader: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', background: '#27272A', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #3F3F46' },
    planMeta: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.5rem' },
    planName: { margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: 700, color: '#F4F4F5' },
    goalBadge: { display: 'inline-block', background: 'rgba(225,29,72,0.1)', color: '#E11D48', borderRadius: '9999px', padding: '0.3rem 0.875rem', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' },
    planDesc: { color: '#A1A1AA', margin: 0, lineHeight: 1.6 },
    metaText: { color: '#71717A', fontSize: '0.85rem' },
    badge: { display: 'inline-block', borderRadius: '9999px', padding: '0.25rem 0.75rem', fontSize: '0.78rem', fontWeight: 600 },
    planActions: { display: 'flex', gap: '0.75rem', flexDirection: 'column', justifyContent: 'flex-start' },
    btnPrimary:   { background: '#E11D48', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' },
    btnSecondary: { background: '#3F3F46', color: '#F4F4F5', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' },
    btnGhost:     { background: 'transparent', color: '#A1A1AA', border: '1px solid #3F3F46', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' },
    exBanner: { background: '#27272A', border: '1px solid #3F3F46', borderRadius: '0.5rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' },
    exCount: { color: '#E11D48', fontWeight: 700, fontSize: '1.25rem' },
    emptyEx: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', gap: '1rem', background: '#27272A', borderRadius: '0.75rem', border: '1px solid #3F3F46' },
    dayCard: { background: '#27272A', borderRadius: '0.75rem', border: '1px solid #3F3F46', marginBottom: '1.25rem', overflow: 'hidden' },
    dayHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #3F3F46' },
    dayBadge: { background: '#E11D48', color: '#fff', borderRadius: '0.375rem', padding: '0.25rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 },
    dayCount: { color: '#71717A', fontSize: '0.85rem' },
    exerciseList: { padding: '0.5rem 0' },
    exerciseRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid #3F3F4650', flexWrap: 'wrap' },
    exOrder: { width: 28, height: 28, borderRadius: '50%', background: '#3F3F46', color: '#A1A1AA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 },
    exInfo: { flex: 1, minWidth: '150px' },
    exName: { fontWeight: 600, color: '#F4F4F5', marginBottom: '0.3rem' },
    exMeta: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
    exTag: { background: '#3F3F46', color: '#A1A1AA', borderRadius: '9999px', padding: '0.15rem 0.5rem', fontSize: '0.72rem' },
    exStats: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
    exStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem' },
    exStatLabel: { color: '#71717A', fontSize: '0.7rem', textTransform: 'uppercase' },
    exStatValue: { color: '#F4F4F5', fontWeight: 700, fontSize: '0.95rem' },
    removeBtn: { background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem', borderRadius: '0.25rem', flexShrink: 0 },
    toast: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', color: '#fff', borderRadius: '0.5rem', padding: '0.75rem 1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'center', fontWeight: 500, fontSize: '0.9rem', zIndex: 9999, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' },
};
