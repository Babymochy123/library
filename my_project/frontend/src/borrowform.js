import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { borrowAPI, bookAPI, adminAPI } from './api';

function BorrowForm() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const [bookId, setBookId] = useState('');
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [availableBooks, setAvailableBooks] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [booksLoading, setBooksLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAvailableBooks();
        if (isAdmin) {
            fetchUsers();
        }
    }, []);

    const fetchAvailableBooks = async () => {
        try {
            const response = await bookAPI.getBooks();
            // Filter only books with available copies
            const available = response.data.filter(book => book.available_copies > 0);
            setAvailableBooks(available);
            setBooksLoading(false);
        } catch (err) {
            setError('Failed to load books');
            setBooksLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            setUsers(response.data);
        } catch (err) {
            setError('Failed to load users');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isAdmin) {
                await borrowAPI.issueToUser({
                    user_id: userId,
                    book_id: bookId,
                });
                setSuccess('Book issued successfully.');
                setUserId('');
            } else {
                await borrowAPI.createBorrow({
                    book: bookId,
                });
                setSuccess('Book borrowed successfully!');
            }

            setBookId('');
            // Refresh the available books list
            fetchAvailableBooks();
            setTimeout(() => navigate('/borrow-history'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    if (booksLoading) {
        return <div className="borrow-form-container">Loading books...</div>;
    }

    return (
        <div className="borrow-form-container">
            <h2>{isAdmin ? 'Issue Book to User' : 'Borrow a Book'}</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            {availableBooks.length === 0 ? (
                <div className="no-books">
                    <p>No books available for borrowing.</p>
                    <Link to="/">Back to Book List</Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {isAdmin && (
                        <>
                            <label htmlFor="user-select">Select a User:</label>
                            <select
                                id="user-select"
                                value={userId}
                                onChange={e => setUserId(e.target.value)}
                                required
                            >
                                <option value="">-- Select a User --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.username} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                    <label htmlFor="book-select">Select a Book:</label>
                    <select
                        id="book-select"
                        value={bookId}
                        onChange={e => setBookId(e.target.value)}
                        required
                    >
                        <option value="">-- Select a Book --</option>
                        {availableBooks.map(book => (
                            <option key={book.id} value={book.id}>
                                {book.title} by {book.author} (Available: {book.available_copies})
                            </option>
                        ))}
                    </select>
                    <button type="submit" disabled={loading || !bookId || (isAdmin && !userId)}>
                        {loading ? 'Processing...' : (isAdmin ? 'Issue Book' : 'Borrow Book')}
                    </button>
                </form>
            )}
            <Link to="/">Back to Book List</Link>
        </div>
    );
}

export default BorrowForm;
