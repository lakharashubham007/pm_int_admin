import apiClient from './apiClient';

const vendorProductService = {
    // Bulk clone products from base inventory to vendor inventory
    bulkCloneProducts: async (data) => {
        try {
            const response = await apiClient.post('/private/vendor-products/bulk-clone', data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getVendorProducts: async (params = {}) => {
        try {
            const response = await apiClient.get('/private/vendor-products/vendor-products', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    getVendorProductById: async (id) => {
        try {
            const response = await apiClient.get(`/private/vendor-products/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateVendorProduct: async (id, formData) => {
        try {
            const response = await apiClient.patch(`/private/vendor-products/${id}`, formData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteVendorProduct: async (id) => {
        try {
            const response = await apiClient.delete(`/private/vendor-products/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
}

const settingService = {
    getSettings: async (key = '') => {
        return await apiClient.get('/private/settings', { params: { key } });
    },

    updateSetting: async (settingData) => {
        return await apiClient.post('/private/settings', settingData);
    }
};

const permissionService = {
    getPermissions: async () => {
        try {
            return await apiClient.get('/permissions');
        } catch (error) {
            throw error;
        }
    }
};


export default vendorProductService;
export { settingService, permissionService };
