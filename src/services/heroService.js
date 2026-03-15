import apiClient, { API_URL } from './apiClient';

export const getHeroConfig = async () => {
    return apiClient.get(`${API_URL}/hero`);
};

export const updateHeroConfig = async (formData) => {
    return apiClient.put(`${API_URL}/hero`, formData);
};
