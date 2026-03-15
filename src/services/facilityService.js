import apiClient from './apiClient';

const facilityService = {
    getFacilities: async () => {
        try {
            return await apiClient('/facilities');
        } catch (error) {
            throw error;
        }
    },

    createFacility: async (data) => {
        try {
            return await apiClient('/facilities', {
                method: 'POST',
                body: data
            });
        } catch (error) {
            throw error;
        }
    },

    updateFacility: async (id, data) => {
        try {
            return await apiClient(`/facilities/${id}`, {
                method: 'PUT',
                body: data
            });
        } catch (error) {
            throw error;
        }
    },

    deleteFacility: async (id) => {
        try {
            return await apiClient(`/facilities/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            throw error;
        }
    }
};

export default facilityService;
