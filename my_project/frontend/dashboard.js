import React from 'react';
import UserDashboard from './UserDashboard';
import AdminDashboard from './admin/AdminDashboard';

function Dashboard() {
    const isAdmin = localStorage.getItem('is_superuser') === 'true';
    return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}

export default Dashboard;