import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaTrophy, FaSearch, FaBook, FaPray, FaMedal } from 'react-icons/fa';
import { GiStarMedal } from 'react-icons/gi';
import './Leaderboard.css';

const MEDAL_ICONS = [GiStarMedal, FaTrophy, FaMedal];
const MEDAL_COLORS = ['#d4a017', '#94a3b8', '#cd7f32'];

export default function Leaderboard() {
    const { user } = useAuth();
    const [list, setList] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/user/leaderboard')
            .then(res => {
                setList(res.data.leaderboard || []);
                setFiltered(res.data.leaderboard || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!search.trim()) { setFiltered(list); return; }
        setFiltered(list.filter(u => u.username.toLowerCase().includes(search.toLowerCase())));
    }, [search, list]);

    const top3 = list.slice(0, 3);
    const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

    return (
        <div className="page-wrapper">
            <div className="container leaderboard-page">
                <div className="lb-header">
                    <h1 className="section-title">
                        <FaTrophy style={{ fontSize: '1.5rem', verticalAlign: 'middle', marginLeft: '0.5rem', color: '#d4a017' }} />
                        التصنيف العالمي
                    </h1>
                    <p className="section-subtitle">أبطال ختم القرآن الكريم في مصر - أول 100 يحصلون على مركز رسمي</p>
                </div>

                {/* Podium */}
                {top3.length >= 2 && (
                    <div className="lb-podium">
                        {podiumOrder.map((u, pi) => {
                            const rank = top3.findIndex(t => t._id === u._id) + 1;
                            const MedalIcon = MEDAL_ICONS[rank - 1];
                            const medalColor = MEDAL_COLORS[rank - 1];
                            return (
                                <div key={u._id} className="podium-item" style={{ order: pi }}>
                                    <div className="podium-avatar">
                                        <div className={`podium-circle rank-${rank}`} style={{ boxShadow: `0 0 30px ${medalColor}40` }}>
                                            {u.username?.charAt(0).toUpperCase()}
                                            <span className="podium-medal">
                                                <MedalIcon style={{ color: medalColor }} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="podium-name">{u.username}</div>
                                    <div className="podium-completions">{u.quranCompletions}<small>ختمة</small></div>
                                    <div className={`podium-base rank-${rank}`} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Full Table */}
                <div className="lb-table-wrapper">
                    <div className="lb-search">
                        <FaSearch className="lb-search-icon" />
                        <input
                            id="lb-search-input"
                            className="lb-search-input"
                            placeholder="ابحث عن مستخدم..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {loading && <div className="loader"><div className="spinner" /></div>}
                    {!loading && filtered.length === 0 && (
                        <div className="lb-empty">
                            <FaBook style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem', color: 'var(--primary-dark)' }} />
                            لم يُسجَّل أي مستخدم بعد. كن الأول!
                        </div>
                    )}

                    {filtered.map((u, i) => {
                        const realRank = list.findIndex(l => l._id === u._id) + 1;
                        const isMe = user?._id === u._id;
                        const MedalIcon = realRank <= 3 ? MEDAL_ICONS[realRank - 1] : null;
                        const medalColor = realRank <= 3 ? MEDAL_COLORS[realRank - 1] : 'var(--text-muted)';
                        return (
                            <div key={u._id} className={`lb-row ${isMe ? 'current-user' : ''} ${realRank === 1 ? 'rank-1-row' : ''}`}>
                                <span className="lb-rank" style={{ color: medalColor }}>
                                    {MedalIcon
                                        ? <MedalIcon style={{ fontSize: '1.1rem' }} />
                                        : <span className="lb-rank-num">#{realRank}</span>
                                    }
                                </span>
                                <div className="lb-avatar" style={{
                                    background: realRank <= 3
                                        ? `linear-gradient(135deg, ${medalColor}, ${medalColor}88)`
                                        : 'linear-gradient(135deg, var(--primary), var(--secondary))'
                                }}>
                                    {u.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="lb-info">
                                    <div className="lb-username">
                                        {u.username}
                                        {isMe && <span className="lb-you">أنت</span>}
                                    </div>
                                    <div className="lb-sub">
                                        <FaBook style={{ fontSize: '0.65rem' }} /> {u.totalPagesRead || 0} صفحة مقروءة
                                    </div>
                                </div>
                                <div className="lb-stats">
                                    <div className="lb-stat">
                                        <span className="lb-stat-val">{u.quranCompletions}</span>
                                        <span className="lb-stat-key">ختمة</span>
                                    </div>
                                    <div className="lb-stat">
                                        <span className="lb-stat-val">{u.totalPrayers || 0}</span>
                                        <span className="lb-stat-key">صلاة</span>
                                    </div>
                                    <div className="lb-stat">
                                        <span className="lb-stat-val">{u.totalNawafil || 0}</span>
                                        <span className="lb-stat-key">نافلة</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
