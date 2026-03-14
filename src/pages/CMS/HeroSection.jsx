import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getHeroConfig, updateHeroConfig } from '../../services/heroService';
import Loader from '../../components/Loader';
import { getImageUrl } from '../../utils/imageHelper';
import './HeroSection.css';

const HeroSection = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        badgeText: '',
        headingRegular: '',
        headingHighlighted: '',
        headingEnd: '',
        subheading: '',
        applyButtonText: '',
        applyButtonLink: '',
        tourButtonText: '',
        tourVideoUrl: '',
        floatingBadgeTitle: '',
        floatingBadgeSubtitle: '',
        stats: []
    });

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);

    useEffect(() => {
        fetchHeroData();
    }, []);

    const fetchHeroData = async () => {
        try {
            const data = await getHeroConfig();
            setFormData({
                badgeText: data.badgeText || '',
                headingRegular: data.headingRegular || '',
                headingHighlighted: data.headingHighlighted || '',
                headingEnd: data.headingEnd || '',
                subheading: data.subheading || '',
                applyButtonText: data.applyButtonText || '',
                applyButtonLink: data.applyButtonLink || '',
                tourButtonText: data.tourButtonText || '',
                tourVideoUrl: data.tourVideoUrl || '',
                floatingBadgeTitle: data.floatingBadgeTitle || '',
                floatingBadgeSubtitle: data.floatingBadgeSubtitle || '',
                stats: data.stats && data.stats.length > 0 ? data.stats : [
                    { label: '', detail: '', iconName: 'Star' }
                ]
            });
            setExistingImages(data.heroImages || []);
        } catch (error) {
            toast.error('Failed to load Hero settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ─── Stats Handling ───
    const handleStatChange = (index, field, value) => {
        const updatedStats = [...formData.stats];
        updatedStats[index][field] = value;
        setFormData(prev => ({ ...prev, stats: updatedStats }));
    };

    const addStat = () => {
        if (formData.stats.length >= 3) {
            return toast.error("Maximum 3 stats allowed.");
        }
        setFormData(prev => ({
            ...prev,
            stats: [...prev.stats, { label: '', detail: '', iconName: 'Star' }]
        }));
    };

    const removeStat = (index) => {
        const updatedStats = formData.stats.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, stats: updatedStats }));
    };

    // ─── Image Handling ───
    const handleImageDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer?.files || e.target.files);
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        
        if (existingImages.length + newImages.length + imageFiles.length > 10) {
            return toast.error("Maximum 10 images total allowed.");
        }

        const newFilesWithPreviews = imageFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setNewImages(prev => [...prev, ...newFilesWithPreviews]);
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    // ─── Save ───
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const submitData = new FormData();
            
            // Append all text fields
            Object.keys(formData).forEach(key => {
                if (key !== 'stats') {
                    submitData.append(key, formData[key]);
                }
            });

            // Append stats as JSON
            submitData.append('stats', JSON.stringify(formData.stats));

            // Append existing images to keep
            existingImages.forEach(img => {
                submitData.append('existingImages', img);
            });

            // Append new files
            newImages.forEach(imgObj => {
                submitData.append('newImages', imgObj.file);
            });

            const updatedData = await updateHeroConfig(submitData);
            setExistingImages(updatedData.heroImages || []);
            setNewImages([]);
            toast.success('Hero section updated successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to update hero settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loader message="Loading Hero Settings..." />;

    return (
        <div className="cms-page-container fade-in">
            <div className="cms-content-pane">
                <header className="cms-header">
                    <div>
                        <h1>Website Hero Section</h1>
                        <p>Manage the main banner content, headings, stats, and image carousel for the homepage.</p>
                    </div>
                    <button onClick={handleSubmit} disabled={isSaving} className="save-btn hidden-mobile">
                        {isSaving ? <><div className="spin-circle"/> Saving...</> : <><Save size={18} /> Publish Changes</>}
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="cms-form-layout">
                    
                    {/* LEFT COLUMN: Text Content */}
                    <div className="cms-left-col">
                        
                        {/* Section: Headings */}
                        <div className="cms-card">
                            <div className="cms-card-header">
                                <div className="cms-card-bar" />
                                <h3>Main Headings</h3>
                            </div>
                            <div className="cms-grid">
                                <div className="cms-group col-span-2">
                                    <label>Top Badge Text</label>
                                    <input type="text" name="badgeText" value={formData.badgeText} onChange={handleChange} placeholder="e.g. Enrollment Open 2026-27" />
                                </div>
                                <div className="cms-group">
                                    <label>Heading (Line 1)</label>
                                    <input type="text" name="headingRegular" value={formData.headingRegular} onChange={handleChange} placeholder="e.g. The Future of" />
                                </div>
                                <div className="cms-group">
                                    <label>Highlight Text (Line 2)</label>
                                    <input type="text" name="headingHighlighted" value={formData.headingHighlighted} onChange={handleChange} placeholder="e.g. Early Education" />
                                </div>
                                <div className="cms-group col-span-2">
                                    <label>Heading End (Line 3)</label>
                                    <input type="text" name="headingEnd" value={formData.headingEnd} onChange={handleChange} placeholder="e.g. Powered by AI" />
                                </div>
                                <div className="cms-group col-span-2">
                                    <label>Subheading Paragraph</label>
                                    <textarea name="subheading" value={formData.subheading} onChange={handleChange} rows="3" placeholder="Enter the main description..." />
                                </div>
                            </div>
                        </div>

                        {/* Section: Buttons & Action */}
                        <div className="cms-card">
                            <div className="cms-card-header">
                                <div className="cms-card-bar bg-green" />
                                <h3>Call to Action Buttons</h3>
                            </div>
                            <div className="cms-grid">
                                <div className="cms-group">
                                    <label>Primary Button Text</label>
                                    <input type="text" name="applyButtonText" value={formData.applyButtonText} onChange={handleChange} placeholder="e.g. APPLY NOW" />
                                </div>
                                <div className="cms-group">
                                    <label>Primary Button Link</label>
                                    <input type="text" name="applyButtonLink" value={formData.applyButtonLink} onChange={handleChange} placeholder="e.g. /admission" />
                                </div>
                                <div className="cms-group">
                                    <label>Video Button Text</label>
                                    <input type="text" name="tourButtonText" value={formData.tourButtonText} onChange={handleChange} placeholder="e.g. VIEW TOUR" />
                                </div>
                                <div className="cms-group">
                                    <label>YouTube Video ID / URL</label>
                                    <input type="text" name="tourVideoUrl" value={formData.tourVideoUrl} onChange={handleChange} placeholder="e.g. https://www.youtube.com/embed/..." />
                                </div>
                            </div>
                        </div>

                        {/* Section: Feature Stats */}
                        <div className="cms-card">
                            <div className="cms-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div className="cms-card-bar bg-amber" />
                                    <h3 style={{ margin: 0 }}>Feature Stats</h3>
                                </div>
                                {formData.stats.length < 3 && (
                                    <button type="button" onClick={addStat} className="add-stat-btn"><Plus size={14}/> Add Stat</button>
                                )}
                            </div>
                            
                            <div className="stats-list">
                                {formData.stats.map((stat, i) => (
                                    <div key={i} className="stat-row">
                                        <div className="cms-group">
                                            <label>Label</label>
                                            <input type="text" value={stat.label} onChange={(e) => handleStatChange(i, 'label', e.target.value)} placeholder="e.g. 5:1 Student Ratio" />
                                        </div>
                                        <div className="cms-group">
                                            <label>Detail</label>
                                            <input type="text" value={stat.detail} onChange={(e) => handleStatChange(i, 'detail', e.target.value)} placeholder="e.g. Personalized Care" />
                                        </div>
                                        <div className="cms-group icon-group">
                                            <label>Icon</label>
                                            <select value={stat.iconName} onChange={(e) => handleStatChange(i, 'iconName', e.target.value)}>
                                                <option value="Star">Star</option>
                                                <option value="ShieldCheck">Shield</option>
                                                <option value="Sparkles">Sparkles</option>
                                                <option value="BrainCircuit">AI Brain</option>
                                                <option value="Users">Users</option>
                                                <option value="Award">Award</option>
                                            </select>
                                        </div>
                                        <button type="button" className="remove-stat-btn" onClick={() => removeStat(i)} title="Remove stat">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {formData.stats.length === 0 && <p className="empty-text">No stats added. Click "Add Stat" to create one.</p>}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Images & Badge */}
                    <div className="cms-right-col">
                        
                        {/* Section: Floating Badge */}
                        <div className="cms-card">
                            <div className="cms-card-header">
                                <div className="cms-card-bar bg-purple" />
                                <h3>Floating Image Badge</h3>
                            </div>
                            <div className="cms-grid narrow">
                                <div className="cms-group">
                                    <label>Badge Title</label>
                                    <input type="text" name="floatingBadgeTitle" value={formData.floatingBadgeTitle} onChange={handleChange} placeholder="e.g. Top Tier" />
                                </div>
                                <div className="cms-group">
                                    <label>Badge Subtitle</label>
                                    <input type="text" name="floatingBadgeSubtitle" value={formData.floatingBadgeSubtitle} onChange={handleChange} placeholder="e.g. Preschool 2026" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Hero Carousel Images */}
                        <div className="cms-card">
                            <div className="cms-card-header">
                                <div className="cms-card-bar bg-blue" />
                                <div>
                                    <h3>Carousel Images</h3>
                                    <p className="card-subtext">Upload images for the right-side sliding gallery.</p>
                                </div>
                            </div>
                            
                            <div className="image-upload-area" 
                                 onDragOver={(e) => e.preventDefault()} 
                                 onDrop={handleImageDrop}>
                                <div className="upload-prompt">
                                    <Camera size={32} className="text-muted-foreground mb-2" />
                                    <p><strong>Drag & drop images here</strong></p>
                                    <p>or click to browse</p>
                                    <input type="file" multiple accept="image/*" onChange={handleImageDrop} className="hidden-file-input" />
                                </div>
                            </div>

                            {(existingImages.length > 0 || newImages.length > 0) && (
                                <div className="image-gallery-preview">
                                    {existingImages.map((img, i) => (
                                        <div key={`idx-${i}`} className="preview-item">
                                            <img src={getImageUrl(img)} alt="Hero gallery element" />
                                            <button type="button" className="remove-img-btn" onClick={() => removeExistingImage(i)}><X size={14}/></button>
                                        </div>
                                    ))}
                                    {newImages.map((img, i) => (
                                        <div key={`new-${i}`} className="preview-item new">
                                            <div className="new-badge">New</div>
                                            <img src={img.preview} alt="New upload preview" />
                                            <button type="button" className="remove-img-btn" onClick={() => removeNewImage(i)}><X size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mobile Save Button */}
                        <button onClick={handleSubmit} disabled={isSaving} className="save-btn show-mobile w-full mt-4">
                            {isSaving ? <><div className="spin-circle"/> Saving...</> : <><Save size={18} /> Publish Changes</>}
                        </button>
                    </div>

                </form>
            </div>
            {isSaving && <Loader message="Publishing Hero Content to Website..." />}
        </div>
    );
};

export default HeroSection;
