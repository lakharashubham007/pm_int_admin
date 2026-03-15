import apiClient from './apiClient';

const galleryService = {
    getGalleryItems: async (params = {}) => {
        try {
            return await apiClient.get('/gallery', { params });
        } catch (error) {
            throw error;
        }
    },

    createGalleryItem: async (formData) => {
        try {
            return await apiClient.post('/gallery', formData);
        } catch (error) {
            throw error;
        }
    },

    updateGalleryItem: async (id, formData) => {
        try {
            return await apiClient.put(`/gallery/${id}`, formData);
        } catch (error) {
            throw error;
        }
    },

    deleteGalleryItem: async (id) => {
        try {
            return await apiClient.delete(`/gallery/${id}`);
        } catch (error) {
            throw error;
        }
    },

    toggleStatus: async (id) => {
        try {
            return await apiClient.patch(`/gallery/${id}/status`);
        } catch (error) {
            throw error;
        }
    }
};

export default galleryService;
