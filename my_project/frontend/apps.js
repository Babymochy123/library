import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import BookList from './components/BookList';
import BorrowForm from './components/BorrowForm';
import ReturnForm from './components/ReturnForm';
import BorrowHistory from './components/BorrowHistory'; // import mpya

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    return (
        <Router>
            <nav>
                <Link to="/signup">Signup</Link> |
                <Link to="/login">Login</Link> |
                <Link to="/books">Books</Link> |
                <Link to="/history">My History</Link>
            </nav>

            <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/books" element={<BookList />} />
                <Route path="/borrow/:id" element={<BorrowForm />} />
                <Route path="/return/:id" element={<ReturnForm />} />
                <Route path="/history" element={<BorrowHistory />} /> {/* route mpya */}
            </Routes>
        </Router>
    );
}

export default App;

const isSuperuser = localStorage.getItem('is_superuser') === 'true';
const isStaff = localStorage.getItem('is_staff') === 'true';

return (
    <Router>
        <nav>
            <Link to="/books">Books</Link> |
            <Link to="/history">My History</Link>
            {isSuperuser && <Link to="/admin-dashboard">Admin Dashboard</Link>}
        </nav>
        <Routes>
            {/* normal user routes */}
            <Route path="/books" element={<BookList />} />
            <Route path="/history" element={<BorrowHistory />} />

            {/* admin-only route */}
            {isSuperuser && <Route path="/admin-dashboard" element={<AdminDashboard />} />}
        </Routes>
    </Router>
);