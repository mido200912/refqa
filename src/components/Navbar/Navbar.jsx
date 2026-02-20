import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaHome, FaBook, FaTrophy, FaComments, FaStar,
    FaPray, FaShieldAlt, FaSignInAlt, FaUserPlus,
    FaSignOutAlt, FaBars, FaTimes, FaMoon
} from 'react-icons/fa';
import './Navbar.css';

const NAV_ITEMS = [
    { to: '/', label: 'الرئيسية', icon: FaHome },
    { to: '/quran', label: 'ختم القرآن', icon: FaBook },
    { to: '/leaderboard', label: 'التصنيف', icon: FaTrophy },
    { to: '/chat', label: 'غرف الجزء', icon: FaComments },
    { to: '/athkar', label: 'الأذكار', icon: FaStar },
    { to: '/prayer', label: 'الصلاة', icon: FaPray },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner">
                <NavLink to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
                    <div className="navbar-logo-icon">
                        <FaMoon />
                    </div>
                    <span className="navbar-logo-text">رفقه</span>
                    <span className="navbar-logo-sub">RefQA</span>
                </NavLink>

                <button
                    className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="القائمة"
                >
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>

                <ul className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
                    {NAV_ITEMS.map(item => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                                end={item.to === '/'}
                            >
                                <item.icon className="nav-icon" />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                    {user?.role === 'admin' && (
                        <li>
                            <NavLink
                                to="/admin"
                                className={({ isActive }) => `nav-link admin-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                <FaShieldAlt className="nav-icon" /> الأدمن
                            </NavLink>
                        </li>
                    )}
                </ul>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <div className="navbar-user">
                                <div className="navbar-avatar">{user.username?.charAt(0).toUpperCase()}</div>
                                <span className="navbar-username">{user.username}</span>
                                {user.role === 'admin' && <span className="navbar-role-badge">أدمن</span>}
                            </div>
                            <button className="btn-logout" onClick={handleLogout} title="تسجيل الخروج">
                                <FaSignOutAlt />
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="btn btn-secondary nav-auth-btn">
                                <FaSignInAlt /> دخول
                            </NavLink>
                            <NavLink to="/register" className="btn btn-primary nav-auth-btn">
                                <FaUserPlus /> تسجيل
                            </NavLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
