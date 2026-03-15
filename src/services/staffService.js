import apiClient from './apiClient';

const staffService = {
    getStaff: async (params = {}) => {
        try {
            return await apiClient.get('/staff', { params });
        } catch (error) {
            throw error;
        }
    },

    getStaffById: async (id) => {
        try {
            return await apiClient.get(`/staff/${id}`);
        } catch (error) {
            throw error;
        }
    },

    createStaff: async (data) => {
        try {
            return await apiClient.post('/staff', data);
        } catch (error) {
            throw error;
        }
    },

    updateStaff: async (id, data) => {
        try {
            return await apiClient.put(`/staff/${id}`, data);
        } catch (error) {
            throw error;
        }
    },

    deleteStaff: async (id) => {
        try {
            return await apiClient.delete(`/staff/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

export default staffService;
