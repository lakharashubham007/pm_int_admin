import React from 'react';
import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard';

const Dashboard = () => {
    const { user } = useAuth();
    // Default to SuperAdminDashboard for school admins.
    return <SuperAdminDashboard user={user} />;
};

export default Dashboard;
