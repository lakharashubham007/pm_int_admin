import apiClient from './apiClient';

export const getHeroConfig = async () => {
    return apiClient('/hero');
};

export const updateHeroConfig = async (formData) => {
    return apiClient('/hero', {
        method: 'PUT',
        body: formData
    });
};
