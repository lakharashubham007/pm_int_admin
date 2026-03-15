import apiClient from './apiClient';

const admissionService = {
    getAdmissions: (page = 1, limit = 10) => 
        apiClient.get(`/admissions?page=${page}&limit=${limit}`),
    
    updateStatus: (id, status) => 
        apiClient.put(`/admissions/${id}`, { status }),
    
    deleteAdmission: (id) => 
        apiClient.delete(`/admissions/${id}`)
};

export default admissionService;
