import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Search, Plus, Filter, Edit, Trash2, Package,
    ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Layers, Tag, Eye,
    AlertCircle, CheckCircle2, MoreHorizontal, RefreshCw, Copy, ShoppingCart, UtensilsCrossed
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import vendorProductService from '../../../services/vendorProductService';
import productService from '../../../services/productService'; // For masters (categories/brands)
import Loader from '../../../components/Loader';
import CustomSelect from '../../../components/CustomSelect';
import PillSlider from '../../../components/PillSlider';
import masterCategoryStore from '../../../store/masterCategoryStore';
import SafeImage from '../../../components/SafeImage';
import '../../products/Product.css';

const unitAwareSort = (a, b) => {
    const getAttrValueString = (x) => {
        if (!x.attributes) return '';
        return x.attributes.map(attr => attr.valueName || attr.valueId?.name || attr.valueId?.valueName || '').join(' ');
    };

    const parseValue = (str) => {
        if (!str) return { magnitude: 0, unit: '' };
        const match = str.toLowerCase().match(/^([\d.]+)\s*([a-z]+)$/);
        if (!match) return { magnitude: parseFloat(str) || 0, unit: '' };

        let magnitude = parseFloat(match[1]);
        const unit = match[2];

        const scales = {
            'kg': 1000, 'kilogram': 1000, 'kilograms': 1000,
            'g': 1, 'gram': 1, 'grams': 1,
            'mg': 0.001, 'milligram': 0.001,
            'l': 1000, 'liter': 1000, 'litre': 1000, 'liters': 1000,
            'ml': 1, 'milliliter': 1, 'millilitre': 1,
            'pcs': 1, 'pc': 1, 'unit': 1, 'units': 1
        };

        return { magnitude: magnitude * (scales[unit] || 1), unit };
    };

    const strA = getAttrValueString(a);
    const strB = getAttrValueString(b);

    const valA = parseValue(strA);
    const valB = parseValue(strB);

    if (valA.magnitude !== valB.magnitude) {
        return valA.magnitude - valB.magnitude;
    }
    return strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
};

