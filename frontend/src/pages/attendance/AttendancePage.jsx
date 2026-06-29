// frontend/src/pages/attendance/AttendancePage.jsx
// Main Attendance Dashboard — stats cards, check-in form, table with search/filter/pagination.

import { useState, useEffect, useCallback } from 'react';
import attendanceService from '../../services/attendanceService';
import AttendanceTable   from '../../components/attendance/AttendanceTable';
import CheckInModal      from '../../components/attendance/CheckInModal';
import ManualEntryModal  from '../../components/attendance/ManualEntryModal';
import StatsCard         from '../../components/attendance/StatsCard';

// ─── tiny helpers ────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString());

export default function AttendancePage() {
    // ── state ─────────────────────────────────────────────
    const [stats,        setStats]        = useState(null);
    const [weekly,       setWeekly]       = useState([]);
    const [records,      setRecords]      = useState([]);
    const [total,        setTotal]        = useState(0);
    const [loading,      setLoading]      = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    const [search,    setSearch]    = useState('');
    const [dateFilter,setDateFilter]= useState('');
    const [page,      setPage]      = useState(1);
    const limit = 15;

    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showManual,  setShowManual]  = useState(false);
    const [toast,       setToast]       = useState(null);

    // ── data fetching ─────────────────────────────────────
    const loadStats = useCallback(() => {
        setStatsLoading(true);
        attendanceService.getDashboardStats()
            .then(r => {
                setStats(r.data.data.daily);
                setWeekly(r.data.data.weekly || []);
            })
            .catch(console.error)
            .finally(() => setStatsLoading(false));
    }, []);

    const loadRecords = useCallback(() => {
        setLoading(true);
        attendanceService.getList({ search, date: dateFilter, page, limit })
            .then(r => {
                setRecords(r.data.data.rows);
                setTotal(r.data.data.total);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [search, dateFilter, page]);

    useEffect(() => { loadStats(); }, [loadStats]);
    useEffect(() => { setPage(1); }, [search, dateFilter]);
    useEffect(() => { loadRecords(); }, [loadRecords]);

    // ── toast helper ──────────────────────────────────────
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── event handlers ────────────────────────────────────
    const handleCheckOut = async (memberId) => {
        try {
            await attendanceService.checkOut(memberId);
            showToast('Member checked out successfully.');
            loadStats();
            loadRecords();
        } catch (err) {
            showToast(err.response?.data?.message || 'Check-out failed.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this attendance record?')) return;
        try {
            await attendanceService.remove(id);
            showToast('Record deleted.');
            loadStats();
            loadRecords();
        } catch {
            showToast('Failed to delete record.', 'error');
        }
    };

    const onCheckInSuccess = () => {
        setShowCheckIn(false);
        showToast('Member checked in successfully!');
        loadStats();
        loadRecords();
    };

    const onManualSuccess = () => {
        setShowManual(false);
        showToast('Manual attendance record created.');
        loadStats();
        loadRecords();
    };

    // ── max of weekly bar chart ───────────────────────────
    const weeklyMax = Math.max(...weekly.map(w => w.total), 1);

    // ── render ────────────────────────────────────────────
    return (
        <div style={styles.page}>

            {/* ── Toast ── */}
            {toast && (
                <div style={{ ...styles.toast, background: toast.type === 'error' ? '#7f1d1d' : '#14532d' }}>
                    <span>{toast.type === 'error' ? '✕' : '✓'}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* ── Header ── */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Attendance</h1>
                    <p style={styles.subtitle}>Track member check-ins and gym activity</p>
                </div>
                <div style={styles.headerActions}>
                    <button style={styles.btnSecondary} onClick={() => setShowManual(true)}>
                        + Manual Entry
                    </button>
                    <button style={styles.btnPrimary} onClick={() => setShowCheckIn(true)}>
                        ⚡ Check In Member
                    </button>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div style={styles.statsGrid}>
                <StatsCard
                    label="Today's Check-ins"
                    value={statsLoading ? '…' : fmt(stats?.total_checkins)}
                    icon="👥"
                    accent
                />
                <StatsCard
                    label="Currently Inside"
                    value={statsLoading ? '…' : fmt(stats?.currently_in)}
                    icon="🏃"
                    color="#22c55e"
                />
                <StatsCard
                    label="Checked Out"
                    value={statsLoading ? '…' : fmt(stats?.checked_out)}
                    icon="✅"
                    color="#3b82f6"
                />
                <StatsCard
                    label="Avg Duration"
                    value={statsLoading ? '…' : stats?.avg_duration_minutes ? `${stats.avg_duration_minutes}m` : '—'}
                    icon="⏱"
                    color="#a855f7"
                />
            </div>

            {/* ── Weekly Trend Mini-Chart ── */}
            {weekly.length > 0 && (
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>7-Day Check-in Trend</h3>
                    <div style={styles.barChart}>
                        {weekly.map((w) => (
                            <div key={w.day} style={styles.barGroup}>
                                <div style={styles.barTrack}>
                                    <div
                                        style={{
                                            ...styles.barFill,
                                            height: `${Math.round((w.total / weeklyMax) * 100)}%`,
                                        }}
                                    />
                                </div>
                                <span style={styles.barLabel}>{w.day_name?.slice(0, 3)}</span>
                                <span style={styles.barValue}>{w.total}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Filters ── */}
            <div style={styles.card}>
                <div style={styles.filterRow}>
                    <div style={styles.searchWrapper}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            style={styles.searchInput}
                            placeholder="Search members by name or email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button style={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
                        )}
                    </div>
                    <input
                        type="date"
                        style={styles.dateInput}
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                    {dateFilter && (
                        <button style={styles.btnGhost} onClick={() => setDateFilter('')}>
                            Clear Date
                        </button>
                    )}
                    <button
                        style={styles.btnGhost}
                        onClick={() => setDateFilter(today())}
                    >
                        Today
                    </button>
                </div>

                {/* ── Table ── */}
                <AttendanceTable
                    records={records}
                    loading={loading}
                    onCheckOut={handleCheckOut}
                    onDelete={handleDelete}
                />

                {/* ── Pagination ── */}
                {total > limit && (
                    <div style={styles.pagination}>
                        <span style={styles.pageInfo}>
                            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                        </span>
                        <div style={styles.pageButtons}>
                            <button
                                style={styles.pageBtn}
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                ← Prev
                            </button>
                            <span style={styles.pageNum}>Page {page} of {Math.ceil(total / limit)}</span>
                            <button
                                style={styles.pageBtn}
                                disabled={page >= Math.ceil(total / limit)}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {showCheckIn && (
                <CheckInModal
                    onClose={() => setShowCheckIn(false)}
                    onSuccess={onCheckInSuccess}
                    showToast={showToast}
                />
            )}
            {showManual && (
                <ManualEntryModal
                    onClose={() => setShowManual(false)}
                    onSuccess={onManualSuccess}
                    showToast={showToast}
                />
            )}
        </div>
    );
}

// ─── styles ───────────────────────────────────────────────────
const styles = {
    page: {
        minHeight: '100vh',
        background: '#18181B',
        color: '#F4F4F5',
        padding: '2rem',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
    },
    title: { margin: 0, fontSize: '1.875rem', fontWeight: 700, color: '#F4F4F5' },
    subtitle: { margin: '0.25rem 0 0', color: '#71717A', fontSize: '0.9rem' },
    headerActions: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    btnPrimary: {
        background: '#E11D48', color: '#fff', border: 'none',
        borderRadius: '0.5rem', padding: '0.6rem 1.25rem',
        cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
        transition: 'opacity 0.2s',
    },
    btnSecondary: {
        background: '#27272A', color: '#F4F4F5', border: '1px solid #3F3F46',
        borderRadius: '0.5rem', padding: '0.6rem 1.25rem',
        cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
    },
    btnGhost: {
        background: 'transparent', color: '#A1A1AA', border: '1px solid #3F3F46',
        borderRadius: '0.5rem', padding: '0.5rem 0.9rem',
        cursor: 'pointer', fontSize: '0.85rem',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    card: {
        background: '#27272A',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #3F3F46',
    },
    cardTitle: { margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600, color: '#F4F4F5' },
    barChart: {
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-end',
        height: '120px',
        padding: '0.5rem 0',
    },
    barGroup: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '0.25rem', flex: 1,
    },
    barTrack: {
        width: '100%', background: '#3F3F46', borderRadius: '0.25rem',
        height: '80px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
    },
    barFill: {
        width: '100%', background: '#E11D48', borderRadius: '0.25rem',
        transition: 'height 0.4s ease', minHeight: '2px',
    },
    barLabel: { fontSize: '0.7rem', color: '#71717A' },
    barValue: { fontSize: '0.7rem', color: '#A1A1AA', fontWeight: 600 },
    filterRow: {
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
        marginBottom: '1.25rem', alignItems: 'center',
    },
    searchWrapper: {
        position: 'relative', flex: 1, minWidth: '220px',
    },
    searchIcon: {
        position: 'absolute', left: '0.75rem', top: '50%',
        transform: 'translateY(-50%)', fontSize: '0.9rem',
    },
    searchInput: {
        width: '100%', background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.5rem',
        padding: '0.55rem 2.5rem 0.55rem 2.2rem',
        fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
    },
    clearBtn: {
        position: 'absolute', right: '0.6rem', top: '50%',
        transform: 'translateY(-50%)', background: 'none', border: 'none',
        color: '#71717A', cursor: 'pointer', fontSize: '0.8rem',
    },
    dateInput: {
        background: '#18181B', color: '#F4F4F5',
        border: '1px solid #3F3F46', borderRadius: '0.5rem',
        padding: '0.55rem 0.75rem', fontSize: '0.875rem', outline: 'none',
    },
    pagination: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem',
    },
    pageInfo: { color: '#71717A', fontSize: '0.85rem' },
    pageButtons: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
    pageBtn: {
        background: '#3F3F46', color: '#F4F4F5', border: 'none',
        borderRadius: '0.375rem', padding: '0.4rem 0.9rem',
        cursor: 'pointer', fontSize: '0.85rem',
    },
    pageNum: { color: '#A1A1AA', fontSize: '0.85rem', padding: '0 0.25rem' },
    toast: {
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        color: '#fff', borderRadius: '0.5rem', padding: '0.75rem 1.25rem',
        display: 'flex', gap: '0.6rem', alignItems: 'center',
        fontWeight: 500, fontSize: '0.9rem', zIndex: 9999,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    },
};
