// frontend/src/components/workout/AddExerciseModal.jsx
// Pick an exercise from the library and configure sets/reps/day for the plan.

import { useState, useEffect } from 'react';
import workoutService from '../../services/workoutService';

export default function AddExerciseModal({ planId, daysPerWeek, onClose, onSuccess, showToast }) {
    const [exercises,  setExercises]  = useState([]);
    const [filtered,   setFiltered]   = useState([]);
    const [search,     setSearch]     = useState('');
    const [catFilter,  setCatFilter]  = useState('');
    const [selected,   setSelected]   = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [saving,     setSaving]     = useState(false);

    const [form, setForm] = useState({
        sets:          3,
        reps:          10,
        duration_secs: '',
        rest_secs:     60,
        day_number:    1,
        order_index:   1,
        notes:         '',
        is_timed:      false,
    });

    // Load all exercises once
    useEffect(() => {
        workoutService.getAllExercises()
            .then(r => {
                setExercises(r.data.data);
                setFiltered(r.data.data);
            })
            .catch(() => showToast('Failed to load exercises.', 'error'))
            .finally(() => setLoading(false));
    }, []);

    // Filter on search/cat change
    useEffect(() => {
        let list = exercises;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(e =>
                e.name.toLowerCase().includes(q) ||
                (e.muscle_group || '').toLowerCase().includes(q)
            );
        }
        if (catFilter) {
            list = list.filter(e => e.category === catFilter);
        }
        setFiltered(list);
    }, [search, catFilter, exercises]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async () => {
        if (!selected) return showToast('Please select an exercise.', 'error');

        setSaving(true);
        try {
            await workoutService.addExerciseToPlan(planId, {
                exercise_id:   selected.id,
                sets:          Number(form.sets),
                reps:          form.is_timed ? null : Number(form.reps),
                duration_secs: form.is_timed ? Number(form.duration_secs) : null,
                rest_secs:     Number(form.rest_secs),
                day_number:    Number(form.day_number),
                order_index:   Number(form.order_index),
                notes:         form.notes,
            });
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to add exercise.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Build unique category list from loaded exercises
    const categories = [...new Set(exercises.map(e => e.category))].sort();

    // Build day options based on plan
    const dayOptions = Array.from({ length: daysPerWeek || 7 }, (_, i) => i + 1);

    const DIFF_COLOR = { Beginner: '#22c55e', Intermediate: '#eab308', Advanced: '#E11D48' };

    return (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>+ Add Exercise to Plan</h2>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.body}>
                    {/* Left: exercise picker */}
                    <div style={styles.pickerPane}>
                        <div style={styles.pickerHeader}>
                            <input
                                style={styles.searchInput}
                                placeholder="🔍 Search exercises…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <select
                                style={styles.catSelect}
                                value={catFilter}
                                onChange={e => setCatFilter(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {loading ? (
                            <div style={styles.center}><div style={styles.spinner} /></div>
                        ) : (
                            <div style={styles.exerciseList}>
                                {filtered.length === 0 && (
                                    <p style={{ color: '#71717A', textAlign: 'center', padding: '1rem' }}>No exercises found.</p>
                                )}
                                {filtered.map(ex => (
                                    <div
                                        key={ex.id}
                                        style={{
                                            ...styles.exerciseItem,
                                            ...(selected?.id === ex.id ? styles.exerciseItemActive : {}),
                                        }}
                                        onClick={() => setSelected(ex)}
                                    >
                                        <div style={styles.exItemLeft}>
                                            <div style={styles.exItemName}>{ex.name}</div>
                                            <div style={styles.exItemMeta}>
                                                {ex.category}
                                                {ex.muscle_group ? ` · ${ex.muscle_group}` : ''}
                                            </div>
                                        </div>
                                        <span style={{
                                            ...styles.diffDot,
                                            background: DIFF_COLOR[ex.difficulty] + '20',
                                            color: DIFF_COLOR[ex.difficulty],
                                        }}>
                                            {ex.difficulty}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: configuration */}
                    <div style={styles.configPane}>
                        {!selected ? (
                            <div style={styles.noSelection}>
                                <span style={{ fontSize: '2rem' }}>👈</span>
                                <p style={{ color: '#71717A', margin: 0, textAlign: 'center' }}>
                                    Select an exercise from the list
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Selected preview */}
                                <div style={styles.selectedPreview}>
                                    <div style={styles.selectedName}>{selected.name}</div>
                                    <div style={styles.selectedMeta}>
                                        {selected.category}
                                        {selected.muscle_group ? ` · ${selected.muscle_group}` : ''}
                                        {selected.equipment ? ` · ${selected.equipment}` : ''}
                                    </div>
                                </div>

                                {/* Day + Order */}
                                <div style={styles.configRow}>
                                    <div style={styles.configField}>
                                        <label style={styles.cfgLabel}>Training Day</label>
                                        <select name="day_number" style={styles.cfgSelect} value={form.day_number} onChange={handleChange}>
                                            {dayOptions.map(d => <option key={d} value={d}>Day {d}</option>)}
                                        </select>
                                    </div>
                                    <div style={styles.configField}>
                                        <label style={styles.cfgLabel}>Order #</label>
                                        <input type="number" name="order_index" min={1} style={styles.cfgInput}
                                            value={form.order_index} onChange={handleChange} />
                                    </div>
                                </div>

                                {/* Sets */}
                                <div style={styles.configField}>
                                    <label style={styles.cfgLabel}>Sets</label>
                                    <input type="number" name="sets" min={1} style={styles.cfgInput}
                                        value={form.sets} onChange={handleChange} />
                                </div>

                                {/* Timed toggle */}
                                <label style={styles.toggleRow}>
                                    <input
                                        type="checkbox"
                                        name="is_timed"
                                        checked={form.is_timed}
                                        onChange={handleChange}
                                        style={styles.checkbox}
                                    />
                                    <span style={{ color: '#A1A1AA', fontSize: '0.85rem' }}>
                                        Timed exercise (duration instead of reps)
                                    </span>
                                </label>

                                {/* Reps or Duration */}
                                {form.is_timed ? (
                                    <div style={styles.configField}>
                                        <label style={styles.cfgLabel}>Duration (seconds)</label>
                                        <input type="number" name="duration_secs" min={1} style={styles.cfgInput}
                                            placeholder="e.g. 45"
                                            value={form.duration_secs} onChange={handleChange} />
                                    </div>
                                ) : (
                                    <div style={styles.configField}>
                                        <label style={styles.cfgLabel}>Reps per Set</label>
                                        <input type="number" name="reps" min={1} style={styles.cfgInput}
                                            value={form.reps} onChange={handleChange} />
                                    </div>
                                )}

                                {/* Rest */}
                                <div style={styles.configField}>
                                    <label style={styles.cfgLabel}>Rest Between Sets (seconds)</label>
                                    <input type="number" name="rest_secs" min={0} style={styles.cfgInput}
                                        value={form.rest_secs} onChange={handleChange} />
                                </div>

                                {/* Notes */}
                                <div style={styles.configField}>
                                    <label style={styles.cfgLabel}>Notes (optional)</label>
                                    <textarea
                                        name="notes" rows={2} style={styles.cfgTextarea}
                                        placeholder="e.g. Focus on form, slow eccentric…"
                                        value={form.notes} onChange={handleChange}
                                    />
                                </div>

                                {/* Summary chip */}
                                <div style={styles.summaryChip}>
                                    {form.sets} sets ×{' '}
                                    {form.is_timed
                                        ? `${form.duration_secs || '?'}s`
                                        : `${form.reps || '?'} reps`
                                    }
                                    {' '}· {form.rest_secs}s rest · Day {form.day_number}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        style={{
                            ...styles.submitBtn,
                            opacity: (!selected || saving) ? 0.5 : 1,
                        }}
                        disabled={!selected || saving}
                        onClick={handleSubmit}
                    >
                        {saving ? 'Adding…' : '+ Add to Plan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(2px)',
    },
    modal: {
        background: '#27272A', borderRadius: '1rem', width: '100%',
        maxWidth: '860px', border: '1px solid #3F3F46',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', maxHeight: '92vh',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 1.5rem', borderBottom: '1px solid #3F3F46', flexShrink: 0,
    },
    title:    { margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#F4F4F5' },
    closeBtn: { background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: '1.1rem' },
    body: {
        display: 'flex', flex: 1, overflow: 'hidden',
    },
    // Left pane
    pickerPane: {
        width: '55%', borderRight: '1px solid #3F3F46',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
    },
    pickerHeader: {
        padding: '1rem', display: 'flex', gap: '0.5rem', flexShrink: 0,
        borderBottom: '1px solid #3F3F46',
    },
    searchInput: {
        flex: 1, background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.5rem',
        padding: '0.55rem 0.75rem', fontSize: '0.85rem', outline: 'none',
    },
    catSelect: {
        background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.5rem',
        padding: '0.55rem 0.5rem', fontSize: '0.82rem', outline: 'none',
    },
    exerciseList: { overflowY: 'auto', flex: 1, padding: '0.5rem' },
    exerciseItem: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.75rem 0.875rem', borderRadius: '0.5rem',
        cursor: 'pointer', transition: 'background 0.15s', marginBottom: '0.25rem',
        border: '1px solid transparent',
    },
    exerciseItemActive: {
        background: 'rgba(225,29,72,0.08)',
        border: '1px solid rgba(225,29,72,0.3)',
    },
    exItemLeft:  { flex: 1 },
    exItemName:  { fontWeight: 600, color: '#F4F4F5', fontSize: '0.875rem' },
    exItemMeta:  { color: '#71717A', fontSize: '0.78rem', marginTop: '0.1rem' },
    diffDot: {
        borderRadius: '9999px', padding: '0.15rem 0.5rem',
        fontSize: '0.7rem', fontWeight: 600, flexShrink: 0, marginLeft: '0.5rem',
    },
    // Right pane
    configPane: {
        flex: 1, overflowY: 'auto', padding: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.9rem',
    },
    noSelection: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', flex: 1, gap: '0.75rem', height: '100%',
    },
    selectedPreview: {
        background: '#18181B', borderRadius: '0.5rem',
        padding: '0.875rem 1rem', border: '1px solid rgba(225,29,72,0.25)',
    },
    selectedName: { fontWeight: 700, color: '#F4F4F5', fontSize: '1rem', marginBottom: '0.25rem' },
    selectedMeta: { color: '#71717A', fontSize: '0.82rem' },
    configRow:   { display: 'flex', gap: '0.75rem' },
    configField: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
    cfgLabel: {
        color: '#A1A1AA', fontSize: '0.75rem', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.04em',
    },
    cfgInput: {
        background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.375rem',
        padding: '0.55rem 0.75rem', fontSize: '0.875rem', outline: 'none',
        width: '100%', boxSizing: 'border-box',
    },
    cfgSelect: {
        background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.375rem',
        padding: '0.55rem 0.75rem', fontSize: '0.875rem', outline: 'none',
        width: '100%',
    },
    cfgTextarea: {
        background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.375rem',
        padding: '0.55rem 0.75rem', fontSize: '0.875rem', outline: 'none',
        resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
    },
    toggleRow: {
        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
    },
    checkbox: { accentColor: '#E11D48', width: 16, height: 16, cursor: 'pointer' },
    summaryChip: {
        background: 'rgba(225,29,72,0.1)', color: '#E11D48',
        borderRadius: '0.5rem', padding: '0.5rem 0.875rem',
        fontSize: '0.82rem', fontWeight: 600, textAlign: 'center',
        border: '1px solid rgba(225,29,72,0.2)',
    },
    // Footer
    footer: {
        display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
        padding: '1.25rem 1.5rem', borderTop: '1px solid #3F3F46', flexShrink: 0,
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
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' },
    spinner: {
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid #3F3F46', borderTopColor: '#E11D48',
        animation: 'spin 0.8s linear infinite',
    },
};
