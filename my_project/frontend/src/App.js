import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './login';
import SignUp from './signup';
import BookList from './booklist';
import BorrowForm from './borrowform';
import BorrowHistory from './borrowhistory';
import ReturningForm from './returning_form';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';

function App() {
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    if (savedToken) {
      setToken(savedToken);
      setIsAdmin(savedIsAdmin);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('isAdmin');
    setToken(null);
    setIsAdmin(false);
  };

  // Handle login - accepts token and isAdmin flag
  const handleLogin = (token, isAdmin = false) => {
    setToken(token);
    setIsAdmin(isAdmin);
    localStorage.setItem('token', token);
    localStorage.setItem('isAdmin', isAdmin);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/admin-login"
            element={token && isAdmin ? <Navigate to="/admin" /> : <AdminLogin setToken={handleLogin} />}
          />
          <Route
            path="/login"
            element={token ? <Navigate to={isAdmin ? "/admin" : "/"} /> : <Login setToken={handleLogin} />}
          />
          <Route
            path="/signup"
            element={token ? <Navigate to="/" /> : <SignUp setToken={setToken} />}
          />
          <Route
            path="/admin"
            element={token && isAdmin ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={token ? <BookList onLogout={handleLogout} isAdmin={isAdmin} /> : <Navigate to="/login" />}
          />
          <Route
            path="/borrow"
            element={token ? <BorrowForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/borrow-history"
            element={token ? <BorrowHistory /> : <Navigate to="/login" />}
          />
          <Route
            path="/return-book"
            element={token ? <ReturningForm /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
