import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('refqa_token') || null);
    const [loading, setLoading] = useState(true);

    axios.defaults.baseURL = 'https://refqa-0-lhx8.vercel.app/api';

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get('/auth/me')
                .then(res => setUser(res.data.user))
                .catch(() => { setToken(null); localStorage.removeItem('refqa_token'); })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post('/auth/login', { email, password });
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('refqa_token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return newUser;
    };

    const register = async (username, email, password, adminCode) => {
        const res = await axios.post('/auth/register', { username, email, password, adminCode });
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('refqa_token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return newUser;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('refqa_token');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
