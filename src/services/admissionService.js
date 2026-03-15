import apiClient, { API_URL } from './apiClient';

const admissionService = {
    getAdmissions: (page = 1, limit = 10) => 
        apiClient.get(`${API_URL}/admissions?page=${page}&limit=${limit}`),
    
    updateStatus: (id, status) => 
        apiClient.put(`${API_URL}/admissions/${id}`, { status }),
    
    deleteAdmission: (id) => 
        apiClient.delete(`${API_URL}/admissions/${id}`)
};

export default admissionService;
