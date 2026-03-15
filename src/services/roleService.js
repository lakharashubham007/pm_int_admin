import apiClient from './apiClient';

const roleService = {
    getRoles: async () => {
        try {
            return await apiClient.get('/roles');
        } catch (error) {
            throw error;
        }
    },

    getRoleById: async (id) => {
        try {
            return await apiClient.get(`/roles/${id}`);
        } catch (error) {
            throw error;
        }
    },

    createRole: async (data) => {
        try {
            return await apiClient.post('/roles', data);
        } catch (error) {
            throw error;
        }
    },

    updateRole: async (id, data) => {
        try {
            return await apiClient.put(`/roles/${id}`, data);
        } catch (error) {
            throw error;
        }
    },

    deleteRole: async (id) => {
        try {
            return await apiClient.delete(`/roles/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

export default roleService;
