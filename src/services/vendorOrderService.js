import apiClient, { API_URL } from './apiClient';

const vendorOrderService = {
    async getVendorOrders(params) {
        const query = new URLSearchParams(params).toString();
        return apiClient(`${API_URL}/private/orders/vendor-order/orders?${query}`);
    },

    async updateOrderStatus(orderId, status) {
        return await apiClient(`${API_URL}/private/vendor-orders/${orderId}/status`, {
            method: 'PATCH',
            data: { status }
        });
    },

    async getOrderById(orderId, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = `${API_URL}/private/orders/vendor-order/orders/${orderId}${query ? '?' + query : ''}`;
        return await apiClient(url);
    }
};

export default vendorOrderService;
