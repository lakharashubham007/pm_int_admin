import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for attaching the token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for standardized error handling
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const message = error.response?.data?.message || error.response?.data?.error || 'Something went wrong';
        
        // Handle 401 globally
        if (error.response?.status === 401) {
            // Optional: logout logic
        }

        const customError = new Error(message);
        customError.status = error.response?.status;
        customError.data = error.response?.data;
        
        console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message);
        
        return Promise.reject(customError);
    }
);

export default apiClient;
