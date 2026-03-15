import apiClient from './apiClient';

export const login = async (email, password) => {
    return apiClient('/auth/login', {
        method: 'POST',
        body: { email, password }
    });
};

export const getMe = async () => {
    return apiClient('/auth/me');
};

// Update profile info (name, email, profile image)
// Accepts FormData (for image upload) or a plain JSON object
export const updateProfile = async (data) => {
    return apiClient('/auth/update-profile', {
        method: 'PUT',
        body: data
    });
};

// Change password — separate call for better UX
export const changePassword = async ({ currentPassword, newPassword }) => {
    return apiClient('/auth/change-password', {
        method: 'PUT',
        body: { currentPassword, newPassword }
    });
};

export const deleteProfileImage = async () => {
    return apiClient('/auth/delete-profile-image', {
        method: 'DELETE'
    });
};

export const vendorLogin = async (email, password) => {
    return apiClient('/public/vendor-login', {
        method: 'POST',
        body: { email, password }
    });
};

export const vendorRegister = async (formData) => {
    return apiClient('/public/vendor-register', {
        method: 'POST',
        body: formData
    });
};
