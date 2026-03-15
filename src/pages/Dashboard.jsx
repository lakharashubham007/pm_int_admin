import React, { useState, useEffect } from 'react';
import authStore from '../store/authStore';
import SuperAdminDashboard from './SuperAdminDashboard';

const Dashboard = () => {
    const [authState, setAuthState] = useState(authStore.getState());

    useEffect(() => {
        return authStore.subscribe(setAuthState);
    }, []);

    const { user } = authState;
    return <SuperAdminDashboard user={user} />;
};

export default Dashboard;
