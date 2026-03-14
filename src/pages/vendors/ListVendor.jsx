import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import vendorService from '../../services/vendorService';
import {
    Search, Plus, Edit, Trash2,
    User, Mail, Phone, Building2, Package,
    ChevronLeft, ChevronRight, ChevronDown, RefreshCw, BarChart2
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../employee/Employee.css';
import Loader from '../../components/Loader';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'approved', label: 'Approved' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'suspended', label: 'Suspended' },
];

const STATUS_COLORS = {
    draft: '#6b7280',
    submitted: '#3b82f6',
    under_review: '#f59e0b',
    approved: '#8b5cf6',
    active: '#10b981',
    rejected: '#ef4444',
    suspended: '#ef4444',
};

const ListVendor = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);

    const fetchVendors = useCallback(async (page, limit, search, status) => {
        try {
            setLoading(true);
            const response = await vendorService.getAllVendors({ page, limit, search, status });
            if (response.success) {
                setVendors(response.data);
                setPagination(prev => ({ ...prev, total: response.total || 0, page }));
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
            toast.error(error.message || 'Failed to load vendors');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVendors(pagination.page, pagination.limit, searchInput, statusFilter);
    }, [pagination.page, pagination.limit]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }));
            fetchVendors(1, pagination.limit, searchInput, statusFilter);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchVendors(1, pagination.limit, searchInput, status);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this vendor? This cannot be undone.')) return;
        try {
            const response = await vendorService.deleteVendor(id);
            if (response.success) {
                toast.success('Vendor deleted');
                fetchVendors(pagination.page, pagination.limit, searchInput, statusFilter);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete vendor');
        }
    };

    const handleStatusToggle = async (vendorId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            const response = await vendorService.updateVendorStatus(vendorId, newStatus);
            if (response.success) {
                setVendors(prev => prev.map(v => v._id === vendorId ? { ...v, status: newStatus } : v));
                toast.success(`Vendor marked as ${newStatus}`);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <div className="employee-page-container fade-in">
            <div className="employee-content-pane">
                <header className="employee-header">
                    <div>
                        <h1>Vendor Intelligence</h1>
                        <p>Manage supplier profiles, business credentials, and payment details.</p>
                    </div>
                    <button
                        className="primary-button"
                        onClick={() => navigate('/vendors/add-vendor')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> New Vendor
                    </button>
                </header>

                {/* ── Filter Bar ────────────────────────────── */}
                <div className="employee-glass-card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Search */}
                        <div className="employee-input-wrapper" style={{ flex: 1, minWidth: 240 }}>
                            <Search size={18} />
                            <input
                                type="text"
                                className="enterprise-input"
                                placeholder="Search by code, name, email, owner..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>

                        {/* Status filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
                            style={{
                                padding: '0.55rem 1rem', borderRadius: 8,
                                border: '1px solid hsl(var(--border))',
                                background: 'hsl(var(--card))', color: 'hsl(var(--foreground))',
                                fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', outline: 'none',
                            }}
                        >
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        {/* Refresh */}
                        <button
                            onClick={() => fetchVendors(pagination.page, pagination.limit, searchInput, statusFilter)}
                            title="Refresh"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '0.55rem 1rem', borderRadius: 8,
                                border: '1px solid hsl(var(--border))',
                                background: 'transparent', color: 'hsl(var(--muted-foreground))',
                                fontSize: '0.875rem', cursor: 'pointer',
                            }}
                        >
                            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        </button>

                        {/* Rows per page dropdown */}
                        <div style={{ position: 'relative', marginLeft: 'auto' }}>
                            <button
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.55rem 1rem', borderRadius: 8,
                                    border: '1px solid hsl(var(--border))',
                                    background: 'hsl(var(--card))', cursor: 'pointer', fontSize: '0.85rem',
                                }}
                                onClick={() => setIsRowsDropdownOpen(o => !o)}
                            >
                                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Rows:</span>
                                <span style={{ fontWeight: 600 }}>{pagination.limit}</span>
                                <ChevronDown size={14} style={{ transform: isRowsDropdownOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
                            </button>
                            {isRowsDropdownOpen && (
                                <div style={{
                                    position: 'absolute', top: '110%', right: 0, zIndex: 50,
                                    background: 'hsl(var(--card))', border: '1px solid hsl(var(--border) / 0.5)',
                                    borderRadius: 8, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                    minWidth: 120, overflow: 'hidden',
                                }}>
                                    {[10, 25, 50, 100].map(limit => (
                                        <div
                                            key={limit}
                                            onClick={() => { setPagination(prev => ({ ...prev, limit, page: 1 })); setIsRowsDropdownOpen(false); }}
                                            style={{
                                                padding: '0.6rem 1rem', cursor: 'pointer',
                                                background: pagination.limit === limit ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                                color: pagination.limit === limit ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                                                fontSize: '0.9rem', fontWeight: pagination.limit === limit ? 600 : 400,
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

                {/* ── Table ─────────────────────────────────── */}
                <div className="enterprise-table-wrapper">
                    {vendors.length === 0 && !loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                            <Building2 size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                            <h3>No Vendors Found</h3>
                            <p>{searchInput || statusFilter ? 'Try adjusting your filters.' : 'Get started by adding your first supplier.'}</p>
                        </div>
                    ) : (
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 52, paddingLeft: '1.5rem' }}>S.No.</th>
                                    <th>Vendor Identity</th>
                                    <th>Business Entity</th>
                                    <th>Contact Data</th>
                                    <th>Account Status</th>
                                    <th>Visibility</th>
                                    <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendors.map((vendor, index) => (
                                    <tr key={vendor._id} className="enterprise-row">
                                        <td style={{ fontWeight: 500, color: 'hsl(var(--muted-foreground))', paddingLeft: '1.5rem' }}>
                                            {(pagination.page - 1) * pagination.limit + index + 1}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {vendor.profileImage ? (
                                                        <img src={`${import.meta.env.VITE_IMAGE_API_URL || 'http://localhost:5000'}/${vendor.profileImage}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <Building2 size={16} color="hsl(var(--muted-foreground))" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'hsl(var(--foreground))', fontSize: '0.95rem' }}>
                                                        {vendor.vendorCode || 'VND-PENDING'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                        <User size={12} /> {vendor.ownerName || 'Unknown'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'hsl(var(--primary))' }}>
                                                {vendor.businessName || 'Unnamed Business'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                                                GST: <span style={{ fontFamily: 'monospace' }}>{vendor.businessDetails?.gstNumber || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Mail size={12} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                                {vendor.email || 'N/A'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                <Phone size={12} style={{ color: 'hsl(var(--muted-foreground))' }} />
                                                {vendor.phone || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{
                                                display: 'inline-block', padding: '0.2rem 0.65rem',
                                                borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
                                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                                background: (STATUS_COLORS[vendor.status] || '#6b7280') + '22',
                                                color: STATUS_COLORS[vendor.status] || '#6b7280',
                                                border: `1px solid ${(STATUS_COLORS[vendor.status] || '#6b7280')}44`,
                                            }}>
                                                {vendor.status || 'draft'}
                                            </div>
                                        </td>
                                        <td>
                                            <label className="vendor-status-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={vendor.status === 'active'}
                                                    onChange={() => handleStatusToggle(vendor._id, vendor.status)}
                                                />
                                                <span className="vendor-status-slider"></span>
                                            </label>
                                        </td>
                                        <td style={{ paddingRight: '1.5rem' }}>
                                            <div className="employee-action-buttons" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => navigate(`/vendors/products/list/${vendor._id}`)}
                                                    className="employee-btn-icon"
                                                    title="See Products"
                                                    style={{ color: 'hsl(var(--primary))' }}
                                                >
                                                    <Package size={14} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/vendors/analytics/${vendor._id}`)}
                                                    className="employee-btn-icon"
                                                    title="Sales & Analytics"
                                                    style={{ color: '#10b981' }}
                                                >
                                                    <BarChart2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/vendors/edit-vendor/${vendor._id}`)}
                                                    className="employee-btn-icon"
                                                    title="Edit Vendor"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(vendor._id)}
                                                    className="employee-btn-icon delete"
                                                    title="Delete Vendor"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Pagination Footer ─────────────────────── */}
                {pagination.total > 0 && (
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '1rem 1.5rem', borderTop: '1px solid hsl(var(--border) / 0.1)',
                    }}>
                        <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>
                            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="secondary-button"
                                style={{ padding: '0.4rem', borderRadius: 6 }}
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                className="secondary-button"
                                style={{ padding: '0.4rem', borderRadius: 6 }}
                                disabled={pagination.page >= totalPages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {loading && <Loader message="Loading Vendors..." />}
        </div>
    );
};

export default ListVendor;
