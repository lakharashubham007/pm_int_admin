import apiClient from './apiClient';

const facilityService = {
    getFacilities: async () => {
        try {
            return await apiClient.get('/facilities');
        } catch (error) {
            throw error;
        }
    },

    createFacility: async (data) => {
        try {
            return await apiClient.post('/facilities', data);
        } catch (error) {
            throw error;
        }
    },

    updateFacility: async (id, data) => {
        try {
            return await apiClient.put(`/facilities/${id}`, data);
        } catch (error) {
            throw error;
        }
    },

    deleteFacility: async (id) => {
        try {
            return await apiClient.delete(`/facilities/${id}`);
        } catch (error) {
            throw error;
        }
    }
};

export default facilityService;
