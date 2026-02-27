import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI, bookAPI } from '../api';

function AdminDashboard({ onLogout }) {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddBook, setShowAddBook] = useState(false);
    const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', available_copies: 1 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, booksRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getUsers(),
                bookAPI.getBooks()
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setBooks(booksRes.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load admin data. You may not have admin access.');
            setLoading(false);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            await bookAPI.createBook(newBook);
            setShowAddBook(false);
            setNewBook({ title: '', author: '', isbn: '', available_copies: 1 });
            fetchData();
        } catch (err) {
            setError('Failed to add book');
        }
    };

    const handleDeleteBook = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await bookAPI.deleteBook(id);
                fetchData();
            } catch (err) {
                setError('Failed to delete book');
            }
        }
    };

    if (loading) {
        return <div className="loading">Loading admin dashboard...</div>;
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <nav>
                    <Link to="/">Book List</Link>
                    <Link to="/borrow">Issue Book</Link>
                    <Link to="/borrow-history">History</Link>
                    <button onClick={onLogout}>Logout</button>
                </nav>
            </header>

            {error && <div className="error">{error}</div>}

            {/* Statistics Section */}
            <section className="stats-section">
                <h2>Library Statistics</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Books</h3>
                        <p>{stats?.total_books || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Users</h3>
                        <p>{stats?.total_users || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Borrows</h3>
                        <p>{stats?.total_borrows || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Active Borrows</h3>
                        <p>{stats?.active_borrows || 0}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Overdue Borrows</h3>
                        <p>{stats?.overdue_borrows || 0}</p>
                    </div>
                </div>
            </section>

            {/* Books Section */}
            <section className="books-section">
                <div className="section-header">
                    <h2>Manage Books</h2>
                    <button onClick={() => setShowAddBook(!showAddBook)}>
                        {showAddBook ? 'Cancel' : 'Add New Book'}
                    </button>
                </div>

                {showAddBook && (
                    <form className="add-book-form" onSubmit={handleAddBook}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newBook.title}
                            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Author"
                            value={newBook.author}
                            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="ISBN"
                            value={newBook.isbn}
                            onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Available Copies"
                            value={newBook.available_copies}
                            onChange={(e) => setNewBook({ ...newBook, available_copies: parseInt(e.target.value) })}
                            min="1"
                            required
                        />
                        <button type="submit">Add Book</button>
                    </form>
                )}

                <table className="books-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>ISBN</th>
                            <th>Available</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book) => (
                            <tr key={book.id}>
                                <td>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{book.isbn}</td>
                                <td>{book.available_copies}</td>
                                <td>
                                    <button onClick={() => handleDeleteBook(book.id)} className="delete-btn">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Users Section */}
            <section className="users-section">
                <h2>Manage Users</h2>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Staff</th>
                            <th>Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.is_staff ? 'Yes' : 'No'}</td>
                                <td>{user.is_active ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default AdminDashboard;
