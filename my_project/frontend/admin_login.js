import React, { useState } from 'react';
import axios from 'axios';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                username,
                password
            });

            // hifadhi token
            localStorage.setItem('token', response.data.access);

            // check kama ni admin
            if (response.data.is_superuser || response.data.is_staff) {
                // redirect moja kwa moja Django Admin
                window.location.href = 'http://127.0.0.1:8000/admin/';
            } else {
                alert('You are not an admin!');
            }

        } catch (error) {
            alert('Login failed');
        }
    };

    return (
        <div>
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Admin Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Admin Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit">Login as Admin</button>
            </form>
        </div>
    );
}

export default AdminLogin;