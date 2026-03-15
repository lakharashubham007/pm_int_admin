import apiClient from './apiClient';

const contactService = {
    getContact: () => apiClient('/contact'),

    updateContact: (data) => apiClient('/contact', {
        method: 'POST',
        body: data
    })
};

export default contactService;
