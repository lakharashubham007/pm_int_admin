import apiClient from './apiClient';

const contactService = {
    getContact: () => apiClient.get('/contact'),

    updateContact: (data) => apiClient.post('/contact', data)
};

export default contactService;
