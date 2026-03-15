import apiClient, { API_URL } from './apiClient';

const vendorService = {
    createVendor: async (vendorData) => {
        return await apiClient.post(`${API_URL}/private/vendors/add-vendor`, vendorData);
    },

    getAllVendors: async (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        return await apiClient.get(`${API_URL}/private/vendors/all-vendors`, { params: cleanParams });
    },


    getVendorById: async (id) => {
        return await apiClient.get(`${API_URL}/private/vendors/vendor/${id}`);
    },

    updateVendor: async (id, vendorData) => {
        return await apiClient.put(`${API_URL}/private/vendors/update-vendor/${id}`, vendorData);
    },

    getSelfVendor: async () => {
        return await apiClient.get(`${API_URL}/private/vendors/self`);
    },

    updateSelfVendor: async (vendorData) => {
        return await apiClient.put(`${API_URL}/private/vendors/self`, vendorData);
    },

    verifyKyc: async (kycData) => {
        return await apiClient.post(`${API_URL}/private/vendors/self/kyc-verify`, kycData);
    },

    updateVendorStatus: async (id, status) => {
        return await apiClient.patch(`${API_URL}/private/vendors/update-status/${id}`, { status });
    },

    deleteVendor: async (id) => {
        return await apiClient.delete(`${API_URL}/private/vendors/delete-vendor/${id}`);
    }
};

export default vendorService;
