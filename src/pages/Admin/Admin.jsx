import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../utils/toast';
import './Admin.css';

export default function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [msgPage, setMsgPage] = useState(1);
    const [msgTotal, setMsgTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // Guard - admin only
    useEffect(() => {
        if (user && user.role !== 'admin') navigate('/');
    }, [user, navigate]);

    // Load stats
    useEffect(() => {
        axios.get('/admin/stats').then(res => setStats(res.data.stats)).catch(() => { });
    }, []);

    // Load users
    useEffect(() => {
        if (activeTab !== 'users') return;
        setLoading(true);
        axios.get('/admin/users').then(res => setUsers(res.data.users || [])).catch(() => { }).finally(() => setLoading(false));
    }, [activeTab]);

    // Load messages
    useEffect(() => {
        if (activeTab !== 'messages') return;
        setLoading(true);
        axios.get(`/chat/admin/all-messages?page=${msgPage}`)
            .then(res => { setMessages(res.data.messages || []); setMsgTotal(res.data.total || 0); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [activeTab, msgPage]);

    const deleteUser = async (id) => {
        if (!window.confirm('هل تريد حذف هذا المستخدم؟')) return;
        try {
            await axios.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
            toast.success('تم حذف المستخدم');
        } catch (err) { toast.error(err.response?.data?.message || 'فشل الحذف'); }
    };

    const deleteMessage = async (id) => {
        try {
            await axios.delete(`/chat/message/${id}`);
            setMessages(prev => prev.map(m => m._id === id ? { ...m, isDeleted: true } : m));
            toast.success('تم حذف الرسالة');
        } catch { toast.error('فشل الحذف'); }
    };

    const filteredUsers = users.filter(u =>
        !userSearch || u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.includes(userSearch)
    );

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="page-wrapper">
            <div className="container admin-page">
                <div className="admin-header">
                    <h1 className="admin-title">
                        🛡️ لوحة التحكم
                        <span className="admin-title-badge">ADMIN</span>
                    </h1>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="admin-stats-grid">
                        <div className="admin-stat">
                            <span className="admin-stat-icon">👥</span>
                            <span className="admin-stat-val">{stats.totalUsers}</span>
                            <span className="admin-stat-key">إجمالي المستخدمين</span>
                        </div>
                        <div className="admin-stat">
                            <span className="admin-stat-icon">📖</span>
                            <span className="admin-stat-val">{stats.totalCompletions}</span>
                            <span className="admin-stat-key">إجمالي الختمات</span>
                        </div>
                        <div className="admin-stat">
                            <span className="admin-stat-icon">🕌</span>
                            <span className="admin-stat-val">{stats.totalPrayers}</span>
                            <span className="admin-stat-key">إجمالي الصلوات</span>
                        </div>
                        <div className="admin-stat">
                            <span className="admin-stat-icon">🏆</span>
                            <span className="admin-stat-val">{stats.topUser?.quranCompletions || 0}</span>
                            <span className="admin-stat-key">أعلى عدد ختمات - {stats.topUser?.username || '-'}</span>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="admin-tabs">
                    {[
                        { key: 'overview', label: '📊 نظرة عامة' },
                        { key: 'users', label: '👥 المستخدمون' },
                        { key: 'messages', label: '💬 الرسائل' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview */}
                {activeTab === 'overview' && (
                    <div style={{ color: 'var(--text-secondary)', lineHeight: 2 }}>
                        <div className="card">
                            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>📌 ملاحظات الأدمن</h3>
                            <ul style={{ paddingRight: '1.5rem' }}>
                                <li>يمكنك حذف أي رسالة غير لائقة من تبويب "الرسائل"</li>
                                <li>يمكنك حذف أي مستخدم مخالف من تبويب "المستخدمون"</li>
                                <li>الرسائل المحذوفة لا تظهر في غرف الدردشة تلقائياً</li>
                                <li>كود الأدمن موجود في ملف .env في الباكند - ADMIN_CODE</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="admin-table-wrap">
                        <div className="admin-table-header">
                            <span className="admin-table-title">👥 المستخدمون ({filteredUsers.length})</span>
                            <input
                                id="admin-user-search"
                                className="admin-search"
                                placeholder="ابحث بالاسم أو البريد..."
                                value={userSearch}
                                onChange={e => setUserSearch(e.target.value)}
                            />
                        </div>
                        {loading && <div className="loader"><div className="spinner" /></div>}
                        {!loading && filteredUsers.length === 0 && <div className="admin-empty">لا يوجد مستخدمون</div>}
                        {filteredUsers.map(u => (
                            <div key={u._id} className="admin-row">
                                <div className="admin-row-avatar">{u.username?.charAt(0).toUpperCase()}</div>
                                <div className="admin-row-info">
                                    <div className="admin-row-name">
                                        {u.username}
                                        <span className={`admin-row-role ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>{u.role}</span>
                                    </div>
                                    <div className="admin-row-email">{u.email}</div>
                                </div>
                                <div className="admin-row-stats">
                                    <div className="admin-row-stat">
                                        <span className="admin-row-stat-val">{u.quranCompletions}</span>
                                        <span className="admin-row-stat-key">ختمة</span>
                                    </div>
                                    <div className="admin-row-stat">
                                        <span className="admin-row-stat-val">{u.totalPrayers}</span>
                                        <span className="admin-row-stat-key">صلاة</span>
                                    </div>
                                </div>
                                {u.role !== 'admin' && (
                                    <button className="admin-delete-btn" onClick={() => deleteUser(u._id)}>🗑️ حذف</button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                    <div className="admin-table-wrap">
                        <div className="admin-table-header">
                            <span className="admin-table-title">💬 رسائل الدردشة ({msgTotal})</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} disabled={msgPage <= 1} onClick={() => setMsgPage(p => p - 1)}>◀ السابق</button>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>صفحة {msgPage}</span>
                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => setMsgPage(p => p + 1)}>التالي ▶</button>
                            </div>
                        </div>
                        {loading && <div className="loader"><div className="spinner" /></div>}
                        {!loading && messages.length === 0 && <div className="admin-empty">لا توجد رسائل</div>}
                        {messages.map(msg => (
                            <div key={msg._id} className={`admin-msg-row ${msg.isDeleted ? 'deleted' : ''}`}>
                                <div className="admin-row-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>{msg.username?.charAt(0)?.toUpperCase()}</div>
                                <div className="admin-msg-info">
                                    <div className="admin-msg-sender">
                                        {msg.username}
                                        <span className="admin-msg-juz">الجزء {msg.juzNumber}</span>
                                        {msg.isDeleted && <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>محذوفة</span>}
                                    </div>
                                    <div className="admin-msg-content">{msg.content}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                                    <span className="admin-msg-time">{new Date(msg.createdAt).toLocaleString('ar-EG')}</span>
                                    {!msg.isDeleted && (
                                        <button className="admin-delete-btn" onClick={() => deleteMessage(msg._id)}>🗑️ حذف</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
