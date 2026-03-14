import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Plus, ShoppingCart, UtensilsCrossed, Package, Coffee, Apple, Pizza } from 'lucide-react';
import BaseInventoryPortal from './BaseInventoryPortal';

const VendorAddProduct = () => {
    const navigate = useNavigate();
    const [selectedFlow, setSelectedFlow] = useState(null);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 100px)', padding: '2rem', backgroundColor: 'var(--body-bg)' }}>

            {/* Outer White Card Container */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '1740px', height: 'calc(100vh - 140px)', background: 'hsl(var(--card))', borderRadius: '24px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>

                {/* Background Floating Elements restricted to outer card (ONLY visible on main screen) */}
                {selectedFlow === null && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                        <style>
                            {`
                                @keyframes float1 { 0% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } 100% { transform: translateY(0) rotate(0deg); } }
                                @keyframes float2 { 0% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(25px) rotate(-15deg); } 100% { transform: translateY(0) rotate(0deg); } }
                                @keyframes float3 { 0% { transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.1); } 100% { transform: translateY(0) scale(1); } }
                            `}
                        </style>
                        <div style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.05, animation: 'float1 6s infinite ease-in-out' }}><ShoppingCart size={120} /></div>
                        <div style={{ position: 'absolute', top: '65%', left: '15%', opacity: 0.04, animation: 'float2 8s infinite ease-in-out', animationDelay: '1s' }}><Apple size={100} /></div>
                        <div style={{ position: 'absolute', top: '25%', right: '12%', opacity: 0.04, animation: 'float3 7s infinite ease-in-out', animationDelay: '2s' }}><UtensilsCrossed size={140} /></div>
                        <div style={{ position: 'absolute', top: '70%', right: '15%', opacity: 0.05, animation: 'float1 9s infinite ease-in-out', animationDelay: '0.5s' }}><Package size={110} /></div>
                        <div style={{ position: 'absolute', top: '45%', left: '5%', opacity: 0.03, animation: 'float3 10s infinite ease-in-out', animationDelay: '3s' }}><Pizza size={80} /></div>
                        <div style={{ position: 'absolute', top: '40%', right: '5%', opacity: 0.03, animation: 'float2 11s infinite ease-in-out', animationDelay: '1.5s' }}><Coffee size={90} /></div>
                    </div>
                )}

                {/* Inner Selection Card */}
                {selectedFlow === null && (
                    <div style={{ position: 'relative', zIndex: 10, background: 'hsl(var(--card))', borderRadius: '16px', padding: '3rem', width: '100%', maxWidth: '750px', border: '1px solid hsl(var(--border))', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem', color: 'hsl(var(--card-foreground))' }}>Add New Product</h2>
                        <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '3rem', fontSize: '0.95rem' }}>How would you like to add your product to the catalogue?</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>

                            {/* Option 1: Base Inventory */}
                            <div
                                onClick={() => setSelectedFlow('base_inventory')}
                                style={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '2.5rem 1.5rem', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '280px' }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--primary))'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.04)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ background: 'hsla(var(--primary) / 0.1)', padding: '1.25rem', borderRadius: '50%' }}>
                                    <Box size={36} color="hsl(var(--primary))" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'hsl(var(--foreground))', margin: 0 }}>Take from Base Inventory</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', margin: 0, lineHeight: '1.4' }}>Select from pre-approved master products to sell.</p>
                                </div>
                            </div>

                            {/* Option 2: Create New */}
                            <div
                                onClick={() => navigate('/products/add-product')}
                                style={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '2.5rem 1.5rem', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '280px' }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--primary))'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.04)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={{ background: 'hsla(var(--primary) / 0.1)', padding: '1.25rem', borderRadius: '50%' }}>
                                    <Plus size={36} color="hsl(var(--primary))" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'hsl(var(--foreground))', margin: 0 }}>Create New Product</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', margin: 0, lineHeight: '1.4' }}>Build a completely new product from scratch.</p>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* Base Inventory Portal Container */}
                {selectedFlow === 'base_inventory' && (
                    <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', overflowY: 'auto', padding: '2rem' }}>
                        <BaseInventoryPortal onBack={() => setSelectedFlow(null)} />
                    </div>
                )}

                {/* Create New Flow Placeholder */}
                {selectedFlow === 'create_new' && (
                    <div style={{ position: 'relative', zIndex: 10, background: 'hsl(var(--card))', borderRadius: '16px', padding: '3rem', width: '100%', maxWidth: '750px', border: '1px solid hsl(var(--border))', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '1.5rem', color: 'hsl(var(--foreground))' }}>Create New Product Flow (Coming Soon)</h2>
                        <button onClick={() => setSelectedFlow(null)} style={{ padding: '0.6rem 2rem' }} className="primary-button">Back</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorAddProduct;
