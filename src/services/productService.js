import apiClient, { API_URL } from './apiClient';

const productService = {
    // Products
    getProducts: async (params) => {
        return await apiClient.get(`${API_URL}/private/products/get-products`, { 
            params: { ...params, _t: Date.now() } 
        });
    },
    getProductById: async (id) => {
        return await apiClient.get(`${API_URL}/private/products/get-products/${id}`);
    },
    createProduct: async (formData) => {
        return await apiClient.post(`${API_URL}/private/products/create-product`, formData);
    },
    updateProduct: async (id, formData) => {
        return await apiClient.patch(`${API_URL}/private/products/edit-product/${id}`, formData);
    },
    deleteProduct: async (id) => {
        return await apiClient.delete(`${API_URL}/private/products/delete-product/${id}`);
    },
    updateProductStatus: async (id, status) => {
        return await apiClient.patch(`${API_URL}/private/products/update-product-status/${id}`, { status });
    },

    // Masters
    getCategories: async (params = {}) => {
        return await apiClient.get(`${API_URL}/private/categories/get-categories`, { params });
    },
    getCategoryById: async (id) => {
        return await apiClient.get(`${API_URL}/private/categories/get-category/${id}`);
    },
    createCategory: async (data) => {
        return await apiClient.post(`${API_URL}/private/categories/create-category`, data);
    },
    updateCategoryStatus: async (id, status) => {
        return await apiClient.patch(`${API_URL}/private/categories/${id}/status`, { status });
    },
    updateCategory: async (id, data) => {
        return await apiClient.put(`${API_URL}/private/categories/update-category/${id}`, data);
    },
    deleteCategory: async (id) => {
        return await apiClient.delete(`${API_URL}/private/categories/delete-category/${id}`);
    },

    // Subcategories
    getSubcategories: async (params = {}) => {
        return await apiClient.get(`${API_URL}/private/subcategories`, { params });
    },
    getSubcategoryById: async (id) => {
        return await apiClient.get(`${API_URL}/private/subcategories/${id}`);
    },
    createSubcategory: async (data) => {
        return await apiClient.post(`${API_URL}/private/subcategories`, data);
    },
    updateSubcategory: async (id, data) => {
        return await apiClient.put(`${API_URL}/private/subcategories/${id}`, data);
    },
    deleteSubcategory: async (id) => {
        return await apiClient.delete(`${API_URL}/private/subcategories/${id}`);
    },
    updateSubcategoryStatus: async (id, status) => {
        return await apiClient.patch(`${API_URL}/private/subcategories/${id}/status`, { status });
    },

    getBrands: async (params = {}) => {
        return await apiClient.get(`${API_URL}/private/brands/get-brands`, { params });
    },
    getBrandById: async (id) => {
        return await apiClient.get(`${API_URL}/private/brands/get-brand/${id}`);
    },
    createBrand: async (data) => {
        return await apiClient.post(`${API_URL}/private/brands/create-brand`, data);
    },
    updateBrand: async (id, data) => {
        return await apiClient.put(`${API_URL}/private/brands/update-brand/${id}`, data);
    },
    deleteBrand: async (id) => {
        return await apiClient.delete(`${API_URL}/private/brands/delete-brand/${id}`);
    },
    updateBrandStatus: async (id, status) => {
        return await apiClient.patch(`${API_URL}/private/brands/update-status/${id}`, { status });
    },


    getAttributes: async () => {
        return await apiClient.get(`${API_URL}/private/attributes/get-attributes`);
    },
    createAttribute: async (data) => {
        return await apiClient.post(`${API_URL}/private/attributes/create-attribute`, data);
    },
    deleteAttribute: async (id) => {
        return await apiClient.delete(`${API_URL}/private/attributes/delete-attribute/${id}`);
    },

    getVariantTypes: async () => {
        return await apiClient.get(`${API_URL}/private/variant-types/get-variant-types`);
    },
    createVariantType: async (data) => {
        return await apiClient.post(`${API_URL}/private/variant-types/create-variant-type`, data);
    },
    deleteVariantType: async (id) => {
        return await apiClient.delete(`${API_URL}/private/variant-types/delete-variant-type/${id}`);
    },

    getUnits: async (params = {}) => {
        return await apiClient.get(`${API_URL}/private/units/get-units`, { params });
    },
    getUnitById: async (id) => {
        return await apiClient.get(`${API_URL}/private/units/get-unit/${id}`);
    },
    createUnit: async (data) => {
        return await apiClient.post(`${API_URL}/private/units/create-unit`, data);
    },
    updateUnit: async (id, data) => {
        return await apiClient.put(`${API_URL}/private/units/update-unit/${id}`, data);
    },
    updateUnitStatus: async (id, status) => {
        return await apiClient.patch(`${API_URL}/private/units/update-status/${id}`, { status });
    },
    deleteUnit: async (id) => {
        return await apiClient.delete(`${API_URL}/private/units/delete-unit/${id}`);
    },


    getAddons: async () => {
        return await apiClient.get(`${API_URL}/private/addons/get-addons`);
    },
    createAddon: async (data) => {
        return await apiClient.post(`${API_URL}/private/addons/create-addon`, data);
    },
    deleteAddon: async (id) => {
        return await apiClient.delete(`${API_URL}/private/addons/delete-addon/${id}`);
    },

    // Taxes
    getTaxes: async (params = {}) => {
        return await apiClient.get(`${API_URL}/private/taxes/get-taxes`, { params });
    },
    createTax: async (data) => {
        return await apiClient.post(`${API_URL}/private/taxes/create-tax`, data);
    },
    updateTax: async (id, data) => {
        return await apiClient.put(`${API_URL}/private/taxes/update-tax/${id}`, data);
    },
    updateTaxStatus: async (id, status) => {
        return await apiClient.patch(`${API_URL}/private/taxes/update-status/${id}`, { status });
    },
    deleteTax: async (id) => {
        return await apiClient.delete(`${API_URL}/private/taxes/delete-tax/${id}`);
    },

    // Variant Attributes (VariantTypes)
    getVariantAttributes: async (params = {}) => {
        return await apiClient.get(`${API_URL}/private/variant-types/get-variant-types`, { params });
    },
    createVariantAttribute: async (data) => {
        return await apiClient.post(`${API_URL}/private/variant-types/create-variant-type`, data);
    },
    updateVariantAttribute: async (id, data) => {
        return await apiClient.put(`${API_URL}/private/variant-types/update-variant-type/${id}`, data);
    },
    updateVariantAttributeStatus: async (id, status) => {
        return await apiClient.patch(`${API_URL}/private/variant-types/update-status/${id}`, { status });
    },
    deleteVariantAttribute: async (id) => {
        return await apiClient.delete(`${API_URL}/private/variant-types/delete-variant-type/${id}`);
    },

    // Variant Values
    getVariantValues: async (params = {}) => {
        return await apiClient.get(`${API_URL}/private/variant-types/get-variant-values`, { params });
    },
    createVariantValue: async (data) => {
        return await apiClient.post(`${API_URL}/private/variant-types/create-variant-value`, data);
    },
    updateVariantValue: async (id, data) => {
        return await apiClient.put(`${API_URL}/private/variant-types/update-variant-value/${id}`, data);
    },
    updateVariantValueStatus: async (id, status) => {
        return await apiClient.patch(`${API_URL}/private/variant-types/update-value-status/${id}`, { status });
    },
    deleteVariantValue: async (id) => {
        return await apiClient.delete(`${API_URL}/private/variant-types/delete-variant-value/${id}`);
    },
};



export default productService;
