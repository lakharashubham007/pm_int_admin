import apiClient, { API_URL } from './apiClient';

const cmsService = {
    // Terms
    getTerms: async () => {
        return await apiClient.get(`${API_URL}/cms/terms`);
    },
    updateTerms: async (data) => {
        return await apiClient.put(`${API_URL}/cms/terms`, data);
    },

    // Privacy
    getPrivacy: async () => {
        return await apiClient.get(`${API_URL}/cms/privacy`);
    },
    updatePrivacy: async (data) => {
        return await apiClient.put(`${API_URL}/cms/privacy`, data);
    },

    // FAQs
    getFAQs: async () => {
        return await apiClient.get(`${API_URL}/cms/faqs`);
    },
    createFAQ: async (data) => {
        return await apiClient.post(`${API_URL}/cms/faqs`, data);
    },
    updateFAQ: async (id, data) => {
        return await apiClient.put(`${API_URL}/cms/faqs/${id}`, data);
    },
    deleteFAQ: async (id) => {
        return await apiClient.delete(`${API_URL}/cms/faqs/${id}`);
    },

    // Contact
    getContact: async () => {
        return await apiClient.get(`${API_URL}/cms/contact`);
    },
    updateContact: async (data) => {
        return await apiClient.put(`${API_URL}/cms/contact`, data);
    },

    // About
    getAbout: async () => {
        return await apiClient.get(`${API_URL}/cms/about`);
    },
    updateAbout: async (data) => {
        return await apiClient.put(`${API_URL}/cms/about`, data);
    },
};

export default cmsService;
