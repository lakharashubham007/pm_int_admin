import apiClient from './apiClient';

const staffService = {
    getStaff: async (params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            return await apiClient(`/staff${query ? `?${query}` : ''}`);
        } catch (error) {
            throw error;
        }
    },

    getStaffById: async (id) => {
        try {
            return await apiClient(`/staff/${id}`);
        } catch (error) {
            throw error;
        }
    },

    createStaff: async (data) => {
        try {
            return await apiClient('/staff', {
                method: 'POST',
                body: data
            });
        } catch (error) {
            throw error;
        }
    },

    updateStaff: async (id, data) => {
        try {
            return await apiClient(`/staff/${id}`, {
                method: 'PUT',
                body: data
            });
        } catch (error) {
            throw error;
        }
    },

    deleteStaff: async (id) => {
        try {
            return await apiClient(`/staff/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            throw error;
        }
    }
};

export default staffService;
