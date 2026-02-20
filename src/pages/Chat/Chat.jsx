import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../utils/toast';
import './Chat.css';

const SOCKET_URL = 'http://localhost:5000';
const JUZ_NAMES = [
    'الجزء الأول - سورة البقرة', 'الجزء الثاني - البقرة', 'الجزء الثالث - البقرة والآل عمران',
    'الجزء الرابع - آل عمران والنساء', 'الجزء الخامس - النساء والمائدة',
    'الجزء السادس - المائدة والأنعام', 'الجزء السابع - الأنعام والأعراف',
    'الجزء الثامن - الأنعام والأعراف والأنفال', 'الجزء التاسع - التوبة',
    'الجزء العاشر - يونس وهود', 'الجزء الحادي عشر - يوسف وهود',
    'الجزء الثاني عشر - هود ويوسف والرعد', 'الجزء الثالث عشر - يوسف والرعد وإبراهيم',
    'الجزء الرابع عشر - الحجر والنحل', 'الجزء الخامس عشر - الإسراء والكهف',
    'الجزء السادس عشر - الكهف ومريم وطه', 'الجزء السابع عشر - الأنبياء والحج',
    'الجزء الثامن عشر - المؤمنون والنور والفرقان', 'الجزء التاسع عشر - الشعراء والنمل',
    'الجزء العشرون - القصص والعنكبوت', 'الجزء الحادي والعشرون - الروم ولقمان',
    'الجزء الثاني والعشرون - الأحزاب وسبأ', 'الجزء الثالث والعشرون - يس والصافات',
    'الجزء الرابع والعشرون - غافر وفصلت', 'الجزء الخامس والعشرون - الشورى والجاثية',
    'الجزء السادس والعشرون - الأحقاف والذاريات', 'الجزء السابع والعشرون - الطور والنجم',
    'الجزء الثامن والعشرون - المجادلة والتغابن', 'الجزء التاسع والعشرون - الملك والإنسان',
    'الجزء الثلاثون - النبأ والناس'
];

let socket = null;

