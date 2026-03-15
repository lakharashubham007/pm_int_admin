import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Camera, X, Image as ImageIcon, Eye, EyeOff, Save, ChevronLeft, ChevronRight, Filter, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import galleryService from '../../services/galleryService';
import Loader from '../../components/Loader';
import { getImageUrl } from '../../utils/imageHelper';
import './GallerySection.css';

const categories = ["All", "Events", "Sports", "Activities", "Classrooms"];

const CustomDropdown = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="custom-dropdown-container" ref={dropdownRef}>
            <div 
                className={`custom-dropdown-trigger ${isOpen ? 'open' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{value}</span>
                <ChevronDown size={16} className={`chevron ${isOpen ? 'rotate' : ''}`} />
            </div>
            {isOpen && (
                <div className="custom-dropdown-menu">
                    {options.map((option) => (
                        <div 
                            key={option} 
                            className={`custom-dropdown-item ${value === option ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const GallerySection = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    const [filterCat, setFilterCat] = useState('All');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        category: 'Events',
        description: '',
        isActive: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchGallery();
    }, [pagination.page, filterCat]);

    const fetchGallery = async () => {
        setIsLoading(true);
        try {
            const data = await galleryService.getGalleryItems({
                page: pagination.page,
                category: filterCat,
                isAdmin: true
            });
            setItems(data.items);
            setPagination({ page: data.page, pages: data.pages });
        } catch (error) {
            toast.error('Failed to load gallery items');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await galleryService.toggleStatus(id);
            setItems(items.map(item => item._id === id ? { ...item, isActive: !item.isActive } : item));
            toast.success('Status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await galleryService.deleteGalleryItem(id);
            toast.success('Deleted successfully');
            fetchGallery();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                category: item.category,
                description: item.description || '',
                isActive: item.isActive
            });
            setImagePreview(getImageUrl(item.imageUrl));
        } else {
            setEditingItem(null);
            setFormData({ title: '', category: 'Events', description: '', isActive: true });
            setImagePreview(null);
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('category', formData.category);
            submitData.append('description', formData.description);
            submitData.append('isActive', formData.isActive);
            if (imageFile) submitData.append('image', imageFile);

            if (editingItem) {
                await galleryService.updateGalleryItem(editingItem._id, submitData);
                toast.success('Updated successfully');
            } else {
                await galleryService.createGalleryItem(submitData);
                toast.success('Created successfully');
            }
                setPagination(prev => ({ ...prev, page: 1 }));
                if (pagination.page === 1) {
                    fetchGallery();
                }
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="cms-page-container">
            <div className="cms-content-pane">
                <header className="cms-header">
                    <div>
                        <h1>School Gallery</h1>
                        <p>Manage visual moments and events displayed on the website.</p>
                    </div>
                    <button className="save-details-btn" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        <span>Add New Image</span>
                    </button>
                </header>

                <div className="flex justify-between items-center mb-6">
                    <div className="cms-tabs-container">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                className={`cms-tab-btn ${filterCat === cat ? 'active' : ''}`}
                                onClick={() => { setFilterCat(cat); setPagination({ ...pagination, page: 1 }); }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? <Loader /> : (
                    <>
                        <div className="gallery-grid">
                            {items.length > 0 ? items.map(item => (
                                <div key={item._id} className="gallery-item-card">
                                    <div className="gallery-img-container">
                                        <img src={getImageUrl(item.imageUrl)} alt={item.title} />
                                        <span className={`item-status-badge ${item.isActive ? 'status-active' : 'status-inactive'}`}>
                                            {item.isActive ? 'Visible' : 'Hidden'}
                                        </span>
                                    </div>
                                    <div className="gallery-item-info">
                                        <span className="gallery-item-cat">{item.category}</span>
                                        <h4>{item.title}</h4>
                                        <div className="gallery-item-actions">
                                            <button className="action-btn" onClick={() => handleOpenModal(item)} title="Edit">
                                                <ImageIcon size={16} />
                                            </button>
                                            <button className="action-btn" onClick={() => handleToggleStatus(item._id)} title={item.isActive ? 'Hide' : 'Show'}>
                                                {item.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button className="action-btn danger" onClick={() => handleDelete(item._id)} title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-gallery full-width">
                                    <ImageIcon size={48} className="opacity-20 mb-4 mx-auto" />
                                    <p>No gallery items found in this category.</p>
                                </div>
                            )}
                        </div>

                        {pagination.pages > 1 && (
                            <div className="pagination-container">
                                <button 
                                    className="page-btn" 
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {[...Array(pagination.pages)].map((_, i) => (
                                    <button 
                                        key={i} 
                                        className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                                        onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    className="page-btn" 
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="cms-modal-overlay">
                    <div className="cms-modal-card">
                        <div className="cms-modal-header">
                            <h3>{editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}</h3>
                            <button className="remove-btn-sm" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="gallery-form">
                            <div className="cms-group">
                                <label>Image Title</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Enter event or activity title..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="cms-group">
                                    <label>Category</label>
                                    <CustomDropdown 
                                        options={categories.filter(c => c !== 'All')}
                                        value={formData.category}
                                        onChange={(val) => setFormData({ ...formData, category: val })}
                                    />
                                </div>
                                <div className="cms-group">
                                    <label>Visibility</label>
                                    <CustomDropdown 
                                        options={['Visible', 'Hidden']}
                                        value={formData.isActive ? 'Visible' : 'Hidden'}
                                        onChange={(val) => setFormData({ ...formData, isActive: val === 'Visible' })}
                                    />
                                </div>
                            </div>

                            <div className="cms-group">
                                <label>Photo</label>
                                <div className="image-upload-wrapper">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" />
                                            <label className="upload-overlay-btn">
                                                <Camera size={18} />
                                                <input type="file" className="cms-hidden-input" onChange={handleImageChange} />
                                            </label>
                                        </>
                                    ) : (
                                        <label className="upload-trigger">
                                            <ImageIcon size={40} className="opacity-30" />
                                            <span>Click or drag to upload image</span>
                                            <input type="file" required={!editingItem} className="cms-hidden-input" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={isSaving} className="save-details-btn w-full py-3 mt-4">
                                {isSaving ? 'Processing...' : <><Save size={18} /> {editingItem ? 'Update Item' : 'Add to Gallery'}</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GallerySection;
