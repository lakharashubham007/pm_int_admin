import apiClient, { API_URL } from './apiClient';

const facilityService = {
    getFacilities: async () => {
        try {
            return await apiClient.get(`${API_URL}/facilities`);
        } catch (error) {
            throw error;
        }
    },

    createFacility: async (data) => {
        try {
            return await apiClient.post(`${API_URL}/facilities`, data);
        } catch (error) {
            throw error;
        }
    },

    updateFacility: async (id, data) => {
        try {
            return await apiClient.put(`${API_URL}/facilities/${id}`, data);
        } catch (error) {
            throw error;
        }
    },

    deleteFacility: async (id) => {
        try {
            return await apiClient.delete(`${API_URL}/facilities/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

export default facilityService;
