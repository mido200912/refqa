import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../utils/toast';
import { FaUser, FaEnvelope, FaLock, FaShieldAlt, FaUserPlus, FaKey } from 'react-icons/fa';
import './Auth.css';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '', adminCode: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAdmin, setShowAdmin] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
        setLoading(true);
        try {
            await register(form.username, form.email, form.password, form.adminCode);
            toast.success('تم إنشاء الحساب بنجاح! أهلاً بك');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'خطأ في التسجيل');
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
                    <div className="auth-logo register-logo">
                        <FaUserPlus />
                    </div>
                    <h1 className="auth-title">إنشاء حساب جديد</h1>
                    <p className="auth-subtitle">انضم لمجتمع حُفّاظ ومتلوّ القرآن الكريم</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error">
                            <span className="auth-error-icon">⚠</span>
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">اسم المستخدم <span>*</span></label>
                        <div className="form-input-wrapper">
                            <FaUser className="form-input-icon" />
                            <input id="reg-username" type="text" className="form-input"
                                placeholder="أدخل اسمك" value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })} required minLength={3} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">البريد الإلكتروني <span>*</span></label>
                        <div className="form-input-wrapper">
                            <FaEnvelope className="form-input-icon" />
                            <input id="reg-email" type="email" className="form-input"
                                placeholder="example@email.com" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">كلمة المرور <span>*</span></label>
                        <div className="form-input-wrapper">
                            <FaLock className="form-input-icon" />
                            <input id="reg-password" type="password" className="form-input"
                                placeholder="6 أحرف على الأقل" value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label admin-label" style={{ cursor: 'pointer' }} onClick={() => setShowAdmin(!showAdmin)}>
                            <FaShieldAlt className="admin-icon" />
                            كود الأدمن (اختياري)
                            <span className="admin-toggle">{showAdmin ? '▲' : '▼'}</span>
                        </label>
                        {showAdmin && (
                            <div className="form-input-wrapper">
                                <FaKey className="form-input-icon" />
                                <input id="reg-admincode" type="password" className="form-input"
                                    placeholder="أدخل كود الأدمن إذا كان لديك" value={form.adminCode}
                                    onChange={e => setForm({ ...form, adminCode: e.target.value })} />
                            </div>
                        )}
                        <small className="auth-admin-hint">* صاحب الموقع فقط يملك هذا الكود</small>
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? (
                            <span className="auth-loading"><span className="btn-spinner" /> جارٍ التسجيل...</span>
                        ) : (
                            <><FaUserPlus /> إنشاء الحساب</>
                        )}
                    </button>

                    <p className="auth-footer">
                        لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
