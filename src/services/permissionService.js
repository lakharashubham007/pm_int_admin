import apiClient, { API_URL } from './apiClient';

const permissionService = {
    getPermissions: async () => {
        try {
            return await apiClient(`${API_URL}/permissions`);
        } catch (error) {
            throw error;
        }
    }
};

export default permissionService;
