import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import settingService from '../../services/settingService';
import '../employee/Employee.css';
import './Settings.css';

const Settings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [settings, setSettings] = useState({
        groceryCommissionPercentage: 5,
        foodCommissionPercentage: 7,
    });

    // If vendor, redirect to profile where their own settings/KYC are
    if (user?.userType === 'vendor') {
        return <Navigate to="/profile" replace />;
    }


    const [descriptions, setDescriptions] = useState({
        groceryCommissionPercentage: 'Universal order commission deducted from Grocery vendor orders.',
        foodCommissionPercentage: 'Universal order commission deducted from Food vendor orders.',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await settingService.getSettings();
            if (response.success && Array.isArray(response.data)) {
                const newSettings = { ...settings };
                const newDescriptions = { ...descriptions };
                
                response.data.forEach(item => {
                    if (newSettings[item.key] !== undefined) {
                        newSettings[item.key] = item.value;
                        if (item.description) {
                            newDescriptions[item.key] = item.description;
                        }
                    }
                });
                
                setSettings(newSettings);
                setDescriptions(newDescriptions);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch platform settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value === '' ? '' : Number(value)
        }));
    };

    const saveSettings = async () => {
        try {
            setSaving(true);
            
            // Validate
            if (settings.groceryCommissionPercentage < 0 || settings.groceryCommissionPercentage > 100) {
                return toast.error("Grocery Commission must be between 0 and 100%");
            }
            if (settings.foodCommissionPercentage < 0 || settings.foodCommissionPercentage > 100) {
                return toast.error("Food Commission must be between 0 and 100%");
            }

            // Save Grocery
            await settingService.updateSetting({
                key: 'groceryCommissionPercentage',
                value: settings.groceryCommissionPercentage,
                description: descriptions.groceryCommissionPercentage
            });

            // Save Food
            await settingService.updateSetting({
                key: 'foodCommissionPercentage',
                value: settings.foodCommissionPercentage,
                description: descriptions.foodCommissionPercentage
            });

            toast.success('Platform settings successfully saved!');
        } catch (error) {
            toast.error(error.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="settings-loading">
                <Loader className="spin-icon" size={32} />
                <p>Loading Global Configurations...</p>
            </div>
        );
    }

    return (
        <div className="employee-page-container fade-in">
            <div className="employee-content-pane">
                <header className="employee-header">
                    <div>
                        <h1>Platform Settings</h1>
                        <p>Manage MgiBasket's universal algorithms and commission variables.</p>
                    </div>
                    <button 
                        className="primary-button" 
                        onClick={saveSettings} 
                        disabled={saving}
                        style={{ height: '42px', padding: '0 1.5rem' }}
                    >
                        {saving ? <Loader className="spin-icon" size={18} /> : <Save size={18} />} 
                        <span style={{ marginLeft: '8px' }}>{saving ? 'Saving...' : 'Save Configuration'}</span>
                    </button>
                </header>

                <div className="settings-grid">
                    <div className="employee-glass-card">
                        <div className="settings-card-header" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>Commission Matrix</h2>
                            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>Automatically extracted from Vendor payouts on order completion.</p>
                        </div>
                        
                        <div className="settings-form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <div className="employee-form-group">
                                <label>Grocery Vendor Commission</label>
                                <div className="employee-input-wrapper" style={{ position: 'relative' }}>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        max="100" 
                                        name="groceryCommissionPercentage" 
                                        value={settings.groceryCommissionPercentage} 
                                        onChange={handleInputChange} 
                                        className="enterprise-input"
                                        style={{ paddingLeft: '1rem', width: '100%' }}
                                    />
                                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>%</span>
                                </div>
                                <p className="setting-description" style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
                                    {descriptions.groceryCommissionPercentage}
                                </p>
                            </div>

                            <div className="employee-form-group">
                                <label>Food Vendor Commission</label>
                                <div className="employee-input-wrapper" style={{ position: 'relative' }}>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        max="100" 
                                        name="foodCommissionPercentage" 
                                        value={settings.foodCommissionPercentage} 
                                        onChange={handleInputChange} 
                                        className="enterprise-input"
                                        style={{ paddingLeft: '1rem', width: '100%' }}
                                    />
                                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>%</span>
                                </div>

                                <p className="setting-description" style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
                                    {descriptions.foodCommissionPercentage}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
