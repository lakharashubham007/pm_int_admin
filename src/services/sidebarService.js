import apiClient from './apiClient';

const sidebarService = {
    getAllMenus: async () => {
        try {
            return await apiClient('/sidebar/get-menus');
        } catch (error) {
            throw error;
        }
    }
};

export default sidebarService;
