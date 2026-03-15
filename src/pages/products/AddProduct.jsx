import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, CheckCircle,
    Package, DollarSign, ChevronRight, X, RefreshCw, Layers, Zap,
    ShoppingCart, UtensilsCrossed, ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import productService from '../../services/productService';
import Loader from '../../components/Loader';
import CustomSelect from '../../components/CustomSelect';
import QuickCreateModal from '../../components/QuickCreateModal';
import PillSlider from '../../components/PillSlider';
import masterCategoryStore from '../../store/masterCategoryStore';
import '../../components/QuickCreateModal.css'; // Added CSS import for the Bulk Modal styling
import './Product.css';

const unitAwareSort = (a, b) => {
    const parseValue = (str) => {
        if (!str) return { magnitude: 0, unit: '' };
        const match = str.toLowerCase().match(/^([\d.]+)\s*([a-z]+)$/);
        if (!match) return { magnitude: parseFloat(str) || 0, unit: '' };

        let magnitude = parseFloat(match[1]);
        const unit = match[2];

        // Conversion scales to base units (grams, milliliters, units)
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

    const valA = parseValue(a.name || a.valueName);
    const valB = parseValue(b.name || b.valueName);

    if (valA.magnitude !== valB.magnitude) {
        return valA.magnitude - valB.magnitude;
    }
    return (a.name || a.valueName || '').localeCompare(b.name || b.valueName || '', undefined, { numeric: true, sensitivity: 'base' });
};

const AddProduct = () => {
    const navigate = useNavigate();
    const [mcState, setMcState] = useState(masterCategoryStore.getState());
    const { masterCategory: globalMasterCategory } = mcState;

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [showAttributeModal, setShowAttributeModal] = useState(false);
    const [showValueModal, setShowValueModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [activeAttributeForValue, setActiveAttributeForValue] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(1);
    const [masterCategory, setMasterCategory] = useState(globalMasterCategory);

    useEffect(() => {
        return masterCategoryStore.subscribe(setMcState);
    }, []);

    useEffect(() => {
        setMasterCategory(globalMasterCategory);
    }, [globalMasterCategory]);
    const [masters, setMasters] = useState({
        categories: [],
        allSubCategories: [],
        subCategories: [],
        brands: [],
        units: [],
        taxes: [],
        variantAttributes: [],
    });

    const [formData, setFormData] = useState({
        masterCategory: globalMasterCategory,
        name: '',
        categoryId: '',
        subCategoryId: '',
        brandId: '',
        unitId: '',
        description: '',
        productType: 'Single',
        pricing: {
            mrp: '',
            sellingPrice: '',
            costPrice: '',
            taxId: '',
            discountType: 'Fixed',
            discountValue: 0,
            quantity: '',
            sku: '',
            minStock: 0
        },
        variants: [],
    });

    // Variant builder state
    const [selectedAttributes, setSelectedAttributes] = useState([]);
    const [selectedValuesPerAttr, setSelectedValuesPerAttr] = useState({});
    const [bulkApply, setBulkApply] = useState({ mrp: '', price: '', discount: '', costPrice: '', taxId: '', stock: '', minStock: '' });

    const [images, setImages] = useState({ thumbnail: null, gallery: [] });
    const [previews, setPreviews] = useState({ thumbnail: '', gallery: [] });

    useEffect(() => {
        fetchMasters();
    }, [masterCategory]);

    const fetchMasters = async () => {
        setIsLoading(true);
        try {
            const params = { masterCategory, status: true };
            const [cat, sub, br, un, tx, attr] = await Promise.all([
                productService.getCategories(params),
                productService.getSubcategories(params),
                productService.getBrands(params),
                productService.getUnits(params),
                productService.getTaxes(params),
                productService.getVariantAttributes(params)
            ]);
            setMasters({
                categories: cat.categories || [],
                allSubCategories: sub.subcategories || [],
                subCategories: [],
                brands: br.brands || [],
                units: un.units || [],
                taxes: tx.taxes || [],
                variantAttributes: (attr.variantTypes || []).filter(a => a.status),
            });
        } catch {
            toast.error('Failed to load masters');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePricingChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newPricing = { ...prev.pricing, [name]: value };

            // Auto-calculate discount if mrp or sellingPrice changes
            if (name === 'mrp' || name === 'sellingPrice') {
                const mrp = parseFloat(newPricing.mrp) || 0;
                const sp = parseFloat(newPricing.sellingPrice) || 0;
                if (mrp > 0 && sp > 0 && mrp > sp) {
                    newPricing.discountValue = Math.round(((mrp - sp) / mrp) * 100);
                    newPricing.discountType = 'Percentage';
                } else {
                    newPricing.discountValue = 0;
                }
            }

            return { ...prev, pricing: newPricing };
        });
    };

    const generateSKUAction = (type = 'product', index = null) => {
        const namePart = formData.name ? formData.name.substring(0, 3).toUpperCase() : 'SKU';
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const newSKU = `${namePart}-${randomPart}`;
        if (type === 'product') {
            setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, sku: newSKU } }));
        } else if (index !== null) {
            const updated = [...formData.variants];
            updated[index].sku = newSKU;
            setFormData(prev => ({ ...prev, variants: updated }));
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImages(prev => ({ ...prev, thumbnail: file }));
            setPreviews(prev => ({ ...prev, thumbnail: URL.createObjectURL(file) }));
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => ({ ...prev, gallery: [...prev.gallery, ...files] }));
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setPreviews(prev => ({ ...prev, gallery: [...prev.gallery, ...newPreviews] }));
    };

    const removeGalleryImage = (index) => {
        setImages(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
        setPreviews(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
    };

    // ─── Variant Builder Logic ─────────────────────────────────────────────────

    const toggleAttribute = async (attrId) => {
        const alreadySelected = selectedAttributes.some(a => a._id === attrId);
        if (alreadySelected) {
            setSelectedAttributes(prev => prev.filter(a => a._id !== attrId));
            setSelectedValuesPerAttr(prev => {
                const next = { ...prev };
                delete next[attrId];
                return next;
            });
        } else {
            const attr = masters.variantAttributes.find(a => a._id === attrId);
            try {
                const res = await productService.getVariantValues({ variantTypeId: attrId });
                const values = (res.variantValues || []).filter(v => v.status);
                values.sort(unitAwareSort);
                // Pre-select all values by default
                const valueMap = {};
                values.forEach(v => { valueMap[v._id] = true; });
                setSelectedAttributes(prev => [...prev, { ...attr, values }]);
                setSelectedValuesPerAttr(prev => ({ ...prev, [attrId]: valueMap }));
            } catch {
                toast.error('Failed to load values for ' + attr.name);
            }
        }
    };

    const toggleValue = (attrId, valueId) => {
        setSelectedValuesPerAttr(prev => ({
            ...prev,
            [attrId]: { ...prev[attrId], [valueId]: !prev[attrId]?.[valueId] }
        }));
    };

    const toggleAllValues = (attrId, selectAll) => {
        const attr = selectedAttributes.find(a => a._id === attrId);
        if (!attr) return;
        const valueMap = {};
        attr.values.forEach(v => { valueMap[v._id] = selectAll; });
        setSelectedValuesPerAttr(prev => ({ ...prev, [attrId]: valueMap }));
    };

    const getComboCount = () => {
        if (selectedAttributes.length === 0) return 0;
        let count = 1;
        for (const attr of selectedAttributes) {
            const selected = Object.values(selectedValuesPerAttr[attr._id] || {}).filter(Boolean).length;
            if (selected === 0) return 0;
            count *= selected;
        }
        return count;
    };

    const generateMatrix = () => {
        const count = getComboCount();
        if (count === 0) return toast.error('Select at least one value per attribute');

        let matrix = [[]];
        selectedAttributes.forEach(attr => {
            const selectedVals = attr.values.filter(v => selectedValuesPerAttr[attr._id]?.[v._id]);
            const newMatrix = [];
            selectedVals.forEach(val => {
                matrix.forEach(prevRow => {
                    newMatrix.push([...prevRow, {
                        variantTypeId: attr._id,
                        valueId: val._id,
                        valueName: val.name,
                        typeName: attr.name,
                        colorCode: val.colorCode || null
                    }]);
                });
            });
            matrix = newMatrix;
        });

        const newVariants = matrix.map(combination => ({
            variantValues: combination,
            sku: '',
            quantity: '',
            price: '', // Note: price here maps to sellingPrice conceptually, but DB uses sellingPrice
            sellingPrice: '',
            mrp: '',
            discount: 0,
            costPrice: '',
            taxId: '',
            unitId: '',
            minStock: 0
        }));

        setFormData(prev => ({ ...prev, variants: newVariants }));
        setBulkApply({ mrp: '', price: '', discount: '', costPrice: '', taxId: '', stock: '', minStock: '' });
        toast.success(`${newVariants.length} variant combinations generated`);
    };

    const updateVariantRow = (index, field, value) => {
        const updated = [...formData.variants];
        updated[index][field] = value;

        // Auto-calc discount for variant row
        if (field === 'mrp' || field === 'sellingPrice') {
            const mrp = parseFloat(updated[index].mrp) || 0;
            const sp = parseFloat(updated[index].sellingPrice) || 0;
            if (mrp > 0 && sp > 0 && mrp > sp) {
                updated[index].discount = Math.round(((mrp - sp) / mrp) * 100);
            } else {
                updated[index].discount = 0;
            }
        }

        setFormData(prev => ({ ...prev, variants: updated }));
    };

    const applyBulkToAll = () => {
        if (!bulkApply.mrp && !bulkApply.price && !bulkApply.discount && !bulkApply.costPrice && !bulkApply.taxId && !bulkApply.stock && !bulkApply.minStock) {
            return toast.error('Fill at least one field to apply');
        }

        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v => {
                const newVariant = {
                    ...v,
                    ...(bulkApply.price !== '' && { sellingPrice: bulkApply.price, price: bulkApply.price }),
                    ...(bulkApply.mrp !== '' && { mrp: bulkApply.mrp }),
                    ...(bulkApply.discount !== '' && { discount: bulkApply.discount }),
                    ...(bulkApply.costPrice !== '' && { costPrice: bulkApply.costPrice }),
                    ...(bulkApply.taxId !== '' && { taxId: bulkApply.taxId }),
                    ...(bulkApply.stock !== '' && { quantity: bulkApply.stock }),
                    ...(bulkApply.minStock !== '' && { minStock: bulkApply.minStock }),
                };

                // Auto recalc discount if MRp/Price was bulk applied and discount wasn't
                if ((bulkApply.price !== '' || bulkApply.mrp !== '') && bulkApply.discount === '') {
                    const mrp = parseFloat(newVariant.mrp) || 0;
                    const sp = parseFloat(newVariant.sellingPrice || newVariant.price) || 0;
                    if (mrp > 0 && sp > 0 && mrp > sp) {
                        newVariant.discount = Math.round(((mrp - sp) / mrp) * 100);
                    } else {
                        newVariant.discount = 0;
                    }
                }

                return newVariant;
            })
        }));
        toast.success('Bulk values applied to all variants');
        setShowBulkModal(false);
    };

    const deleteVariantRow = (index) => {
        setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
    };

    // ─── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!formData.name || !formData.categoryId) return toast.error('Product Name and Category are required');
        if (formData.productType === 'Variant' && formData.variants.length === 0) {
            return toast.error('Generate at least one variant combination');
        }

        setIsLoading(true);
        try {
            const data = new FormData();
            ['name', 'categoryId', 'subCategoryId', 'brandId', 'unitId', 'description', 'productType'].forEach(key => {
                if (formData[key]) data.append(key, formData[key]);
            });
            data.append('masterCategory', masterCategory);
            const cleanPricing = { ...formData.pricing };
            if (!cleanPricing.taxId) delete cleanPricing.taxId;
            data.append('pricing', JSON.stringify(cleanPricing));

            if (formData.productType === 'Variant') {
                const cleanVariants = formData.variants.map(v => {
                    const cleanV = { ...v };
                    if (!cleanV.taxId) delete cleanV.taxId;
                    if (!cleanV.unitId) delete cleanV.unitId;
                    return cleanV;
                });
                data.append('variants', JSON.stringify(cleanVariants));
            }
            if (images.thumbnail) data.append('image', images.thumbnail);
            images.gallery.forEach(img => data.append('images', img));
            console.log(data);
            const res = await productService.createProduct(data);
            console.log(res);
            toast.success('Product created successfully!');
            navigate('/products/list-products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    const comboCount = getComboCount();

    return (
        <div className="product-page-container fade-in">
            <div className="product-content-pane">
                <header className="internal-page-header" style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>

                        {/* LEFT: Title & Back Button */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'hsl(var(--foreground))' }}>
                                    <ArrowLeft size={18} />
                                </button>
                                <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--primary))' }}>
                                    Catalog / New Product
                                </span>
                            </div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 4px 0', color: 'hsl(var(--foreground))' }}>
                                {formData.name || 'Create New Product'}
                            </h1>
                            <p style={{ margin: 0, color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', textAlign: 'left' }}>
                                Define standard or variant-based products for the catalog.
                            </p>
                        </div>

                        {/* CENTER: Master Category Pill Slider */}
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                            <PillSlider
                                options={[
                                    { value: 'Grocery', label: 'Grocery', icon: <ShoppingCart size={18} /> },
                                    { value: 'Food', label: 'Food', icon: <UtensilsCrossed size={18} />, activeColor: '#8b5cf6' }
                                ]}
                                value={masterCategory}
                                onChange={setMasterCategory}
                            />
                        </div>

                        {/* RIGHT: Phase Indicator */}
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--secondary) / 0.5)', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
                                Phase {activeTab} / 3
                            </span>
                        </div>

                    </div>
                </header>

                <div className="product-glass-card" style={{ padding: '2rem', overflow: 'visible' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid hsl(var(--border)/0.2)', paddingBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'hsl(var(--primary))', margin: 0 }}>
                            {['1. General Information', '2. Pricing & Stock Matrix', '3. Media Assets'][activeTab - 1]}
                        </h3>
                    </div>

                    {/* ── Tab 1: General Info ── */}
                    {activeTab === 1 && (
                        <div className="animate-in fade-in">
                            <div className="product-grid">
                                <div className="product-field-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="product-label">Product Name *</label>
                                    <input name="name" className="product-input" style={{ fontSize: '1.1rem', fontWeight: 800 }} placeholder="Enter product name..." value={formData.name} onChange={handleInputChange} autoFocus />
                                </div>
                                <div className="product-field-group">
                                    <label className="product-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Category *</span>
                                        <button
                                            type="button"
                                            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 'bold' }}
                                            onClick={() => setShowCategoryModal(true)}
                                            title="Create new category"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--primary) / 0.15)', width: '20px', height: '20px', borderRadius: '50%' }}>
                                                <Plus size={12} strokeWidth={3} />
                                            </div>
                                            Add New
                                        </button>
                                    </label>
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'None' },
                                            ...masters.categories.map(c => ({ value: c._id, label: c.name }))
                                        ]}
                                        value={formData.categoryId}
                                        onChange={(val) => {
                                            setFormData(prev => ({ ...prev, categoryId: val, subCategoryId: '' }));
                                            const filtered = val ? masters.allSubCategories.filter(s => s.categoryId?._id === val || s.categoryId === val) : [];
                                            setMasters(prev => ({ ...prev, subCategories: filtered }));
                                        }}
                                        placeholder="Select Category"
                                    />
                                </div>
                                <div className="product-field-group">
                                    <label className="product-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Sub-Classification</span>
                                        <button
                                            type="button"
                                            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 'bold' }}
                                            onClick={() => setShowSubcategoryModal(true)}
                                            title="Create new subcategory"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--primary) / 0.15)', width: '20px', height: '20px', borderRadius: '50%' }}>
                                                <Plus size={12} strokeWidth={3} />
                                            </div>
                                            Add New
                                        </button>
                                    </label>
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'None' },
                                            ...masters.subCategories.map(s => ({ value: s._id, label: s.name }))
                                        ]}
                                        value={formData.subCategoryId}
                                        onChange={(val) => setFormData(prev => ({ ...prev, subCategoryId: val }))}
                                        placeholder={formData.categoryId ? 'Select Sub Category' : 'Awaiting Category...'}
                                        disabled={!formData.categoryId || masters.subCategories.length === 0}
                                    />
                                </div>
                                <div className="product-field-group">
                                    <label className="product-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Brand</span>
                                        <button
                                            type="button"
                                            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 'bold' }}
                                            onClick={() => setShowBrandModal(true)}
                                            title="Create new brand"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--primary) / 0.15)', width: '20px', height: '20px', borderRadius: '50%' }}>
                                                <Plus size={12} strokeWidth={3} />
                                            </div>
                                            Add New
                                        </button>
                                    </label>
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'None' },
                                            ...masters.brands.map(b => ({ value: b._id, label: b.name }))
                                        ]}
                                        value={formData.brandId}
                                        onChange={(val) => setFormData(prev => ({ ...prev, brandId: val }))}
                                        placeholder="Select Brand"
                                    />
                                </div>
                                <div className="product-field-group">
                                    <label className="product-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Base Unit</span>
                                        <button
                                            type="button"
                                            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 'bold' }}
                                            onClick={() => setShowUnitModal(true)}
                                            title="Create new unit"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--primary) / 0.15)', width: '20px', height: '20px', borderRadius: '50%' }}>
                                                <Plus size={12} strokeWidth={3} />
                                            </div>
                                            Add New
                                        </button>
                                    </label>
                                    <CustomSelect
                                        options={[
                                            { value: '', label: 'None' },
                                            ...masters.units.map(u => ({ value: u._id, label: u.name }))
                                        ]}
                                        value={formData.unitId}
                                        onChange={(val) => setFormData(prev => ({ ...prev, unitId: val }))}
                                        placeholder="Select Unit"
                                    />
                                </div>
                                <div className="product-field-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="product-label">Description</label>
                                    <textarea name="description" className="product-input product-textarea" placeholder="Product description, specifications..." value={formData.description} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 2: Pricing & Stock ── */}
                    {activeTab === 2 && (
                        <div className="animate-in fade-in">
                            {/* Product Type Toggle */}
                            <div className="type-selection-wrapper">
                                <label className={`type-selection-card ${formData.productType === 'Single' ? 'active' : ''}`}>
                                    <input type="radio" name="productType" value="Single" checked={formData.productType === 'Single'} onChange={handleInputChange} style={{ width: 14, height: 14, cursor: 'pointer' }} />
                                    <div className="type-selection-icon"><Package size={14} strokeWidth={2.5} /></div>
                                    <div className="type-selection-title">Standard Single</div>
                                </label>
                                <label className={`type-selection-card ${formData.productType === 'Variant' ? 'active' : ''}`}>
                                    <input type="radio" name="productType" value="Variant" checked={formData.productType === 'Variant'} onChange={handleInputChange} style={{ width: 14, height: 14, cursor: 'pointer' }} />
                                    <div className="type-selection-icon"><Layers size={14} strokeWidth={2.5} /></div>
                                    <div className="type-selection-title">Variant Matrix</div>
                                </label>
                            </div>

                            {/* ── Single Product Pricing ── */}
                            {formData.productType === 'Single' && (
                                <div className="product-grid">
                                    <div className="product-field-group">
                                        <label className="product-label">SKU</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input name="sku" className="product-input" style={{ fontFamily: 'monospace', textTransform: 'uppercase', fontSize: '0.85rem' }} placeholder="AUTO-SKU" value={formData.pricing.sku} onChange={handlePricingChange} />
                                            <button className="vb-icon-btn" onClick={() => generateSKUAction('product')} title="Generate SKU"><RefreshCw size={15} /></button>
                                        </div>
                                    </div>
                                    <div className="product-field-group">
                                        <label className="product-label">Tax Configuration</label>
                                        <CustomSelect
                                            options={masters.taxes.filter(t => t && t.name).map(t => ({ value: t._id, label: `${t.name} (${t.rate || 0}%)` }))}
                                            value={formData.pricing.taxId}
                                            onChange={(val) => setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, taxId: val } }))}
                                            placeholder="Exempt / No Tax"
                                        />
                                    </div>
                                    <div className="product-field-group">
                                        <label className="product-label">Selling Price (₹) *</label>
                                        <input type="number" name="sellingPrice" className="product-input" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'hsl(var(--primary))' }} value={formData.pricing.sellingPrice} onChange={handlePricingChange} placeholder="0.00" />
                                    </div>
                                    <div className="product-field-group">
                                        <label className="product-label">MRP (₹)</label>
                                        <input type="number" name="mrp" className="product-input" value={formData.pricing.mrp} onChange={handlePricingChange} placeholder="0.00" />
                                    </div>
                                    <div className="product-field-group">
                                        <label className="product-label">Discount (%)</label>
                                        <input type="number" name="discountValue" className="product-input" value={formData.pricing.discountValue} onChange={handlePricingChange} placeholder="0" />
                                    </div>
                                    <div className="product-field-group">
                                        <label className="product-label">Cost Price (₹)</label>
                                        <input type="number" name="costPrice" className="product-input" value={formData.pricing.costPrice} onChange={handlePricingChange} placeholder="0.00" />
                                    </div>
                                    <div className="product-field-group">
                                        <label className="product-label">Stock Quantity</label>
                                        <input type="number" name="quantity" className="product-input" style={{ fontWeight: 700 }} value={formData.pricing.quantity} onChange={handlePricingChange} placeholder="0" />
                                    </div>
                                    <div className="product-field-group">
                                        <label className="product-label">Min Stock Alert</label>
                                        <input type="number" name="minStock" className="product-input" value={formData.pricing.minStock} onChange={handlePricingChange} placeholder="0" />
                                    </div>
                                </div>
                            )}

                            {/* ── Variant Matrix Builder ── */}
                            {formData.productType === 'Variant' && (
                                <div className="variant-builder-section">

                                    {/* Step 1: Attribute + Value Selection */}
                                    <div className="vb-step-card">
                                        <div className="vb-step-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                                                <div className="vb-step-number">1</div>
                                                <div>
                                                    <div className="vb-step-title">Select Variant Attributes</div>
                                                    <div className="vb-step-desc">Choose which attributes define this product's variations, then pick the specific values to include</div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}
                                                onClick={() => setShowAttributeModal(true)}
                                                title="Create new attribute"
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--primary) / 0.15)', width: '20px', height: '20px', borderRadius: '50%' }}>
                                                    <Plus size={12} strokeWidth={3} />
                                                </div>
                                                Add New
                                            </button>
                                        </div>

                                        {/* Attribute Type Toggles */}
                                        {masters.variantAttributes.length === 0 ? (
                                            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', border: '1px dashed hsl(var(--border)/0.4)', borderRadius: '0.75rem' }}>
                                                No variant attributes found. Create some in the Variants settings first.
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: selectedAttributes.length > 0 ? '1.25rem' : '0' }}>
                                                {masters.variantAttributes.map(attr => {
                                                    const isSelected = selectedAttributes.some(a => a._id === attr._id);
                                                    return (
                                                        <button key={attr._id} onClick={() => toggleAttribute(attr._id)} className={`attr-type-toggle ${isSelected ? 'active' : ''}`}>
                                                            {isSelected ? <CheckCircle size={13} /> : <Plus size={13} />}
                                                            {attr.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Value Selection per Attribute */}
                                        {selectedAttributes.map(attr => {
                                            const vals = selectedValuesPerAttr[attr._id] || {};
                                            const selectedCount = Object.values(vals).filter(Boolean).length;
                                            const allSelected = attr.values.length > 0 && selectedCount === attr.values.length;
                                            return (
                                                <div key={attr._id} className="attr-values-panel">
                                                    <div className="attr-values-header">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span className="attr-values-name">{attr.name}</span>
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--secondary)/0.5)', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
                                                                {selectedCount} / {attr.values.length} selected
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                            <button
                                                                type="button"
                                                                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: 'bold' }}
                                                                onClick={() => {
                                                                    setActiveAttributeForValue(attr);
                                                                    setShowValueModal(true);
                                                                }}
                                                                title={`Add new value to ${attr.name}`}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--primary) / 0.15)', width: '20px', height: '20px', borderRadius: '50%' }}>
                                                                    <Plus size={12} strokeWidth={3} />
                                                                </div>
                                                                Add New
                                                            </button>
                                                            <div style={{ width: '1px', height: '14px', background: 'hsl(var(--border))', margin: '0 0.5rem' }}></div>
                                                            <button className="attr-select-all-btn" onClick={() => toggleAllValues(attr._id, !allSelected)}>
                                                                {allSelected ? 'Deselect All' : 'Select All'}
                                                            </button>
                                                            <button className="attr-remove-btn" onClick={() => toggleAttribute(attr._id)} title="Remove attribute">
                                                                <X size={13} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {attr.values.length === 0 ? (
                                                        <div style={{ fontSize: '0.78rem', color: 'hsl(var(--muted-foreground))', fontStyle: 'italic' }}>No values found for this attribute.</div>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                            {attr.values.map(val => {
                                                                const isChecked = !!vals[val._id];
                                                                return (
                                                                    <button key={val._id} onClick={() => toggleValue(attr._id, val._id)} className={`attr-value-chip ${isChecked ? 'selected' : ''}`}>
                                                                        {attr.inputType === 'Color Picker' && (
                                                                            <span style={{ display: 'inline-block', width: 11, height: 11, borderRadius: '50%', background: val.colorCode || '#ccc', border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                                                                        )}
                                                                        {val.name}
                                                                        {isChecked && <CheckCircle size={11} />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* Combo Count + Generate Button */}
                                        {selectedAttributes.length > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed hsl(var(--border)/0.3)' }}>
                                                <div className="combo-preview">
                                                    {comboCount > 0 ? (
                                                        <><span className="combo-count">{comboCount}</span> variant combination{comboCount !== 1 ? 's' : ''} will be generated</>
                                                    ) : (
                                                        <span style={{ color: 'hsl(var(--muted-foreground))' }}>Select values above to preview combinations</span>
                                                    )}
                                                </div>
                                                <button onClick={generateMatrix} className="vb-generate-btn" disabled={comboCount === 0}>
                                                    <Layers size={15} />
                                                    Generate Variant Matrix
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Step 2: Variant Table */}
                                    {formData.variants.length > 0 && (
                                        <div className="vb-step-card" style={{ padding: 0, overflow: 'hidden' }}>

                                            {/* Compact Action Toolbar */}
                                            <div className="vb-compact-toolbar">
                                                <div className="vb-toolbar-status">
                                                    <div className="vb-table-title">
                                                        <span style={{ color: 'hsl(var(--primary))', marginRight: '0.4rem' }}>{formData.variants.length}</span>
                                                        Variants
                                                    </div>
                                                </div>

                                                <div className="vb-bulk-bar" style={{ padding: '0.5rem 1rem' }}>
                                                    <div className="vb-bulk-label" style={{ fontWeight: 600 }}>
                                                        <Zap size={14} color="hsl(var(--primary))" />
                                                        Matrix Actions
                                                    </div>
                                                    <button
                                                        onClick={() => setShowBulkModal(true)}
                                                        className="vb-apply-btn"
                                                        style={{ padding: '0.4rem 0.8rem', background: 'hsl(var(--primary))', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                                                    >
                                                        <Layers size={14} /> Apply Bulk Options
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Column Headers */}
                                            <div className="table-responsive-wrapper" style={{ width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                                <div style={{ minWidth: '1250px' }}>
                                                    <div className="vb-col-header">
                                                        <div>Variant Combination</div>
                                                        <div>SKU</div>
                                                        <div>MRP</div>
                                                        <div>Sell Price</div>
                                                        <div>Discount (%)</div>
                                                        <div>Cost Price</div>
                                                        <div>Tax</div>
                                                        <div>Unit</div>
                                                        <div>Stock</div>
                                                        <div>Min Stock</div>
                                                        <div></div>
                                                    </div>

                                                    {/* Variant Rows */}
                                                    <div style={{ paddingBottom: '1rem' }}>
                                                        {formData.variants.map((variant, idx) => (
                                                            <div key={idx} className="vb-variant-row">
                                                                {/* Variant / Attributes */}
                                                                <div>
                                                                    <div className="vb-badge-group">
                                                                        {variant.variantValues.map(v => (
                                                                            <div key={v.valueId} className="vb-attr-badge">
                                                                                {v.colorCode && <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: v.colorCode, border: '1px solid rgba(0,0,0,0.15)', marginRight: 3, flexShrink: 0 }} />}
                                                                                <span className="vb-badge-type">{v.typeName}:</span>
                                                                                {v.valueName}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* SKU */}
                                                                <div>
                                                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                                                                        <input className="product-input vb-row-input" style={{ fontFamily: 'monospace', textTransform: 'uppercase', fontSize: '0.7rem' }} value={variant.sku} onChange={e => updateVariantRow(idx, 'sku', e.target.value)} placeholder="AUTO" />
                                                                        <button className="vb-icon-btn" style={{ padding: '0.35rem' }} onClick={() => generateSKUAction('variant', idx)} title="Regenerate">
                                                                            <RefreshCw size={11} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* MRP */}
                                                                <div>
                                                                    <input type="number" className="product-input vb-row-input" value={variant.mrp} onChange={e => updateVariantRow(idx, 'mrp', e.target.value)} placeholder="0.00" />
                                                                </div>

                                                                {/* Selling Price */}
                                                                <div>
                                                                    <input type="number" className="product-input vb-row-input" style={{ fontWeight: 700, color: 'hsl(var(--primary))' }} value={variant.sellingPrice || variant.price} onChange={e => updateVariantRow(idx, 'sellingPrice', e.target.value)} placeholder="0.00" />
                                                                </div>

                                                                {/* Discount */}
                                                                <div>
                                                                    <input type="number" className="product-input vb-row-input" value={variant.discount} onChange={e => updateVariantRow(idx, 'discount', e.target.value)} placeholder="0" />
                                                                </div>

                                                                {/* Cost Price */}
                                                                <div>
                                                                    <input type="number" className="product-input vb-row-input" value={variant.costPrice} onChange={e => updateVariantRow(idx, 'costPrice', e.target.value)} placeholder="0.00" />
                                                                </div>

                                                                {/* Tax */}
                                                                <div>
                                                                    <CustomSelect
                                                                        className="vb-row-custom-select"
                                                                        value={variant.taxId}
                                                                        onChange={(val) => updateVariantRow(idx, 'taxId', val)}
                                                                        options={[
                                                                            { value: "", label: "No Tax" },
                                                                            ...masters.taxes.filter(t => t && t.name).map(t => ({ value: t._id, label: `${t.name} (${t.rate || 0}%)` }))
                                                                        ]}
                                                                        placeholder="No Tax"
                                                                    />
                                                                </div>

                                                                {/* Unit */}
                                                                <div>
                                                                    <div className="product-input vb-row-input" style={{ display: 'flex', alignItems: 'center', background: 'hsl(var(--secondary)/0.3)', color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', cursor: 'not-allowed' }}>
                                                                        {formData.unitId ? (masters.units.find(u => u._id === formData.unitId)?.shortName || masters.units.find(u => u._id === formData.unitId)?.name || 'N/A') : 'N/A'}
                                                                    </div>
                                                                </div>

                                                                {/* Stock */}
                                                                <div>
                                                                    <input type="number" className="product-input vb-row-input" style={{ fontWeight: 600 }} value={variant.quantity} onChange={e => updateVariantRow(idx, 'quantity', e.target.value)} placeholder="0" />
                                                                </div>

                                                                {/* Min Stock */}
                                                                <div>
                                                                    <input type="number" className="product-input vb-row-input" value={variant.minStock} onChange={e => updateVariantRow(idx, 'minStock', e.target.value)} placeholder="0" />
                                                                </div>

                                                                {/* Delete */}
                                                                <div style={{ justifyContent: 'center' }}>
                                                                    <button className="vb-delete-btn" onClick={() => deleteVariantRow(idx)} title="Remove variant">
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Tab 3: Visuals ── */}
                    {activeTab === 3 && (
                        <div className="animate-in fade-in">
                            <div className="product-grid">
                                <div className="product-field-group">
                                    <label className="product-label">Thumbnail Image *</label>
                                    <div className="image-upload-zone" style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', border: '2px dashed hsl(var(--border)/0.3)', borderRadius: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                                        {previews.thumbnail ? (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--secondary)/0.1)', position: 'relative' }}>
                                                <img src={previews.thumbnail} alt="Thumbnail" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                <button style={{ position: 'absolute', top: 12, right: 12, padding: '8px 12px', background: 'hsl(var(--destructive))', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', zIndex: 10, transition: 'all 0.2s' }}
                                                    onClick={() => { setImages(p => ({ ...p, thumbnail: null })); setPreviews(p => ({ ...p, thumbnail: '' })); }}
                                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                                    <X size={14} strokeWidth={3} /> Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ width: 48, height: 48, background: 'hsl(var(--primary)/0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem', marginBottom: '0.5rem' }}><Plus size={24} /></div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.4, letterSpacing: '0.1em' }}>Main Product Image</span>
                                                <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={handleThumbnailChange} />
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="product-field-group">
                                    <label className="product-label">Gallery Images</label>
                                    <div className="image-upload-zone" style={{ height: 220, padding: '0.75rem', border: '2px dashed hsl(var(--border)/0.3)', borderRadius: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', overflowY: 'auto' }}>
                                        {previews.gallery.map((src, i) => (
                                            <div key={i} style={{ width: 80, height: 80, borderRadius: '0.75rem', overflow: 'hidden', position: 'relative', border: '1px solid hsl(var(--border)/0.2)' }}>
                                                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button style={{ position: 'absolute', top: 4, right: 4, padding: '4px', background: 'hsl(var(--destructive))', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10 }} onClick={() => removeGalleryImage(i)}>
                                                    <X size={10} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ))}
                                        <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--primary)/0.05)', border: '1px solid hsl(var(--primary)/0.1)', borderRadius: '0.75rem', position: 'relative', cursor: 'pointer' }}>
                                            <Plus size={20} style={{ color: 'hsl(var(--primary)/0.4)' }} />
                                            <input type="file" multiple accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={handleGalleryChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="action-footer" style={{ borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
                    <button className="btn-premium-outline" onClick={() => navigate(-1)}>Exit Studio</button>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {activeTab > 1 && (
                            <button className="btn-premium-outline" onClick={() => setActiveTab(activeTab - 1)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <ChevronLeft size={18} /> Previous
                            </button>
                        )}
                        {activeTab < 3 ? (
                            <button className="btn-premium-primary" onClick={() => setActiveTab(activeTab + 1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Next <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button className="btn-premium-primary" onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Save size={16} /> Create Product
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isLoading && <Loader />}

            {/* Category Creation Modal */}
            {showCategoryModal && (
                <QuickCreateModal
                    isOpen={showCategoryModal}
                    onClose={() => setShowCategoryModal(false)}
                    type="Category"
                    onSuccess={(newCategory) => {
                        // Add new category to masters list
                        setMasters(prev => ({
                            ...prev,
                            categories: [...prev.categories, newCategory]
                        }));
                        // Auto-select the newly created category
                        setFormData(prev => ({
                            ...prev,
                            categoryId: newCategory._id,
                            subCategoryId: '' // Reset subcategory as it's a new category
                        }));
                    }}
                />
            )}

            {/* Subcategory Creation Modal */}
            {showSubcategoryModal && (
                <QuickCreateModal
                    isOpen={showSubcategoryModal}
                    onClose={() => setShowSubcategoryModal(false)}
                    type="Subcategory"
                    masters={{ categories: masters.categories }} // Need categories drop down for parent selection
                    onSuccess={(newSubcategory) => {
                        setMasters(prev => {
                            const newAllSubCategories = [...prev.allSubCategories, newSubcategory];
                            const filtered = formData.categoryId
                                ? newAllSubCategories.filter(s => s.categoryId?._id === formData.categoryId || s.categoryId === formData.categoryId)
                                : [];
                            return {
                                ...prev,
                                allSubCategories: newAllSubCategories,
                                subCategories: filtered
                            };
                        });

                        // Select it if it belongs to the currently selected category
                        const subCatParentId = newSubcategory.categoryId?._id || newSubcategory.categoryId;
                        if (subCatParentId === formData.categoryId) {
                            setFormData(prev => ({
                                ...prev,
                                subCategoryId: newSubcategory._id
                            }));
                        } else if (!formData.categoryId) {
                            // If no category was selected, auto-select both parent category and new subcategory
                            setFormData(prev => ({
                                ...prev,
                                categoryId: subCatParentId,
                                subCategoryId: newSubcategory._id
                            }));
                            setMasters(prev => {
                                const filtered = prev.allSubCategories.filter(s => s.categoryId?._id === subCatParentId || s.categoryId === subCatParentId);
                                return {
                                    ...prev,
                                    subCategories: filtered
                                };
                            })
                        }
                    }}
                />
            )}

            {/* Brand Creation Modal */}
            {showBrandModal && (
                <QuickCreateModal
                    isOpen={showBrandModal}
                    onClose={() => setShowBrandModal(false)}
                    type="Brand"
                    onSuccess={(newBrand) => {
                        // Add new brand to masters list
                        setMasters(prev => ({
                            ...prev,
                            brands: [...prev.brands, newBrand]
                        }));
                        // Auto-select the newly created brand
                        setFormData(prev => ({
                            ...prev,
                            brandId: newBrand._id
                        }));
                    }}
                />
            )}

            {/* Base Unit Creation Modal */}
            {showUnitModal && (
                <QuickCreateModal
                    isOpen={showUnitModal}
                    onClose={() => setShowUnitModal(false)}
                    type="Unit"
                    onSuccess={(newUnit) => {
                        // Add new unit to masters list
                        setMasters(prev => ({
                            ...prev,
                            units: [...prev.units, newUnit]
                        }));
                        // Auto-select the newly created unit
                        setFormData(prev => ({
                            ...prev,
                            unitId: newUnit._id
                        }));
                    }}
                />
            )}

            {/* Attribute Creation Modal */}
            {showAttributeModal && (
                <QuickCreateModal
                    isOpen={showAttributeModal}
                    onClose={() => setShowAttributeModal(false)}
                    type="Attribute"
                    onSuccess={(newAttribute) => {
                        // Add new attribute to masters list
                        setMasters(prev => ({
                            ...prev,
                            variantAttributes: [...prev.variantAttributes, newAttribute]
                        }));
                        // Auto-select the newly created attribute
                        setSelectedAttributes(prev => [...prev, { ...newAttribute, values: [] }]);
                        setSelectedValuesPerAttr(prev => ({ ...prev, [newAttribute._id]: {} }));
                    }}
                />
            )}

            {/* Variant Value Creation Modal */}
            {showValueModal && activeAttributeForValue && (
                <QuickCreateModal
                    isOpen={showValueModal}
                    onClose={() => {
                        setShowValueModal(false);
                        setActiveAttributeForValue(null);
                    }}
                    type="Value"
                    masters={{ variantTypeId: activeAttributeForValue._id }}
                    onSuccess={(newValue) => {
                        // 1. Add the new value to the masters variantAttributes list globally
                        setMasters(prev => ({
                            ...prev,
                            variantAttributes: prev.variantAttributes.map(attr =>
                                attr._id === activeAttributeForValue._id
                                    ? { ...attr, values: [...(attr.values || []), newValue] }
                                    : attr
                            )
                        }));

                        // 2. Add the new value to the currently selected attributes list so it immediately appears in the UI
                        setSelectedAttributes(prev => prev.map(attr =>
                            attr._id === activeAttributeForValue._id
                                ? { ...attr, values: [...(attr.values || []), newValue] }
                                : attr
                        ));

                        // 3. Auto-select the newly created value
                        setSelectedValuesPerAttr(prev => ({
                            ...prev,
                            [activeAttributeForValue._id]: {
                                ...(prev[activeAttributeForValue._id] || {}),
                                [newValue._id]: true
                            }
                        }));

                        setActiveAttributeForValue(null);
                    }}
                />
            )}

            {/* Bulk Apply Modal */}
            {showBulkModal && createPortal(
                <div className="quick-modal-overlay" onClick={(e) => { if (e.target.className === 'quick-modal-overlay') setShowBulkModal(false); }}>
                    <div className="quick-modal-container" style={{ maxWidth: '600px' }}>
                        <div className="quick-modal-gradient-bar" />

                        <div className="quick-modal-content">
                            <div className="quick-modal-header" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 className="quick-modal-title">
                                        <Zap size={20} style={{ color: 'hsl(var(--primary))' }} />
                                        Apply to All Variants
                                    </h3>
                                    <p className="quick-modal-subtitle" style={{ marginTop: '0.4rem', lineHeight: 1.4 }}>
                                        Set values to apply globally across the matrix. Empty fields will be ignored.
                                    </p>
                                </div>
                                <button className="quick-modal-close-btn" onClick={() => setShowBulkModal(false)} title="Close Modal">
                                    <X size={20} />
                                </button>
                            </div>

                            <form className="quick-modal-form" style={{ gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="quick-modal-form-group">
                                        <label className="quick-modal-label">Selling Price (₹)</label>
                                        <input type="number" className="quick-modal-input" value={bulkApply.sellingPrice} onChange={e => setBulkApply(p => ({ ...p, sellingPrice: e.target.value }))} placeholder="0.00" />
                                    </div>
                                    <div className="quick-modal-form-group">
                                        <label className="quick-modal-label">MRP (₹)</label>
                                        <input type="number" className="quick-modal-input" value={bulkApply.mrp} onChange={e => setBulkApply(p => ({ ...p, mrp: e.target.value }))} placeholder="0.00" />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <div className="quick-modal-form-group">
                                        <label className="quick-modal-label">Discount (%)</label>
                                        <input type="number" className="quick-modal-input" value={bulkApply.discount} onChange={e => setBulkApply(p => ({ ...p, discount: e.target.value }))} placeholder="0" />
                                    </div>
                                    <div className="quick-modal-form-group">
                                        <label className="quick-modal-label">Cost Price (₹)</label>
                                        <input type="number" className="quick-modal-input" value={bulkApply.costPrice} onChange={e => setBulkApply(p => ({ ...p, costPrice: e.target.value }))} placeholder="0.00" />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <div className="quick-modal-form-group">
                                        <label className="quick-modal-label">Tax Profile</label>
                                        <CustomSelect
                                            placeholder="Leave Unchanged"
                                            value={bulkApply.taxId}
                                            onChange={val => setBulkApply(p => ({ ...p, taxId: val }))}
                                            options={[
                                                { value: '', label: 'Leave Unchanged' },
                                                { value: 'none', label: 'No Tax' },
                                                ...masters.taxes.filter(t => t && t.name).map(t => ({
                                                    value: t._id,
                                                    label: `${t.rate || 0}% (${t.name})`
                                                }))
                                            ]}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="quick-modal-form-group">
                                        <label className="quick-modal-label">Stock Quantity</label>
                                        <input type="number" className="quick-modal-input" value={bulkApply.stock} onChange={e => setBulkApply(p => ({ ...p, stock: e.target.value }))} placeholder="0" />
                                    </div>
                                    <div className="quick-modal-form-group">
                                        <label className="quick-modal-label">Min Stock Alert</label>
                                        <input type="number" className="quick-modal-input" value={bulkApply.minStock} onChange={e => setBulkApply(p => ({ ...p, minStock: e.target.value }))} placeholder="0" />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        className="quick-modal-submit-btn"
                                        style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))', flex: 1 }}
                                        onClick={() => setShowBulkModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="quick-modal-submit-btn"
                                        style={{ flex: 2 }}
                                        onClick={() => {
                                            const updatedBulkApply = {
                                                ...bulkApply,
                                                taxId: bulkApply.taxId === 'none' ? null : bulkApply.taxId,
                                            };
                                            setBulkApply(updatedBulkApply);
                                            // Process sync application
                                            setTimeout(applyBulkToAll, 0);
                                        }}
                                    >
                                        <Zap size={16} />
                                        Apply Options
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AddProduct;
