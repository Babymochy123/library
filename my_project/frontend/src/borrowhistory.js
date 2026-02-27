import React, { useState, useEffect } from 'react';
import { borrowAPI } from './api';

function BorrowHistory() {
    const [borrows, setBorrows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBorrows();
    }, []);

    const fetchBorrows = async () => {
        try {
            setLoading(true);
            const response = await borrowAPI.getBorrows();
            setBorrows(response.data.results || response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch borrow history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading borrow history...</div>;

    return (
        <div className="borrow-history-container">
            <h2>Borrow History</h2>
            {error && <div className="error">{error}</div>}

            {borrows.length === 0 ? (
                <p>No borrow records found</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Book</th>
                            <th>Issue Date</th>
                            <th>Due Date</th>
                            <th>Return Date</th>
                            <th>Fine</th>
                        </tr>
                    </thead>
                    <tbody>
                        {borrows.map(borrow => (
                            <tr key={borrow.id}>
                                <td>{borrow.book_title || borrow.book}</td>
                                <td>{borrow.issue_date}</td>
                                <td>{borrow.due_date}</td>
                                <td>{borrow.return_date || 'Not returned'}</td>
                                <td>${borrow.fine}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default BorrowHistory;
