import apiClient from './apiClient';

const permissionService = {
    getPermissions: async () => {
        try {
            return await apiClient('/permissions');
        } catch (error) {
            throw error;
        }
    }
};

export default permissionService;
