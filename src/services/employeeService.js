import apiClient from './apiClient';

const employeeService = {
    getEmployees: (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        return apiClient.get('/staff/get-staffs', { params: cleanParams });
    },

    getEmployeeById: (id) => apiClient.get(`/staff/get-staff/${id}`),

    createEmployee: (employeeData) => apiClient.post('/staff/create-staff', employeeData),

    updateEmployee: (id, employeeData) => apiClient.put(`/staff/update-staff/${id}`, employeeData),

    deleteEmployee: (id) => apiClient.delete(`/staff/delete-staff/${id}`)
};

export default employeeService;
