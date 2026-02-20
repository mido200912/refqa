import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../utils/toast';
import { FaEnvelope, FaLock, FaSignInAlt, FaMoon } from 'react-icons/fa';
import './Auth.css';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            toast.success(`مرحباً بك ${user.username}!`);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'خطأ في تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-orbs">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
            </div>
            <div className="auth-card scale-in">
                <div className="auth-header">
                    <div className="auth-logo">
                        <FaMoon />
                    </div>
                    <h1 className="auth-title">مرحباً بك في RefQA</h1>
                    <p className="auth-subtitle">منصة المنافسة في تلاوة القرآن الكريم</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error">
                            <span className="auth-error-icon">⚠</span>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">البريد الإلكتروني</label>
                        <div className="form-input-wrapper">
                            <FaEnvelope className="form-input-icon" />
                            <input
                                id="login-email"
                                type="email"
                                className="form-input"
                                placeholder="example@email.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">كلمة المرور</label>
                        <div className="form-input-wrapper">
                            <FaLock className="form-input-icon" />
                            <input
                                id="login-password"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? (
                            <span className="auth-loading"><span className="btn-spinner" /> جارٍ الدخول...</span>
                        ) : (
                            <><FaSignInAlt /> دخول</>
                        )}
                    </button>

                    <div className="auth-divider"><span>أو</span></div>

                    <p className="auth-footer">
                        ليس لديك حساب؟ <Link to="/register">إنشاء حساب جديد</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
