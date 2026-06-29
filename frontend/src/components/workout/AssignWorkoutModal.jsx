// frontend/src/components/workout/AssignWorkoutModal.jsx
// Assign a workout plan to a member. Can be launched with a pre-selected plan,
// or allow the user to choose both a member and a plan.

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import workoutService from '../../services/workoutService';

const todayStr = () => new Date().toISOString().split('T')[0];

export default function AssignWorkoutModal({ plan, onClose, onSuccess, showToast }) {
    // If `plan` prop provided, it's pre-selected (from plan detail page)
    const [plans,       setPlans]       = useState([]);
    const [selectedPlan,setSelectedPlan]= useState(plan || null);

    const [memberQuery, setMemberQuery] = useState('');
    const [members,     setMembers]     = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [searching,   setSearching]   = useState(false);

    const [form, setForm] = useState({
        start_date: todayStr(),
        end_date:   '',
        notes:      '',
    });
    const [saving, setSaving] = useState(false);
    const memberRef = useRef(null);

    // Load plans for dropdown (only when no plan pre-selected)
    useEffect(() => {
        if (!plan) {
            workoutService.getPlans({ limit: 100 })
                .then(r => setPlans(r.data.data.rows))
                .catch(console.error);
        }
    }, [plan]);

    // Auto-focus member search
    useEffect(() => { memberRef.current?.focus(); }, []);

    // Debounced member search
    useEffect(() => {
        if (memberQuery.length < 2) { setMembers([]); return; }
        const t = setTimeout(() => {
            setSearching(true);
            axios.get('/api/members', { params: { search: memberQuery, limit: 8 } })
                .then(r => setMembers(r.data.data?.rows || r.data.data || []))
                .catch(() => setMembers([]))
                .finally(() => setSearching(false));
        }, 350);
        return () => clearTimeout(t);
    }, [memberQuery]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        if (!selectedMember) return showToast('Please select a member.', 'error');
        if (!selectedPlan)   return showToast('Please select a workout plan.', 'error');
        if (!form.start_date) return showToast('Start date is required.', 'error');

        setSaving(true);
        try {
            await workoutService.assignWorkout({
                member_id:      selectedMember.id,
                workout_plan_id: selectedPlan.id,
                start_date:     form.start_date,
                end_date:       form.end_date || null,
                notes:          form.notes,
            });
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to assign workout.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>📋 Assign Workout Plan</h2>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.body}>
                    {/* Plan (pre-selected or dropdown) */}
                    {plan ? (
                        <div style={styles.planPreview}>
                            <div style={styles.planPreviewLabel}>Workout Plan</div>
                            <div style={styles.planPreviewName}>{plan.name}</div>
                            <div style={styles.planPreviewMeta}>{plan.goal} · {plan.difficulty} · {plan.duration_weeks}w</div>
                        </div>
                    ) : (
                        <div style={styles.field}>
                            <label style={styles.label}>Workout Plan *</label>
                            <select
                                style={styles.input}
                                value={selectedPlan?.id || ''}
                                onChange={e => {
                                    const found = plans.find(p => p.id === Number(e.target.value));
                                    setSelectedPlan(found || null);
                                }}
                            >
                                <option value="">-- Select a plan --</option>
                                {plans.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.goal} · {p.difficulty})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Member search */}
                    <div style={styles.field}>
                        <label style={styles.label}>Member *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                ref={memberRef}
                                style={styles.input}
                                placeholder="Search member by name or email…"
                                value={memberQuery}
                                onChange={e => { setMemberQuery(e.target.value); setSelectedMember(null); }}
                            />
                            {searching && <span style={styles.spinIcon}>⏳</span>}
                        </div>

                        {/* Dropdown */}
                        {members.length > 0 && (
                            <div style={styles.dropdown}>
                                {members.map(m => (
                                    <div
                                        key={m.id}
                                        style={styles.dropdownItem}
                                        onClick={() => {
                                            setSelectedMember(m);
                                            setMemberQuery(`${m.first_name} ${m.last_name}`);
                                            setMembers([]);
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#3F3F46'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={styles.dropdownAvatar}>
                                            {m.first_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={styles.dropdownName}>{m.first_name} {m.last_name}</div>
                                            <div style={styles.dropdownEmail}>{m.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Selected chip */}
                        {selectedMember && (
                            <div style={styles.selectedChip}>
                                ✓ {selectedMember.first_name} {selectedMember.last_name} · {selectedMember.email}
                            </div>
                        )}
                    </div>

                    {/* Dates */}
                    <div style={styles.row}>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>Start Date *</label>
                            <input
                                type="date" name="start_date" style={styles.input}
                                value={form.start_date} onChange={handleChange}
                            />
                        </div>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>End Date (optional)</label>
                            <input
                                type="date" name="end_date" style={styles.input}
                                value={form.end_date} onChange={handleChange}
                                min={form.start_date}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div style={styles.field}>
                        <label style={styles.label}>Notes (optional)</label>
                        <textarea
                            name="notes" rows={2} style={styles.textarea}
                            placeholder="Any special instructions for this member…"
                            value={form.notes} onChange={handleChange}
                        />
                    </div>

                    {/* Preview summary */}
                    {selectedMember && selectedPlan && (
                        <div style={styles.summary}>
                            <div style={styles.summaryTitle}>Assignment Summary</div>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryKey}>Member</span>
                                <span style={styles.summaryVal}>{selectedMember.first_name} {selectedMember.last_name}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryKey}>Plan</span>
                                <span style={styles.summaryVal}>{selectedPlan.name}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryKey}>Duration</span>
                                <span style={styles.summaryVal}>{selectedPlan.duration_weeks} weeks · {selectedPlan.days_per_week} days/week</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryKey}>Start</span>
                                <span style={styles.summaryVal}>{form.start_date}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        style={{ ...styles.submitBtn, opacity: (!selectedMember || !selectedPlan || saving) ? 0.5 : 1 }}
                        disabled={!selectedMember || !selectedPlan || saving}
                        onClick={handleSubmit}
                    >
                        {saving ? 'Assigning…' : '📋 Assign Workout'}
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
        maxWidth: '540px', border: '1px solid #3F3F46',
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
    planPreview: {
        background: 'rgba(225,29,72,0.06)', border: '1px solid rgba(225,29,72,0.2)',
        borderRadius: '0.5rem', padding: '0.875rem 1rem',
    },
    planPreviewLabel: { color: '#71717A', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem' },
    planPreviewName:  { color: '#F4F4F5', fontWeight: 700, fontSize: '1rem' },
    planPreviewMeta:  { color: '#A1A1AA', fontSize: '0.82rem', marginTop: '0.2rem' },
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
    spinIcon: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' },
    dropdown: {
        background: '#18181B', border: '1px solid #3F3F46', borderRadius: '0.5rem',
        marginTop: '0.25rem', overflow: 'hidden', maxHeight: '210px', overflowY: 'auto',
    },
    dropdownItem: {
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem', cursor: 'pointer', transition: 'background 0.15s',
    },
    dropdownAvatar: {
        width: 32, height: 32, borderRadius: '50%', background: '#E11D4820',
        color: '#E11D48', fontWeight: 700, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0,
    },
    dropdownName:  { color: '#F4F4F5', fontWeight: 600, fontSize: '0.875rem' },
    dropdownEmail: { color: '#71717A', fontSize: '0.78rem' },
    selectedChip: {
        background: 'rgba(34,197,94,0.1)', color: '#22c55e',
        borderRadius: '9999px', padding: '0.3rem 0.875rem',
        fontSize: '0.8rem', fontWeight: 600, display: 'inline-block', marginTop: '0.25rem',
    },
    summary: {
        background: '#18181B', borderRadius: '0.5rem',
        border: '1px solid #3F3F46', padding: '1rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
    },
    summaryTitle: { color: '#F4F4F5', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' },
    summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    summaryKey: { color: '#71717A', fontSize: '0.82rem' },
    summaryVal: { color: '#F4F4F5', fontSize: '0.82rem', fontWeight: 600 },
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
