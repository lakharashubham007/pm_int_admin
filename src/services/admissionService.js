import apiClient from './apiClient';

const admissionService = {
    getAdmissions: (page = 1, limit = 10) => 
        apiClient(`/admissions?page=${page}&limit=${limit}`),
    
    updateStatus: (id, status) => 
        apiClient(`/admissions/${id}`, {
            method: 'PUT',
            body: { status }
        }),
    
    deleteAdmission: (id) => 
        apiClient(`/admissions/${id}`, { method: 'DELETE' })
};

export default admissionService;
