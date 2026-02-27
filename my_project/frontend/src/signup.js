import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function SignUp({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Create user
            await axios.post('http://127.0.0.1:8000/api/signup/', {
                username,
                password,
                email,
            });

            // Auto login after signup
            const loginResponse = await axios.post('http://127.0.0.1:8000/api/token/', {
                username,
                password,
            });

            localStorage.setItem('token', loginResponse.data.access);
            if (loginResponse.data.refresh) {
                localStorage.setItem('refresh', loginResponse.data.refresh);
            }

            // Check if user is admin
            const isAdmin = loginResponse.data.is_staff === true || loginResponse.data.is_superuser === true;
            localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');

            setToken(loginResponse.data.access, isAdmin);
            navigate('/');
        } catch (err) {
            console.error('Signup error:', err);
            console.error('Error response:', err.response);
            const errorMessage = err.response?.data?.detail ||
                err.response?.data?.error ||
                JSON.stringify(err.response?.data) ||
                'Sign up failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSignUp}>
                <h2>Sign Up</h2>
                {error && <div className="error">{error}</div>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>
                <p>Already have an account? <Link to="/login">Login here</Link></p>
            </form>
        </div>
    );
}

export default SignUp;
