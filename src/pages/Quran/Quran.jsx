import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../utils/toast';
import {
    FaBook, FaChevronRight, FaChevronLeft, FaStar,
    FaFileAlt, FaBookReader, FaBolt, FaCheckCircle,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { MdMenuBook } from 'react-icons/md';
import './Quran.css';

// رابط القرآن الكريم الخارجي - بدون تحميل على السيرفر
const QURAN_PDF_BASE = 'https://www.pdfquran.com/download/standard2/standard2-quran.pdf';
const TOTAL_PAGES = 624;

// نستخدم Google Docs Viewer لعرض PDF خارجي بدون مشاكل CORS
const getViewerUrl = (page) =>
    `https://docs.google.com/viewer?url=${encodeURIComponent(QURAN_PDF_BASE)}&embedded=true#page=${page}`;

export default function Quran() {
    const { user, setUser } = useAuth();
    const [currentPage, setCurrentPage] = useState(user?.currentPage || 1);
    const [pageInput, setPageInput] = useState(String(user?.currentPage || 1));
    const [completions, setCompletions] = useState(user?.quranCompletions || 0);
    const [totalPages, setTotalPages] = useState(user?.totalPagesRead || 0);
    const [saving, setSaving] = useState(false);

    const progress = Math.round((currentPage / TOTAL_PAGES) * 100);

    useEffect(() => {
        axios.get('/user/stats')
            .then(res => {
                const s = res.data.stats;
                setCurrentPage(s.currentPage || 1);
                setPageInput(String(s.currentPage || 1));
                setCompletions(s.quranCompletions || 0);
                setTotalPages(s.totalPagesRead || 0);
            })
            .catch(() => { });
    }, []);

    const savePage = useCallback(async (page) => {
        if (!user) return;
        setSaving(true);
        try {
            const res = await axios.put('/user/quran/page', { page });
            setCurrentPage(page);
            setPageInput(String(page));
            setTotalPages(res.data.totalPagesRead);
            if (setUser) setUser(prev => prev ? { ...prev, currentPage: page, totalPagesRead: res.data.totalPagesRead } : prev);
        } catch (err) {
            toast.error('فشل حفظ الصفحة');
        } finally {
            setSaving(false);
        }
    }, [user, setUser]);

    const handleNextPage = () => { if (currentPage < TOTAL_PAGES) savePage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 1) savePage(currentPage - 1); };

    const handlePageInput = (e) => {
        const val = e.target.value;
        setPageInput(val);
        const num = parseInt(val);
        if (num >= 1 && num <= TOTAL_PAGES) savePage(num);
    };

    const handleCompleteQuran = async () => {
        if (currentPage < TOTAL_PAGES) {
            const confirm = window.confirm('هل أتممت قراءة القرآن كاملاً؟ سيتم إضافة ختمة جديدة لحسابك!');
            if (!confirm) return;
        }
        try {
            const res = await axios.put('/user/quran/complete');
            setCompletions(res.data.completions);
            setCurrentPage(1);
            setPageInput('1');
            toast.success(res.data.message);
        } catch (err) {
            toast.error('حدث خطأ ما');
        }
    };

    if (!user) return (
        <div className="page-wrapper container" style={{ textAlign: 'center', paddingTop: '6rem' }}>
            <FaBook style={{ fontSize: '3rem', color: 'var(--primary)', display: 'block', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>يجب تسجيل الدخول أولاً لمتابعة قراءتك</p>
        </div>
    );

    const iframeSrc = getViewerUrl(currentPage);

    return (
        <div className="page-wrapper">
            <div className="container quran-page">
                <div className="quran-topbar">
                    <h1 className="quran-topbar-title">
                        <MdMenuBook style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }} />
                        قراءة القرآن الكريم
                    </h1>
                    <button className="complete-btn" onClick={handleCompleteQuran}>
                        <FaCheckCircle /> تسجيل ختمة كاملة
                    </button>
                </div>

                {/* Stats */}
                <div className="quran-stats">
                    <div className="qs-card">
                        <FaStar className="qs-icon" />
                        <span className="qs-value">{completions}</span>
                        <span className="qs-label">ختمة مكتملة</span>
                    </div>
                    <div className="qs-card">
                        <FaFileAlt className="qs-icon" />
                        <span className="qs-value">{currentPage}</span>
                        <span className="qs-label">الصفحة الحالية</span>
                    </div>
                    <div className="qs-card">
                        <FaBookReader className="qs-icon" />
                        <span className="qs-value">{totalPages}</span>
                        <span className="qs-label">مجموع الصفحات المقروءة</span>
                    </div>
                    <div className="qs-card">
                        <FaBolt className="qs-icon" />
                        <span className="qs-value">{progress}%</span>
                        <span className="qs-label">نسبة الختمة الحالية</span>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="quran-viewer-wrapper">
                    <div className="quran-viewer-header">
                        <span className="quran-viewer-label">
                            <MdMenuBook /> المصحف الشريف
                        </span>
                        <a
                            href={QURAN_PDF_BASE}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="quran-direct-link"
                            title="فتح المصحف في صفحة جديدة"
                        >
                            <FaExternalLinkAlt /> فتح مباشرة
                        </a>
                        <div className="quran-viewer-controls">
                            <button id="quran-prev" className="ctrl-btn" onClick={handlePrevPage} disabled={currentPage <= 1 || saving}>
                                <FaChevronRight />
                            </button>
                            <div className="page-indicator">
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ص</span>
                                <input
                                    type="number"
                                    className="page-input"
                                    value={pageInput}
                                    onChange={handlePageInput}
                                    min={1} max={TOTAL_PAGES}
                                />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/ {TOTAL_PAGES}</span>
                            </div>
                            <button id="quran-next" className="ctrl-btn" onClick={handleNextPage} disabled={currentPage >= TOTAL_PAGES || saving}>
                                <FaChevronLeft />
                            </button>
                        </div>
                        {saving && <span className="saving-indicator">جاري الحفظ...</span>}
                    </div>

                    <div className="quran-iframe-wrapper">
                        <iframe
                            key={currentPage}
                            src={iframeSrc}
                            className="quran-iframe"
                            title="القرآن الكريم"
                            allowFullScreen
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        />
                        <div className="quran-iframe-fallback">
                            <MdMenuBook style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem', display: 'block' }} />
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>في حالة عدم ظهور المصحف</p>
                            <a href={QURAN_PDF_BASE} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                <FaExternalLinkAlt /> افتح المصحف مباشرة
                            </a>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="quran-progress-bar">
                        <span className="progress-text">التقدم في الختمة:</span>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="progress-text">{progress}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
