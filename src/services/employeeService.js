import apiClient from './apiClient';

const employeeService = {
    getEmployees: (params = {}) => {
        const query = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== ''))
        ).toString();
        return apiClient(`/staff/get-staffs${query ? '?' + query : ''}`);
    },

    getEmployeeById: (id) => apiClient(`/staff/get-staff/${id}`),


    createEmployee: (employeeData) => apiClient('/staff/create-staff', {
        method: 'POST',
        body: employeeData
    }),

    updateEmployee: (id, employeeData) => apiClient(`/staff/update-staff/${id}`, {
        method: 'PUT',
        body: employeeData
    }),

    deleteEmployee: (id) => apiClient(`/staff/delete-staff/${id}`, {
        method: 'DELETE'
    })
};

export default employeeService;
