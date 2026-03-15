import apiClient from './apiClient';

export const getHeroConfig = async () => {
    return apiClient.get('/hero');
};

export const updateHeroConfig = async (formData) => {
    return apiClient.put('/hero', formData);
};
