import React, { useState, useEffect } from 'react';
import {
    Search, Filter, ChevronLeft, ChevronRight, ChevronDown,
    RefreshCw, ShoppingBag, User, MapPin, Phone, Calendar,
    CheckCircle2, Clock, Truck, XCircle, MoreHorizontal, Eye,
    ShieldCheck, Info, Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import vendorOrderService from '../../../services/vendorOrderService';
import vendorService from '../../../services/vendorService';
import Loader from '../../../components/Loader';
import CustomSelect from '../../../components/CustomSelect';
import PillSlider from '../../../components/PillSlider';
import authStore from '../../../store/authStore';
import OrderDetailsModal from './OrderDetailsModal';
import '../../products/Product.css'; // Reusing product table CSS

const VendorOrders = () => {
    const { user } = authStore.getState();
    const queryParams = new URLSearchParams(window.location.search);
    const urlVendorId = queryParams.get('vendorId');

    const [orders, setOrders] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [diagnosticsData, setDiagnosticsData] = useState(null);

    // Modal State
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        status: 'pending',
        vendorId: urlVendorId || (user?.userType === 'vendor' ? user.id : '')
    });

    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);

    // Fetch vendors for admin dropdown
    useEffect(() => {
        if (user?.userType === 'admin') {
            const fetchVendors = async () => {
                try {
                    const response = await vendorService.getAllVendors();
                    if (response.success) {
                        setVendors(response.data || []);
                    }
                } catch (error) {
                    console.error('Failed to fetch vendors:', error);
                }
            };
            fetchVendors();
        }
    }, [user]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(timer);
    }, [pagination.page, filters, pagination.limit]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            console.log('[DEBUG] Fetching orders with filters:', filters);
            const data = await vendorOrderService.getVendorOrders({
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            });
            console.log('[DEBUG] API Response:', data);

            if (data.success) {
                setOrders(data.orders || []);
                setPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
                setDiagnosticsData(data.diagnostics);
            } else {
                toast.error(data.message || 'Failed to load orders');
            }
        } catch (error) {
            console.error('[DEBUG] Fetch Error:', error);
            toast.error(error.message || 'Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setIsLoading(true);
            await vendorOrderService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
            fetchOrders();
        } catch (error) {
            toast.error(error.message || 'Failed to update status');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'placed': return { label: 'Pending', class: 'bg-amber-500/10 text-amber-600', icon: <Clock size={12} /> };
            case 'confirmed': return { label: 'Confirmed', class: 'bg-blue-500/10 text-blue-600', icon: <CheckCircle2 size={12} /> };
            case 'preparing': return { label: 'Preparing', class: 'bg-indigo-500/10 text-indigo-600', icon: <Clock size={12} /> };
            case 'out_for_delivery': return { label: 'Out for Delivery', class: 'bg-purple-500/10 text-purple-600', icon: <Truck size={12} /> };
            case 'delivered': return { label: 'Delivered', class: 'bg-emerald-500/10 text-emerald-600', icon: <CheckCircle2 size={12} /> };
            case 'cancelled': return { label: 'Cancelled', class: 'bg-red-500/10 text-red-600', icon: <XCircle size={12} /> };
            default: return { label: status, class: 'bg-gray-500/10 text-gray-600', icon: <Clock size={12} /> };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="product-page-container fade-in">
            <div className="product-content-pane">
                <header className="internal-page-header" style={{
                    padding: '0 0 1.5rem 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid hsl(var(--border) / 0.1)',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}>
                    <div style={{ minWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShoppingBag className="text-primary" size={24} />
                            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Order Management</h1>
                        </div>
                        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="badge badge-secondary" style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>
                                {user?.userType === 'admin' ? 'Super Admin' : 'Vendor'} View
                            </span>
                            <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                                Total Context Orders: <strong>{pagination.total}</strong>
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', minWidth: '300px' }}>
                        <PillSlider
                            options={[
                                { value: 'pending', label: 'Pending', icon: <Clock size={16} /> },
                                { value: 'in_progress', label: 'In Progress', icon: <Truck size={16} />, activeColor: '#3b82f6' },
                                { value: 'completed', label: 'Completed', icon: <CheckCircle2 size={16} />, activeColor: '#10b981' },
                                { value: 'cancelled', label: 'Cancelled', icon: <XCircle size={16} />, activeColor: '#ef4444' }
                            ]}
                            value={filters.status}
                            onChange={(val) => {
                                setFilters(prev => ({ ...prev, status: val }));
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            themeColor="hsl(var(--primary))"
                            size="compact"
                        />
                    </div>

                    <div className="header-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', minWidth: '200px' }}>
                        <button
                            className={`secondary-button ${showDiagnostics ? 'active' : ''}`}
                            onClick={() => setShowDiagnostics(!showDiagnostics)}
                            style={{
                                padding: '0.5rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: showDiagnostics ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                color: showDiagnostics ? 'hsl(var(--primary))' : 'inherit'
                            }}
                        >
                            <ShieldCheck size={16} />
                            <span>Debug</span>
                        </button>
                        <button className="secondary-button" onClick={fetchOrders} title="Refresh Data" style={{ padding: '0.5rem 1rem' }}>
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                            <span style={{ marginLeft: '6px' }}>Refresh</span>
                        </button>
                    </div>
                </header>

                {showDiagnostics && (
                    <div className="product-glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem', border: '1px solid hsl(var(--primary) / 0.2)', backgroundColor: 'hsl(var(--primary) / 0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: 'hsl(var(--primary))' }}>
                            <Database size={18} />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Backend Diagnostic Panel</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ padding: '0.75rem', background: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>Active User Context</label>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{user?.name}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>ID: {user?.id}</div>
                            </div>
                            <div style={{ padding: '0.75rem', background: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>Querying Vendor ID</label>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'hsl(var(--primary))' }}>{diagnosticsData?.vendorId || filters.vendorId || 'N/A'}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Mapped via: {user?.userType === 'admin' ? 'Admin Override' : 'Auth Token'}</div>
                            </div>
                            <div style={{ padding: '0.75rem', background: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>Data Availability</label>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{diagnosticsData?.totalForVendor || 0} Orders in DB</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Status Filter: {filters.status}</div>
                            </div>
                        </div>
                        {diagnosticsData?.totalForVendor > 0 && orders.length === 0 && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <Info size={18} className="text-amber-600" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
                                    <strong>Visibility Note:</strong> This vendor has orders in the database, but they don't match your current status filter <strong>"{filters.status}"</strong>. Try switching tabs to find them.
                                </div>
                                {/* Quick Tools */}
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <button style={{ flex: '1 1 120px', padding: '1rem', borderRadius: '1.5rem', background: '#000', color: '#fff', border: 'none', fontWeight: '900', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Printer size={16} /> PRINT
                                    </button>
                                    <button style={{ flex: '1 1 120px', padding: '1rem', borderRadius: '1.5rem', background: 'hsl(var(--primary))', color: '#fff', border: 'none', fontWeight: '900', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Download size={16} /> PDF
                                    </button>
                                </div>
                            </div>
                        )}
                        {!diagnosticsData?.totalForVendor && !isLoading && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                <XCircle size={18} className="text-red-600" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div style={{ fontSize: '0.85rem', color: '#991b1b' }}>
                                    <strong>Data Mismatch:</strong> No orders found for this Vendor ID in the whole database. Check if you have selected the correct vendor.
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="product-glass-card" style={{ marginBottom: '1.5rem' }}>
                    <div className="product-filter-bar" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="product-search-wrapper" style={{ flex: '1 1 300px' }}>
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search by Order number or item..."
                                className="product-search-input"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                            />
                        </div>

                        {user?.userType === 'admin' && (
                            <div style={{ flex: '1 1 200px' }}>
                                <select
                                    className="product-search-input"
                                    style={{ width: '100%', height: '42px', padding: '0 1rem 0 1rem' }}
                                    value={filters.vendorId}
                                    onChange={(e) => setFilters(prev => ({ ...prev, vendorId: e.target.value, page: 1 }))}
                                >
                                    <option value="">-- All Vendors / My Account --</option>
                                    {vendors.map(v => (
                                        <option key={v._id} value={v._id}>
                                            {v.businessName} ({v.ownerName})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <button
                                className="secondary-button"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: 'hsl(var(--card))', height: '42px' }}
                                onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                            >
                                <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Rows:</span>
                                <span style={{ fontWeight: '600' }}>{pagination.limit}</span>
                                <ChevronDown size={14} className={isRowsDropdownOpen ? 'rotate-180' : ''} />
                            </button>

                            {isRowsDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border) / 0.5)',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                    zIndex: 50,
                                    minWidth: '120px',
                                    overflow: 'hidden'
                                }}>
                                    {[10, 25, 50, 100].map(limit => (
                                        <div
                                            key={limit}
                                            style={{
                                                padding: '0.6rem 1rem',
                                                cursor: 'pointer',
                                                background: pagination.limit === limit ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                                color: pagination.limit === limit ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                                                fontSize: '0.9rem',
                                                fontWeight: pagination.limit === limit ? '600' : '400',
                                            }}
                                            onClick={() => {
                                                setPagination(prev => ({ ...prev, limit, page: 1 }));
                                                setIsRowsDropdownOpen(false);
                                            }}
                                        >
                                            {limit} rows
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="orders-desktop-view">
                    <div className="product-table-wrapper">
                        <table className="product-table w-full text-left">
                            <thead>
                                <tr style={{ background: 'hsl(var(--muted) / 0.3)' }}>
                                    <th style={{ width: '60px', paddingLeft: '1.5rem' }}>S.No.</th>
                                    <th>Order Details</th>
                                    <th>Customer</th>
                                    <th>Billing</th>
                                    <th className="hide-on-tablet">Status</th>
                                    <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? orders.map((order, index) => {
                                    const statusInfo = getStatusBadge(order.status);
                                    return (
                                        <tr key={order._id} className="category-row cursor-default">
                                            <td style={{ fontWeight: '500', color: 'hsl(var(--muted-foreground))', paddingLeft: '1.5rem' }}>
                                                {(pagination.page - 1) * pagination.limit + index + 1}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    <span style={{ fontWeight: '900', fontSize: '0.95rem', color: 'hsl(var(--primary))' }}>{order.orderNumber}</span>
                                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Calendar size={12} />
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        {order.customerId?.name || 'Guest Customer'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        {order.customerId?.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>{order.items?.length || 0} Items</span>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'hsl(var(--foreground))' }}>₹{order.totalAmount}</span>
                                                    {order.platformFee > 0 && (
                                                        <div style={{ fontSize: '0.7rem', color: 'hsl(var(--destructive))', marginTop: '2px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid hsl(var(--border)/0.2)', paddingTop: '2px' }}>
                                                            <span>Fee:</span> <span>-₹{order.platformFee.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    {order.vendorPayout > 0 && (
                                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--success))', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>Payout:</span> <span>₹{order.vendorPayout.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="hide-on-tablet">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black flex items-center gap-1.5 w-fit ${statusInfo.class}`}>
                                                    {statusInfo.icon}
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td style={{ paddingRight: '1.5rem' }}>
                                                <div className="category-actions" style={{ justifyContent: 'flex-end' }}>
                                                    {order.status === 'placed' && (
                                                        <button
                                                            className="primary-button"
                                                            onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: '800' }}
                                                        >
                                                            Accept
                                                        </button>
                                                    )}
                                                    {order.status === 'confirmed' && (
                                                        <button
                                                            className="primary-button"
                                                            onClick={() => handleStatusUpdate(order._id, 'preparing')}
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#8b5cf6', color: 'white' }}
                                                        >
                                                            Start Prep
                                                        </button>
                                                    )}
                                                    {order.status === 'preparing' && (
                                                        <button
                                                            className="primary-button"
                                                            onClick={() => handleStatusUpdate(order._id, 'out_for_delivery')}
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#3b82f6', color: 'white' }}
                                                        >
                                                            Dispatch
                                                        </button>
                                                    )}
                                                    {order.status === 'out_for_delivery' && (
                                                        <button
                                                            className="primary-button"
                                                            onClick={() => handleStatusUpdate(order._id, 'delivered')}
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#10b981', color: 'white' }}
                                                        >
                                                            Delivered
                                                        </button>
                                                    )}
                                                    <button
                                                        className="action-btn"
                                                        title="View Details"
                                                        style={{ width: '32px', height: '32px' }}
                                                        onClick={() => {
                                                            setSelectedOrderId(order._id);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-32">
                                            <div className="flex flex-col items-center gap-6 opacity-30">
                                                <div style={{ position: 'relative' }}>
                                                    <ShoppingBag size={100} strokeWidth={1} />
                                                    <XCircle size={32} className="text-red-500" style={{ position: 'absolute', bottom: 10, right: 10, background: 'white', borderRadius: '50%' }} />
                                                </div>
                                                <div className="text-center">
                                                    <h3 className="text-2xl font-black text-gray-800">NO ORDERS FOUND</h3>
                                                    <p className="max-w-[300px] text-sm text-gray-500 mt-2">
                                                        {filters.search ? `No results match "${filters.search}"` : 'There are no orders matching your current filters or account.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="orders-mobile-view" style={{ display: 'none' }}>
                    {orders.length > 0 ? orders.map((order, index) => {
                        const statusInfo = getStatusBadge(order.status);
                        return (
                            <div key={order._id} className="product-glass-card" style={{ marginBottom: '1rem', padding: '1.25rem' }} onClick={() => { setSelectedOrderId(order._id); setIsModalOpen(true); }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'hsl(var(--primary))' }}>{order.orderNumber}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>{formatDate(order.createdAt)}</div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black flex items-center gap-1.5 ${statusInfo.class}`}>
                                        {statusInfo.icon}
                                        {statusInfo.label}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontWeight: 800 }}>Customer</div>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{order.customerId?.name || 'Guest'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', fontWeight: 800 }}>{order.items?.length || 0} Items</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>₹{order.totalAmount}</div>
                                        {order.platformFee > 0 && (
                                            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--destructive))', marginTop: '2px' }}>
                                                Fee: -₹{order.platformFee.toFixed(2)}
                                            </div>
                                        )}
                                        {order.vendorPayout > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--success))', fontWeight: 'bold' }}>
                                                Payout: ₹{order.vendorPayout.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border) / 0.1)', display: 'flex', gap: '0.5rem' }}>
                                    {order.status === 'placed' && <button className="primary-button flex-1" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'confirmed'); }}>Accept</button>}
                                    {order.status === 'confirmed' && <button className="primary-button flex-1" style={{ background: '#8b5cf6' }} onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'preparing'); }}>Start Prep</button>}
                                    {order.status === 'preparing' && <button className="primary-button flex-1" style={{ background: '#3b82f6' }} onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'out_for_delivery'); }}>Dispatch</button>}
                                    {order.status === 'out_for_delivery' && <button className="primary-button flex-1" style={{ background: '#10b981' }} onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, 'delivered'); }}>Delivered</button>}
                                    <button className="secondary-button" style={{ padding: '0.5rem' }} onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order._id); setIsModalOpen(true); }}><Eye size={18} /></button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-20 opacity-30">
                            <ShoppingBag size={60} style={{ margin: '0 auto mb-4' }} />
                            <h3 className="font-black">NO ORDERS</h3>
                        </div>
                    )}
                </div>

                {pagination.total > 0 && (
                    <div className="pagination-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderTop: '1px solid hsl(var(--border) / 0.1)', background: 'hsl(var(--muted)/0.1)', marginTop: '1.5rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                            <span>Showing <strong>{(pagination.page - 1) * pagination.limit + 1}</strong> to <strong>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of <strong>{pagination.total}</strong> entries</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="secondary-button"
                                style={{ padding: '0.4rem', borderRadius: '6px' }}
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 8px', fontSize: '0.9rem' }}>
                                Page <span style={{ fontWeight: '800' }}>{pagination.page}</span> of {Math.ceil(pagination.total / pagination.limit)}
                            </div>
                            <button
                                className="secondary-button"
                                style={{ padding: '0.4rem', borderRadius: '6px' }}
                                disabled={pagination.page * pagination.limit >= pagination.total}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isLoading && <Loader />}

            <OrderDetailsModal
                orderId={selectedOrderId}
                vendorId={filters.vendorId}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedOrderId(null);
                }}
            />
        </div>
    );
};

export default VendorOrders;
