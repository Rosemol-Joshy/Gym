// frontend/src/components/attendance/ManualEntryModal.jsx
// Allows admin to manually add an attendance record with full date/time control.

import { useState, useEffect } from 'react';
import axios from 'axios';
import attendanceService from '../../services/attendanceService';

const todayStr = () => new Date().toISOString().split('T')[0];
const nowTimeStr = () => new Date().toTimeString().slice(0, 5);

export default function ManualEntryModal({ onClose, onSuccess, showToast }) {
    const [members,  setMembers]  = useState([]);
    const [query,    setQuery]    = useState('');
    const [selected, setSelected] = useState(null);
    const [dropdown, setDropdown] = useState([]);
    const [searching,setSearching]= useState(false);
    const [loading,  setLoading]  = useState(false);

    const [form, setForm] = useState({
        date:       todayStr(),
        check_in:   nowTimeStr(),
        check_out:  '',
        notes:      '',
    });

    // debounced member search
    useEffect(() => {
        if (query.length < 2) { setDropdown([]); return; }
        const t = setTimeout(() => {
            setSearching(true);
            axios.get('/api/members', { params: { search: query, limit: 8 } })
                .then(r => setDropdown(r.data.data?.rows || r.data.data || []))
                .catch(() => setDropdown([]))
                .finally(() => setSearching(false));
        }, 350);
        return () => clearTimeout(t);
    }, [query]);

    const handleSelect = (m) => {
        setSelected(m);
        setQuery(`${m.first_name} ${m.last_name}`);
        setDropdown([]);
    };

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const buildDateTime = (date, time) => time ? `${date} ${time}:00` : null;

    const handleSubmit = async () => {
        if (!selected) return showToast('Please select a member.', 'error');
        if (!form.date || !form.check_in) return showToast('Date and check-in time are required.', 'error');

        setLoading(true);
        try {
            await attendanceService.createManual({
                member_id: selected.id,
                date:      form.date,
                check_in:  buildDateTime(form.date, form.check_in),
                check_out: form.check_out ? buildDateTime(form.date, form.check_out) : null,
                notes:     form.notes,
            });
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create record.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>📋 Manual Attendance Entry</h2>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div style={styles.body}>
                    {/* Member search */}
                    <div style={styles.field}>
                        <label style={styles.label}>Member *</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                style={styles.input}
                                placeholder="Search by name or email…"
                                value={query}
                                onChange={e => { setQuery(e.target.value); setSelected(null); }}
                            />
                            {searching && <span style={styles.spinnerIcon}>⏳</span>}
                        </div>
                        {dropdown.length > 0 && (
                            <div style={styles.dropdown}>
                                {dropdown.map(m => (
                                    <div
                                        key={m.id}
                                        style={styles.dropdownItem}
                                        onClick={() => handleSelect(m)}
                                        onMouseEnter={e => e.currentTarget.style.background = '#3F3F46'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={styles.dropdownInitial}>
                                            {m.first_name?.charAt(0)}
                                        </span>
                                        <span style={styles.dropdownName}>{m.first_name} {m.last_name}</span>
                                        <span style={styles.dropdownEmail}>{m.email}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {selected && (
                            <div style={styles.selectedChip}>
                                ✓ {selected.first_name} {selected.last_name}
                            </div>
                        )}
                    </div>

                    {/* Date */}
                    <div style={styles.field}>
                        <label style={styles.label}>Date *</label>
                        <input
                            type="date" name="date" style={styles.input}
                            value={form.date} onChange={handleChange}
                        />
                    </div>

                    {/* Times */}
                    <div style={styles.row}>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Check-In Time *</label>
                            <input
                                type="time" name="check_in" style={styles.input}
                                value={form.check_in} onChange={handleChange}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Check-Out Time</label>
                            <input
                                type="time" name="check_out" style={styles.input}
                                value={form.check_out} onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div style={styles.field}>
                        <label style={styles.label}>Notes</label>
                        <textarea
                            name="notes" rows={2} style={styles.textarea}
                            placeholder="Optional notes…"
                            value={form.notes} onChange={handleChange}
                        />
                    </div>
                </div>

                <div style={styles.footer}>
                    <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? 'Saving…' : '+ Save Record'}
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
    body:     { padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' },
    field:    { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    row:      { display: 'flex', gap: '1rem' },
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
    spinnerIcon: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' },
    dropdown: {
        background: '#18181B', border: '1px solid #3F3F46', borderRadius: '0.5rem',
        marginTop: '0.25rem', overflow: 'hidden', maxHeight: '200px', overflowY: 'auto',
    },
    dropdownItem: {
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.65rem 1rem', cursor: 'pointer', transition: 'background 0.15s',
    },
    dropdownInitial: {
        width: 28, height: 28, borderRadius: '50%', background: '#E11D4820',
        color: '#E11D48', fontWeight: 700, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0,
    },
    dropdownName:  { color: '#F4F4F5', fontWeight: 600, fontSize: '0.85rem', flex: 1 },
    dropdownEmail: { color: '#71717A', fontSize: '0.78rem' },
    selectedChip: {
        display: 'inline-block', background: 'rgba(34,197,94,0.12)',
        color: '#22c55e', borderRadius: '9999px',
        padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.4rem',
    },
    footer: {
        display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
        padding: '1.25rem 1.5rem', borderTop: '1px solid #3F3F46',
    },
    cancelBtn: {
        background: 'transparent', color: '#A1A1AA', border: '1px solid #3F3F46',
        borderRadius: '0.5rem', padding: '0.6rem 1.25rem', cursor: 'pointer',
    },
    submitBtn: {
        background: '#E11D48', color: '#fff', border: 'none',
        borderRadius: '0.5rem', padding: '0.6rem 1.5rem',
        cursor: 'pointer', fontWeight: 700,
    },
};
