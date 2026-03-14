import apiClient from './apiClient';

const vendorService = {
    createVendor: async (vendorData) => {
        return await apiClient('/private/vendors/add-vendor', {
            method: 'POST',
            body: vendorData
        });
    },

    getAllVendors: async (params = {}) => {
        const query = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== ''))
        ).toString();
        return await apiClient(`/private/vendors/all-vendors${query ? '?' + query : ''}`);
    },


    getVendorById: async (id) => {
        return await apiClient(`/private/vendors/vendor/${id}`);
    },

    updateVendor: async (id, vendorData) => {
        return await apiClient(`/private/vendors/update-vendor/${id}`, {
            method: 'PUT',
            body: vendorData
        });
    },

    getSelfVendor: async () => {
        return await apiClient('/private/vendors/self');
    },

    updateSelfVendor: async (vendorData) => {
        return await apiClient('/private/vendors/self', {
            method: 'PUT',
            body: vendorData
        });
    },

    verifyKyc: async (kycData) => {
        return await apiClient('/private/vendors/self/kyc-verify', {
            method: 'POST',
            body: kycData
        });
    },

    updateVendorStatus: async (id, status) => {
        return await apiClient(`/private/vendors/update-status/${id}`, {
            method: 'PATCH',
            body: { status }
        });
    },

    deleteVendor: async (id) => {
        return await apiClient(`/private/vendors/delete-vendor/${id}`, {
            method: 'DELETE'
        });
    }
};

export default vendorService;
