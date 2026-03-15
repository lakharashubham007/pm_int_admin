import apiClient from './apiClient';

const galleryService = {
    getGalleryItems: async (params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            return await apiClient(`/gallery${query ? `?${query}` : ''}`);
        } catch (error) {
            throw error;
        }
    },

    createGalleryItem: async (formData) => {
        try {
            return await apiClient('/gallery', {
                method: 'POST',
                body: formData
            });
        } catch (error) {
            throw error;
        }
    },

    updateGalleryItem: async (id, formData) => {
        try {
            return await apiClient(`/gallery/${id}`, {
                method: 'PUT',
                body: formData
            });
        } catch (error) {
            throw error;
        }
    },

    deleteGalleryItem: async (id) => {
        try {
            return await apiClient(`/gallery/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            throw error;
        }
    },

    toggleStatus: async (id) => {
        try {
            return await apiClient(`/gallery/${id}/status`, {
                method: 'PATCH'
            });
        } catch (error) {
            throw error;
        }
    }
};

export default galleryService;
