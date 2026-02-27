import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

function AdminLogin({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(username, password);
            console.log('Admin login response:', response.data);

            localStorage.setItem('token', response.data.access);
            if (response.data.refresh) {
                localStorage.setItem('refresh', response.data.refresh);
            }

            // Check if user is admin (is_staff or is_superuser)
            const isAdmin = response.data.is_staff === true || response.data.is_superuser === true;

            if (!isAdmin) {
                setError('You do not have admin access');
                return;
            }

            console.log('Is Admin:', isAdmin);
            localStorage.setItem('isAdmin', 'true');
            setToken(response.data.access, isAdmin);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin}>
                <h2>Admin Login</h2>
                {error && <div className="error">{error}</div>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

export default AdminLogin;
