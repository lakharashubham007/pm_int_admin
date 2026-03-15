import apiClient, { API_URL } from './apiClient';

const roleService = {
    getRoles: async () => {
        try {
            return await apiClient.get(`${API_URL}/roles`);
        } catch (error) {
            throw error;
        }
    },

    getRoleById: async (id) => {
        try {
            return await apiClient.get(`${API_URL}/roles/${id}`);
        } catch (error) {
            throw error;
        }
    },

    createRole: async (data) => {
        try {
            return await apiClient.post(`${API_URL}/roles`, data);
        } catch (error) {
            throw error;
        }
    },

    updateRole: async (id, data) => {
        try {
            return await apiClient.put(`${API_URL}/roles/${id}`, data);
        } catch (error) {
            throw error;
        }
    },

    deleteRole: async (id) => {
        try {
            return await apiClient.delete(`${API_URL}/roles/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

export default roleService;
