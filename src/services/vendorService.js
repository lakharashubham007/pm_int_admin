import apiClient from './apiClient';

const vendorService = {
    createVendor: async (vendorData) => {
        return await apiClient.post('/private/vendors/add-vendor', vendorData);
    },

    getAllVendors: async (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        return await apiClient.get('/private/vendors/all-vendors', { params: cleanParams });
    },


    getVendorById: async (id) => {
        return await apiClient.get(`/private/vendors/vendor/${id}`);
    },

    updateVendor: async (id, vendorData) => {
        return await apiClient.put(`/private/vendors/update-vendor/${id}`, vendorData);
    },

    getSelfVendor: async () => {
        return await apiClient.get('/private/vendors/self');
    },

    updateSelfVendor: async (vendorData) => {
        return await apiClient.put('/private/vendors/self', vendorData);
    },

    verifyKyc: async (kycData) => {
        return await apiClient.post('/private/vendors/self/kyc-verify', kycData);
    },

    updateVendorStatus: async (id, status) => {
        return await apiClient.patch(`/private/vendors/update-status/${id}`, { status });
    },

    deleteVendor: async (id) => {
        return await apiClient.delete(`/private/vendors/delete-vendor/${id}`);
    }
};

export default vendorService;
