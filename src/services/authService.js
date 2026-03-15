import apiClient from './apiClient';

export const login = async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
};

export const getMe = async () => {
    return apiClient.get('/auth/me');
};

export const updateProfile = async (data) => {
    return apiClient.put('/auth/update-profile', data);
};

export const changePassword = async ({ currentPassword, newPassword }) => {
    return apiClient.put('/auth/change-password', { currentPassword, newPassword });
};

export const deleteProfileImage = async () => {
    return apiClient.delete('/auth/delete-profile-image');
};

export const vendorLogin = async (email, password) => {
    return apiClient.post('/public/vendor-login', { email, password });
};

export const vendorRegister = async (formData) => {
    return apiClient.post('/public/vendor-register', formData);
};
