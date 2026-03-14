import apiClient from './apiClient';

const vendorOrderService = {
    async getVendorOrders(params) {
        const query = new URLSearchParams(params).toString();
        return apiClient(`/private/orders/vendor-order/orders?${query}`);
    },

    async updateOrderStatus(orderId, status) {
        return apiClient(`/private/orders/vendor-order/orders/${orderId}/status`, {
            method: 'PATCH',
            body: { status }
        });
    },

    async getOrderById(orderId, params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = `/private/orders/vendor-order/orders/${orderId}${query ? '?' + query : ''}`;
        return apiClient(url);
    }
};

export default vendorOrderService;
