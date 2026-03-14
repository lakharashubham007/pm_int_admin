import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import cmsService from '../../services/cmsService';
import Loader from '../../components/Loader';

const TermsTab = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchTerms();
    }, []);

    const fetchTerms = async () => {
        setIsLoading(true);
        try {
            const data = await cmsService.getTerms();
            if (data) {
                setTitle(data.title || '');
                setContent(data.content || '');
                setStatus(data.status !== false);
            }
        } catch (error) {
            toast.error('Failed to load Terms & Conditions');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error('Title and Content are required!');
            return;
        }

        setIsSaving(true);
        try {
            await cmsService.updateTerms({ title, content, status });
            toast.success('Terms & Conditions updated successfully');
        } catch (error) {
            toast.error('Failed to update Terms');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="cms-tab-wrapper fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>Manage Terms & Conditions</h2>

            <div className="cms-form-group">
                <label>Page Title</label>
                <input
                    type="text"
                    className="cms-input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Terms & Conditions"
                />
            </div>

            <div className="cms-form-group">
                <label>Content</label>
                <div className="cms-editor-wrapper">
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        style={{ height: '300px', marginBottom: '40px' }}
                    />
                </div>
            </div>

            <div className="cms-form-group">
                <label>Status</label>
                <div className="cms-status-toggle">
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={status}
                            onChange={(e) => setStatus(e.target.checked)}
                        />
                        <span className="slider round"></span>
                    </label>
                    <span style={{ fontSize: '0.9rem', color: status ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>
                        {status ? 'Published/Active' : 'Draft/Inactive'}
                    </span>
                </div>
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

export default TermsTab;
