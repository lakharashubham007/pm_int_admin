import apiClient, { API_URL } from './apiClient';

const galleryService = {
    getGalleryItems: async (params = {}) => {
        try {
            return await apiClient.get(`${API_URL}/gallery`, { params });
        } catch (error) {
            throw error;
        }
    },

    createGalleryItem: async (formData) => {
        try {
            return await apiClient.post(`${API_URL}/gallery`, formData);
        } catch (error) {
            throw error;
        }
    },

    updateGalleryItem: async (id, formData) => {
        try {
            return await apiClient.put(`${API_URL}/gallery/${id}`, formData);
        } catch (error) {
            throw error;
        }
    },

    deleteGalleryItem: async (id) => {
        try {
            return await apiClient.delete(`${API_URL}/gallery/${id}`);
        } catch (error) {
            throw error;
        }
    },

    toggleStatus: async (id) => {
        try {
            return await apiClient.patch(`${API_URL}/gallery/${id}/status`);
        } catch (error) {
            throw error;
        }
    }
};

export default galleryService;
