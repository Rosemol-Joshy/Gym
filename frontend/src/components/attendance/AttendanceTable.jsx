// frontend/src/components/attendance/AttendanceTable.jsx

export default function AttendanceTable({ records, loading, onCheckOut, onDelete }) {
    const fmtTime = (dt) => {
        if (!dt) return '—';
        return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    const fmtDate = (dt) => {
        if (!dt) return '—';
        return new Date(dt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const fmtDuration = (mins) => {
        if (!mins) return '—';
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    if (loading) {
        return (
            <div style={styles.center}>
                <div style={styles.spinner} />
                <span style={styles.loadingText}>Loading attendance records…</span>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div style={styles.empty}>
                <span style={{ fontSize: '2.5rem' }}>📋</span>
                <p style={styles.emptyText}>No attendance records found.</p>
            </div>
        );
    }

    return (
        <div style={styles.tableWrapper}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        {['Member', 'Date', 'Check-In', 'Check-Out', 'Duration', 'Status', 'Actions'].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {records.map((r) => {
                        const isActive = !r.check_out;
                        return (
                            <tr key={r.id} style={styles.tr}>
                                {/* Member */}
                                <td style={styles.td}>
                                    <div style={styles.memberCell}>
                                        <div style={styles.avatar}>
                                            {r.member_image
                                                ? <img src={r.member_image} alt="" style={styles.avatarImg} />
                                                : <span style={styles.avatarInitial}>
                                                    {r.member_name?.charAt(0).toUpperCase()}
                                                  </span>
                                            }
                                        </div>
                                        <div>
                                            <div style={styles.memberName}>{r.member_name}</div>
                                            <div style={styles.memberEmail}>{r.member_email}</div>
                                        </div>
                                    </div>
                                </td>
                                {/* Date */}
                                <td style={styles.td}>
                                    <span style={styles.dateText}>{fmtDate(r.check_in)}</span>
                                </td>
                                {/* Check-in */}
                                <td style={styles.td}>
                                    <span style={styles.timeText}>{fmtTime(r.check_in)}</span>
                                </td>
                                {/* Check-out */}
                                <td style={styles.td}>
                                    <span style={{ ...styles.timeText, color: r.check_out ? '#F4F4F5' : '#71717A' }}>
                                        {fmtTime(r.check_out)}
                                    </span>
                                </td>
                                {/* Duration */}
                                <td style={styles.td}>
                                    <span style={styles.duration}>{fmtDuration(r.duration_minutes)}</span>
                                </td>
                                {/* Status */}
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge,
                                        background: isActive ? 'rgba(34,197,94,0.15)' : 'rgba(161,161,170,0.15)',
                                        color:      isActive ? '#22c55e' : '#A1A1AA',
                                    }}>
                                        {isActive ? '● Active' : '✓ Done'}
                                    </span>
                                </td>
                                {/* Actions */}
                                <td style={styles.td}>
                                    <div style={styles.actions}>
                                        {isActive && (
                                            <button
                                                style={styles.checkOutBtn}
                                                onClick={() => onCheckOut(r.member_id)}
                                                title="Check out"
                                            >
                                                Check Out
                                            </button>
                                        )}
                                        <button
                                            style={styles.deleteBtn}
                                            onClick={() => onDelete(r.id)}
                                            title="Delete record"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
    th: {
        textAlign: 'left', padding: '0.75rem 1rem',
        color: '#71717A', fontWeight: 600, fontSize: '0.78rem',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        borderBottom: '1px solid #3F3F46', whiteSpace: 'nowrap',
    },
    tr: {
        borderBottom: '1px solid #3F3F46',
        transition: 'background 0.15s',
    },
    td: { padding: '0.9rem 1rem', verticalAlign: 'middle' },
    memberCell: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    avatar: {
        width: 36, height: 36, borderRadius: '50%',
        background: '#3F3F46', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    avatarImg:     { width: '100%', height: '100%', objectFit: 'cover' },
    avatarInitial: { color: '#E11D48', fontWeight: 700, fontSize: '0.9rem' },
    memberName:    { fontWeight: 600, color: '#F4F4F5', fontSize: '0.875rem' },
    memberEmail:   { color: '#71717A', fontSize: '0.78rem' },
    dateText:      { color: '#A1A1AA' },
    timeText:      { color: '#F4F4F5', fontWeight: 500 },
    duration:      { color: '#A1A1AA' },
    badge: {
        display: 'inline-block', borderRadius: '9999px',
        padding: '0.25rem 0.75rem', fontSize: '0.78rem', fontWeight: 600,
    },
    actions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
    checkOutBtn: {
        background: 'rgba(34,197,94,0.15)', color: '#22c55e',
        border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.375rem',
        padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
    },
    deleteBtn: {
        background: 'transparent', color: '#71717A', border: 'none',
        cursor: 'pointer', fontSize: '1rem', padding: '0.2rem',
        borderRadius: '0.25rem',
    },
    center: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '3rem', gap: '1rem',
    },
    spinner: {
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid #3F3F46', borderTopColor: '#E11D48',
        animation: 'spin 0.8s linear infinite',
    },
    loadingText: { color: '#71717A', fontSize: '0.9rem' },
    empty: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '3rem', gap: '0.75rem',
    },
    emptyText: { color: '#71717A', margin: 0 },
};
