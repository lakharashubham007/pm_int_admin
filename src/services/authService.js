import apiClient, { API_URL } from './apiClient';

export const login = async (email, password) => {
    return apiClient.post(`${API_URL}/auth/login`, { email, password });
};

export const getMe = async () => {
    return apiClient.get(`${API_URL}/auth/me`);
};

export const updateProfile = async (data) => {
    return apiClient.put(`${API_URL}/auth/update-profile`, data);
};

export const changePassword = async ({ currentPassword, newPassword }) => {
    return apiClient.put(`${API_URL}/auth/change-password`, { currentPassword, newPassword });
};

export const deleteProfileImage = async () => {
    return apiClient.delete(`${API_URL}/auth/delete-profile-image`);
};

export const vendorLogin = async (email, password) => {
    return apiClient.post(`${API_URL}/public/vendor-login`, { email, password });
};

export const vendorRegister = async (formData) => {
    return apiClient.post(`${API_URL}/public/vendor-register`, formData);
};
