import apiClient from './apiClient';

const settingService = {
    getSettings: async (key = '') => {
        return await apiClient(`/private/settings${key ? `?key=${key}` : ''}`);
    },

    updateSetting: async (settingData) => {
        return await apiClient('/private/settings', {
            method: 'POST',
            body: settingData
        });
    }
};

export default settingService;
