import React, { useState, useEffect } from 'react';
import { 
    Plus, Sparkles, Trash2, Edit3, X, Image as ImageIcon, 
    Monitor, Dumbbell, Flower2, Palette, Music, Check, ChevronDown,
    Eye, EyeOff, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import facilityService from '../../services/facilityService';
import Loader from '../../components/Loader';
import './ManageFacilities.css';

const ICON_OPTIONS = [
    { name: 'Monitor', icon: Monitor },
    { name: 'Dumbbell', icon: Dumbbell },
    { name: 'Flower2', icon: Flower2 },
    { name: 'Palette', icon: Palette },
    { name: 'Music', icon: Music },
    { name: 'Sparkles', icon: Sparkles }
];

const COLOR_PRESETS = [
    { name: 'Blue-Indigo', value: 'from-blue-500 to-indigo-600' },
    { name: 'Emerald-Teal', value: 'from-emerald-500 to-teal-600' },
    { name: 'Amber-Orange', value: 'from-amber-500 to-orange-600' },
    { name: 'Rose-Pink', value: 'from-rose-500 to-pink-600' },
    { name: 'Purple-Violet', value: 'from-purple-500 to-violet-600' }
];

const ManageFacilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'Monitor',
        image: '',
        color: COLOR_PRESETS[0].value,
        isActive: true
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        setLoading(true);
        try {
            const res = await facilityService.getFacilities();
            if (res.success) {
                setFacilities(res.data);
            }
        } catch (error) {
            toast.error('Failed to load facilities');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleOpenModal = (facility = null) => {
        if (facility) {
            setFormData({
                name: facility.name,
                description: facility.description,
                icon: facility.icon,
                image: facility.image,
                color: facility.color,
                isActive: facility.isActive ?? true
            });
            setPreviewUrl(facility.image);
            setEditingId(facility._id);
        } else {
            setFormData({
                name: '',
                description: '',
                icon: 'Monitor',
                image: '',
                color: COLOR_PRESETS[0].value,
                isActive: true
            });
            setPreviewUrl('');
            setEditingId(null);
        }
        setSelectedFile(null);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('icon', formData.icon);
            data.append('color', formData.color);
            data.append('isActive', formData.isActive);
            
            if (selectedFile) {
                data.append('image', selectedFile);
            } else if (editingId) {
                // Keep existing image name if not changing
                data.append('image', formData.image);
            } else {
                toast.error('Please select an image');
                setIsSaving(false);
                return;
            }

            if (editingId) {
                await facilityService.updateFacility(editingId, data);
                toast.success('Facility updated');
            } else {
                await facilityService.createFacility(data);
                toast.success('Facility created');
            }
            setModalOpen(false);
            fetchFacilities();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this facility?')) return;
        try {
            await facilityService.deleteFacility(id);
            toast.success('Facility removed');
            fetchFacilities();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleToggleStatus = async (facility) => {
        try {
            const data = new FormData();
            data.append('isActive', !facility.isActive);
            await facilityService.updateFacility(facility._id, data);
            toast.success('Visibility toggled');
            fetchFacilities();
        } catch (error) {
            toast.error('Toggle failed');
        }
    };

    const renderIcon = (iconName, size = 18) => {
        const option = ICON_OPTIONS.find(o => o.name === iconName);
        if (option) {
            const IconComp = option.icon;
            return <IconComp size={size} />;
        }
        return <Sparkles size={size} />;
    };

    // Helper to get image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('blob:')) return imagePath;
        return `${import.meta.env.VITE_IMAGE_API_URL}/uploads/facilities/${imagePath}`;
    };

    return (
        <div className="cms-page-container">
            <div className="cms-content-pane">
                <header className="cms-header">
                    <div>
                        <h1>School Facilities</h1>
                        <p>Manage physical infrastructure and learning environments for the website.</p>
                    </div>
                    <button className="save-details-btn" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        <span>Add New Facility</span>
                    </button>
                </header>

                {loading ? <Loader message="Fetching facilities list..." /> : (
                    <div className="facilities-grid">
                        {facilities.length > 0 ? facilities.map((fac) => (
                            <div key={fac._id} className="facility-cms-card">
                                <div className="fac-image-wrapper">
                                    <img src={getImageUrl(fac.image)} alt={fac.name} className="fac-img" />
                                    <div className={`fac-icon-tag bg-gradient-to-br ${fac.color}`}>
                                        {renderIcon(fac.icon, 20)}
                                    </div>
                                    <div className={`fac-status-badge ${fac.isActive ? 'active' : 'hidden'}`}>
                                        {fac.isActive ? 'Visible' : 'Hidden'}
                                    </div>
                                </div>
                                <div className="fac-content">
                                    <h3 className="fac-name">{fac.name}</h3>
                                    <p className="fac-desc">{fac.description}</p>
                                    <div className="fac-actions">
                                        <button onClick={() => handleOpenModal(fac)} className="action-btn" title="Edit">
                                            <Edit3 size={16} />
                                        </button>
                                        <button onClick={() => handleToggleStatus(fac)} className="action-btn" title={fac.isActive ? 'Hide' : 'Show'}>
                                            {fac.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button onClick={() => handleDelete(fac._id)} className="action-btn danger" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state full-width">
                                <ImageIcon size={48} className="opacity-20 mb-4" />
                                <p>No facilities found. Click "Add New Facility" to get started.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Positioning Parity with Gallery */}
            {modalOpen && (
                <div className="fac-modal-overlay">
                    <div className="fac-modal-container">
                        <div className="fac-modal-header">
                            <div className="header-content">
                                <div className="header-icon">
                                    {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                                </div>
                                <div>
                                    <h3>{editingId ? 'Edit Facility' : 'Add New Facility'}</h3>
                                    <p>Define the details and visuals for this facility</p>
                                </div>
                            </div>
                            <button className="fac-modal-close" onClick={() => setModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="fac-modal-form">
                            <div className="form-sections">
                                <div className="fac-input-group">
                                    <label>Facility Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g., Computer Laboratory"
                                        required
                                    />
                                </div>

                                <div className="fac-input-group">
                                    <label>Description</label>
                                    <textarea 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Brief overview..."
                                        rows="2"
                                        required
                                    />
                                </div>

                                <div className="settings-grid">
                                    <div className="fac-input-group">
                                        <label>Icon Style</label>
                                        <div className="fac-icon-strip">
                                            {ICON_OPTIONS.map((opt) => (
                                                <button 
                                                    key={opt.name}
                                                    type="button"
                                                    className={`fac-strip-btn ${formData.icon === opt.name ? 'active' : ''}`}
                                                    onClick={() => setFormData({...formData, icon: opt.name})}
                                                >
                                                    {<opt.icon size={18} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="fac-input-group">
                                        <label>Theme Gradient</label>
                                        <div className="fac-color-strip">
                                            {COLOR_PRESETS.map((preset) => (
                                                <button 
                                                    key={preset.name}
                                                    type="button"
                                                    className={`fac-color-btn bg-gradient-to-br ${preset.value} ${formData.color === preset.value ? 'active' : ''}`}
                                                    onClick={() => setFormData({...formData, color: preset.value})}
                                                >
                                                    {formData.color === preset.value && <Check size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="fac-input-group">
                                    <label>Feature Image</label>
                                    <div className="fac-image-compact-input">
                                        <div className="fac-preview-circle">
                                            {previewUrl ? <img src={getImageUrl(previewUrl)} alt="Ref" /> : <ImageIcon size={20} />}
                                        </div>
                                        <div className="file-input-wrapper">
                                            <button type="button" className="choose-file-btn" onClick={() => document.getElementById('fac-file-input').click()}>
                                                <ImageIcon size={16} /> {selectedFile ? 'Change Image' : 'Choose from system'}
                                            </button>
                                            <input 
                                                id="fac-file-input"
                                                type="file" 
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                hidden
                                            />
                                            {selectedFile && <span className="file-name">{selectedFile.name}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="fac-modal-footer">
                                <div className="visibility-toggle">
                                    <input 
                                        type="checkbox" 
                                        id="fac-v-toggle"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    />
                                    <label htmlFor="fac-v-toggle">Visible on Website</label>
                                </div>
                                <button type="submit" disabled={isSaving} className="fac-submit-btn">
                                    {isSaving ? 'Processing...' : <><Save size={18} /> {editingId ? 'Save Changes' : 'Create Facility'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageFacilities;
