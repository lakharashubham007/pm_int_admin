import React, { useState } from 'react';
import TermsTab from './TermsTab';
import PrivacyTab from './PrivacyTab';
import FAQTab from './FAQTab';
import ContactTab from './ContactTab';
import AboutTab from './AboutTab';
import { FileText, Shield, HelpCircle, Phone, Info } from 'lucide-react';
import './CMS.css';

const CMSPage = () => {
    const [activeTab, setActiveTab] = useState('terms');

    const tabs = [
        { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={16} /> },
        { id: 'privacy', label: 'Privacy Policy', icon: <Shield size={16} /> },
        { id: 'faq', label: 'FAQs', icon: <HelpCircle size={16} /> },
        { id: 'contact', label: 'Contact Us', icon: <Phone size={16} /> },
        { id: 'about', label: 'About Us', icon: <Info size={16} /> }
    ];

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'terms': return <TermsTab />;
            case 'privacy': return <PrivacyTab />;
            case 'faq': return <FAQTab />;
            case 'contact': return <ContactTab />;
            case 'about': return <AboutTab />;
            default: return <TermsTab />;
        }
    };

    return (
        <div className="cms-page-container fade-in" style={{ padding: '0' }}>
            <div className="cms-content-pane">
                <header className="internal-page-header" style={{ padding: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Content Management System</h1>
                        <p style={{ margin: 0, color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>
                            Manage your application's static content pages automatically synced with the mobile app.
                        </p>
                    </div>
                </header>

                <div className="cms-tabs-wrapper">
                    <div className="cms-tabs-header">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`cms-tab-button ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="cms-tab-content glass-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
                        {renderActiveTab()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CMSPage;
