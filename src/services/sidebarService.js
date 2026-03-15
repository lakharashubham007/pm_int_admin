import apiClient, { API_URL } from './apiClient';

const sidebarService = {
    getAllMenus: async () => {
        try {
            return await apiClient.get(`${API_URL}/sidebar/get-menus`);
        } catch (error) {
            throw error;
        }
    }
};

export default sidebarService;
