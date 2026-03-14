const BASE_URL = '/api';

const apiClient = async (endpoint, options = {}) => {
    const { method = 'GET', body, headers = {}, ...customConfig } = options;
    const token = localStorage.getItem('token');

    const isFormData = body instanceof FormData;
    const defaultHeaders = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...headers,
    };

    const config = {
        method,
        headers: defaultHeaders,
        ...customConfig,
    };

    if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
    }

    // Ensure endpoint has leading slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    try {
        const response = await fetch(`${BASE_URL}${cleanEndpoint}`, config);

        // Handle 401 Unauthorized globally if needed (e.g., auto-logout)
        if (response.status === 401) {
             // Optional: localStorage.removeItem('token'); window.location.href = '/login';
        }

        const contentType = response.headers.get('content-type');
        let data = {};

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // If it's not JSON, might be HTML error page from proxy/Vite
            const text = await response.text();
            if (text.includes('<!DOCTYPE html>')) {
                throw new Error(`API Error: Received HTML instead of JSON from ${cleanEndpoint}. Check backend status.`);
            }
        }

        if (response.ok) {
            return data;
        }

        // Throw standardized error from backend message
        const errorMessage = data.message || data.error || 'Something went wrong';
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
    } catch (err) {
        console.error(`[API ERROR] ${method} ${cleanEndpoint}:`, err.message);
        throw err;
    }
};

export default apiClient;
