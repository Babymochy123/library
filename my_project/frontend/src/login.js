import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from './api';

function Login({ setToken }) {
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
            console.log('Login response:', response.data);

            localStorage.setItem('token', response.data.access);
            if (response.data.refresh) {
                localStorage.setItem('refresh', response.data.refresh);
            }

            // Check if user is admin (is_staff or is_superuser)
            const isAdmin = response.data.is_staff === true || response.data.is_superuser === true;
            console.log('Is Admin:', isAdmin);

            // Store isAdmin in localStorage
            localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');

            // Call setToken with both token and isAdmin
            setToken(response.data.access, isAdmin);

            // Navigate based on admin status
            navigate(isAdmin ? '/admin' : '/');
        } catch (err) {
            console.error('Full error:', err);
            console.error('Error response:', err.response);
            console.error('Error message:', err.message);

            let errorMessage = 'Login failed. Please try again.';

            if (!err.response) {
                // Network error - server might not be running
                errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:8000';
            } else if (err.response.data) {
                errorMessage = err.response.data.detail ||
                    err.response.data.error ||
                    JSON.stringify(err.response.data);
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin}>
                <h2>Login</h2>
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
                <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
            </form>
        </div>
    );
}

export default Login;
