import apiClient from './apiClient';

const productService = {
    // Products
    getProducts: async (params) => {
        return await apiClient.get('/private/products/get-products', { 
            params: { ...params, _t: Date.now() } 
        });
    },
    getProductById: async (id) => {
        return await apiClient.get(`/private/products/get-products/${id}`);
    },
    createProduct: async (formData) => {
        return await apiClient.post('/private/products/create-product', formData);
    },
    updateProduct: async (id, formData) => {
        return await apiClient.patch(`/private/products/edit-product/${id}`, formData);
    },
    deleteProduct: async (id) => {
        return await apiClient.delete(`/private/products/delete-product/${id}`);
    },
    updateProductStatus: async (id, status) => {
        return await apiClient.patch(`/private/products/update-product-status/${id}`, { status });
    },

    // Masters
    getCategories: async (params = {}) => {
        return await apiClient.get('/private/categories/get-categories', { params });
    },
    getCategoryById: async (id) => {
        return await apiClient.get(`/private/categories/get-category/${id}`);
    },
    createCategory: async (data) => {
        return await apiClient.post('/private/categories/create-category', data);
    },
    updateCategoryStatus: async (id, status) => {
        return await apiClient.patch(`/private/categories/${id}/status`, { status });
    },
    updateCategory: async (id, data) => {
        return await apiClient.put(`/private/categories/update-category/${id}`, data);
    },
    deleteCategory: async (id) => {
        return await apiClient.delete(`/private/categories/delete-category/${id}`);
    },

    // Subcategories
    getSubcategories: async (params = {}) => {
        return await apiClient.get('/private/subcategories', { params });
    },
    getSubcategoryById: async (id) => {
        return await apiClient.get(`/private/subcategories/${id}`);
    },
    createSubcategory: async (data) => {
        return await apiClient.post('/private/subcategories', data);
    },
    updateSubcategory: async (id, data) => {
        return await apiClient.put(`/private/subcategories/${id}`, data);
    },
    deleteSubcategory: async (id) => {
        return await apiClient.delete(`/private/subcategories/${id}`);
    },
    updateSubcategoryStatus: async (id, status) => {
        return await apiClient.patch(`/private/subcategories/${id}/status`, { status });
    },

    getBrands: async (params = {}) => {
        return await apiClient.get('/private/brands/get-brands', { params });
    },
    getBrandById: async (id) => {
        return await apiClient.get(`/private/brands/get-brand/${id}`);
    },
    createBrand: async (data) => {
        return await apiClient.post('/private/brands/create-brand', data);
    },
    updateBrand: async (id, data) => {
        return await apiClient.put(`/private/brands/update-brand/${id}`, data);
    },
    deleteBrand: async (id) => {
        return await apiClient.delete(`/private/brands/delete-brand/${id}`);
    },
    updateBrandStatus: async (id, status) => {
        return await apiClient.patch(`/private/brands/update-status/${id}`, { status });
    },


    getAttributes: async () => {
        return await apiClient.get('/private/attributes/get-attributes');
    },
    createAttribute: async (data) => {
        return await apiClient.post('/private/attributes/create-attribute', data);
    },
    deleteAttribute: async (id) => {
        return await apiClient.delete(`/private/attributes/delete-attribute/${id}`);
    },

    getVariantTypes: async () => {
        return await apiClient.get('/private/variant-types/get-variant-types');
    },
    createVariantType: async (data) => {
        return await apiClient.post('/private/variant-types/create-variant-type', data);
    },
    deleteVariantType: async (id) => {
        return await apiClient.delete(`/private/variant-types/delete-variant-type/${id}`);
    },

    getUnits: async (params = {}) => {
        return await apiClient.get('/private/units/get-units', { params });
    },
    getUnitById: async (id) => {
        return await apiClient.get(`/private/units/get-unit/${id}`);
    },
    createUnit: async (data) => {
        return await apiClient.post('/private/units/create-unit', data);
    },
    updateUnit: async (id, data) => {
        return await apiClient.put(`/private/units/update-unit/${id}`, data);
    },
    updateUnitStatus: async (id, status) => {
        return await apiClient.patch(`/private/units/update-status/${id}`, { status });
    },
    deleteUnit: async (id) => {
        return await apiClient.delete(`/private/units/delete-unit/${id}`);
    },


    getAddons: async () => {
        return await apiClient.get('/private/addons/get-addons');
    },
    createAddon: async (data) => {
        return await apiClient.post('/private/addons/create-addon', data);
    },
    deleteAddon: async (id) => {
        return await apiClient.delete(`/private/addons/delete-addon/${id}`);
    },

    // Taxes
    getTaxes: async (params = {}) => {
        return await apiClient.get('/private/taxes/get-taxes', { params });
    },
    createTax: async (data) => {
        return await apiClient.post('/private/taxes/create-tax', data);
    },
    updateTax: async (id, data) => {
        return await apiClient.put(`/private/taxes/update-tax/${id}`, data);
    },
    updateTaxStatus: async (id, status) => {
        return await apiClient.patch(`/private/taxes/update-status/${id}`, { status });
    },
    deleteTax: async (id) => {
        return await apiClient.delete(`/private/taxes/delete-tax/${id}`);
    },

    // Variant Attributes (VariantTypes)
    getVariantAttributes: async (params = {}) => {
        return await apiClient.get('/private/variant-types/get-variant-types', { params });
    },
    createVariantAttribute: async (data) => {
        return await apiClient.post('/private/variant-types/create-variant-type', data);
    },
    updateVariantAttribute: async (id, data) => {
        return await apiClient.put(`/private/variant-types/update-variant-type/${id}`, data);
    },
    updateVariantAttributeStatus: async (id, status) => {
        return await apiClient.patch(`/private/variant-types/update-status/${id}`, { status });
    },
    deleteVariantAttribute: async (id) => {
        return await apiClient.delete(`/private/variant-types/delete-variant-type/${id}`);
    },

    // Variant Values
    getVariantValues: async (params = {}) => {
        return await apiClient.get('/private/variant-types/get-variant-values', { params });
    },
    createVariantValue: async (data) => {
        return await apiClient.post('/private/variant-types/create-variant-value', data);
    },
    updateVariantValue: async (id, data) => {
        return await apiClient.put(`/private/variant-types/update-variant-value/${id}`, data);
    },
    updateVariantValueStatus: async (id, status) => {
        return await apiClient.patch(`/private/variant-types/update-value-status/${id}`, { status });
    },
    deleteVariantValue: async (id) => {
        return await apiClient.delete(`/private/variant-types/delete-variant-value/${id}`);
    },
};



export default productService;
