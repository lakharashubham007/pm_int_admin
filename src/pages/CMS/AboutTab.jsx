import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import cmsService from '../../services/cmsService';
import Loader from '../../components/Loader';

const AboutTab = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mission, setMission] = useState('');
    const [vision, setVision] = useState('');
    const [companyOverview, setCompanyOverview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchAbout();
    }, []);

    const fetchAbout = async () => {
        setIsLoading(true);
        try {
            const data = await cmsService.getAbout();
            if (data) {
                setTitle(data.title || '');
                setDescription(data.description || '');
                setMission(data.mission || '');
                setVision(data.vision || '');
                setCompanyOverview(data.companyOverview || '');
            }
        } catch (error) {
            toast.error('Failed to load About Us');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !description.trim()) {
            toast.error('Title and Description are required!');
            return;
        }

        setIsSaving(true);
        try {
            await cmsService.updateAbout({ title, description, mission, vision, companyOverview });
            toast.success('About Us updated successfully');
        } catch (error) {
            toast.error('Failed to update About Us');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="cms-tab-wrapper fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>Manage About Us</h2>

            <div className="cms-form-group">
                <label>Page Title</label>
                <input
                    type="text"
                    className="cms-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. About Our Company"
                />
            </div>

            <div className="cms-form-group">
                <label>Main Description</label>
                <div className="cms-editor-wrapper">
                    <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        style={{ height: '200px', marginBottom: '40px' }}
                    />
                </div>
            </div>

            <div className="cms-form-group">
                <label>Company Overview</label>
                <textarea
                    className="cms-input"
                    rows={3}
                    value={companyOverview}
                    onChange={e => setCompanyOverview(e.target.value)}
                    placeholder="Brief overview..."
                />
            </div>

            <div className="cms-form-group">
                <label>Mission Statement</label>
                <textarea
                    className="cms-input"
                    rows={3}
                    value={mission}
                    onChange={e => setMission(e.target.value)}
                    placeholder="Our core mission is to..."
                />
            </div>

            <div className="cms-form-group">
                <label>Vision Statement</label>
                <textarea
                    className="cms-input"
                    rows={3}
                    value={vision}
                    onChange={e => setVision(e.target.value)}
                    placeholder="Our vision is to..."
                />
            </div>

            <div className="cms-save-bar">
                <button className="primary-button" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    <span style={{ marginLeft: '0.5rem' }}>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>
        </div>
    );
};

export default AboutTab;
