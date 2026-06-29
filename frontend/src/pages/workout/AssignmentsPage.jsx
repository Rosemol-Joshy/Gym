// frontend/src/pages/workout/AssignmentsPage.jsx
// View and manage all member-workout assignments.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import workoutService from '../../services/workoutService';
import AssignWorkoutModal from '../../components/workout/AssignWorkoutModal';

const STATUS_STYLE = {
    Active:    { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
    Completed: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
    Paused:    { bg: 'rgba(234,179,8,0.12)',  color: '#eab308' },
    Cancelled: { bg: 'rgba(113,113,122,0.12)',color: '#71717A' },
};

export default function AssignmentsPage() {
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState([]);
    const [total,       setTotal]       = useState(0);
    const [loading,     setLoading]     = useState(true);

    const [statusFilter, setStatusFilter] = useState('');
    const [page,         setPage]         = useState(1);
    const limit = 15;

    const [showAssign, setShowAssign] = useState(false);
    const [editAssign, setEditAssign] = useState(null); // for status update
    const [toast,      setToast]      = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadAssignments = useCallback(() => {
        setLoading(true);
        workoutService.getAssignments({ status: statusFilter, page, limit })
            .then(r => {
                setAssignments(r.data.data.rows);
                setTotal(r.data.data.total);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [statusFilter, page]);

    useEffect(() => { setPage(1); }, [statusFilter]);
    useEffect(() => { loadAssignments(); }, [loadAssignments]);

    const handleStatusChange = async (a, newStatus) => {
        try {
            await workoutService.updateAssignment(a.id, {
                status:     newStatus,
                start_date: a.start_date?.split('T')[0],
                end_date:   a.end_date?.split('T')[0],
                notes:      a.notes,
            });
            showToast(`Assignment marked as ${newStatus}.`);
            loadAssignments();
        } catch {
            showToast('Failed to update assignment.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            await workoutService.deleteAssignment(id);
            showToast('Assignment deleted.');
            loadAssignments();
        } catch {
            showToast('Failed to delete.', 'error');
        }
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    return (
        <div style={styles.page}>
            {toast && (
                <div style={{ ...styles.toast, background: toast.type === 'error' ? '#7f1d1d' : '#14532d' }}>
                    <span>{toast.type === 'error' ? '✕' : '✓'}</span> {toast.message}
                </div>
            )}

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <button style={styles.backBtn} onClick={() => navigate('/workout')}>← Workout Plans</button>
                    <h1 style={styles.title}>Workout Assignments</h1>
                    <p style={styles.subtitle}>{total} total assignments</p>
                </div>
                <button style={styles.btnPrimary} onClick={() => setShowAssign(true)}>
                    + Assign Workout
                </button>
            </div>

            {/* Status tabs */}
            <div style={styles.tabs}>
                {['', 'Active', 'Completed', 'Paused', 'Cancelled'].map(s => (
                    <button
                        key={s}
                        style={{ ...styles.tab, ...(statusFilter === s ? styles.tabActive : {}) }}
                        onClick={() => setStatusFilter(s)}
                    >
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={styles.card}>
                {loading ? (
                    <div style={styles.center}><div style={styles.spinner} /></div>
                ) : assignments.length === 0 ? (
                    <div style={styles.empty}>
                        <span style={{ fontSize: '2.5rem' }}>📋</span>
                        <p style={{ color: '#71717A', margin: 0 }}>No assignments found.</p>
                    </div>
                ) : (
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {['Member','Plan','Status','Start','End','Assigned By','Actions'].map(h => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map(a => {
                                    const ss = STATUS_STYLE[a.status] || {};
                                    return (
                                        <tr key={a.id} style={styles.tr}>
                                            {/* Member */}
                                            <td style={styles.td}>
                                                <div style={styles.memberCell}>
                                                    <div style={styles.avatar}>
                                                        {a.member_image
                                                            ? <img src={a.member_image} alt="" style={styles.avatarImg} />
                                                            : <span style={styles.avatarInitial}>{a.member_name?.charAt(0)}</span>
                                                        }
                                                    </div>
                                                    <div>
                                                        <div style={styles.memberName}>{a.member_name}</div>
                                                        <div style={styles.memberEmail}>{a.member_email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Plan */}
                                            <td style={styles.td}>
                                                <div style={styles.planName}>{a.plan_name}</div>
                                                <div style={styles.planMeta}>{a.plan_goal} · {a.plan_difficulty}</div>
                                            </td>
                                            {/* Status */}
                                            <td style={styles.td}>
                                                <select
                                                    style={{ ...styles.statusSelect, ...ss }}
                                                    value={a.status}
                                                    onChange={e => handleStatusChange(a, e.target.value)}
                                                >
                                                    {['Active','Completed','Paused','Cancelled'].map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            {/* Dates */}
                                            <td style={styles.td}><span style={{ color: '#A1A1AA' }}>{fmtDate(a.start_date)}</span></td>
                                            <td style={styles.td}><span style={{ color: '#A1A1AA' }}>{fmtDate(a.end_date)}</span></td>
                                            {/* Assigned by */}
                                            <td style={styles.td}><span style={{ color: '#71717A' }}>{a.assigned_by_name || '—'}</span></td>
                                            {/* Actions */}
                                            <td style={styles.td}>
                                                <button style={styles.delBtn} onClick={() => handleDelete(a.id)}>🗑</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {total > limit && (
                    <div style={styles.pagination}>
                        <span style={{ color: '#71717A', fontSize: '0.85rem' }}>
                            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                            <button style={styles.pageBtn} disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next →</button>
                        </div>
                    </div>
                )}
            </div>

            {showAssign && (
                <AssignWorkoutModal
                    onClose={() => setShowAssign(false)}
                    onSuccess={() => { setShowAssign(false); showToast('Workout assigned!'); loadAssignments(); }}
                    showToast={showToast}
                />
            )}
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#18181B', color: '#F4F4F5', padding: '2rem', fontFamily: "'Inter', sans-serif", position: 'relative' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' },
    backBtn: { background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: '0.85rem', padding: 0, marginBottom: '0.25rem', display: 'block' },
    title:   { margin: 0, fontSize: '1.875rem', fontWeight: 700 },
    subtitle:{ margin: '0.25rem 0 0', color: '#71717A', fontSize: '0.9rem' },
    btnPrimary: { background: '#E11D48', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600 },
    tabs: { display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
    tab: { background: '#27272A', color: '#A1A1AA', border: '1px solid #3F3F46', borderRadius: '9999px', padding: '0.35rem 0.875rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 },
    tabActive: { background: '#E11D48', color: '#fff', border: '1px solid #E11D48' },
    card: { background: '#27272A', borderRadius: '0.75rem', border: '1px solid #3F3F46', padding: '1.5rem' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
    th: { textAlign: 'left', padding: '0.75rem 1rem', color: '#71717A', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #3F3F46', whiteSpace: 'nowrap' },
    tr: { borderBottom: '1px solid #3F3F46' },
    td: { padding: '0.9rem 1rem', verticalAlign: 'middle' },
    memberCell: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    avatar: { width: 36, height: 36, borderRadius: '50%', background: '#3F3F46', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    avatarInitial: { color: '#E11D48', fontWeight: 700, fontSize: '0.9rem' },
    memberName: { fontWeight: 600, color: '#F4F4F5', fontSize: '0.875rem' },
    memberEmail: { color: '#71717A', fontSize: '0.78rem' },
    planName: { fontWeight: 600, color: '#F4F4F5', fontSize: '0.875rem' },
    planMeta: { color: '#71717A', fontSize: '0.78rem', marginTop: '0.1rem' },
    statusSelect: { border: 'none', borderRadius: '9999px', padding: '0.25rem 0.5rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', outline: 'none' },
    delBtn: { background: 'transparent', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem', borderRadius: '0.25rem' },
    center: { display: 'flex', justifyContent: 'center', padding: '3rem' },
    spinner: { width: 36, height: 36, borderRadius: '50%', border: '3px solid #3F3F46', borderTopColor: '#E11D48', animation: 'spin 0.8s linear infinite' },
    empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '0.75rem' },
    pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' },
    pageBtn: { background: '#3F3F46', color: '#F4F4F5', border: 'none', borderRadius: '0.375rem', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' },
    toast: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', color: '#fff', borderRadius: '0.5rem', padding: '0.75rem 1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'center', fontWeight: 500, fontSize: '0.9rem', zIndex: 9999, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' },
};
