import apiClient, { API_URL } from './apiClient';

export const getAboutConfig = async () => {
    try {
        return await apiClient.get(`${API_URL}/about`);
    } catch (error) {
        throw error;
    }
};

export const updateAboutConfig = async (formData, section = '') => {
    try {
        const url = section ? `/about/${section}` : '/about';
        return await apiClient.put(url, formData);
    } catch (error) {
        throw error;
    }
};