const VendorProductList = () => {
    const { vendorId } = useParams();
    const [mcState, setMcState] = useState(masterCategoryStore.getState());
    const { masterCategory: globalMasterCategory } = mcState;

    useEffect(() => {
        const unsub = masterCategoryStore.subscribe(setMcState);
        return unsub;
    }, []);

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [masters, setMasters] = useState({ categories: [], brands: [] });
    const [filters, setFilters] = useState({
        search: '',
        categoryId: '',
        brandId: '',
        productType: '',
        status: '',
        masterCategory: globalMasterCategory,
        vendorId: vendorId || ''
    });

    useEffect(() => {
        setFilters(prev => ({ ...prev, masterCategory: globalMasterCategory }));
    }, [globalMasterCategory]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const navigate = useNavigate();

    const toggleRow = (productId) => {
        setExpandedRows(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    useEffect(() => {
        fetchMasters();
    }, [filters.masterCategory]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [pagination.page, filters, pagination.limit]);

    const fetchMasters = async () => {
        try {
            const [cat, br] = await Promise.all([
                productService.getCategories({ masterCategory: filters.masterCategory }),
                productService.getBrands({ masterCategory: filters.masterCategory })
            ]);
            setMasters({
                categories: cat.categories || [],
                brands: br.brands || []
            });
        } catch (error) {
            console.error('Failed to load masters');
        }
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const data = await vendorProductService.getVendorProducts({
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            });
            setProducts(data.products || []);
            setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Remove from Inventory?',
            text: 'This will remove the product only from your store inventory. The master product catalog will not be affected.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: 'transparent',
            confirmButtonText: 'Yes, Remove',
            cancelButtonText: 'Cancel',
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
        });

        if (result.isConfirmed) {
            try {
                await vendorProductService.deleteVendorProduct(id);
                toast.success('Product removed from your inventory');
                // Remove from local state immediately for instant UI feedback
                setProducts(prev => prev.filter(p => p._id !== id));
                setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            } catch (error) {
                toast.error(error?.message || 'Failed to remove product');
            }
        }
    };

    const getStockInfo = (product) => {
        if (product.productType === 'Single') {
            const qty = product.pricing?.quantity || 0;
            const min = product.pricing?.minStock || 0;
            return {
                qty,
                intensity: qty <= min ? 'stock-low' : qty <= min * 2 ? 'stock-mid' : 'stock-high',
                label: qty <= min ? 'Critical' : 'Healthy'
            };
        } else {
            const totalQty = (product.variants || []).reduce((acc, v) => acc + (v.inventory?.quantity || 0), 0);
            return {
                qty: totalQty,
                intensity: totalQty === 0 ? 'stock-low' : 'stock-high',
                label: `${product.variants?.length || 0} Variants`
            };
        }
    };

    const getPriceRange = (product) => {
        if (product.productType === 'Single') {
            return `₹${product.pricing?.sellingPrice || 0}`;
        } else {
            const prices = (product.variants || []).map(v => v.pricing?.sellingPrice).filter(p => p !== undefined && !isNaN(p));
            if (prices.length === 0) return 'N/A';
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
        }
    };

    return (
        <div className="product-page-container fade-in">
            <div className="product-content-pane">
                <header className="internal-page-header" style={{ padding: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                            {vendorId ? 'Vendor Inventory' : 'My Inventory'}
                        </h1>
                        <p style={{ margin: 0, color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>
                            {vendorId ? 'Viewing inventory for specific vendor.' : `Managing ${pagination.total} products in your local inventory.`}
                        </p>
                    </div>

                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <PillSlider
                            options={[
                                { value: 'Grocery', label: 'Grocery', icon: <ShoppingCart size={16} /> },
                                { value: 'Food', label: 'Food', icon: <UtensilsCrossed size={16} />, activeColor: '#8b5cf6' }
                            ]}
                            value={filters.masterCategory}
                            onChange={(val) => {
                                setFilters(prev => ({ ...prev, masterCategory: val, page: 1 }));
                            }}
                            themeColor="hsl(var(--primary))"
                        />
                    </div>

                    <div className="header-actions" style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <button className="secondary-button" onClick={fetchProducts} title="Refresh Data" style={{ padding: '0.5rem 1rem' }}>
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                            <span style={{ marginLeft: '6px' }}>Refresh</span>
                        </button>
                        {!vendorId && (
                            <button className="primary-button" onClick={() => navigate('/vendors/products/add')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                <Plus size={16} /> Add Product
                            </button>
                        )}
                    </div>
                </header>

                <div className="product-glass-card" style={{ marginBottom: '1.5rem' }}>
                    <div className="product-filter-bar">
                        <div className="product-search-wrapper">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                className="product-search-input"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                            />
                        </div>

                        <div className="product-filter-group">
                            <CustomSelect
                                options={[
                                    { value: '', label: 'All Categories' },
                                    ...masters.categories.map(c => ({ value: c._id, label: c.name }))
                                ]}
                                value={filters.categoryId}
                                onChange={(val) => setFilters(prev => ({ ...prev, categoryId: val, page: 1 }))}
                                placeholder="All Categories"
                            />
                        </div>

                        <div className="product-filter-group">
                            <CustomSelect
                                options={[
                                    { value: '', label: 'All Brands' },
                                    ...masters.brands.map(b => ({ value: b._id, label: b.name }))
                                ]}
                                value={filters.brandId}
                                onChange={(val) => setFilters(prev => ({ ...prev, brandId: val, page: 1 }))}
                                placeholder="All Brands"
                            />
                        </div>

                        <div className="product-filter-group" style={{ minWidth: '160px' }}>
                            <CustomSelect
                                options={[
                                    { value: '', label: 'All Types' },
                                    { value: 'Single', label: 'Static/Single' },
                                    { value: 'Variant', label: 'Variable Matrix' }
                                ]}
                                value={filters.productType}
                                onChange={(val) => setFilters(prev => ({ ...prev, productType: val, page: 1 }))}
                                placeholder="Product Type"
                            />
                        </div>

                        <div className="product-filter-group">
                            <CustomSelect
                                options={[
                                    { value: '', label: 'Any Status' },
                                    { value: 'true', label: 'Active Live' },
                                    { value: 'false', label: 'Draft Mode' }
                                ]}
                                value={filters.status}
                                onChange={(val) => setFilters(prev => ({ ...prev, status: val, page: 1 }))}
                                placeholder="Status"
                            />
                        </div>

                        {(filters.search || filters.categoryId || filters.brandId || filters.productType || filters.status) && (
                            <button
                                className="secondary-button"
                                style={{ padding: '0.65rem', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => setFilters({ ...filters, search: '', categoryId: '', brandId: '', productType: '', status: '' })}
                                title="Clear all filters"
                            >
                                <RefreshCw size={16} />
                            </button>
                        )}

                        <div style={{ position: 'relative', marginLeft: 'auto' }}>
                            <button
                                className="secondary-button"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: 'hsl(var(--card))', height: '42px' }}
                                onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                            >
                                <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Rows:</span>
                                <span style={{ fontWeight: '600' }}>{pagination.limit}</span>
                                <ChevronDown size={14} className={isRowsDropdownOpen ? 'rotate-180' : ''} />
                            </button>

                            {isRowsDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border) / 0.5)',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                    zIndex: 50,
                                    minWidth: '120px',
                                    overflow: 'hidden'
                                }}>
                                    {[10, 25, 50, 100].map(limit => (
                                        <div
                                            key={limit}
                                            style={{
                                                padding: '0.6rem 1rem',
                                                cursor: 'pointer',
                                                background: pagination.limit === limit ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                                color: pagination.limit === limit ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                                                fontSize: '0.9rem',
                                                fontWeight: pagination.limit === limit ? '600' : '400',
                                            }}
                                            onClick={() => {
                                                setPagination(prev => ({ ...prev, limit, page: 1 }));
                                                setIsRowsDropdownOpen(false);
                                            }}
                                        >
                                            {limit} rows
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="product-table-wrapper">
                    <table className="product-table w-full">
                        <thead>
                            <tr>
                                <th style={{ width: '60px', paddingLeft: '1.5rem' }}>S.No.</th>
                                <th>Product Name & Image</th>
                                <th>Category & Brand</th>
                                <th>Pricing & Inventory</th>
                                <th>Status</th>
                                {!vendorId && <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Management</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? products.map((product, index) => {
                                const stock = getStockInfo(product);
                                const isExpanded = expandedRows[product._id];
                                return (
                                    <React.Fragment key={product._id}>
                                        <tr className="category-row cursor-default">
                                            <td style={{ fontWeight: '500', color: 'hsl(var(--muted-foreground))', paddingLeft: '1.5rem' }}>
                                                {(pagination.page - 1) * pagination.limit + index + 1}
                                            </td>
                                            <td>
                                                <div className="category-cell-name">
                                                    <div className="product-image-container">
                                                        <SafeImage src={product.images?.thumbnail || product.thumbnail} alt={product.name} style={{ width: 44, height: 44, borderRadius: 10 }} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{product.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${product.productType === 'Variant' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                                {product.productType === 'Variant' ? 'Variable' : 'Static'}
                                                            </span>
                                                            <span style={{ color: 'hsl(var(--muted-foreground))' }}>• SKU: {product.productType === 'Single' ? (product.pricing?.sku || 'N/A') : `MTX-${product.variants?.length || 0}`}</span>
                                                            {product.productType === 'Variant' && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); toggleRow(product._id); }}
                                                                    className="variant-expand-btn"
                                                                    title={isExpanded ? "Hide Variants" : "Show Variants"}
                                                                >
                                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>{product.categoryId?.name || 'Uncategorized'}</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{product.brandId?.name || 'Generic Brand'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'hsl(var(--foreground))' }}>{getPriceRange(product)}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: stock.intensity === 'stock-high' ? '#10b981' : stock.intensity === 'stock-mid' ? '#f59e0b' : '#ef4444' }} />
                                                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', fontWeight: '500' }}>{stock.qty} Units in Stock</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`category-badge ${product.status ? 'active' : 'inactive'}`}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: product.status ? 'currentColor' : 'hsl(var(--muted-foreground))' }} />
                                                    {product.status ? 'Live' : 'Draft'}
                                                </span>
                                            </td>
                                            {!vendorId && (
                                                <td style={{ paddingRight: '1.5rem' }}>
                                                    <div className="category-actions">
                                                        <button
                                                            className="action-btn"
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/vendors/products/edit/${product._id}`); }}
                                                            title="Edit Product"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(product._id); }}
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                        {isExpanded && product.variants && product.variants.length > 0 && (
                                            <tr className="variant-subrow">
                                                <td colSpan="1" style={{ padding: 0, borderBottom: '1px solid hsl(var(--border) / 0.1)' }}></td>
                                                <td colSpan="5" style={{ padding: 0 }}>
                                                    <div className="variant-subrow-content" style={{ paddingLeft: '0', paddingRight: '2rem' }}>
                                                        <table className="variant-matrix-subtable">
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ width: '40%' }}>Variant Combination</th>
                                                                    <th style={{ width: '25%' }}>SKU</th>
                                                                    <th style={{ width: '20%', textAlign: 'right' }}>Price (MRP)</th>
                                                                    <th style={{ width: '15%', textAlign: 'right', paddingRight: '1.5rem' }}>In Stock</th>
                                                                    <th></th> {/* New column for image */}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(product.variants || []).sort(unitAwareSort).map((v, i) => (
                                                                    <tr key={v._id || i}>
                                                                        <td style={{ fontWeight: '500' }}>
                                                                            {v.attributes?.map(attr => attr.valueName || attr.valueId?.name || attr.valueId?.valueName).join(' / ') || 'Variant'}
                                                                        </td>
                                                                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{v.sku}</td>
                                                                        <td style={{ textAlign: 'right' }}>
                                                                            <span style={{ fontWeight: '600' }}>₹{v.pricing?.sellingPrice}</span> <span style={{ textDecoration: 'line-through', color: 'hsl(var(--muted-foreground) / 0.5)', fontSize: '0.75rem', marginLeft: '0.2rem' }}>₹{v.pricing?.mrp}</span>
                                                                        </td>
                                                                        <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                                                                            <span className={`px-2 py-0.5 rounded textxs font-bold ${v.inventory?.quantity > (v.inventory?.minStock || 5) ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                                                                {v.inventory?.quantity || 0} Units
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <div className="variant-mini-img">
                                                                                <SafeImage src={v.images?.thumbnail || v.image} alt={v.sku} style={{ width: 32, height: 32, borderRadius: 6 }} />
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-24">
                                        <div className="flex flex-col items-center gap-6 opacity-20">
                                            <Package size={80} strokeWidth={1} />
                                            <div className="text-center">
                                                <h3 className="text-2xl font-black">CATALOG EMPTY</h3>
                                                <p className="text-sm">Initiate your first product to begin tracking.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.total > 0 && (
                    <div className="pagination-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid hsl(var(--border) / 0.1)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                            <span>Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="secondary-button"
                                style={{ padding: '0.4rem', borderRadius: '6px' }}
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                className="secondary-button"
                                style={{ padding: '0.4rem', borderRadius: '6px' }}
                                disabled={pagination.page * pagination.limit >= pagination.total}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {isLoading && <Loader />}
        </div>
    );
};

export default VendorProductList;
