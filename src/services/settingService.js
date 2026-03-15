import apiClient, { API_URL } from './apiClient';

const settingService = {
    getSettings: async (key = '') => {
        return await apiClient(`${API_URL}/private/settings${key ? `?key=${key}` : ''}`);
    },

    updateSetting: async (settingData) => {
        return await apiClient(`${API_URL}/private/settings`, {
            method: 'POST',
            data: settingData
        });
    }
};

export default settingService;
