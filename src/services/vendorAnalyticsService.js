import apiClient, { API_URL } from './apiClient';

const vendorAnalyticsService = {
    getVendorAnalytics: async (id, params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await apiClient(`${API_URL}/private/orders/vendor-analytics/${id}?${query}`);
            return response;
        } catch (error) {
            console.error(`Failed to fetch analytics for vendor ${id}:`, error);
            throw error;
        }
    },
    getAnalytics: async () => {
        try {
            const response = await apiClient(`${API_URL}/private/orders/vendor-analytics`);
            return response;
        } catch (error) {
            console.error('Failed to fetch dashboard analytics:', error);
            throw error;
        }
    }

};

export default vendorAnalyticsService;
