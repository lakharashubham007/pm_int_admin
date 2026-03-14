import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import cmsService from '../../services/cmsService';
import Loader from '../../components/Loader';

const ContactTab = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        email: '',
        phone: '',
        googleMapUrl: '',
        supportHours: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchContact();
    }, []);

    const fetchContact = async () => {
        setIsLoading(true);
        try {
            const data = await cmsService.getContact();
            if (data) {
                setFormData({
                    companyName: data.companyName || '',
                    address: data.address || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    googleMapUrl: data.googleMapUrl || '',
                    supportHours: data.supportHours || ''
                });
            }
        } catch (error) {
            toast.error('Failed to load Contact information');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.companyName.trim() || !formData.email.trim() || !formData.phone.trim()) {
            toast.error('Company Name, Email, and Phone are required!');
            return;
        }

        setIsSaving(true);
        try {
            await cmsService.updateContact(formData);
            toast.success('Contact information updated successfully');
        } catch (error) {
            toast.error('Failed to update Contact info');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="cms-tab-wrapper fade-in">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '600' }}>Manage Contact Info</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="cms-form-group">
                    <label>Company Name</label>
                    <input
                        type="text"
                        name="companyName"
                        className="cms-input"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="e.g. Acme Corp"
                    />
                </div>

                <div className="cms-form-group">
                    <label>Support Email Address</label>
                    <input
                        type="email"
                        name="email"
                        className="cms-input"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. support@example.com"
                    />
                </div>

                <div className="cms-form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        className="cms-input"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. +1 234 567 890"
                    />
                </div>

                <div className="cms-form-group">
                    <label>Support Hours</label>
                    <input
                        type="text"
                        name="supportHours"
                        className="cms-input"
                        value={formData.supportHours}
                        onChange={handleChange}
                        placeholder="e.g. Mon-Fri, 9AM-5PM"
                    />
                </div>

                <div className="cms-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Physical Address</label>
                    <textarea
                        className="cms-input"
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Full company address..."
                    />
                </div>

                <div className="cms-form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Google Maps Embed URL / Link</label>
                    <input
                        type="url"
                        name="googleMapUrl"
                        className="cms-input"
                        value={formData.googleMapUrl}
                        onChange={handleChange}
                        placeholder="https://maps.google.com/..."
                    />
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

export default ContactTab;
