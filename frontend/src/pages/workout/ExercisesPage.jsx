// frontend/src/pages/workout/ExercisesPage.jsx
// Full exercise library management page.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import workoutService from '../../services/workoutService';
import ExerciseModal from '../../components/workout/ExerciseModal';

const CATEGORIES   = ['Chest','Back','Shoulders','Arms','Legs','Core','Cardio','Full Body','Flexibility'];
const DIFFICULTIES = ['Beginner','Intermediate','Advanced'];

const DIFF_STYLE = {
    Beginner:     { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
    Intermediate: { bg: 'rgba(234,179,8,0.12)',  color: '#eab308' },
    Advanced:     { bg: 'rgba(225,29,72,0.12)',  color: '#E11D48' },
};

const CAT_ICONS = {
    Chest:'💪', Back:'🔙', Shoulders:'🏋️', Arms:'💪', Legs:'🦵',
    Core:'🎯', Cardio:'🏃', 'Full Body':'⭐', Flexibility:'🤸',
};

export default function ExercisesPage() {
    const navigate = useNavigate();

    const [exercises, setExercises] = useState([]);
    const [total,     setTotal]     = useState(0);
    const [loading,   setLoading]   = useState(true);

    const [search,     setSearch]     = useState('');
    const [catFilter,  setCatFilter]  = useState('');
    const [diffFilter, setDiffFilter] = useState('');
    const [page,       setPage]       = useState(1);
    const limit = 18;

    const [showModal, setShowModal] = useState(false);
    const [editEx,    setEditEx]    = useState(null);
    const [toast,     setToast]     = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadExercises = useCallback(() => {
        setLoading(true);
        workoutService.getExercises({ search, category: catFilter, difficulty: diffFilter, page, limit })
            .then(r => {
                setExercises(r.data.data.rows);
                setTotal(r.data.data.total);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [search, catFilter, diffFilter, page]);

    useEffect(() => { setPage(1); }, [search, catFilter, diffFilter]);
    useEffect(() => { loadExercises(); }, [loadExercises]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this exercise?')) return;
        try {
            await workoutService.deleteExercise(id);
            showToast('Exercise deleted.');
            loadExercises();
        } catch {
            showToast('Failed to delete.', 'error');
        }
    };

    const onSaved = () => {
        setShowModal(false);
        setEditEx(null);
        showToast(editEx ? 'Exercise updated.' : 'Exercise created.');
        loadExercises();
    };

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
                    <h1 style={styles.title}>Exercise Library</h1>
                    <p style={styles.subtitle}>{total} exercises available</p>
                </div>
                <button style={styles.btnPrimary} onClick={() => { setEditEx(null); setShowModal(true); }}>
                    + New Exercise
                </button>
            </div>

            {/* Category chips */}
            <div style={styles.chips}>
                <button
                    style={{ ...styles.chip, ...(catFilter === '' ? styles.chipActive : {}) }}
                    onClick={() => setCatFilter('')}
                >
                    All
                </button>
                {CATEGORIES.map(c => (
                    <button
                        key={c}
                        style={{ ...styles.chip, ...(catFilter === c ? styles.chipActive : {}) }}
                        onClick={() => setCatFilter(catFilter === c ? '' : c)}
                    >
                        {CAT_ICONS[c]} {c}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div style={styles.filterRow}>
                <div style={styles.searchWrapper}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                        style={styles.searchInput}
                        placeholder="Search exercises…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && <button style={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
                </div>
                <select style={styles.select} value={diffFilter} onChange={e => setDiffFilter(e.target.value)}>
                    <option value="">All Levels</option>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* Grid */}
            {loading ? (
                <div style={styles.center}><div style={styles.spinner} /></div>
            ) : exercises.length === 0 ? (
                <div style={styles.empty}>
                    <span style={{ fontSize: '3rem' }}>🏋️</span>
                    <p style={{ color: '#71717A' }}>No exercises found.</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {exercises.map(ex => {
                        const ds = DIFF_STYLE[ex.difficulty] || {};
                        return (
                            <div key={ex.id} style={styles.exCard}>
                                <div style={styles.exCardTop}>
                                    <div style={styles.catIcon}>{CAT_ICONS[ex.category] || '💪'}</div>
                                    <span style={{ ...styles.diffBadge, ...ds }}>{ex.difficulty}</span>
                                </div>
                                <div style={styles.exCardName}>{ex.name}</div>
                                <div style={styles.exCardMeta}>
                                    <span style={styles.exCardTag}>{ex.category}</span>
                                    {ex.muscle_group && <span style={styles.exCardTag}>{ex.muscle_group}</span>}
                                    {ex.equipment    && <span style={styles.exCardTag}>{ex.equipment}</span>}
                                </div>
                                {ex.description && (
                                    <p style={styles.exCardDesc}>
                                        {ex.description.slice(0, 80)}{ex.description.length > 80 ? '…' : ''}
                                    </p>
                                )}
                                <div style={styles.exCardActions}>
                                    <button
                                        style={styles.editBtn}
                                        onClick={() => { setEditEx(ex); setShowModal(true); }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        style={styles.delBtn}
                                        onClick={() => handleDelete(ex.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
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

            {showModal && (
                <ExerciseModal
                    exercise={editEx}
                    onClose={() => { setShowModal(false); setEditEx(null); }}
                    onSuccess={onSaved}
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
    btnPrimary: { background: '#E11D48', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
    chips: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' },
    chip: { background: '#27272A', color: '#A1A1AA', border: '1px solid #3F3F46', borderRadius: '9999px', padding: '0.35rem 0.875rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s' },
    chipActive: { background: '#E11D48', color: '#fff', border: '1px solid #E11D48' },
    filterRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
    searchWrapper: { position: 'relative', flex: 1, minWidth: '200px' },
    searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem' },
    searchInput: { width: '100%', background: '#27272A', color: '#F4F4F5', border: '1px solid #3F3F46', borderRadius: '0.5rem', padding: '0.55rem 2.5rem 0.55rem 2.2rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' },
    clearBtn: { position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: '0.8rem' },
    select: { background: '#27272A', color: '#F4F4F5', border: '1px solid #3F3F46', borderRadius: '0.5rem', padding: '0.55rem 0.75rem', fontSize: '0.875rem', outline: 'none' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
    exCard: { background: '#27272A', borderRadius: '0.75rem', border: '1px solid #3F3F46', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'border-color 0.2s, transform 0.2s' },
    exCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    catIcon: { fontSize: '1.5rem' },
    diffBadge: { borderRadius: '9999px', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 600 },
    exCardName: { fontWeight: 700, fontSize: '1rem', color: '#F4F4F5' },
    exCardMeta: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
    exCardTag: { background: '#3F3F46', color: '#A1A1AA', borderRadius: '9999px', padding: '0.15rem 0.5rem', fontSize: '0.72rem' },
    exCardDesc: { color: '#71717A', fontSize: '0.82rem', margin: 0, lineHeight: 1.5, flex: 1 },
    exCardActions: { display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #3F3F46' },
    editBtn: { flex: 1, background: '#3F3F46', color: '#F4F4F5', border: 'none', borderRadius: '0.375rem', padding: '0.4rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
    delBtn:  { flex: 1, background: 'rgba(225,29,72,0.1)', color: '#E11D48', border: '1px solid rgba(225,29,72,0.2)', borderRadius: '0.375rem', padding: '0.4rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
    center: { display: 'flex', justifyContent: 'center', padding: '4rem' },
    spinner: { width: 40, height: 40, borderRadius: '50%', border: '4px solid #3F3F46', borderTopColor: '#E11D48', animation: 'spin 0.8s linear infinite' },
    empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', gap: '0.75rem' },
    pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' },
    pageBtn: { background: '#27272A', color: '#F4F4F5', border: '1px solid #3F3F46', borderRadius: '0.375rem', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' },
    toast: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', color: '#fff', borderRadius: '0.5rem', padding: '0.75rem 1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'center', fontWeight: 500, fontSize: '0.9rem', zIndex: 9999, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' },
};
