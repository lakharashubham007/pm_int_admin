import apiClient, { API_URL } from './apiClient';

const staffService = {
    getStaff: async (params = {}) => {
        try {
            return await apiClient.get(`${API_URL}/staff`, { params });
        } catch (error) {
            throw error;
        }
    },

    getStaffById: async (id) => {
        try {
            return await apiClient.get(`${API_URL}/staff/${id}`);
        } catch (error) {
            throw error;
        }
    },

    createStaff: async (data) => {
        try {
            return await apiClient.post(`${API_URL}/staff`, data);
        } catch (error) {
            throw error;
        }
    },

    updateStaff: async (id, data) => {
        try {
            return await apiClient.put(`${API_URL}/staff/${id}`, data);
        } catch (error) {
            throw error;
        }
    },

    deleteStaff: async (id) => {
        try {
            return await apiClient.delete(`${API_URL}/staff/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

export default staffService;
