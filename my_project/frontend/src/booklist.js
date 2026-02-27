import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookAPI } from './api';

function BookList({ onLogout }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await bookAPI.getBooks();
            setBooks(response.data.results || response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch books');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    if (loading) return <div>Loading books...</div>;

    return (
        <div className="booklist-container">
            <nav>
                <h1>Library Management System</h1>
                <div>
                    <Link to="/">Books</Link>
                    <Link to="/borrow">Borrow Book</Link>
                    <Link to="/borrow-history">Borrow History</Link>
                    <Link to="/return-book">Return Book</Link>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="content">
                {error && <div className="error">{error}</div>}
                <h2>Available Books</h2>
                {books.length === 0 ? (
                    <p>No books available</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>ISBN</th>
                                <th>Available Copies</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map(book => (
                                <tr key={book.id}>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>{book.isbn}</td>
                                    <td>{book.available_copies}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default BookList;
