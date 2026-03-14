import apiClient from './apiClient';

const cmsService = {
    // Terms
    getTerms: async () => {
        return await apiClient('/cms/terms');
    },
    updateTerms: async (data) => {
        return await apiClient('/cms/terms', { method: 'PUT', body: data });
    },

    // Privacy
    getPrivacy: async () => {
        return await apiClient('/cms/privacy');
    },
    updatePrivacy: async (data) => {
        return await apiClient('/cms/privacy', { method: 'PUT', body: data });
    },

    // FAQs
    getFAQs: async () => {
        return await apiClient('/cms/faqs');
    },
    createFAQ: async (data) => {
        return await apiClient('/cms/faqs', { method: 'POST', body: data });
    },
    updateFAQ: async (id, data) => {
        return await apiClient(`/cms/faqs/${id}`, { method: 'PUT', body: data });
    },
    deleteFAQ: async (id) => {
        return await apiClient(`/cms/faqs/${id}`, { method: 'DELETE' });
    },

    // Contact
    getContact: async () => {
        return await apiClient('/cms/contact');
    },
    updateContact: async (data) => {
        return await apiClient('/cms/contact', { method: 'PUT', body: data });
    },

    // About
    getAbout: async () => {
        return await apiClient('/cms/about');
    },
    updateAbout: async (data) => {
        return await apiClient('/cms/about', { method: 'PUT', body: data });
    }
};

export default cmsService;
