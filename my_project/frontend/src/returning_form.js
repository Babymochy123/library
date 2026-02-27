import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { borrowAPI } from './api';

function ReturningForm() {
    const [borrowId, setBorrowId] = useState('');
    const [returnDate, setReturnDate] = useState('');
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
            const response = await borrowAPI.returnBook(borrowId, returnDate);
            setSuccess(`Book returned successfully! Fine: $${response.data.fine}`);
            setTimeout(() => navigate('/borrow-history'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to return book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="returning-form-container">
            <h2>Return a Book</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <input
                    type="number"
                    placeholder="Borrow Record ID"
                    value={borrowId}
                    onChange={e => setBorrowId(e.target.value)}
                    required
                />
                <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Return Book'}
                </button>
            </form>
        </div>
    );
}

export default ReturningForm;
