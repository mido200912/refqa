import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../utils/toast';
import {
    FaHandsHelping, FaMosque, FaBell, FaBellSlash, FaCheckCircle,
    FaPrayingHands, FaClipboardList, FaSun, FaCloudSun, FaMoon, FaStar
} from 'react-icons/fa';
import { WiSunrise, WiSunset, WiDaySunny } from 'react-icons/wi';
import './Prayer.css';

const PRAYERS = [
    { name: 'الفجر', Icon: FaStar, key: 'fajr', color: '#7c52e8' },
    { name: 'الشروق', Icon: WiSunrise, key: 'sunrise', color: '#f59e0b' },
    { name: 'الظهر', Icon: WiDaySunny, key: 'dhuhr', color: '#eab308' },
    { name: 'العصر', Icon: FaCloudSun, key: 'asr', color: '#f97316' },
    { name: 'المغرب', Icon: WiSunset, key: 'maghrib', color: '#ef4444' },
    { name: 'العشاء', Icon: FaMoon, key: 'isha', color: '#3b82f6' },
];

function getNextPrayerIdx(times) {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    for (let i = 0; i < times.length; i++) {
        const [h, m] = times[i].split(':').map(Number);
        if (h * 60 + m > current) return i;
    }
    return 0;
}

function requestNotificationPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    Notification.requestPermission();
    return false;
}

