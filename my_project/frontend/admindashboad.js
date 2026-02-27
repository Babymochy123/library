import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('http://127.0.0.1:8000/api/books/', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setBooks(res.data));

        axios.get('http://127.0.0.1:8000/api/users/', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setUsers(res.data));
    }, []);

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <h3>Books</h3>
            <ul>{books.map(b => <li key={b.id}>{b.title}</li>)}</ul>
            <h3>Users</h3>
            <ul>{users.map(u => <li key={u.id}>{u.username}</li>)}</ul>
        </div>
    );
}

export default AdminDashboard;