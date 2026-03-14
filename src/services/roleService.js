import apiClient from './apiClient';

const roleService = {
    getRoles: async () => {
        try {
            return await apiClient('/roles');
        } catch (error) {
            throw error;
        }
    },

    getRoleById: async (id) => {
        try {
            return await apiClient(`/roles/${id}`);
        } catch (error) {
            throw error;
        }
    },

    createRole: async (data) => {
        try {
            return await apiClient('/roles', {
                method: 'POST',
                body: data
            });
        } catch (error) {
            throw error;
        }
    },

    updateRole: async (id, data) => {
        try {
            return await apiClient(`/roles/${id}`, {
                method: 'PUT',
                body: data
            });
        } catch (error) {
            throw error;
        }
    },

    deleteRole: async (id) => {
        try {
            return await apiClient(`/roles/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            throw error;
        }
    }
};

export default roleService;