export default function Prayer() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ prayersToday: 0, totalPrayers: 0, nawafilToday: 0, totalNawafil: 0 });
    const [prayerTimes, setPrayerTimes] = useState([]);
    const [nextPrayer, setNextPrayer] = useState(0);
    const [notifEnabled, setNotifEnabled] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingPrayer, setLoadingPrayer] = useState(false);
    const [loadingNawafil, setLoadingNawafil] = useState(false);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=5`
                    );
                    const data = await res.json();
                    if (data.status === 'OK') {
                        const t = data.data.timings;
                        const times = [t.Fajr, t.Sunrise, t.Dhuhr, t.Asr, t.Maghrib, t.Isha];
                        setPrayerTimes(times);
                        setNextPrayer(getNextPrayerIdx(times));
                    }
                } catch { }
            },
            () => {
                setPrayerTimes(['05:00', '06:30', '12:00', '15:30', '18:00', '19:30']);
                setNextPrayer(getNextPrayerIdx(['05:00', '06:30', '12:00', '15:30', '18:00', '19:30']));
            }
        );
    }, []);

    useEffect(() => {
        if (!user) return;
        axios.get('/user/stats')
            .then(res => {
                const s = res.data.stats;
                setStats({
                    prayersToday: s.prayersToday || 0,
                    totalPrayers: s.totalPrayers || 0,
                    nawafilToday: s.nawafilToday || 0,
                    totalNawafil: s.totalNawafil || 0
                });
            }).catch(() => { });
    }, [user]);

    useEffect(() => {
        if (!notifEnabled || prayerTimes.length === 0) return;
        const interval = setInterval(() => {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const current = `${h}:${m}`;
            PRAYERS.forEach((p, i) => {
                if (prayerTimes[i] === current && Notification.permission === 'granted') {
                    new Notification(`حان وقت ${p.name}`, {
                        body: 'حي على الصلاة، حي على الفلاح',
                        icon: '/favicon.ico'
                    });
                }
            });
        }, 30000);
        return () => clearInterval(interval);
    }, [notifEnabled, prayerTimes]);

    const handleLogPrayer = async () => {
        if (!user) { toast.error('يجب تسجيل الدخول أولاً'); return; }
        setLoadingPrayer(true);
        try {
            const res = await axios.put('/user/prayer');
            setStats(prev => ({ ...prev, prayersToday: res.data.prayersToday, totalPrayers: res.data.totalPrayers }));
            setHistory(prev => [{ type: 'prayer', time: new Date(), msg: 'تم تسجيل صلاة' }, ...prev.slice(0, 9)]);
            toast.success(res.data.message);
        } catch { toast.error('فشل التسجيل'); }
        finally { setLoadingPrayer(false); }
    };

    const handleLogNawafil = async () => {
        if (!user) { toast.error('يجب تسجيل الدخول أولاً'); return; }
        setLoadingNawafil(true);
        try {
            const res = await axios.put('/user/nawafil');
            setStats(prev => ({ ...prev, nawafilToday: res.data.nawafilToday, totalNawafil: res.data.totalNawafil }));
            setHistory(prev => [{ type: 'nawafil', time: new Date(), msg: 'تم تسجيل نافلة' }, ...prev.slice(0, 9)]);
            toast.success(res.data.message);
        } catch { toast.error('فشل التسجيل'); }
        finally { setLoadingNawafil(false); }
    };

    const toggleNotif = () => {
        if (!notifEnabled) {
            requestNotificationPermission();
            if (Notification.permission === 'denied') { toast.error('الإشعارات محظورة في المتصفح'); return; }
        }
        setNotifEnabled(!notifEnabled);
        toast.info(!notifEnabled ? 'تم تفعيل إشعارات الصلاة' : 'تم إيقاف الإشعارات');
    };

    const formatTime = (d) => new Date(d).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="page-wrapper">
            <div className="container prayer-page">
                <div className="prayer-header">
                    <h1 className="section-title">
                        <FaPrayingHands style={{ fontSize: '1.5rem', verticalAlign: 'middle', marginLeft: '0.5rem' }} />
                        الصلاة والنوافل
                    </h1>
                    <p className="section-subtitle">سجّل صلاتك ونوافلك اليومية وتابع مواقيت الصلاة</p>
                </div>

                {/* Prayer Times */}
                <div className="prayer-times-card">
                    <div className="prayer-times-title">
                        <FaMosque /> مواقيت الصلاة اليوم
                    </div>
                    <div className="prayer-times-grid">
                        {PRAYERS.map((p, i) => (
                            <div key={p.key} className={`prayer-time-item ${i === nextPrayer ? 'next-prayer' : ''}`}
                                style={i === nextPrayer ? { '--prayer-color': p.color } : {}}>
                                <p.Icon className="prayer-time-icon" style={{ color: i === nextPrayer ? p.color : 'inherit' }} />
                                <div className="prayer-time-name">{p.name}</div>
                                <div className="prayer-time-val">{prayerTimes[i] || '--:--'}</div>
                                {i === nextPrayer && <span className="next-badge">القادمة</span>}
                            </div>
                        ))}
                    </div>
                    <div className="notif-toggle-row">
                        <label className="toggle-switch">
                            <input id="notif-toggle" type="checkbox" checked={notifEnabled} onChange={toggleNotif} />
                            <span className="toggle-slider" />
                        </label>
                        <span><FaBell style={{ fontSize: '0.85rem', color: notifEnabled ? 'var(--primary-light)' : 'inherit' }} /> إشعارات مواقيت الصلاة</span>
                        {notifEnabled && <span style={{ color: 'var(--primary-light)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FaCheckCircle /> مفعّلة</span>}
                    </div>
                </div>

                {/* Log Section */}
                <div className="prayer-log-section">
                    {/* Prayer card */}
                    <div className="log-card">
                        <FaMosque className="log-icon log-icon-blue" />
                        <h2 className="log-title">الصلوات المفروضة</h2>
                        <p className="log-subtitle">سجّل كل صلاة بعد أدائها</p>
                        <div className="prayer-dots">
                            {[1, 2, 3, 4, 5].map(n => (
                                <div key={n} className={`prayer-dot ${n <= stats.prayersToday ? 'filled' : ''}`} />
                            ))}
                        </div>
                        <div className="log-count">
                            {stats.prayersToday}
                            <small>من 5 اليوم</small>
                        </div>
                        <div className="log-total">إجمالي: {stats.totalPrayers} صلاة</div>
                        <button
                            id="log-prayer-btn"
                            className="log-btn prayer-btn"
                            onClick={handleLogPrayer}
                            disabled={loadingPrayer || stats.prayersToday >= 5}
                        >
                            {stats.prayersToday >= 5
                                ? <><FaCheckCircle /> أتممت صلوات اليوم!</>
                                : loadingPrayer ? '...'
                                    : <><FaCheckCircle /> تسجيل صلاة</>
                            }
                        </button>
                    </div>

                    {/* Nawafil card */}
                    <div className="log-card">
                        <FaHandsHelping className="log-icon log-icon-purple" />
                        <h2 className="log-title">النوافل والسنن</h2>
                        <p className="log-subtitle">سجّل نوافلك وسننك</p>
                        <div className="log-count">
                            {stats.nawafilToday}
                            <small>نافلة اليوم</small>
                        </div>
                        <div className="log-total">إجمالي: {stats.totalNawafil} نافلة</div>
                        <button
                            id="log-nawafil-btn"
                            className="log-btn nawafil-btn"
                            onClick={handleLogNawafil}
                            disabled={loadingNawafil}
                        >
                            {loadingNawafil ? '...' : <><FaHandsHelping /> تسجيل نافلة</>}
                        </button>
                    </div>
                </div>

                {/* History */}
                {history.length > 0 && (
                    <div className="prayer-history">
                        <div className="prayer-history-title">
                            <FaClipboardList style={{ marginLeft: '0.5rem' }} />
                            السجل اليومي
                        </div>
                        {history.map((h, i) => (
                            <div key={i} className="history-row">
                                <span className="history-icon">
                                    {h.type === 'prayer' ? <FaMosque /> : <FaHandsHelping />}
                                </span>
                                <span className="history-text">{h.msg}</span>
                                <span className="history-time">{formatTime(h.time)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
