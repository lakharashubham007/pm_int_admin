import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Package, User, MapPin, Phone, Mail,
    CreditCard, ShoppingBag, Truck, CheckCircle2,
    Info, Clock, Zap, Printer, Download, ArrowRight,
    Calendar, Hash
} from 'lucide-react';
import vendorOrderService from '../../../services/vendorOrderService';
import SafeImage from '../../../components/SafeImage';
import './OrderDetailsModal.css';

const OrderDetailsModal = ({ orderId, vendorId, isOpen, onClose }) => {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetails();
        } else {
            setOrder(null);
            setError(null);
        }
    }, [isOpen, orderId, vendorId]);

    const fetchOrderDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log(`[DEBUG_MODAL] Fetching order: ${orderId} with vendorId: ${vendorId}`);
            const data = await vendorOrderService.getOrderById(orderId, vendorId ? { vendorId } : {});
            if (data.success) {
                setOrder(data.order);
                console.log(`[DEBUG_MODAL] Successfully loaded order #`, data.order.orderNumber);
            } else {
                setError(data.message || 'Failed to load order details');
                console.warn(`[DEBUG_MODAL] API returned success:false`, data);
            }
        } catch (error) {
            console.error('[DEBUG_MODAL] Error fetching order details:', error);
            setError('An error occurred while fetching order details');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const StatusBadge = ({ status }) => {
        const config = {
            placed: { bg: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', label: 'New Order' },
            confirmed: { bg: 'blue', color: 'white', label: 'Accepted' },
            preparing: { bg: 'orange', color: 'white', label: 'Preparing' },
            out_for_delivery: { bg: 'purple', color: 'white', label: 'Dispatched' },
            delivered: { bg: 'green', color: 'white', label: 'Delivered' },
            cancelled: { bg: 'red', color: 'white', label: 'Cancelled' }
        };
        const s = config[status] || { bg: 'gray', color: 'white', label: status };
        return (
            <span style={{
                background: s.bg,
                color: s.color,
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.65rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                {s.label}
            </span>
        );
    };

    const modalContent = (
        <div className="order-modal-overlay" onClick={(e) => { if (e.target.className === 'order-modal-overlay') onClose(); }}>
            <div className="order-modal-container">
                <div className="order-modal-gradient-bar" />

                <div className="order-modal-content">
                    {/* Header Section */}
                    <header className="order-modal-header">
                        <div className="order-modal-title-area">
                            <h2 className="order-modal-title">
                                <Zap size={28} style={{ color: 'hsl(var(--primary))' }} />
                                Order Insight
                                <StatusBadge status={order?.status} />
                            </h2>
                            <p className="order-modal-subtitle">Comprehensive tracking for Order #{order?.orderNumber}</p>
                        </div>
                        <button onClick={onClose} className="order-modal-close-btn" title="Close Details">
                            <X size={24} />
                        </button>
                    </header>

                    {isLoading ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem' }}>
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                            <p style={{ fontWeight: '800', color: 'hsl(var(--muted-foreground))' }}>Retrieving live data...</p>
                        </div>
                    ) : error ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem' }}>
                            <X size={48} className="text-red-500" />
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: '800', color: 'hsl(var(--foreground))' }}>Oops! Content Missing</p>
                                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>{error}</p>
                            </div>
                            <button
                                onClick={fetchOrderDetails}
                                style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: 'hsl(var(--primary))', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '900', fontSize: '0.7rem' }}
                            >
                                RETRY FETCH
                            </button>
                        </div>
                    ) : order ? (
                        <div className="order-modal-grid">
                            {/* Items & Billing */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="order-modal-card">
                                    <div className="order-modal-card-header">
                                        <ShoppingBag size={18} />
                                        <h3 className="order-modal-card-title">Purchased Items</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="order-modal-item-row">
                                                <SafeImage
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="order-modal-item-image"
                                                    style={{ width: 60, height: 60, borderRadius: 12 }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '900', fontSize: '0.9rem', color: 'hsl(var(--foreground))' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', fontWeight: '700' }}>
                                                        {item.quantity} Unit{item.quantity > 1 ? 's' : ''} × ₹{item.price}
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: '900', color: 'hsl(var(--primary))' }}>₹{item.subtotal}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="order-modal-card" style={{ background: 'hsl(var(--primary) / 0.03)' }}>
                                    <div className="order-modal-card-header">
                                        <CreditCard size={18} />
                                        <h3 className="order-modal-card-title">Financial Summary</h3>
                                    </div>
                                    <div className="order-modal-summary-item">
                                        <span>Items Subtotal</span>
                                        <span style={{ fontWeight: '700', color: 'hsl(var(--foreground))' }}>₹{order.subtotal}</span>
                                    </div>
                                    <div className="order-modal-summary-item">
                                        <span>Logistics / Delivery</span>
                                        <span style={{ color: 'green', fontWeight: '700' }}>+ ₹{order.deliveryFee || 0}</span>
                                    </div>
                                    <div className="order-modal-summary-item">
                                        <span>Discount Applied</span>
                                        <span style={{ color: 'red', fontWeight: '700' }}>- ₹{order.discount || 0}</span>
                                    </div>
                                    <div className="order-modal-total-box" style={{ marginBottom: order.platformFee ? '0' : '1rem' }}>
                                        <span style={{ fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>Net Total</span>
                                        <span style={{ fontSize: '1.8rem', fontWeight: '1000', color: 'hsl(var(--primary))' }}>₹{order.totalAmount}</span>
                                    </div>
                                    {order.platformFee > 0 && (
                                        <>
                                            <div className="order-modal-summary-item" style={{ borderTop: '1px dashed hsl(var(--border) / 0.5)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                                                <span>Order Commission</span>
                                                <span style={{ color: 'hsl(var(--destructive))', fontWeight: '700' }}>- ₹{order.platformFee.toFixed(2)}</span>
                                            </div>
                                            <div className="order-modal-total-box" style={{ background: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))', marginTop: '0.5rem' }}>
                                                <span style={{ fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>Vendor Payout</span>
                                                <span style={{ fontSize: '1.8rem', fontWeight: '1000' }}>₹{order.vendorPayout.toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Entity Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="order-modal-card">
                                    <div className="order-modal-card-header">
                                        <Info size={18} />
                                        <h3 className="order-modal-card-title">Order Meta</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: '900', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>Date & Time</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{formatDate(order.createdAt)}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: '900', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', marginBottom: 4 }}>Payment Method</div>
                                            <div style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                                {order.paymentMethod === 'cod' ? '💵 Cash on Delivery'
                                                    : order.paymentMethod === 'razorpay' ? '⚡ Razorpay (Online)'
                                                        : order.paymentMethod?.toUpperCase() || 'COD'}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Payment Status & Razorpay ID */}
                                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '900', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>Payment Status:</span>
                                            <span style={{
                                                padding: '2px 10px', borderRadius: 999, fontSize: '0.65rem', fontWeight: '900',
                                                background: order.paymentStatus === 'paid' ? '#f0fdf4' : order.paymentStatus === 'failed' ? '#fef2f2' : '#fef3c7',
                                                color: order.paymentStatus === 'paid' ? '#16a34a' : order.paymentStatus === 'failed' ? '#dc2626' : '#b45309',
                                                border: `1px solid ${order.paymentStatus === 'paid' ? '#bbf7d0' : order.paymentStatus === 'failed' ? '#fecaca' : '#fde68a'}`,
                                                textTransform: 'uppercase'
                                            }}>
                                                {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus === 'failed' ? '✗ Failed' : '⏳ Pending'}
                                            </span>
                                        </div>
                                        {order.razorpayPaymentId && (
                                            <div style={{ padding: '8px 12px', background: 'hsl(var(--primary) / 0.06)', borderRadius: 10, border: '1px solid hsl(var(--primary) / 0.15)' }}>
                                                <div style={{ fontSize: '0.6rem', fontWeight: '900', color: 'hsl(var(--primary))', textTransform: 'uppercase', marginBottom: 2 }}>Razorpay Transaction ID</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '700', fontFamily: 'monospace', wordBreak: 'break-all', color: 'hsl(var(--foreground))' }}>
                                                    {order.razorpayPaymentId}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {order.notes && (
                                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'hsl(var(--primary) / 0.05)', borderRadius: '1rem', border: '1px dashed hsl(var(--primary) / 0.2)' }}>
                                            <div style={{ fontSize: '0.6rem', fontWeight: '900', color: 'hsl(var(--primary))', textTransform: 'uppercase', marginBottom: '2px' }}>Customer Note</div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '600', fontStyle: 'italic' }}>"{order.notes}"</div>
                                        </div>
                                    )}
                                </div>

                                <div className="order-modal-card">
                                    <div className="order-modal-card-header">
                                        <User size={18} />
                                        <h3 className="order-modal-card-title">Customer Profile</h3>
                                    </div>
                                    <div style={{ fontWeight: '900', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{order.customerId?.name}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                            <Phone size={14} /> {order.customerId?.phone}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                            <Mail size={14} /> {order.customerId?.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="order-modal-card">
                                    <div className="order-modal-card-header">
                                        <MapPin size={18} />
                                        <h3 className="order-modal-card-title">Delivery Destination</h3>
                                    </div>
                                    {(order.shippingAddress || order.deliveryAddress) ? (() => {
                                        const addr = order.shippingAddress || order.deliveryAddress;
                                        return (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'hsl(var(--primary))', textTransform: 'uppercase' }}>
                                                    {addr.label || 'Home'}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'hsl(var(--foreground))' }}>
                                                    {addr.addressLine1}
                                                </div>
                                                {addr.addressLine2 && (
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'hsl(var(--foreground))' }}>
                                                        {addr.addressLine2}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'hsl(var(--muted-foreground))' }}>
                                                    {addr.city}, {addr.state} - {addr.pincode}
                                                </div>
                                                {addr.landmark && (
                                                    <div style={{ marginTop: '4px', fontSize: '0.75rem', fontWeight: '700', color: 'orange', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Info size={12} /> Landmark: {addr.landmark}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })() : (
                                        <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'hsl(var(--muted-foreground))' }}>
                                            Shipping address data not found.
                                        </p>
                                    )}
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border) / 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={16} className="text-primary" />
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'hsl(var(--muted-foreground))' }}>
                                            RECORDED: {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Tools */}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button style={{ flex: 1, padding: '1rem', borderRadius: '1.5rem', background: '#000', color: '#fff', border: 'none', fontWeight: '900', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Printer size={16} /> PRINT
                                    </button>
                                    <button style={{ flex: 1, padding: '1rem', borderRadius: '1.5rem', background: 'hsl(var(--primary))', color: '#fff', border: 'none', fontWeight: '900', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Download size={16} /> PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default OrderDetailsModal;
