import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, TrendingUp, ShoppingBag, CreditCard, 
    ArrowLeft, Filter, Download, Briefcase,
    ChevronLeft, ChevronRight, Clock, CheckCircle2
} from 'lucide-react';
import vendorAnalyticsService from '../../services/vendorAnalyticsService';
import vendorService from '../../services/vendorService';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import './VendorAnalytics.css';

const VendorAnalytics = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [vendor, setVendor] = useState(null);
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [dateRange, setDateRange] = useState('lifetime'); // lifetime, 7days, 30days, custom
    const [customDates, setCustomDates] = useState({ start: '', end: '' });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Fetch vendor info if not loaded
            if (!vendor) {
                const vRes = await vendorService.getVendorById(id);
                if (vRes.success) setVendor(vRes.data);
            }

            let params = {};
            if (dateRange === '7days') {
                const start = new Date();
                start.setDate(start.getDate() - 7);
                params.startDate = start.toISOString();
            } else if (dateRange === '30days') {
                const start = new Date();
                start.setDate(start.getDate() - 30);
                params.startDate = start.toISOString();
            } else if (dateRange === 'custom' && customDates.start && customDates.end) {
                params.startDate = customDates.start;
                params.endDate = customDates.end;
            }

            const res = await vendorAnalyticsService.getVendorAnalytics(id, params);
            if (res.success) {
                setStats(res.data.stats);
                setOrders(res.data.orders);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [id, dateRange, customDates, vendor]);

    useEffect(() => {
        fetchData();
    }, [id, dateRange]);

    const handleCustomFilter = (e) => {
        e.preventDefault();
        fetchData();
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    if (loading && !stats) return <Loader message="Analyzing vendor performance..." />;

    return (
        <div className="employee-page-container fade-in">
            <div className="employee-content-pane">
                {/* Header Area */}
                <header className="employee-header" style={{ borderBottom: '1px solid hsl(var(--border) / 0.5)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="va-header-left">
                        <button onClick={() => navigate(-1)} className="va-back-btn">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1>{vendor?.businessName || 'Vendor'} Analytics</h1>
                            <p>Merchant Code: <span className="va-code">{vendor?.vendorCode || 'N/A'}</span></p>
                        </div>
                    </div>

                    <div className="va-header-actions">
                        <div className="va-date-filters">
                            {['lifetime', '7days', '30days', 'custom'].map(range => (
                                <button
                                    key={range}
                                    className={`va-filter-btn ${dateRange === range ? 'active' : ''}`}
                                    onClick={() => setDateRange(range)}
                                >
                                    {range === 'lifetime' ? 'Lifetime' : range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'Custom Range'}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {dateRange === 'custom' && (
                    <form onSubmit={handleCustomFilter} className="va-custom-range-card border-glass" style={{ marginBottom: '1.5rem' }}>
                        <div className="va-input-group">
                            <label>Start Date</label>
                            <input 
                                type="date" 
                                value={customDates.start} 
                                onChange={e => setCustomDates(p => ({...p, start: e.target.value}))}
                                className="enterprise-input"
                                style={{ paddingLeft: '1rem' }}
                            />
                        </div>
                        <div className="va-input-group">
                            <label>End Date</label>
                            <input 
                                type="date" 
                                value={customDates.end} 
                                onChange={e => setCustomDates(p => ({...p, end: e.target.value}))}
                                className="enterprise-input"
                                style={{ paddingLeft: '1rem' }}
                            />
                        </div>
                        <button type="submit" className="primary-button" style={{ height: '42px' }}>Apply Filter</button>
                    </form>
                )}

                {/* Stat Cards */}
                <div className="va-stats-grid" style={{ marginBottom: '2rem' }}>
                    <div className="va-stat-card gradient-blue">
                        <div className="va-stat-icon"><ShoppingBag /></div>
                        <div className="va-stat-info">
                            <span>Total Orders</span>
                            <h2>{stats?.totalOrders || 0}</h2>
                            <p>{stats?.completedOrders || 0} Completed Sales</p>
                        </div>
                    </div>
                    <div className="va-stat-card gradient-green">
                        <div className="va-stat-icon"><TrendingUp /></div>
                        <div className="va-stat-info">
                            <span>Gross Revenue</span>
                            <h2>{formatCurrency(stats?.totalSales)}</h2>
                            <p>Total Transaction Value</p>
                        </div>
                    </div>
                    <div className="va-stat-card gradient-purple">
                        <div className="va-stat-icon"><Briefcase /></div>
                        <div className="va-stat-info">
                            <span>Order Commission</span>
                            <h2>{formatCurrency(stats?.totalCommission)}</h2>
                            <p>Total Platform Deduction</p>
                        </div>
                    </div>
                    <div className="va-stat-card gradient-orange">
                        <div className="va-stat-icon"><CreditCard /></div>
                        <div className="va-stat-info">
                            <span>Net Earning</span>
                            <h2>{formatCurrency(stats?.totalNetIncome)}</h2>
                            <p>Total Merchant Payout</p>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="enterprise-table-wrapper">
                    <div className="va-table-header" style={{ padding: '1.25rem 1.5rem', background: 'hsl(var(--muted) / 0.2)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Transactions</h3>
                        <div className="va-table-badges">
                            <span className="badge-count" style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                {orders.length} Records
                            </span>
                        </div>
                    </div>

                    <div className="va-table-scroll">
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '1.5rem' }}>Order ID</th>
                                    <th>Customer</th>
                                    <th>Gross Amount</th>
                                    <th style={{ color: '#ef4444' }}>Order Commission</th>
                                    <th style={{ color: '#10b981' }}>Vendor Payout</th>
                                    <th>Status</th>
                                    <th style={{ paddingRight: '1.5rem' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="va-empty" style={{ textAlign: 'center', padding: '4rem', color: 'hsl(var(--muted-foreground))' }}>
                                            No transactions found for the selected period.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order._id} className="enterprise-row">
                                            <td className="va-order-id" style={{ paddingLeft: '1.5rem', fontWeight: 700, color: 'hsl(var(--primary))', fontFamily: 'monospace' }}>
                                                #{order.orderNumber || order._id.slice(-6)}
                                            </td>
                                            <td>
                                                <div className="va-user-cell" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div className="va-avatar" style={{ width: 32, height: 32, background: 'hsl(var(--secondary))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', border: '1px solid hsl(var(--border))' }}>
                                                        {order.customerId?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <span>{order.customerId?.name || 'Guest'}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 700 }}>{formatCurrency(order.totalAmount)}</td>
                                            <td style={{ color: '#ef4444' }}>-{formatCurrency(order.platformFee)}</td>
                                            <td style={{ color: '#10b981', fontWeight: 700 }}>{formatCurrency(order.vendorPayout)}</td>
                                            <td>
                                                <div style={{
                                                    display: 'inline-block', padding: '0.2rem 0.65rem',
                                                    borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
                                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                                    background: (order.status === 'delivered' ? '#10b981' : order.status === 'cancelled' ? '#ef4444' : '#f59e0b') + '22',
                                                    color: (order.status === 'delivered' ? '#10b981' : order.status === 'cancelled' ? '#ef4444' : '#f59e0b'),
                                                    border: `1px solid ${(order.status === 'delivered' ? '#10b981' : order.status === 'cancelled' ? '#ef4444' : '#f59e0b')}44`,
                                                }}>
                                                    {order.status}
                                                </div>
                                            </td>
                                            <td style={{ paddingRight: '1.5rem' }}>
                                                <div className="va-date" style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                    <small style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.7rem' }}>
                                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </small>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorAnalytics;