export default function Chat() {
    const { user, token } = useAuth();
    const [selectedJuz, setSelectedJuz] = useState(1);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [juzSearch, setJuzSearch] = useState('');
    const messagesEndRef = useRef(null);
    const prevJuz = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Initialize socket
    useEffect(() => {
        if (!user) return;
        socket = io(SOCKET_URL, { auth: { token } });
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        return () => { socket?.disconnect(); socket = null; };
    }, [user, token]);

    // Join/leave juz room
    useEffect(() => {
        if (!socket || !user) return;

        if (prevJuz.current) {
            socket.emit('leave-juz', { juzNumber: prevJuz.current, username: user.username });
        }

        setLoading(true);
        setMessages([]);

        socket.emit('join-juz', { juzNumber: selectedJuz, userId: user._id, username: user.username });
        prevJuz.current = selectedJuz;

        // Load history
        axios.get(`/chat/${selectedJuz}`)
            .then(res => setMessages(res.data.messages || []))
            .catch(() => toast.error('فشل تحميل الرسائل'))
            .finally(() => setLoading(false));

        // Socket listeners
        const handleNewMsg = (msg) => {
            setMessages(prev => [...prev, msg]);
        };
        const handleMsgDeleted = ({ messageId }) => {
            setMessages(prev => prev.filter(m => m._id !== messageId));
        };
        const handleUserJoined = ({ message }) => {
            setMessages(prev => [...prev, { _id: Date.now(), system: true, content: message }]);
        };

        socket.on('new-message', handleNewMsg);
        socket.on('message-deleted', handleMsgDeleted);
        socket.on('user-joined', handleUserJoined);

        return () => {
            socket?.off('new-message', handleNewMsg);
            socket?.off('message-deleted', handleMsgDeleted);
            socket?.off('user-joined', handleUserJoined);
        };
    }, [selectedJuz, user]);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    const sendMessage = () => {
        if (!input.trim() || !socket || !user) return;
        if (input.length > 500) { toast.error('الرسالة طويلة جداً (500 حرف كحد أقصى)'); return; }

        socket.emit('send-message', {
            juzNumber: selectedJuz,
            userId: user._id,
            username: user.username,
            avatar: user.avatar || '',
            content: input.trim(),
            token
        });
        setInput('');
    };

    const deleteMessage = (msgId) => {
        if (!socket) return;
        socket.emit('delete-message', { messageId: msgId });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const filteredJuz = JUZ_NAMES.filter((_, i) =>
        !juzSearch || String(i + 1).includes(juzSearch) || JUZ_NAMES[i].includes(juzSearch)
    );

    if (!user) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '3rem' }}>💬</span>
            <p style={{ color: 'var(--text-secondary)' }}>يجب تسجيل الدخول للوصول للغرف</p>
        </div>
    );

    const formatTime = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ paddingTop: 'var(--navbar-height)' }}>
            <div className="chat-layout">
                {/* Sidebar */}
                <aside className={`chat-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
                    <div className="chat-sidebar-header">
                        <h2>💬 غرف الأجزاء</h2>
                        <input
                            className="juz-search"
                            placeholder="ابحث عن جزء..."
                            value={juzSearch}
                            onChange={e => setJuzSearch(e.target.value)}
                        />
                    </div>
                    <div className="juz-list">
                        {JUZ_NAMES.map((name, i) => (
                            <div
                                key={i + 1}
                                id={`juz-item-${i + 1}`}
                                className={`juz-item ${selectedJuz === i + 1 ? 'active' : ''}`}
                                onClick={() => { setSelectedJuz(i + 1); setSidebarOpen(false); }}
                            >
                                <div className="juz-num">{i + 1}</div>
                                <div className="juz-label">{`الجزء ${i + 1}`}</div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main chat */}
                <main className="chat-main">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-header-title">📖 {JUZ_NAMES[selectedJuz - 1]}</div>
                            <div className="chat-header-sub">{messages.filter(m => !m.system).length} رسالة</div>
                        </div>
                        <div className="chat-online">
                            <div className={`online-dot ${connected ? '' : 'offline'}`} style={{ background: connected ? 'var(--primary)' : 'var(--danger)' }} />
                            {connected ? 'متصل' : 'غير متصل'}
                        </div>
                    </div>

                    <div className="chat-messages">
                        {loading && <div className="loader"><div className="spinner" /></div>}
                        {messages.map((msg) => {
                            if (msg.system) return (
                                <div key={msg._id} className="chat-system-msg">— {msg.content} —</div>
                            );
                            const isOwn = msg.user === user._id || msg.username === user.username;
                            return (
                                <div key={msg._id} className={`chat-msg ${isOwn ? 'own' : ''}`}>
                                    <div className="msg-avatar">{msg.username?.charAt(0).toUpperCase()}</div>
                                    <div className="msg-bubble-wrapper">
                                        <div className="msg-sender">
                                            {msg.username}
                                            {user?.role === 'admin' && !isOwn && (
                                                <button className="msg-delete-btn" onClick={() => deleteMessage(msg._id)} title="حذف الرسالة">🗑️</button>
                                            )}
                                        </div>
                                        <div className="msg-bubble">{msg.content}</div>
                                        <div className="msg-time">{formatTime(msg.createdAt)}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <div className="chat-input-row">
                            <textarea
                                id="chat-input"
                                className="chat-textarea"
                                placeholder="اكتب رسالتك هنا... (Enter للإرسال)"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                maxLength={500}
                            />
                            <button id="chat-send" className="chat-send-btn" onClick={sendMessage} disabled={!input.trim() || !connected}>
                                📤
                            </button>
                        </div>
                        <div className="char-count">{input.length}/500</div>
                    </div>
                </main>
            </div>

            <button className="chat-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                💬
            </button>
        </div>
    );
}
