import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
    FaBook, FaTrophy, FaComments, FaPray, FaStar, FaShieldAlt,
    FaMedal, FaChevronLeft, FaUsers
} from 'react-icons/fa';
import { GiBookmarklet, GiStarMedal } from 'react-icons/gi';
import { MdLeaderboard } from 'react-icons/md';
import { BiSolidQuoteAltRight } from 'react-icons/bi';
import './Home.css';

const FEATURES = [
    {
        icon: FaBook,
        title: 'ختم القرآن الكريم',
        desc: 'اقرأ القرآن من خلال قارئ PDF متكامل وتتبّع صفحاتك وعدد ختماتك',
        color: '#1a9e6e',
        gradient: 'linear-gradient(135deg, rgba(26,158,110,0.15), rgba(26,158,110,0.05))',
        link: '/quran'
    },
    {
        icon: MdLeaderboard,
        title: 'التصنيف العالمي',
        desc: 'نافس شباب مصر وكن من أوائل 100 في عدد ختمات القرآن الكريم',
        color: '#d4a017',
        gradient: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(212,160,23,0.05))',
        link: '/leaderboard'
    },
    {
        icon: FaComments,
        title: 'غرف الجزء',
        desc: 'تحدّث مع إخوتك في غرفة خاصة لكل جزء من أجزاء القرآن الثلاثين',
        color: '#1e7fc4',
        gradient: 'linear-gradient(135deg, rgba(30,127,196,0.15), rgba(30,127,196,0.05))',
        link: '/chat'
    },
    {
        icon: FaPray,
        title: 'الصلاة والنوافل',
        desc: 'سجّل صلواتك ونوافلك يومياً مع إشعارات لأوقات الصلاة',
        color: '#7c52e8',
        gradient: 'linear-gradient(135deg, rgba(124,82,232,0.15), rgba(124,82,232,0.05))',
        link: '/prayer'
    },
    {
        icon: FaStar,
        title: 'الأذكار اليومية',
        desc: 'مجموعة من 50 ذكراً مأثوراً يومياً لتقوية صلتك بالله',
        color: '#c8893a',
        gradient: 'linear-gradient(135deg, rgba(200,137,58,0.15), rgba(200,137,58,0.05))',
        link: '/athkar'
    },
    {
        icon: FaShieldAlt,
        title: 'بيئة آمنة',
        desc: 'مشرف متخصص يتابع المحادثات لضمان بيئة إيجابية ونظيفة',
        color: '#22c78a',
        gradient: 'linear-gradient(135deg, rgba(34,199,138,0.15), rgba(34,199,138,0.05))',
        link: null
    },
];

const MEDALS_ICONS = [GiStarMedal, FaTrophy, FaMedal];
const MEDAL_COLORS = ['#d4a017', '#94a3b8', '#cd7f32'];

