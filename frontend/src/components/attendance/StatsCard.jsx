// frontend/src/components/attendance/StatsCard.jsx
// Reusable dashboard stat card. Used by both Attendance and Workout dashboards.

export default function StatsCard({ label, value, icon, accent, color }) {
    const accentColor = accent ? '#E11D48' : (color || '#3b82f6');

    return (
        <div style={{ ...styles.card, borderLeft: `3px solid ${accentColor}` }}>
            <div style={styles.top}>
                <span style={styles.label}>{label}</span>
                <span style={{ ...styles.icon, background: `${accentColor}20`, color: accentColor }}>
                    {icon}
                </span>
            </div>
            <div style={{ ...styles.value, color: accent ? '#E11D48' : '#F4F4F5' }}>
                {value}
            </div>
        </div>
    );
}

const styles = {
    card: {
        background: '#27272A',
        borderRadius: '0.75rem',
        padding: '1.25rem 1.5rem',
        border: '1px solid #3F3F46',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'transform 0.2s',
    },
    top: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    label: {
        color: '#71717A',
        fontSize: '0.8rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    icon: {
        width: 36,
        height: 36,
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
    },
    value: {
        fontSize: '1.875rem',
        fontWeight: 700,
        lineHeight: 1,
    },
};
