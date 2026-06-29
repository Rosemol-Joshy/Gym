// frontend/src/components/attendance/CheckInModal.jsx
// Searches for a member by name/email, then performs check-in.

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import attendanceService from '../../services/attendanceService';

export default function CheckInModal({ onClose, onSuccess, showToast }) {
    const [query,    setQuery]    = useState('');
    const [members,  setMembers]  = useState([]);
    const [selected, setSelected] = useState(null);
    const [notes,    setNotes]    = useState('');
    const [loading,  setLoading]  = useState(false);
    const [searching,setSearching]= useState(false);
    const searchRef = useRef(null);

    // auto-focus
    useEffect(() => { searchRef.current?.focus(); }, []);

    // debounced member search (uses the members endpoint owned by the Members module)
    useEffect(() => {
        if (query.length < 2) { setMembers([]); return; }
        const t = setTimeout(() => {
            setSearching(true);
            axios.get('/api/members', { params: { search: query, limit: 8 } })
                .then(r => setMembers(r.data.data?.rows || r.data.data || []))
                .catch(() => setMembers([]))
                .finally(() => setSearching(false));
        }, 350);
        return () => clearTimeout(t);
    }, [query]);

    const handleSelect = (member) => {
        setSelected(member);
        setMembers([]);
        setQuery(`${member.first_name} ${member.last_name}`);
    };

    const handleCheckIn = async () => {
        if (!selected) return;
        setLoading(true);
        try {
            await attendanceService.checkIn(selected.id, notes);
            onSuccess();
        } catch (err) {
            showToast(err.response?.data?.message || 'Check-in failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>⚡ Member Check-In</h2>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Search */}
                <div style={styles.body}>
                    <label style={styles.label}>Search Member</label>
                    <div style={styles.searchWrapper}>
                        <input
                            ref={searchRef}
                            style={styles.input}
                            placeholder="Type name or email…"
                            value={query}
                            onChange={e => { setQuery(e.target.value); setSelected(null); }}
                        />
                        {searching && <span style={styles.spinner}>⏳</span>}
                    </div>

                    {/* Dropdown */}
                    {members.length > 0 && (
                        <div style={styles.dropdown}>
                            {members.map(m => (
                                <div
                                    key={m.id}
                                    style={styles.dropdownItem}
                                    onClick={() => handleSelect(m)}
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

                    {/* Selected member preview */}
                    {selected && (
                        <div style={styles.selectedCard}>
                            <div style={styles.selectedAvatar}>
                                {selected.first_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={styles.selectedName}>
                                    {selected.first_name} {selected.last_name}
                                </div>
                                <div style={styles.selectedEmail}>{selected.email}</div>
                            </div>
                            <span style={styles.selectedBadge}>✓ Selected</span>
                        </div>
                    )}

                    {/* Notes */}
                    <label style={{ ...styles.label, marginTop: '1rem' }}>Notes (optional)</label>
                    <textarea
                        style={styles.textarea}
                        placeholder="Any notes for this visit…"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                    />
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        style={{ ...styles.confirmBtn, opacity: (!selected || loading) ? 0.5 : 1 }}
                        disabled={!selected || loading}
                        onClick={handleCheckIn}
                    >
                        {loading ? 'Checking in…' : '⚡ Check In'}
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
        maxWidth: '480px', border: '1px solid #3F3F46',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh',
    },
    modalHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 1.5rem', borderBottom: '1px solid #3F3F46',
    },
    modalTitle: { margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#F4F4F5' },
    closeBtn: {
        background: 'none', border: 'none', color: '#71717A',
        cursor: 'pointer', fontSize: '1.1rem',
    },
    body: { padding: '1.5rem', overflowY: 'auto' },
    label: { display: 'block', color: '#A1A1AA', fontSize: '0.8rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' },
    searchWrapper: { position: 'relative' },
    input: {
        width: '100%', background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.5rem',
        padding: '0.65rem 0.875rem', fontSize: '0.9rem', outline: 'none',
        boxSizing: 'border-box',
    },
    spinner: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' },
    dropdown: {
        background: '#18181B', border: '1px solid #3F3F46', borderRadius: '0.5rem',
        marginTop: '0.25rem', overflow: 'hidden', maxHeight: '220px', overflowY: 'auto',
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
    selectedCard: {
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.3)',
        borderRadius: '0.5rem', padding: '0.875rem 1rem', marginTop: '0.75rem',
    },
    selectedAvatar: {
        width: 40, height: 40, borderRadius: '50%', background: '#E11D4830',
        color: '#E11D48', fontWeight: 700, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
    },
    selectedName:  { color: '#F4F4F5', fontWeight: 600, fontSize: '0.9rem' },
    selectedEmail: { color: '#A1A1AA', fontSize: '0.8rem' },
    selectedBadge: {
        marginLeft: 'auto', background: 'rgba(34,197,94,0.15)', color: '#22c55e',
        borderRadius: '9999px', padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: 600,
    },
    textarea: {
        width: '100%', background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.5rem',
        padding: '0.65rem 0.875rem', fontSize: '0.875rem', outline: 'none',
        resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit',
    },
    footer: {
        display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
        padding: '1.25rem 1.5rem', borderTop: '1px solid #3F3F46',
    },
    cancelBtn: {
        background: 'transparent', color: '#A1A1AA', border: '1px solid #3F3F46',
        borderRadius: '0.5rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 500,
    },
    confirmBtn: {
        background: '#E11D48', color: '#fff', border: 'none',
        borderRadius: '0.5rem', padding: '0.6rem 1.5rem',
        cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
    },
};