export default function Home() {
    const { user } = useAuth();
    const [top3, setTop3] = useState([]);
    const [heroVisible, setHeroVisible] = useState(false);

    useEffect(() => {
        axios.get('/user/leaderboard')
            .then(res => setTop3(res.data.leaderboard?.slice(0, 5) || []))
            .catch(() => { });
        setTimeout(() => setHeroVisible(true), 100);
    }, []);

    return (
        <div className="home-page">
            {/* ========== HERO ========== */}
            <section className="hero">
                <div className="hero-bg-orbs">
                    <div className="orb orb-1" />
                    <div className="orb orb-2" />
                    <div className="orb orb-3" />
                </div>

                {/* Bismillah line */}
                <div className={`hero-bismillah ${heroVisible ? 'fade-in-down' : ''}`}>
                    <BiSolidQuoteAltRight />
                    <span>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</span>
                    <BiSolidQuoteAltRight style={{ transform: 'scaleX(-1)' }} />
                </div>

                <div className={`hero-content ${heroVisible ? 'fade-in-up' : ''}`}>
                    <div className="hero-badge delay-1 fade-in-up">
                        <FaMedal />
                        <span>منصة المنافسة القرآنية الأولى في مصر</span>
                    </div>

                    <h1 className="hero-title delay-2 fade-in-up">
                        نافس وارتقِ مع <span className="highlight">رفقه</span>
                        <br />في ختم القرآن الكريم
                    </h1>

                    <p className="hero-subtitle delay-3 fade-in-up">
                        انضم لمجتمع شباب مصر وتنافس في أجل المنافسات
                        <br />سجّل ختماتك، تابع صلواتك، وكن من أوائل 100 على مستوى مصر
                    </p>

                    <div className="hero-cta delay-4 fade-in-up">
                        {user ? (
                            <Link to="/quran" className="btn btn-primary hero-btn hero-btn-main">
                                <FaBook /> ابدأ القراءة الآن
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn btn-primary hero-btn hero-btn-main">
                                    <FaUsers /> انضم الآن مجاناً
                                </Link>
                                <Link to="/leaderboard" className="btn btn-secondary hero-btn">
                                    <MdLeaderboard /> شاهد التصنيف
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="stats-bar delay-5 fade-in-up">
                        <div className="stat-item">
                            <span className="stat-value">30</span>
                            <span className="stat-label">غرفة جزء</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">50</span>
                            <span className="stat-label">ذكر يومي</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">100</span>
                            <span className="stat-label">مركز عالمي</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">5</span>
                            <span className="stat-label">صلوات يومية</span>
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="scroll-hint">
                    <div className="scroll-dot" />
                </div>
            </section>

            {/* ========== VERSE BANNER ========== */}
            <div className="verse-banner">
                <div className="container verse-banner-inner">
                    <div className="verse-icon"><FaBook /></div>
                    <div className="verse-text">
                        <p className="verse-arabic">
                            ﴿ إِنَّ الَّذِينَ يَتْلُونَ كِتَابَ اللَّهِ وَأَقَامُوا الصَّلَاةَ ﴾
                        </p>
                        <p className="verse-ref">سورة فاطر - آية 29</p>
                    </div>
                    <div className="verse-icon"><FaBook /></div>
                </div>
            </div>

            {/* ========== FEATURES ========== */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">ماذا يقدم RefQA؟</h2>
                        <p className="section-subtitle">كل ما تحتاجه لرحلتك القرآنية في مكان واحد</p>
                    </div>
                    <div className="features-grid">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            const content = (
                                <div
                                    key={i}
                                    className="feature-card fade-in-up"
                                    style={{ animationDelay: `${i * 0.08}s`, background: f.gradient }}
                                >
                                    <div className="feature-icon-wrap" style={{ color: f.color }}>
                                        <Icon className="feature-icon" />
                                        <div className="feature-icon-ring" style={{ borderColor: f.color }} />
                                    </div>
                                    <h3 className="feature-title" style={{ color: f.color }}>{f.title}</h3>
                                    <p className="feature-desc">{f.desc}</p>
                                    {f.link && (
                                        <div className="feature-arrow" style={{ color: f.color }}>
                                            <FaChevronLeft />
                                        </div>
                                    )}
                                </div>
                            );
                            return f.link
                                ? <Link to={f.link} key={i} className="feature-card-link">{content}</Link>
                                : content;
                        })}
                    </div>
                </div>
            </section>

            {/* ========== LEADERBOARD PREVIEW ========== */}
            <section className="top-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FaTrophy style={{ fontSize: '1.5rem', verticalAlign: 'middle', marginLeft: '0.5rem', color: '#d4a017' }} />
                            أبطال RefQA
                        </h2>
                        <p className="section-subtitle">أكثر المتلوّين للقرآن الكريم على مستوى مصر</p>
                    </div>

                    {top3.length === 0 ? (
                        <div className="empty-leaderboard">
                            <GiBookmarklet className="empty-icon" />
                            <p>سجّل أول ختمة وكن الأول في التصنيف!</p>
                        </div>
                    ) : (
                        <div className="top-list">
                            {top3.map((u, i) => {
                                const MedalIcon = i < 3 ? MEDALS_ICONS[i] : null;
                                const medalColor = i < 3 ? MEDAL_COLORS[i] : 'var(--text-muted)';
                                return (
                                    <div key={u._id} className={`top-item ${i === 0 ? 'first-place' : ''}`}>
                                        <div className="top-rank" style={{ color: medalColor }}>
                                            {MedalIcon
                                                ? <MedalIcon style={{ fontSize: '1.4rem' }} />
                                                : <span className="rank-num">#{i + 1}</span>
                                            }
                                        </div>
                                        <div className="top-avatar" style={{
                                            background: i === 0
                                                ? 'linear-gradient(135deg, #d4a017, #a07010)'
                                                : i === 1
                                                    ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                                                    : 'linear-gradient(135deg, #cd7f32, #a0522d)'
                                        }}>
                                            {u.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="top-info">
                                            <div className="top-name">{u.username}</div>
                                            <div className="top-stat">
                                                <FaBook style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }} />
                                                {u.totalPagesRead || 0} صفحة مقروءة
                                            </div>
                                        </div>
                                        <div className="top-completions" style={{ color: i === 0 ? '#d4a017' : 'var(--primary-light)' }}>
                                            {u.quranCompletions}
                                            <small>ختمة</small>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link to="/leaderboard" className="btn btn-secondary">
                            <MdLeaderboard /> عرض التصنيف الكامل
                        </Link>
                    </div>
                </div>
            </section>

            {/* ========== CTA SECTION ========== */}
            {!user && (
                <section className="cta-section">
                    <div className="container cta-inner">
                        <div className="cta-ornament">✦ ✦ ✦</div>
                        <h2 className="cta-title">ابدأ رحلتك القرآنية اليوم</h2>
                        <p className="cta-sub">انضم لآلاف المسلمين في مصر وتنافس في أشرف المنافسات</p>
                        <div className="cta-btns">
                            <Link to="/register" className="btn btn-gold">
                                <FaUsers /> إنشاء حساب مجاني
                            </Link>
                            <Link to="/login" className="btn btn-secondary">
                                تسجيل الدخول
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
