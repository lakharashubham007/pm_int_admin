import React, { useState, useMemo, useEffect } from 'react';
import authStore from '../store/authStore';
import themeStore from '../store/themeStore';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Sparkles, Zap, GraduationCap, BookOpen, User as UserIcon, Building2, ShieldCheck, Sun, Moon } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [themeState, setThemeState] = useState(themeStore.getState());

    useEffect(() => {
        const unsubscribe = themeStore.subscribe(setThemeState);
        return unsubscribe;
    }, []);

    const { theme } = themeState;
    const navigate = useNavigate();

    // Memoize background elements data once to keep animations stable during re-renders
    const rainData = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${2 + Math.random() * 3}s`
    })), []);

    const bubbleData = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${30 + Math.random() * 80}px`,
        delay: `${Math.random() * 10}s`,
        duration: `${15 + Math.random() * 10}s`
    })), []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await authStore.login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            {/* Advanced Background Layer */}
            <div className="ecommerce-visual-layer">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>

                {/* Floating Icons Layer */}
                <div className="floating-marketplace-icons">
                    <div className="float-icon pos-1"><GraduationCap size={40} /></div>
                    <div className="float-icon pos-2"><BookOpen size={32} /></div>
                    <div className="float-icon pos-3"><ShieldCheck size={28} /></div>
                    <div className="float-icon pos-4"><Building2 size={36} /></div>
                    <div className="float-icon pos-5"><Sparkles size={44} /></div>
                    <div className="float-icon pos-6"><UserIcon size={30} /></div>
                </div>

                <div className="water-rain">
                    {rainData.map(drop => (
                        <div
                            key={drop.id}
                            className="rain-drop"
                            style={{
                                left: drop.left,
                                animationDelay: drop.delay,
                                animationDuration: drop.duration
                            }}
                        ></div>
                    ))}
                </div>

                <div className="floating-elements">
                    {bubbleData.map(bubble => (
                        <div
                            key={bubble.id}
                            className="eco-bubble pump-up"
                            style={{
                                left: bubble.left,
                                width: bubble.size,
                                height: bubble.size,
                                animationDelay: bubble.delay,
                                animationDuration: bubble.duration
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            <div className="login-container">
                <div className="login-card glass-premium">
                    <div className="login-header">
                        <div className="ecommerce-brand">
                            <div className="brand-icon-wrapper">
                                <GraduationCap size={32} />
                                <div className="sparkle-overlay"><Sparkles size={16} /></div>
                            </div>
                            <div className="brand-glow"></div>
                        </div>
                        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                            <button
                                type="button"
                                className="icon-button theme-toggle"
                                onClick={() => themeStore.toggleTheme()}
                                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                                style={{
                                    background: 'hsla(var(--primary), 0.1)',
                                    color: 'hsla(var(--primary), 1)',
                                    border: '1px solid hsla(var(--primary), 0.2)',
                                    borderRadius: '12px',
                                    width: '44px',
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                        <h1 className="premium-title">PM International School Admin</h1>
                        <p className="premium-subtitle" style={{ marginBottom: '8px' }}>
                            Manage your school ecosystem
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="premium-error-toast">
                                <Zap size={14} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="login-fields-scrollable">
                            <div className="premium-field-group">
                                <label>Administrator Email *</label>
                                <div className="premium-input-container">
                                    <Mail size={18} className="field-icon" />
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="admin@pminternational.com" required />
                                </div>
                            </div>

                            <div className="premium-field-group">
                                <label>Secure Password *</label>
                                <div className="premium-input-container">
                                    <Lock size={18} className="field-icon" />
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required />
                                </div>
                            </div>
                        </div>

                        <div className="form-extra-actions">
                            <label className="checkbox-container">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                <span className="label-text">Keep me signed in</span>
                            </label>
                            <button type="button" className="forgot-key-btn">Reset Access?</button>
                        </div>

                        <button type="submit" className="ecommerce-login-btn" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Enter Admin Portal</span>
                                    <Zap size={18} fill="currentColor" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer-branding">
                        <p className="copyright">© 2026 PM International School</p>
                        <div className="trust-badges">
                            <div className="badge-item"><Lock size={10} /> Validated</div>
                            <div className="badge-separator"></div>
                            <div className="badge-item">v3.4.0 High-Performance</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
