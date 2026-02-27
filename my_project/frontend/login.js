import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                username,
                password
            });

            
            localStorage.setItem('token', response.data.access);

            
            if (response.data.is_superuser) {
                window.location.href = 'http://127.0.0.1:8000/admin/';
            } else {
                window.location.href = '/books';
            }

        } catch (error) {
            alert('Login failed');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input type="text" placeholder="Username" value={username}
                onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;