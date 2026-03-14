import React from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap } from 'lucide-react';
import './Loader.css';

const Loader = ({ message = 'Processing...' }) => {
    return createPortal(
        <div className="mgibasket-loader-overlay" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)' }}>
            <div className="mgibasket-loader-content" style={{ border: '1px solid hsl(var(--primary) / 0.3)', background: 'rgba(255, 255, 255, 0.95)' }}>
                <div className="basket-icon-container" style={{ background: 'hsl(var(--primary) / 0.1)' }}>
                    <GraduationCap className="basket-icon" size={42} style={{ color: 'hsl(var(--primary))' }} />
                    <div className="basket-pulse"></div>
                </div>
                <div className="loader-text-container">
                    <h2 className="loader-title" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), #f8bbd0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PM International</h2>
                    <p className="loader-message" style={{ color: 'hsl(var(--muted-foreground))' }}>{message}</p>
                </div>
                <div className="loading-bar-container">
                    <div className="loading-bar-progress" style={{ background: 'hsl(var(--primary))' }}></div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Loader;
