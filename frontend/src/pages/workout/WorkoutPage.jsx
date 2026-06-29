// frontend/src/pages/workout/WorkoutPage.jsx
// Main Workout Dashboard — stats cards, plans table, quick nav to exercises & assignments.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import workoutService from '../../services/workoutService';
import StatsCard from '../../components/attendance/StatsCard';
import WorkoutPlanModal from '../../components/workout/WorkoutPlanModal';

const DIFFICULTY_COLOR = {
    Beginner:     { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
    Intermediate: { bg: 'rgba(234,179,8,0.12)',  color: '#eab308' },
    Advanced:     { bg: 'rgba(225,29,72,0.12)',  color: '#E11D48' },
};

const GOAL_ICONS = {
    'Weight Loss':     '🔥',
    'Muscle Gain':     '💪',
    'Endurance':       '🏃',
    'Flexibility':     '🤸',
    'General Fitness': '⭐',
    'Strength':        '🏋️',
};

export default function WorkoutPage() {
    const navigate = useNavigate();

    const [stats,   setStats]   = useState(null);
    const [plans,   setPlans]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    const [search,     setSearch]     = useState('');
    const [goalFilter, setGoalFilter] = useState('');
    const [diffFilter, setDiffFilter] = useState('');
    const [page,       setPage]       = useState(1);
    const limit = 10;

    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editPlan,      setEditPlan]      = useState(null);
    const [toast,         setToast]         = useState(null);

    // ── data ───────────────────────────────────────────────
    const loadStats = useCallback(() => {
        setStatsLoading(true);
        workoutService.getDashboardStats()
            .then(r => setStats(r.data.data))
            .catch(console.error)
            .finally(() => setStatsLoading(false));
    }, []);

    const loadPlans = useCallback(() => {
        setLoading(true);
        workoutService.getPlans({ search, goal: goalFilter, difficulty: diffFilter, page, limit })
            .then(r => {
                setPlans(r.data.data.rows);
                setTotal(r.data.data.total);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [search, goalFilter, diffFilter, page]);

    useEffect(() => { loadStats(); }, [loadStats]);
    useEffect(() => { setPage(1); }, [search, goalFilter, diffFilter]);
    useEffect(() => { loadPlans(); }, [loadPlans]);

    const showToast = (msg, type = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── plan delete ────────────────────────────────────────
    const handleDeletePlan = async (id) => {
        if (!window.confirm('Delete this workout plan?')) return;
        try {
            await workoutService.deletePlan(id);
            showToast('Workout plan deleted.');
            loadStats();
            loadPlans();
        } catch {
            showToast('Failed to delete plan.', 'error');
        }
    };

    const onPlanSaved = () => {
        setShowPlanModal(false);
        setEditPlan(null);
        showToast(editPlan ? 'Plan updated.' : 'Plan created.');
        loadStats();
        loadPlans();
    };

    return (
        <div style={styles.page}>

            {toast && (
                <div style={{ ...styles.toast, background: toast.type === 'error' ? '#7f1d1d' : '#14532d' }}>
                    <span>{toast.type === 'error' ? '✕' : '✓'}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* ── Header ── */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Workout Management</h1>
                    <p style={styles.subtitle}>Create plans, manage exercises, and assign to members</p>
                </div>
                <div style={styles.headerActions}>
                    <button style={styles.btnGhost} onClick={() => navigate('/workout/exercises')}>
                        🏋️ Exercise Library
                    </button>
                    <button style={styles.btnGhost} onClick={() => navigate('/workout/assignments')}>
                        📋 Assignments
                    </button>
                    <button style={styles.btnPrimary} onClick={() => { setEditPlan(null); setShowPlanModal(true); }}>
                        + New Plan
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div style={styles.statsGrid}>
                <StatsCard label="Total Plans"         value={statsLoading ? '…' : stats?.total_plans        ?? '—'} icon="📋" accent />
                <StatsCard label="Exercise Library"    value={statsLoading ? '…' : stats?.total_exercises    ?? '—'} icon="🏋️" color="#a855f7" />
                <StatsCard label="Active Assignments"  value={statsLoading ? '…' : stats?.active_assignments ?? '—'} icon="✅" color="#22c55e" />
                <StatsCard label="Completed"           value={statsLoading ? '…' : stats?.completed_assignments ?? '—'} icon="🏆" color="#3b82f6" />
            </div>

            {/* ── Plans Section ── */}
            <div style={styles.card}>
                <div style={styles.sectionHeader}>
                    <h3 style={styles.cardTitle}>Workout Plans</h3>
                    <button style={styles.btnSmall} onClick={() => { setEditPlan(null); setShowPlanModal(true); }}>
                        + New Plan
                    </button>
                </div>

                {/* Filters */}
                <div style={styles.filterRow}>
                    <div style={styles.searchWrapper}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            style={styles.searchInput}
                            placeholder="Search plans…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && <button style={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
                    </div>
                    <select style={styles.select} value={goalFilter} onChange={e => setGoalFilter(e.target.value)}>
                        <option value="">All Goals</option>
                        {['Weight Loss','Muscle Gain','Endurance','Flexibility','General Fitness','Strength'].map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                    <select style={styles.select} value={diffFilter} onChange={e => setDiffFilter(e.target.value)}>
                        <option value="">All Levels</option>
                        {['Beginner','Intermediate','Advanced'].map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {/* Plans Table */}
                {loading ? (
                    <div style={styles.center}><div style={styles.spinner} /><span style={{ color: '#71717A' }}>Loading plans…</span></div>
                ) : plans.length === 0 ? (
                    <div style={styles.empty}>
                        <span style={{ fontSize: '2.5rem' }}>💪</span>
                        <p style={{ color: '#71717A', margin: 0 }}>No workout plans found.</p>
                        <button style={styles.btnPrimary} onClick={() => setShowPlanModal(true)}>Create First Plan</button>
                    </div>
                ) : (
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {['Plan','Goal','Level','Duration','Exercises','Assigned','Actions'].map(h => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {plans.map(p => {
                                    const dc = DIFFICULTY_COLOR[p.difficulty] || {};
                                    return (
                                        <tr key={p.id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.planName}>{p.name}</div>
                                                {p.description && (
                                                    <div style={styles.planDesc}>
                                                        {p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <span>{GOAL_ICONS[p.goal] || '🎯'} {p.goal}</span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{ ...styles.badge, background: dc.bg, color: dc.color }}>
                                                    {p.difficulty}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{ color: '#A1A1AA' }}>
                                                    {p.duration_weeks}w / {p.days_per_week}d
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.countBadge}>{p.exercise_count}</span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{ color: p.active_assignments > 0 ? '#22c55e' : '#71717A' }}>
                                                    {p.active_assignments} active
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actions}>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => navigate(`/workout/plans/${p.id}`)}
                                                    >View</button>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => { setEditPlan(p); setShowPlanModal(true); }}
                                                    >Edit</button>
                                                    <button
                                                        style={styles.deleteBtn}
                                                        onClick={() => handleDeletePlan(p.id)}
                                                    >🗑</button>
                                                </div>
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

            {/* ── Modals ── */}
            {showPlanModal && (
                <WorkoutPlanModal
                    plan={editPlan}
                    onClose={() => { setShowPlanModal(false); setEditPlan(null); }}
                    onSuccess={onPlanSaved}
                    showToast={showToast}
                />
            )}
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: '#18181B', color: '#F4F4F5', padding: '2rem', fontFamily: "'Inter', sans-serif", position: 'relative' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' },
    title:  { margin: 0, fontSize: '1.875rem', fontWeight: 700, color: '#F4F4F5' },
    subtitle: { margin: '0.25rem 0 0', color: '#71717A', fontSize: '0.9rem' },
    headerActions: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    btnPrimary: { background: '#E11D48', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
    btnGhost: { background: 'transparent', color: '#A1A1AA', border: '1px solid #3F3F46', borderRadius: '0.5rem', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.875rem' },
    btnSmall: { background: '#E11D48', color: '#fff', border: 'none', borderRadius: '0.375rem', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
    card: { background: '#27272A', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #3F3F46' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
    cardTitle: { margin: 0, fontSize: '1rem', fontWeight: 600, color: '#F4F4F5' },
    filterRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' },
    searchWrapper: { position: 'relative', flex: 1, minWidth: '200px' },
    searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem' },
    searchInput: { width: '100%', background: '#18181B', color: '#F4F4F5', border: '1px solid #3F3F46', borderRadius: '0.5rem', padding: '0.55rem 2.5rem 0.55rem 2.2rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' },
    clearBtn: { position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: '0.8rem' },
    select: { background: '#18181B', color: '#F4F4F5', border: '1px solid #3F3F46', borderRadius: '0.5rem', padding: '0.55rem 0.75rem', fontSize: '0.875rem', outline: 'none' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
    th: { textAlign: 'left', padding: '0.75rem 1rem', color: '#71717A', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #3F3F46' },
    tr: { borderBottom: '1px solid #3F3F46' },
    td: { padding: '0.9rem 1rem', verticalAlign: 'middle' },
    planName: { fontWeight: 600, color: '#F4F4F5' },
    planDesc: { color: '#71717A', fontSize: '0.78rem', marginTop: '0.2rem' },
    badge: { display: 'inline-block', borderRadius: '9999px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 },
    countBadge: { background: '#3F3F46', color: '#A1A1AA', borderRadius: '9999px', padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: 600 },
    actions: { display: 'flex', gap: '0.4rem' },
    actionBtn: { background: '#3F3F46', color: '#F4F4F5', border: 'none', borderRadius: '0.375rem', padding: '0.3rem 0.65rem', cursor: 'pointer', fontSize: '0.78rem' },
    deleteBtn: { background: 'transparent', color: '#71717A', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' },
    center: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem' },
    spinner: { width: 32, height: 32, borderRadius: '50%', border: '3px solid #3F3F46', borderTopColor: '#E11D48', animation: 'spin 0.8s linear infinite' },
    empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '0.75rem' },
    pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' },
    pageBtn: { background: '#3F3F46', color: '#F4F4F5', border: 'none', borderRadius: '0.375rem', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' },
    toast: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', color: '#fff', borderRadius: '0.5rem', padding: '0.75rem 1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'center', fontWeight: 500, fontSize: '0.9rem', zIndex: 9999, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' },
};
