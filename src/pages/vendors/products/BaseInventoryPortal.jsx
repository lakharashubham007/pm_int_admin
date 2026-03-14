import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Search, ShoppingCart, UtensilsCrossed, Package, CheckCircle2, X, Trash2, Check, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomSelect from '../../../components/CustomSelect';
import PillSlider from '../../../components/PillSlider';
import Loader from '../../../components/Loader';
import productService from '../../../services/productService';
import vendorProductService from '../../../services/vendorProductService';
import { useMasterCategory } from '../../../context/MasterCategoryContext';
import '../../products/Product.css'; // Reuse product styling

const BaseInventoryPortal = ({ onBack }) => {
    const [products, setProducts] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [selectedProductsData, setSelectedProductsData] = useState([]);
    const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const loaderRef = React.useRef(null);
    const ITEMS_PER_PAGE = 18;

    // Use full cached objects so "See All" isn't bounded by current filters
    const selectedProductsList = selectedProductsData;

    const [masters, setMasters] = useState({ categories: [], subcategories: [], brands: [] });
    // Global master category (controls sitewide theme + filtering)
    const { masterCategory, setMasterCategory } = useMasterCategory();

    const [filters, setFilters] = useState({
        search: '',
        categoryId: '',
        subcategoryId: '',
        brandId: '',
        masterCategory: masterCategory
    });

    // Fetch master data for dropdowns
    useEffect(() => {
        fetchMasters();
    }, [filters.masterCategory]);

    // Initial load and filter change
    useEffect(() => {
        setPage(1);
        fetchProducts(true);
    }, [filters]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        if (!loaderRef.current || !hasMore || isLoading || isFetchingNextPage) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isFetchingNextPage) {
                setPage(prev => prev + 1);
            }
        }, { threshold: 0.1 });

        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore, isLoading, isFetchingNextPage, products]);

    // Fetch next page
    useEffect(() => {
        if (page > 1) {
            fetchProducts(false);
        }
    }, [page]);

    const fetchMasters = async () => {
        try {
            const [cat, subcat, br] = await Promise.all([
                productService.getCategories({ masterCategory: filters.masterCategory }),
                productService.getSubcategories({ masterCategory: filters.masterCategory }),
                productService.getBrands({ masterCategory: filters.masterCategory })
            ]);
            setMasters({
                categories: cat.categories || [],
                subcategories: subcat.subcategories || [],
                brands: br.brands || []
            });
        } catch (error) {
            console.error('Failed to load masters');
        }
    };

    const fetchProducts = async (isInitial = false) => {
        if (isInitial) setIsLoading(true);
        else setIsFetchingNextPage(true);

        try {
            const params = {
                ...filters,
                page: isInitial ? 1 : page,
                limit: ITEMS_PER_PAGE,
                status: 'true'
            };
            const data = await productService.getProducts(params);

            if (data.success) {
                const newProducts = data.products || [];
                if (isInitial) {
                    setProducts(newProducts);
                } else {
                    setProducts(prev => [...prev, ...newProducts]);
                }
                setTotalCount(data.pagination?.total || data.totalProducts || 0);
                setHasMore(newProducts.length === ITEMS_PER_PAGE);
            }
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
            setIsFetchingNextPage(false);
        }
    };

    const ProductSkeleton = () => (
        <div style={{
            background: 'hsl(var(--card))',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '2px solid hsl(var(--border) / 0.4)',
            height: '320px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div className="shimmer" style={{ height: '160px', width: '100%', background: 'hsl(var(--secondary) / 0.5)' }} />
            <div style={{ padding: '1rem', flex: 1 }}>
                <div className="shimmer" style={{ height: '1rem', width: '80%', marginBottom: '0.75rem', borderRadius: '4px', background: 'hsl(var(--secondary) / 0.4)' }} />
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'auto' }}>
                    <div className="shimmer" style={{ height: '0.8rem', width: '40%', borderRadius: '10px', background: 'hsl(var(--secondary) / 0.4)' }} />
                    <div className="shimmer" style={{ height: '0.8rem', width: '30%', borderRadius: '10px', background: 'hsl(var(--secondary) / 0.4)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <div className="shimmer" style={{ height: '1.2rem', width: '30%', borderRadius: '4px', background: 'hsl(var(--secondary) / 0.5)' }} />
                    <div className="shimmer" style={{ height: '0.7rem', width: '20%', borderRadius: '4px', background: 'hsl(var(--secondary) / 0.4)' }} />
                </div>
            </div>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .shimmer {
                    background: linear-gradient(90deg, 
                        hsl(var(--secondary) / 0.3) 25%, 
                        hsl(var(--secondary) / 0.6) 37%, 
                        hsl(var(--secondary) / 0.3) 63%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite linear;
                }
            `}</style>
        </div>
    );

    const getPriceRange = (product) => {
        if (product.productType === 'Single') {
            return `₹${product.pricing?.sellingPrice || 0}`;
        } else {
            const prices = (product.variants || []).map(v => v.pricing?.sellingPrice).filter(p => !isNaN(p));
            if (prices.length === 0) return 'N/A';
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
        }
    };

    const handleSelectProduct = (product) => {
        const isSelected = selectedProductIds.includes(product._id);
        if (isSelected) {
            toast.success(`Deselected ${product.name}`);
            setSelectedProductIds(prev => prev.filter(id => id !== product._id));
            setSelectedProductsData(prev => prev.filter(p => p._id !== product._id));
        } else {
            toast.success(`Selected ${product.name}`);
            setSelectedProductIds(prev => [...prev, product._id]);
            setSelectedProductsData(prev => [...prev, product]);
        }
    };

    const handleSelectAll = () => {
        // Find which products on the current page are already selected
        const currentProductIds = products.map(p => p._id);
        const selectedOnPage = currentProductIds.filter(id => selectedProductIds.includes(id));

        if (selectedOnPage.length === currentProductIds.length) {
            // Deselect all on current page
            setSelectedProductIds(prev => prev.filter(id => !currentProductIds.includes(id)));
            setSelectedProductsData(prev => prev.filter(p => !currentProductIds.includes(p._id)));
            toast.success('Deselected all products on this page');
        } else {
            // Select all on current page
            const newSelectionsIds = currentProductIds.filter(id => !selectedProductIds.includes(id));
            const newSelectionsData = products.filter(p => newSelectionsIds.includes(p._id));
            setSelectedProductIds(prev => [...prev, ...newSelectionsIds]);
            setSelectedProductsData(prev => [...prev, ...newSelectionsData]);
            toast.success(`Selected ${newSelectionsIds.length} new products`);
        }
    };

    // Calculate overall selection state for the current view
    const currentProductIds = products.map(p => p._id);
    const selectedCountOnPage = currentProductIds.filter(id => selectedProductIds.includes(id)).length;
    const isAllSelected = products.length > 0 && selectedCountOnPage === products.length;
    const isIndeterminate = selectedCountOnPage > 0 && selectedCountOnPage < products.length;

    const handleAddProducts = async () => {
        if (selectedProductIds.length === 0) return;
        setIsAdding(true);
        try {
            const response = await vendorProductService.bulkCloneProducts({
                productIds: selectedProductIds
            });
            console.log("api is  calling");

            if (response.success) {
                toast.success(response.message || `Successfully added ${selectedProductIds.length} products`);
                setSelectedProductIds([]);
                setSelectedProductsData([]);
                setIsSeeAllOpen(false);
                // Optionally redirect to vendor inventory page or refresh
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add products');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div style={{ padding: '0', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'hsl(var(--card))', padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid hsl(var(--border))' }}>
                {/* Left Side: Back & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={onBack}
                        style={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', borderRadius: '50%', transition: 'all 0.2s', color: 'hsl(var(--foreground))' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--secondary))'}
                        onMouseLeave={e => e.currentTarget.style.background = 'hsl(var(--background))'}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '600', color: 'hsl(var(--foreground))', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Base Inventory
                            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', fontWeight: '600' }}>
                                {totalCount}
                            </span>
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Select a master product to add to your catalog</p>
                    </div>
                </div>

                {/* Right Side: Selection Counter & Action */}
                {selectedProductIds.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', fontWeight: '500' }}>
                            <span style={{ color: 'hsl(var(--foreground))', fontWeight: '700' }}>{selectedProductIds.length}</span> Product{selectedProductIds.length !== 1 ? 's' : ''} Selected
                        </div>
                        <button className="secondary-button" onClick={() => setIsSeeAllOpen(true)} style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                            See All
                        </button>
                        <button
                            className="primary-button"
                            style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}
                            onClick={handleAddProducts}
                            disabled={isAdding}
                        >
                            {isAdding ? 'Adding...' : `Add ${selectedProductIds.length} Product${selectedProductIds.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                )}
            </div>

            {/* Filter Portal UI */}
            <div className="product-glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 50 }}>
                {/* Top Center: Pill Slider */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <PillSlider
                        options={[
                            { value: 'Grocery', label: 'Grocery', icon: <ShoppingCart size={16} /> },
                            { value: 'Food', label: 'Food', icon: <UtensilsCrossed size={16} />, activeColor: '#fe6b35' }
                        ]}
                        value={filters.masterCategory}
                        onChange={(val) => {
                            setMasterCategory(val); // Update global theme
                            setFilters(prev => ({ ...prev, masterCategory: val, categoryId: '', subcategoryId: '', brandId: '' }));
                        }}
                        themeColor="hsl(var(--primary))"
                    />
                </div>

                {/* Filter Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="product-search-wrapper" style={{ margin: 0 }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search name or SKU..."
                            className="product-search-input"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>

                    <div className="employee-form-group" style={{ marginBottom: 0 }}>
                        <CustomSelect
                            options={[
                                { value: '', label: 'All Categories' },
                                ...masters.categories.map(c => ({ value: c._id, label: c.name }))
                            ]}
                            value={filters.categoryId}
                            onChange={(val) => setFilters(prev => ({ ...prev, categoryId: val, subcategoryId: '' }))}
                            placeholder="All Categories"
                        />
                    </div>

                    <div className="employee-form-group" style={{ marginBottom: 0 }}>
                        <CustomSelect
                            options={[
                                { value: '', label: 'All Subcategories' },
                                ...masters.subcategories
                                    .filter(c => !filters.categoryId || c.categoryId === filters.categoryId || c.categoryId?._id === filters.categoryId)
                                    .map(c => ({ value: c._id, label: c.name }))
                            ]}
                            value={filters.subcategoryId}
                            onChange={(val) => setFilters(prev => ({ ...prev, subcategoryId: val }))}
                            placeholder="All Subcategories"
                        />
                    </div>

                    <div className="employee-form-group" style={{ marginBottom: 0 }}>
                        <CustomSelect
                            options={[
                                { value: '', label: 'All Brands' },
                                ...masters.brands.map(b => ({ value: b._id, label: b.name }))
                            ]}
                            value={filters.brandId}
                            onChange={(val) => setFilters(prev => ({ ...prev, brandId: val }))}
                            placeholder="All Brands"
                        />
                    </div>
                </div>
            </div>

            {/* Product Grid Area */}
            <div style={{ position: 'relative', minHeight: '300px' }}>

                {/* Select All Bar */}
                {!isLoading && products.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div
                            onClick={handleSelectAll}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer',
                                padding: '0.5rem 1rem 0.5rem 0.5rem',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease',
                                userSelect: 'none'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--secondary) / 0.5)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* Custom Checkbox UI */}
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '6px',
                                border: `2px solid ${isAllSelected || isIndeterminate ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.5)'}`,
                                background: isAllSelected || isIndeterminate ? 'hsl(var(--primary))' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                color: 'white'
                            }}>
                                {isAllSelected && <Check size={14} strokeWidth={3} />}
                                {isIndeterminate && <Minus size={14} strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'hsl(var(--foreground))' }}>
                                {isAllSelected ? 'Deselect All' : 'Select All'}
                                <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                                    ({selectedCountOnPage}/{products.length} on page)
                                </span>
                            </span>
                        </div>
                    </div>
                )}



                {isLoading ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                        gap: '1.25rem',
                        padding: '0.5rem'
                    }}>
                        {[...Array(ITEMS_PER_PAGE)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ background: 'hsl(var(--card))', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid hsl(var(--border))' }}>
                        <Package size={64} color="hsl(var(--muted-foreground))" style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>No products found</h3>
                        <p style={{ color: 'hsl(var(--muted-foreground))' }}>Try adjusting your filters to find base products.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                        gap: '1.25rem',
                        padding: '0.5rem'
                    }}>
                        {products.map(product => {
                            const isSelected = selectedProductIds.includes(product._id);
                            return (
                                <div
                                    key={product._id}
                                    onClick={() => handleSelectProduct(product)}
                                    className="premium-product-card"
                                    style={{
                                        background: isSelected ? 'hsla(var(--primary) / 0.03)' : 'hsl(var(--card))',
                                        border: `2px solid ${isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border) / 0.6)'}`,
                                        borderRadius: '20px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: isSelected ? '0 10px 30px -10px hsla(var(--primary) / 0.2)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                                        transform: isSelected ? 'scale(1.02)' : 'none'
                                    }}
                                    onMouseEnter={e => {
                                        if (!isSelected) {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.12)';
                                            e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.3)';
                                        }
                                        const img = e.currentTarget.querySelector('img');
                                        if (img) img.style.transform = 'scale(1.1)';
                                    }}
                                    onMouseLeave={e => {
                                        if (!isSelected) {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                                            e.currentTarget.style.borderColor = 'hsl(var(--border) / 0.6)';
                                        } else {
                                            e.currentTarget.style.transform = 'scale(1.02)';
                                        }
                                        const img = e.currentTarget.querySelector('img');
                                        if (img) img.style.transform = 'scale(1)';
                                    }}
                                >
                                    {/* Selection Overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: isSelected ? 'hsl(var(--primary))' : 'transparent',
                                        borderRadius: '50%',
                                        color: 'white',
                                        padding: '4px',
                                        zIndex: 10,
                                        opacity: isSelected ? 1 : 0,
                                        transform: isSelected ? 'scale(1)' : 'scale(0.5)',
                                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        boxShadow: isSelected ? '0 4px 12px hsla(var(--primary) / 0.4)' : 'none'
                                    }}>
                                        <CheckCircle2 size={18} strokeWidth={3} />
                                    </div>

                                    {/* Image Container */}
                                    <div style={{
                                        height: '160px',
                                        width: '100%',
                                        background: 'hsl(var(--secondary) / 0.3)',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        {product.images?.thumbnail ? (
                                            <img
                                                src={`${import.meta.env.VITE_IMAGE_API_URL || 'http://localhost:5000'}/${product.images.thumbnail}`}
                                                alt={product.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                                                }}
                                            />
                                        ) : (
                                            <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Package size={48} color="hsl(var(--muted-foreground))" style={{ opacity: 0.2 }} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{
                                            fontSize: '0.95rem',
                                            fontWeight: '700',
                                            margin: '0 0 0.75rem 0',
                                            color: 'hsl(var(--foreground))',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: '1.4',
                                            height: '2.8rem' // Fixed height for alignment
                                        }}>
                                            {product.name}
                                        </h3>

                                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                            {product.categoryId?.name && (
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    fontWeight: '600',
                                                    background: 'hsla(var(--primary) / 0.08)',
                                                    color: 'hsl(var(--primary))',
                                                    padding: '2px 10px',
                                                    borderRadius: '20px',
                                                    border: '1px solid hsla(var(--primary) / 0.1)'
                                                }}>
                                                    {product.categoryId.name}
                                                </span>
                                            )}
                                            {product.brandId?.name && (
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    fontWeight: '600',
                                                    background: 'hsl(var(--secondary) / 0.5)',
                                                    color: 'hsl(var(--muted-foreground))',
                                                    padding: '2px 10px',
                                                    borderRadius: '20px',
                                                    border: '1px solid hsl(var(--border) / 0.4)'
                                                }}>
                                                    {product.brandId.name}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{
                                            marginTop: 'auto',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingTop: '0.75rem',
                                            borderTop: '1px solid hsl(var(--border) / 0.4)'
                                        }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'hsl(var(--foreground))', letterSpacing: '-0.02em' }}>
                                                {getPriceRange(product)}
                                            </div>
                                            <div style={{
                                                fontSize: '0.7rem',
                                                fontWeight: '600',
                                                color: product.productType === 'Variant' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                background: product.productType === 'Variant' ? 'hsla(var(--primary) / 0.1)' : 'hsl(var(--secondary) / 0.5)',
                                                padding: '2px 6px',
                                                borderRadius: '4px'
                                            }}>
                                                {product.productType === 'Variant' ? 'Variant' : 'Standard'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Infinite Scroll Loader */}
                {hasMore && !isLoading && (
                    <div ref={loaderRef} style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {isFetchingNextPage ? (
                            <div style={{ gap: '1rem', width: '100%', maxWidth: '1400px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
                                {[...Array(7)].map((_, i) => <ProductSkeleton key={i} />)}
                            </div>
                        ) : (
                            <div style={{ height: '20px' }} />
                        )}
                    </div>
                )}
            </div>

            {/* See All Modal */}
            {isSeeAllOpen && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ background: 'hsl(var(--background))', borderRadius: '16px', border: '1px solid hsl(var(--border))', width: '90%', maxWidth: '750px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideInUp 0.3s ease' }}>
                        {/* Modal Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsl(var(--card))', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'hsl(var(--foreground))', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Selected Products
                                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', fontWeight: '600' }}>
                                        {selectedProductIds.length}
                                    </span>
                                </h3>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Review and manage your selected base products before adding them</p>
                            </div>
                            <button onClick={() => setIsSeeAllOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--foreground))'} onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: 'hsl(var(--background))' }}>
                            {selectedProductsList.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'hsl(var(--muted-foreground))' }}>
                                    <Package size={64} style={{ opacity: 0.2, margin: '0 auto 1.5rem' }} />
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'hsl(var(--foreground))', margin: '0 0 0.5rem' }}>No products selected</h4>
                                    <p style={{ margin: 0 }}>You haven't selected any products to add yet.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {selectedProductsList.map(p => (
                                        <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'hsl(var(--primary)/0.3)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'hsl(var(--border))'}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', background: 'hsl(var(--secondary) / 0.5)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {p.images?.thumbnail ? (
                                                    <img src={`${import.meta.env.VITE_IMAGE_API_URL || 'http://localhost:5000'}/${p.images.thumbnail}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : <Package size={28} style={{ opacity: 0.3 }} color="hsl(var(--muted-foreground))" />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: '600', color: 'hsl(var(--foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {p.categoryId?.name && <span style={{ fontSize: '0.7rem', fontWeight: '500', padding: '2px 8px', borderRadius: '4px', background: 'hsla(var(--primary)/0.1)', color: 'hsl(var(--primary))' }}>{p.categoryId.name}</span>}
                                                    {p.subCategoryId?.name && <span style={{ fontSize: '0.7rem', fontWeight: '500', padding: '2px 8px', borderRadius: '4px', background: 'hsl(var(--secondary))', color: 'hsl(var(--muted-foreground))' }}>{p.subCategoryId.name}</span>}
                                                    {p.brandId?.name && <span style={{ fontSize: '0.7rem', fontWeight: '500', padding: '2px 8px', borderRadius: '4px', background: 'hsl(var(--secondary))', color: 'hsl(var(--muted-foreground))' }}>{p.brandId.name}</span>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSelectProduct(p)}
                                                style={{ padding: '0.6rem', background: 'transparent', border: '1px solid hsl(var(--destructive)/0.2)', color: 'hsl(var(--destructive))', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                                onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--destructive)/0.1)'; e.currentTarget.style.border = '1px solid hsl(var(--destructive)/0.4)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.border = '1px solid hsl(var(--destructive)/0.2)'; }}
                                                title="Remove Product"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="secondary-button" onClick={() => setIsSeeAllOpen(false)} style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                                Cancel
                            </button>
                            <button
                                className="primary-button"
                                disabled={selectedProductIds.length === 0 || isAdding}
                                onClick={handleAddProducts}
                                style={{ padding: '0.6rem 2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (selectedProductIds.length === 0 || isAdding) ? 0.5 : 1 }}
                            >
                                {isAdding ? 'Adding...' : `Add ${selectedProductIds.length} Product${selectedProductIds.length !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default BaseInventoryPortal;
