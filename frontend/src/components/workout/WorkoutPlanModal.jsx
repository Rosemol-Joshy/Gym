// frontend/src/components/workout/WorkoutPlanModal.jsx
// Create or edit a workout plan. Receives optional `plan` prop for edit mode.

import { useState, useEffect } from 'react';
import workoutService from '../../services/workoutService';

const GOALS       = ['Weight Loss','Muscle Gain','Endurance','Flexibility','General Fitness','Strength'];
const DIFFICULTIES = ['Beginner','Intermediate','Advanced'];

export default function WorkoutPlanModal({ plan, onClose, onSuccess, showToast }) {
    const isEdit = Boolean(plan);

    const [form, setForm] = useState({
        name:           '',
        description:    '',
        goal:           'General Fitness',
        difficulty:     'Beginner',
        duration_weeks: 4,
        days_per_week:  3,
    });
    const [loading, setLoading] = useState(false);

    // Pre-fill on edit
    useEffect(() => {
        if (plan) {
            setForm({
                name:           plan.name           || '',
                description:    plan.description    || '',
                goal:           plan.goal           || 'General Fitness',
                difficulty:     plan.difficulty     || 'Beginner',
                duration_weeks: plan.duration_weeks || 4,
                days_per_week:  plan.days_per_week  || 3,
            });
        }
    }, [plan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) return showToast('Plan name is required.', 'error');
        if (!form.goal)        return showToast('Goal is required.', 'error');

        setLoading(true);
        try {
            if (isEdit) {
                await workoutService.updatePlan(plan.id, form);
            } else {
                await workoutService.createPlan(form);
            }
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save plan.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        {isEdit ? '✏️ Edit Workout Plan' : '+ New Workout Plan'}
                    </h2>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Body */}
                <div style={styles.body}>
                    {/* Name */}
                    <div style={styles.field}>
                        <label style={styles.label}>Plan Name *</label>
                        <input
                            name="name"
                            style={styles.input}
                            placeholder="e.g. 12-Week Strength Builder"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Description */}
                    <div style={styles.field}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            style={styles.textarea}
                            placeholder="Briefly describe this workout plan…"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Goal */}
                    <div style={styles.field}>
                        <label style={styles.label}>Goal *</label>
                        <select name="goal" style={styles.select} value={form.goal} onChange={handleChange}>
                            {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    {/* Difficulty */}
                    <div style={styles.field}>
                        <label style={styles.label}>Difficulty *</label>
                        <div style={styles.radioGroup}>
                            {DIFFICULTIES.map(d => (
                                <label key={d} style={{
                                    ...styles.radioLabel,
                                    ...(form.difficulty === d ? styles.radioLabelActive : {}),
                                }}>
                                    <input
                                        type="radio"
                                        name="difficulty"
                                        value={d}
                                        checked={form.difficulty === d}
                                        onChange={handleChange}
                                        style={{ display: 'none' }}
                                    />
                                    {d}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Duration & days */}
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Duration (weeks) *</label>
                            <input
                                type="number"
                                name="duration_weeks"
                                min={1} max={52}
                                style={styles.input}
                                value={form.duration_weeks}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Days per Week *</label>
                            <input
                                type="number"
                                name="days_per_week"
                                min={1} max={7}
                                style={styles.input}
                                value={form.days_per_week}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Plan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(2px)',
    },
    modal: {
        background: '#27272A', borderRadius: '1rem', width: '100%',
        maxWidth: '520px', border: '1px solid #3F3F46',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 1.5rem', borderBottom: '1px solid #3F3F46',
    },
    title:    { margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#F4F4F5' },
    closeBtn: { background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: '1.1rem' },
    body: {
        padding: '1.5rem', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '1.1rem',
    },
    field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    row:   { display: 'flex', gap: '1rem' },
    label: {
        color: '#A1A1AA', fontSize: '0.78rem', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.05em',
    },
    input: {
        width: '100%', background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.5rem',
        padding: '0.65rem 0.875rem', fontSize: '0.875rem',
        outline: 'none', boxSizing: 'border-box',
    },
    textarea: {
        width: '100%', background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.5rem',
        padding: '0.65rem 0.875rem', fontSize: '0.875rem',
        outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
    },
    select: {
        width: '100%', background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.5rem',
        padding: '0.65rem 0.875rem', fontSize: '0.875rem', outline: 'none',
    },
    radioGroup: { display: 'flex', gap: '0.5rem' },
    radioLabel: {
        flex: 1, textAlign: 'center', padding: '0.5rem',
        background: '#18181B', color: '#A1A1AA',
        border: '1px solid #3F3F46', borderRadius: '0.5rem',
        cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
        transition: 'all 0.15s',
    },
    radioLabelActive: {
        background: 'rgba(225,29,72,0.12)', color: '#E11D48',
        border: '1px solid rgba(225,29,72,0.4)',
    },
    footer: {
        display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
        padding: '1.25rem 1.5rem', borderTop: '1px solid #3F3F46',
    },
    cancelBtn: {
        background: 'transparent', color: '#A1A1AA', border: '1px solid #3F3F46',
        borderRadius: '0.5rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 500,
    },
    submitBtn: {
        background: '#E11D48', color: '#fff', border: 'none',
        borderRadius: '0.5rem', padding: '0.6rem 1.5rem',
        cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
    },
};
