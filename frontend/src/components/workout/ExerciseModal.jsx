// frontend/src/components/workout/ExerciseModal.jsx
// Create or edit a single exercise in the library.

import { useState, useEffect } from 'react';
import workoutService from '../../services/workoutService';

const CATEGORIES   = ['Chest','Back','Shoulders','Arms','Legs','Core','Cardio','Full Body','Flexibility'];
const DIFFICULTIES = ['Beginner','Intermediate','Advanced'];

export default function ExerciseModal({ exercise, onClose, onSuccess, showToast }) {
    const isEdit = Boolean(exercise);

    const [form, setForm] = useState({
        name:         '',
        category:     'Full Body',
        muscle_group: '',
        equipment:    '',
        difficulty:   'Beginner',
        description:  '',
        instructions: '',
        video_url:    '',
        image_url:    '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (exercise) {
            setForm({
                name:         exercise.name         || '',
                category:     exercise.category     || 'Full Body',
                muscle_group: exercise.muscle_group || '',
                equipment:    exercise.equipment    || '',
                difficulty:   exercise.difficulty   || 'Beginner',
                description:  exercise.description  || '',
                instructions: exercise.instructions || '',
                video_url:    exercise.video_url    || '',
                image_url:    exercise.image_url    || '',
            });
        }
    }, [exercise]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        if (!form.name.trim())  return showToast('Exercise name is required.', 'error');
        if (!form.category)     return showToast('Category is required.', 'error');
        if (!form.difficulty)   return showToast('Difficulty is required.', 'error');

        setLoading(true);
        try {
            if (isEdit) {
                await workoutService.updateExercise(exercise.id, form);
            } else {
                await workoutService.createExercise(form);
            }
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save exercise.', 'error');
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
                        {isEdit ? '✏️ Edit Exercise' : '+ New Exercise'}
                    </h2>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Body */}
                <div style={styles.body}>
                    {/* Name */}
                    <div style={styles.field}>
                        <label style={styles.label}>Exercise Name *</label>
                        <input
                            name="name"
                            style={styles.input}
                            placeholder="e.g. Barbell Back Squat"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Category + Difficulty */}
                    <div style={styles.row}>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Category *</label>
                            <select name="category" style={styles.select} value={form.category} onChange={handleChange}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Difficulty *</label>
                            <select name="difficulty" style={styles.select} value={form.difficulty} onChange={handleChange}>
                                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Muscle group + Equipment */}
                    <div style={styles.row}>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Muscle Group</label>
                            <input
                                name="muscle_group"
                                style={styles.input}
                                placeholder="e.g. Quadriceps, Glutes"
                                value={form.muscle_group}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Equipment</label>
                            <input
                                name="equipment"
                                style={styles.input}
                                placeholder="e.g. Barbell, Dumbbell"
                                value={form.equipment}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div style={styles.field}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            name="description"
                            rows={2}
                            style={styles.textarea}
                            placeholder="Short description of this exercise…"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Instructions */}
                    <div style={styles.field}>
                        <label style={styles.label}>Instructions</label>
                        <textarea
                            name="instructions"
                            rows={3}
                            style={styles.textarea}
                            placeholder="Step-by-step instructions for performing this exercise…"
                            value={form.instructions}
                            onChange={handleChange}
                        />
                    </div>

                    {/* URLs */}
                    <div style={styles.row}>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Image URL</label>
                            <input
                                name="image_url"
                                style={styles.input}
                                placeholder="https://…"
                                value={form.image_url}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Video URL</label>
                            <input
                                name="video_url"
                                style={styles.input}
                                placeholder="https://youtube.com/…"
                                value={form.video_url}
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
                        {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Exercise'}
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
        maxWidth: '580px', border: '1px solid #3F3F46',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', maxHeight: '92vh',
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
