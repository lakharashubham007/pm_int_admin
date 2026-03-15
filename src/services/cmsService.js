import apiClient from './apiClient';

const cmsService = {
    // Terms
    getTerms: async () => {
        return await apiClient.get('/cms/terms');
    },
    updateTerms: async (data) => {
        return await apiClient.put('/cms/terms', data);
    },

    // Privacy
    getPrivacy: async () => {
        return await apiClient.get('/cms/privacy');
    },
    updatePrivacy: async (data) => {
        return await apiClient.put('/cms/privacy', data);
    },

    // FAQs
    getFAQs: async () => {
        return await apiClient.get('/cms/faqs');
    },
    createFAQ: async (data) => {
        return await apiClient.post('/cms/faqs', data);
    },
    updateFAQ: async (id, data) => {
        return await apiClient.put(`/cms/faqs/${id}`, data);
    },
    deleteFAQ: async (id) => {
        return await apiClient.delete(`/cms/faqs/${id}`);
    },

    // Contact
    getContact: async () => {
        return await apiClient.get('/cms/contact');
    },
    updateContact: async (data) => {
        return await apiClient.put('/cms/contact', data);
    },

    // About
    getAbout: async () => {
        return await apiClient.get('/cms/about');
    },
    updateAbout: async (data) => {
        return await apiClient.put('/cms/about', data);
    },
};

export default cmsService;
