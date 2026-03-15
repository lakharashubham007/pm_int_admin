import apiClient, { API_URL } from './apiClient';

const employeeService = {
    getEmployees: (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        return apiClient.get(`${API_URL}/staff/get-staffs`, { params: cleanParams });
    },

    getEmployeeById: (id) => apiClient.get(`${API_URL}/staff/get-staff/${id}`),

    createEmployee: (employeeData) => apiClient.post(`${API_URL}/staff/create-staff`, employeeData),

    updateEmployee: (id, employeeData) => apiClient.put(`${API_URL}/staff/update-staff/${id}`, employeeData),

    deleteEmployee: (id) => apiClient.delete(`${API_URL}/staff/delete-staff/${id}`)
};

export default employeeService;
