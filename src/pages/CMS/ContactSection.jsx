import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Save, Plus, Trash2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import contactService from '../../services/contactService';
import Loader from '../../components/Loader';
import './ContactSection.css';

const ContactSection = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        phones: [''],
        emails: [''],
        address: [''],
        workingHours: [''],
        mapEmbedUrl: '',
        socialLinks: []
    });

    useEffect(() => {
        fetchContact();
    }, []);

    const fetchContact = async () => {
        setIsLoading(true);
        try {
            const data = await contactService.getContact();
            if (data && data._id) {
                setFormData({
                    phones: data.phones.length > 0 ? data.phones : [''],
                    emails: data.emails.length > 0 ? data.emails : [''],
                    address: data.address.length > 0 ? data.address : [''],
                    workingHours: data.workingHours.length > 0 ? data.workingHours : [''],
                    mapEmbedUrl: data.mapEmbedUrl || '',
                    socialLinks: data.socialLinks || []
                });
            }
        } catch (error) {
            toast.error('Failed to load contact info');
        } finally {
            setIsLoading(false);
        }
    };

    const handleArrayChange = (field, index, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayItem = (field) => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayItem = (field, index) => {
        if (formData[field].length > 1) {
            const newArray = formData[field].filter((_, i) => i !== index);
            setFormData({ ...formData, [field]: newArray });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Clean up empty strings
            const cleanData = {
                ...formData,
                phones: formData.phones.filter(p => p.trim() !== ''),
                emails: formData.emails.filter(e => e.trim() !== ''),
                address: formData.address.filter(a => a.trim() !== ''),
                workingHours: formData.workingHours.filter(w => w.trim() !== '')
            };
            await contactService.updateContact(cleanData);
            toast.success('Contact information updated');
        } catch (error) {
            toast.error('Failed to update contact information');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="cms-page-container">
            <div className="cms-content-pane">
                <header className="cms-header">
                    <div>
                        <h1>Contact Information</h1>
                        <p>Manage the school's contact details, location, and working hours.</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="contact-cms-form">
                    <div className="contact-cms-grid">
                        {/* Phone Numbers */}
                        <div className="cms-card p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shadow-sm border border-blue-100">
                                    <Phone size={22} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Phone Numbers</h3>
                            </div>
                            <div className="flex-1 space-y-2">
                                {formData.phones.map((phone, idx) => (
                                    <div key={idx} className="cms-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="+1 (234) 567-890"
                                            value={phone}
                                            onChange={(e) => handleArrayChange('phones', idx, e.target.value)}
                                            className="cms-input"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeArrayItem('phones', idx)}
                                            className="remove-btn-sm"
                                            disabled={formData.phones.length === 1}
                                            title="Remove Phone"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => addArrayItem('phones')} className="add-item-btn">
                                <Plus size={18} /> Add New Phone
                            </button>
                        </div>

                        {/* Email Addresses */}
                        <div className="cms-card p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 shadow-sm border border-purple-100">
                                    <Mail size={22} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Email Addresses</h3>
                            </div>
                            <div className="flex-1 space-y-2">
                                {formData.emails.map((email, idx) => (
                                    <div key={idx} className="cms-input-group">
                                        <input 
                                            type="email" 
                                            placeholder="info@pmschool.com"
                                            value={email}
                                            onChange={(e) => handleArrayChange('emails', idx, e.target.value)}
                                            className="cms-input"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeArrayItem('emails', idx)}
                                            className="remove-btn-sm"
                                            disabled={formData.emails.length === 1}
                                            title="Remove Email"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => addArrayItem('emails')} className="add-item-btn">
                                <Plus size={18} /> Add New Email
                            </button>
                        </div>

                        {/* Address */}
                        <div className="cms-card p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 shadow-sm border border-amber-100">
                                    <MapPin size={22} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Physical Address</h3>
                            </div>
                            <div className="flex-1 space-y-2">
                                {formData.address.map((line, idx) => (
                                    <div key={idx} className="cms-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="123 Street Name, Area"
                                            value={line}
                                            onChange={(e) => handleArrayChange('address', idx, e.target.value)}
                                            className="cms-input"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeArrayItem('address', idx)}
                                            className="remove-btn-sm"
                                            disabled={formData.address.length === 1}
                                            title="Remove Address Line"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => addArrayItem('address')} className="add-item-btn">
                                <Plus size={18} /> Add Address Line
                            </button>
                        </div>

                        {/* Working Hours */}
                        <div className="cms-card p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-green-50 rounded-xl text-green-600 shadow-sm border border-green-100">
                                    <Clock size={22} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Working Hours</h3>
                            </div>
                            <div className="flex-1 space-y-2">
                                {formData.workingHours.map((hour, idx) => (
                                    <div key={idx} className="cms-input-group">
                                        <input 
                                            type="text" 
                                            placeholder="Mon - Fri: 8 AM - 4 PM"
                                            value={hour}
                                            onChange={(e) => handleArrayChange('workingHours', idx, e.target.value)}
                                            className="cms-input"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeArrayItem('workingHours', idx)}
                                            className="remove-btn-sm"
                                            disabled={formData.workingHours.length === 1}
                                            title="Remove Working Hour"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => addArrayItem('workingHours')} className="add-item-btn">
                                <Plus size={18} /> Add Time Slot
                            </button>
                        </div>
                    </div>

                    {/* Google Map Link */}
                    <div className="map-section-wrapper mt-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100/50 shadow-sm">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Location & Map Configuration</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Update your physical presence on the website</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="map-instructions">
                                    <div className="map-instructions-title">
                                        <div className="w-1.5 h-4 bg-primary rounded-full" />
                                        Quick Setup Guide
                                    </div>
                                    <div className="space-y-3">
                                        <div className="guide-step">
                                            <span className="guide-number">1</span>
                                            <span>Search school on <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">Google Maps</a></span>
                                        </div>
                                        <div className="guide-step">
                                            <span className="guide-number">2</span>
                                            <span>Click <b>Share</b> → <b>Embed Map</b></span>
                                        </div>
                                        <div className="guide-step">
                                            <span className="guide-number">3</span>
                                            <span>Copy the <b>src</b> URL and paste below</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end px-1">
                                        <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Map Embed URL</label>
                                        {formData.mapEmbedUrl && !formData.mapEmbedUrl.includes('google.com/maps/embed') && (
                                            <span className="text-[10px] font-bold text-red-500 animate-pulse bg-red-50 px-2 py-0.5 rounded border border-red-100 italic">Invalid Embed Link detected</span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="https://www.google.com/maps/embed?..."
                                            value={formData.mapEmbedUrl}
                                            onChange={(e) => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
                                            className={`cms-input pr-12 text-sm py-4 ${formData.mapEmbedUrl && !formData.mapEmbedUrl.includes('google.com/maps/embed') ? 'border-red-300 ring-2 ring-red-50' : ''}`}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                            <Globe size={18} />
                                        </div>
                                    </div>
                                    {formData.mapEmbedUrl && !formData.mapEmbedUrl.includes('google.com/maps/embed') && (
                                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
                                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                                <strong>Note:</strong> You pasted a <u>Share Link</u>. This will not work for preview. Please go to <b>Share → Embed a map</b> and copy the URL from the <code>src</code> attribute.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                {formData.mapEmbedUrl ? (
                                    <div className="map-preview-container h-full min-h-[280px]">
                                        <iframe 
                                            src={formData.mapEmbedUrl} 
                                            width="100%" 
                                            height="100%" 
                                            style={{ border: 0, minHeight: '280px' }} 
                                            allowFullScreen="" 
                                            loading="lazy"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="h-full min-h-[280px] rounded-24 bg-slate-50/50 border-2 border-dashed border-slate-100 flex items-center justify-center">
                                        <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Map Preview will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8 pb-12">
                        <button type="submit" disabled={isSaving} className="save-details-btn px-12 py-4 text-base">
                            {isSaving ? 'Saving Changes...' : <><Save size={20} /> Save Contact Information</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactSection;
