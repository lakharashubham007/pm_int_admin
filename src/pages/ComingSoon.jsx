import React from 'react';
import { Sparkles, Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = ({ title = "Under Construction" }) => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            margin: '1rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Glows */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, rgba(91, 164, 252, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #5BA4FC, #A855F7)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2rem',
                    boxShadow: '0 20px 40px rgba(91, 164, 252, 0.3)',
                    margin: '0 auto 2rem'
                }}>
                    <Construction size={40} color="#fff" />
                </div>

                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    background: 'linear-gradient(to right, #1e3a8a, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1px'
                }}>
                    {title}
                </h1>

                <p style={{
                    fontSize: '1.2rem',
                    color: '#64748b',
                    maxWidth: '500px',
                    lineHeight: '1.6',
                    marginBottom: '2.5rem'
                }}>
                    We're currently building something amazing for the <strong>Programs</strong> module. 
                    This feature will be available in the next update.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.9rem 1.8rem',
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            color: '#1e3a8a',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>

                    <button
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.9rem 1.8rem',
                            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                            border: 'none',
                            borderRadius: '14px',
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 15px 25px rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(59, 130, 246, 0.2)';
                        }}
                    >
                        Notify Me
                        <Sparkles size={18} />
                    </button>
                </div>
            </div>

            {/* Micro-animations or extra visuals */}
            <div style={{
                marginTop: '4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                opacity: 0.5
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5BA4FC' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A855F7' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5BA4FC' }}></div>
            </div>
        </div>
    );
};

export default ComingSoon;
