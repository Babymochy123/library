import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { borrowAPI } from './src/api';

function BorrowForm() {
    const [bookId, setBookId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Create borrow record
            const response = await borrowAPI.createBorrow({
                book: bookId,
            });

            // Issue the book
            await borrowAPI.issueBook(response.data.id);

            setSuccess('Book borrowed successfully!');
            setTimeout(() => navigate('/borrow-history'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to borrow book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="borrow-form-container">
            <h2>Borrow a Book</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <input
                    type="number"
                    placeholder="Book ID"
                    value={bookId}
                    onChange={e => setBookId(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Borrow Book'}
                </button>
            </form>
        </div>
    );
}

export default BorrowForm;