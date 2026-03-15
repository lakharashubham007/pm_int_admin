import apiClient from './apiClient';

export const getAboutConfig = async () => {
    try {
        return await apiClient.get('/about');
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
