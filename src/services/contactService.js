import apiClient, { API_URL } from './apiClient';

const contactService = {
    getContact: () => apiClient.get(`${API_URL}/contact`),

    updateContact: (data) => apiClient.post(`${API_URL}/contact`, data)
};

export default contactService;
