import apiClient from './apiClient';

const vendorProductService = {
    // Bulk clone products from base inventory to vendor inventory
    bulkCloneProducts: async (data) => {
        try {
            const response = await apiClient('/private/vendor-products/bulk-clone', {
                method: 'POST',
                body: data
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    getVendorProducts: async (params = {}) => {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await apiClient(`/private/vendor-products/vendor-products?${query}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getVendorProductById: async (id) => {
        try {
            const response = await apiClient(`/private/vendor-products/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateVendorProduct: async (id, formData) => {
        try {
            const response = await apiClient(`/private/vendor-products/${id}`, {
                method: 'PATCH',
                body: formData
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteVendorProduct: async (id) => {
        try {
            const response = await apiClient(`/private/vendor-products/${id}`, {
                method: 'DELETE'
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
}


export default vendorProductService;
