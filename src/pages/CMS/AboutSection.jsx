import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Camera, X, Heart, Eye, Target, Award, Users, ShieldCheck, Globe, Lightbulb, Cpu, ChevronRight, MessageSquare, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAboutConfig, updateAboutConfig } from '../../services/aboutService';
import Loader from '../../components/Loader';
import { getImageUrl } from '../../utils/imageHelper';
import './AboutSection.css';

const AboutSection = () => {
    const [activeTab, setActiveTab] = useState('main'); // 'main', 'vision', 'leadership', 'reasons'
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        headerTitle: '',
        headerSubtitle: '',
        introBadge: '',
        introHeading: '',
        introParagraphs: [''],
        introStats: [],
        visionTitle: '',
        visionDescription: '',
        visionIcon: 'Eye',
        missionTitle: '',
        missionDescription: '',
        missionIcon: 'Target',
        coreValues: [],
        leaders: [],
        whyChooseHeading: '',
        whyChooseSubheading: '',
        reasons: []
    });

    const [introImagePreview, setIntroImagePreview] = useState(null);
    const [introImageFile, setIntroImageFile] = useState(null);
    const [leaderFiles, setLeaderFiles] = useState({}); // { index: File }

    useEffect(() => {
        fetchAboutData();
    }, []);

    const fetchAboutData = async () => {
        try {
            const data = await getAboutConfig();
            setFormData({
                ...data,
                introParagraphs: data.introParagraphs?.length ? data.introParagraphs : [''],
                introStats: data.introStats || [],
                coreValues: data.coreValues || [],
                leaders: data.leaders || [],
                reasons: data.reasons || []
            });
            if (data.introImage) {
                setIntroImagePreview(getImageUrl(data.introImage));
            }
        } catch (error) {
            toast.error('Failed to load About settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ─── Intro Handling ───
    const handleAddParagraph = () => setFormData(p => ({ ...p, introParagraphs: [...p.introParagraphs, ''] }));
    const handleParaChange = (idx, val) => {
        const paras = [...formData.introParagraphs];
        paras[idx] = val;
        setFormData(p => ({ ...p, introParagraphs: paras }));
    };
    const removePara = (idx) => setFormData(p => ({ ...p, introParagraphs: p.introParagraphs.filter((_, i) => i !== idx) }));

    const handleIntroImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIntroImageFile(file);
            setIntroImagePreview(URL.createObjectURL(file));
        }
    };

    // ─── Stats Handling ───
    const addStat = () => setFormData(p => ({ ...p, introStats: [...p.introStats, { label: '', value: '' }] }));
    const updateStat = (idx, field, val) => {
        const stats = [...formData.introStats];
        stats[idx][field] = val;
        setFormData(p => ({ ...p, introStats: stats }));
    };

    // ─── Leadership ───
    const addLeader = () => setFormData(p => ({ 
        ...p, 
        leaders: [...p.leaders, { name: '', role: '', message: '', image: '', reverse: false }] 
    }));
    
    const updateLeader = (idx, field, val) => {
        const leaders = [...formData.leaders];
        leaders[idx][field] = val;
        setFormData(p => ({ ...p, leaders }));
    };

    const handleLeaderImage = (idx, e) => {
        const file = e.target.files[0];
        if (file) {
            setLeaderFiles(prev => ({ ...prev, [idx]: file }));
            const leaders = [...formData.leaders];
            leaders[idx].preview = URL.createObjectURL(file);
            setFormData(p => ({ ...p, leaders }));
        }
    };

    // ─── Reasons ───
    const addReason = () => setFormData(p => ({ 
        ...p, 
        reasons: [...p.reasons, { title: '', description: '', iconName: 'Cpu', color: 'from-blue-50 to-blue-100' }] 
    }));
    const updateReason = (idx, field, val) => {
        const reasons = [...formData.reasons];
        reasons[idx][field] = val;
        setFormData(p => ({ ...p, reasons }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const submitData = new FormData();
            let section = activeTab;
            
            // Map the frontend tab IDs to backend section paths if different
            if (activeTab === 'main') section = 'intro';

            if (section === 'intro') {
                submitData.append('headerTitle', formData.headerTitle);
                submitData.append('headerSubtitle', formData.headerSubtitle);
                submitData.append('introBadge', formData.introBadge);
                submitData.append('introHeading', formData.introHeading);
                submitData.append('introParagraphs', JSON.stringify(formData.introParagraphs));
                submitData.append('introStats', JSON.stringify(formData.introStats));
                if (introImageFile) submitData.append('introImage', introImageFile);
            } 
            else if (section === 'vision') {
                submitData.append('visionTitle', formData.visionTitle);
                submitData.append('visionDescription', formData.visionDescription);
                submitData.append('visionIcon', formData.visionIcon);
                submitData.append('missionTitle', formData.missionTitle);
                submitData.append('missionDescription', formData.missionDescription);
                submitData.append('missionIcon', formData.missionIcon);
            }
            else if (section === 'leadership') {
                const cleanLeaders = formData.leaders.map(({ preview, ...l }) => l);
                submitData.append('leaders', JSON.stringify(cleanLeaders));
                Object.keys(leaderFiles).forEach(idx => {
                    submitData.append(`leaderImage_${idx}`, leaderFiles[idx]);
                });
            }
            else if (section === 'reasons') {
                submitData.append('whyChooseHeading', formData.whyChooseHeading);
                submitData.append('whyChooseSubheading', formData.whyChooseSubheading);
                submitData.append('reasons', JSON.stringify(formData.reasons));
            }

            await updateAboutConfig(submitData, section);
            toast.success(`${tabs.find(t => t.id === activeTab).label} updated successfully!`);
            
            // Clean up state after successful upload
            if (section === 'intro') setIntroImageFile(null);
            if (section === 'leadership') setLeaderFiles({});

            fetchAboutData(); 
        } catch (error) {
            toast.error(error.message || 'Failed to update About content');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loader message="Loading About Settings..." />;

    const tabs = [
        { id: 'main', label: 'Intro & Stats', icon: Info },
        { id: 'vision', label: 'Vision & Mission', icon: Eye },
        { id: 'leadership', label: 'Leadership', icon: Users },
        { id: 'reasons', label: 'Why Choose Us', icon: Heart }
    ];

    return (
        <div className="cms-page-container fade-in">
            <div className="cms-content-pane">
                <header className="cms-header">
                    <div>
                        <h1>Website About Section</h1>
                        <p>Manage the main banner content, headings, stats, and image carousel for the homepage.</p>
                    </div>
                    <div className="cms-header-badge">
                        <Save size={14} /> <span>Dynamic CMS</span>
                    </div>
                </header>

                <div className="cms-tabs-container">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            className={`cms-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="cms-form-layout">
                    
                    {activeTab === 'main' && (
                        <div className="tab-pane animate-in">
                            <div className="cms-left-col">
                                <div className="cms-card">
                                    <div className="cms-card-header"><div className="cms-card-bar" /><h3>Page Header Content</h3></div>
                                    <div className="cms-grid">
                                        <div className="cms-group">
                                            <label>Header Main Title</label>
                                            <input type="text" name="headerTitle" value={formData.headerTitle} onChange={handleChange} placeholder="e.g. ABOUT OUR SCHOOL" />
                                        </div>
                                        <div className="cms-group">
                                            <label>Header Subtitle</label>
                                            <input type="text" name="headerSubtitle" value={formData.headerSubtitle} onChange={handleChange} placeholder="e.g. Nurturing Minds..." />
                                        </div>
                                    </div>
                                </div>

                                <div className="cms-card">
                                    <div className="cms-card-header"><div className="cms-card-bar bg-blue" /><h3>Introduction Story</h3></div>
                                    <div className="cms-grid">
                                        <div className="cms-group">
                                            <label>Top Badge Text</label>
                                            <input type="text" name="introBadge" value={formData.introBadge} onChange={handleChange} placeholder="e.g. Our Story" />
                                        </div>
                                        <div className="cms-group">
                                            <label>Main Intro Heading</label>
                                            <input type="text" name="introHeading" value={formData.introHeading} onChange={handleChange} placeholder="e.g. Pioneering Excellence" />
                                        </div>
                                        <div className="cms-group cms-full-width">
                                            <label>Paragraphs</label>
                                            <div className="paragraph-list">
                                                {formData.introParagraphs.map((p, i) => (
                                                    <div key={i} className="paragraph-row">
                                                        <textarea value={p} onChange={(e) => handleParaChange(i, e.target.value)} rows="3" placeholder="Enter paragraph content..." />
                                                        <button type="button" onClick={() => removePara(i)} className="remove-btn-sm"><Trash2 size={14}/></button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button type="button" onClick={handleAddParagraph} className="add-btn mt-2"><Plus size={14}/> Add Paragraph</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="cms-right-col">
                                <div className="cms-card">
                                    <div className="cms-card-header"><div className="cms-card-bar bg-amber" /><h3>Side Image & Stats</h3></div>
                                    <div className="cms-group mb-4">
                                        <label>Intro Side Image</label>
                                        <div className="image-single-upload">
                                            {introImagePreview ? (
                                                <div className="preview-box compact">
                                                    <img src={introImagePreview} alt="Intro" />
                                                    <div className="preview-actions">
                                                        <label className="action-btn"><Camera size={16} /><input type="file" className="cms-hidden-input" onChange={handleIntroImage} /></label>
                                                        <button type="button" className="action-btn danger" onClick={() => { setFormData(p => ({...p, introImage: null})); setIntroImagePreview(null); }}><X size={16}/></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="upload-placeholder compact">
                                                    <Camera size={24} />
                                                    <span>Upload Intro Image</span>
                                                    <input type="file" className="cms-hidden-input" onChange={handleIntroImage} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="stats-list-compact">
                                        <label className="cms-label-sm">Key Statistics</label>
                                        {formData.introStats.map((stat, i) => (
                                            <div key={i} className="stat-form-row-compact">
                                                <input placeholder="500+" value={stat.value} onChange={(e) => updateStat(i, 'value', e.target.value)} title="Value" />
                                                <input placeholder="Students" value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} title="Label" />
                                                <button type="button" onClick={() => setFormData(p => ({ ...p, introStats: p.introStats.filter((_, idx) => idx !== i) }))} className="remove-btn-stat"><X size={14}/></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addStat} className="add-btn-sm"><Plus size={12}/> Add Stat</button>
                                    </div>
                                </div>
                            </div>
                            <div className="cms-tab-footer">
                                <button type="submit" disabled={isSaving} className="save-details-btn">
                                    {isSaving ? 'Saving...' : 'Save Intro & Stats Details'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vision' && (
                        <div className="tab-pane animate-in">
                            <div className="cms-grid">
                                <div className="cms-card">
                                    <div className="cms-card-header"><div className="cms-card-bar bg-purple" /><h3>Our Vision</h3></div>
                                    <div className="cms-group mb-4">
                                        <label>Vision Title</label>
                                        <input type="text" name="visionTitle" value={formData.visionTitle} onChange={handleChange} />
                                    </div>
                                    <div className="cms-group">
                                        <label>Vision Description</label>
                                        <textarea name="visionDescription" value={formData.visionDescription} onChange={handleChange} rows="4" />
                                    </div>
                                </div>
                                <div className="cms-card">
                                    <div className="cms-card-header"><div className="cms-card-bar bg-blue" /><h3>Our Mission</h3></div>
                                    <div className="cms-group mb-4">
                                        <label>Mission Title</label>
                                        <input type="text" name="missionTitle" value={formData.missionTitle} onChange={handleChange} />
                                    </div>
                                    <div className="cms-group">
                                        <label>Mission Description</label>
                                        <textarea name="missionDescription" value={formData.missionDescription} onChange={handleChange} rows="4" />
                                    </div>
                                </div>
                            </div>
                            <div className="cms-tab-footer">
                                <button type="submit" disabled={isSaving} className="save-details-btn">
                                    {isSaving ? 'Saving...' : 'Save Vision & Mission Details'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'leadership' && (
                        <div className="tab-pane animate-in full-width-pane">
                            <div className="leaders-grid-cms">
                                {formData.leaders.map((leader, i) => (
                                    <div key={i} className="cms-card leader-card-compact">
                                        <div className="cms-card-header-flex">
                                            <div className="cms-card-title-group">
                                                <div className="cms-card-bar bg-blue" />
                                                <h3>Leader #{i+1}</h3>
                                            </div>
                                            <button type="button" onClick={() => setFormData(p => ({ ...p, leaders: p.leaders.filter((_, idx) => idx !== i) }))} className="cms-icon-btn-danger"><Trash2 size={18}/></button>
                                        </div>
                                        <div className="cms-grid-compact">
                                            <div className="cms-group">
                                                <label>Name</label>
                                                <input type="text" value={leader.name} onChange={(e) => updateLeader(i, 'name', e.target.value)} />
                                            </div>
                                            <div className="cms-group">
                                                <label>Role</label>
                                                <input type="text" value={leader.role} onChange={(e) => updateLeader(i, 'role', e.target.value)} />
                                            </div>
                                            <div className="cms-group cms-full-width">
                                                <label>Leader Message</label>
                                                <textarea value={leader.message} onChange={(e) => updateLeader(i, 'message', e.target.value)} rows="3" />
                                            </div>
                                            <div className="cms-group">
                                                <label>Photo</label>
                                                <div className="cms-image-upload-compact">
                                                    <div className="cms-image-preview-xs">
                                                        <img src={leader.preview || getImageUrl(leader.image)} alt="Leader" />
                                                    </div>
                                                    <label className="cms-action-label-sm">
                                                        Change
                                                        <input type="file" className="cms-hidden-input" onChange={(e) => handleLeaderImage(i, e)} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="cms-group">
                                                <label>Side</label>
                                                <select value={leader.reverse ? 'true' : 'false'} onChange={(e) => updateLeader(i, 'reverse', e.target.value === 'true')}>
                                                    <option value="false">Left</option>
                                                    <option value="true">Right</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addLeader} className="add-leader-placeholder">
                                    <Plus size={24}/> Add Leader
                                </button>
                            </div>
                            <div className="cms-tab-footer">
                                <button type="submit" disabled={isSaving} className="save-details-btn">
                                    {isSaving ? 'Saving...' : 'Save Leadership Details'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reasons' && (
                        <div className="tab-pane animate-in full-width-pane">
                            <div className="reasons-header-card cms-card mb-6">
                                <div className="cms-card-header"><div className="cms-card-bar bg-green" /><h3>Section General Content</h3></div>
                                <div className="cms-grid">
                                    <div className="cms-group">
                                        <label>Main Section Heading</label>
                                        <input type="text" name="whyChooseHeading" value={formData.whyChooseHeading} onChange={handleChange} />
                                    </div>
                                    <div className="cms-group">
                                        <label>Subheading Text</label>
                                        <input type="text" name="whyChooseSubheading" value={formData.whyChooseSubheading} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="reasons-grid-compact">
                                {formData.reasons.map((reason, i) => (
                                    <div key={i} className="cms-list-item-compact">
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, reasons: p.reasons.filter((_, idx) => idx !== i) }))} className="cms-item-remove-abs"><Trash2 size={16}/></button>
                                        <div className="cms-group mb-3">
                                            <label>Feature Title</label>
                                            <input type="text" value={reason.title} onChange={(e) => updateReason(i, 'title', e.target.value)} />
                                        </div>
                                        <div className="cms-group mb-3">
                                            <label>Icon</label>
                                            <select value={reason.iconName} onChange={(e) => updateReason(i, 'iconName', e.target.value)}>
                                                <option value="Cpu">AI / Technology</option>
                                                <option value="Globe">Global Perspective</option>
                                                <option value="ShieldCheck">Safe Environment</option>
                                                <option value="Heart">Holistic Values</option>
                                                <option value="Lightbulb">Creative Inquiry</option>
                                                <option value="Users">Community</option>
                                            </select>
                                        </div>
                                        <div className="cms-group">
                                            <label>Description</label>
                                            <textarea value={reason.description} onChange={(e) => updateReason(i, 'description', e.target.value)} rows="2" />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addReason} className="add-reason-placeholder">
                                    <Plus size={24}/> Add Feature
                                </button>
                            </div>
                            <div className="cms-tab-footer">
                                <button type="submit" disabled={isSaving} className="save-details-btn">
                                    {isSaving ? 'Saving...' : 'Save Why Choose Us Details'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
            {isSaving && <Loader message="Publishing About Content..." />}
        </div>
    );
};

export default AboutSection;
