import apiClient, { API_URL } from './apiClient';

const superAdminAnalyticsService = {
    getAnalytics: async () => {
        try {
            const response = await apiClient(`${API_URL}/private/orders/super-admin-analytics`);
            return response;
        } catch (error) {
            console.error('Failed to fetch super admin analytics:', error);
            throw error;
        }
    }
};

export default superAdminAnalyticsService;
