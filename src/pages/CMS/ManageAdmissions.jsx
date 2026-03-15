import React, { useState, useEffect } from 'react';
import { 
    FileText, Trash2, CheckCircle, Clock, X, Eye, 
    Calendar, User, Phone, Mail, MapPin, GraduationCap,
    ChevronLeft, ChevronRight, ChevronDown, Search, Filter, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import { admissionService } from '../../services';
import Loader from '../../components/Loader';
import './ManageAdmissions.css';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText },
    accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: X }
};

const ManageAdmissions = () => {
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
    });
    const [selectedAdmission, setSelectedAdmission] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);

    useEffect(() => {
        fetchAdmissions(1, pagination.limit);
    }, []);

    const fetchAdmissions = async (page, limit = pagination.limit) => {
        setLoading(true);
        try {
            const res = await admissionService.getAdmissions(page, limit);
            if (res.success) {
                setAdmissions(res.data);
                setPagination({
                    currentPage: res.pagination.currentPage,
                    totalPages: res.pagination.totalPages,
                    totalCount: res.pagination.totalCount,
                    limit: res.pagination.limit
                });
            }
        } catch (error) {
            toast.error('Failed to load admission queries');
        } finally {
            setLoading(false);
        }
    };

    const handleLimitChange = (newLimit) => {
        fetchAdmissions(1, newLimit);
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await admissionService.updateStatus(id, status);
            if (res) {
                toast.success(`Status updated to ${status}`);
                fetchAdmissions(pagination.currentPage);
                if (selectedAdmission && selectedAdmission._id === id) {
                    setSelectedAdmission({ ...selectedAdmission, status });
                }
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this admission query?')) return;
        try {
            await admissionService.deleteAdmission(id);
            toast.success('Query removed');
            fetchAdmissions(pagination.currentPage);
            if (viewModalOpen) setViewModalOpen(false);
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleViewDetails = (admission) => {
        setSelectedAdmission(admission);
        setViewModalOpen(true);
    };

    const StatusBadge = ({ status }) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
        const Icon = config.icon;
        return (
            <span className={`status-badge ${config.color}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    return (
        <div className="cms-page-container">
            <div className="cms-content-pane">
                <header className="cms-header">
                    <div>
                        <h1>Admission Inquiries</h1>
                        <p>Manage and track school admission applications from the website.</p>
                    </div>
                </header>

                <div className="admission-controls-strip">
                    <div className="stat-card-mini">
                        <span className="stat-label">Total Results</span>
                        <span className="stat-value">{pagination.totalCount}</span>
                    </div>

                    <div className="custom-limit-selector">
                        <span className="selector-label">Show</span>
                        <div className="stylish-dropdown-container">
                            <button 
                                className={`stylish-dropdown-trigger ${isLimitDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsLimitDropdownOpen(!isLimitDropdownOpen)}
                            >
                                {pagination.limit}
                                <ChevronDown size={14} className={`dropdown-arrow ${isLimitDropdownOpen ? 'rotated' : ''}`} />
                            </button>
                            
                            {isLimitDropdownOpen && (
                                <div className="stylish-dropdown-menu">
                                    {[10, 20, 50, 100].map(val => (
                                        <button 
                                            key={val}
                                            className={`dropdown-option ${pagination.limit === val ? 'selected' : ''}`}
                                            onClick={() => {
                                                handleLimitChange(val);
                                                setIsLimitDropdownOpen(false);
                                            }}
                                        >
                                            {val} rows
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {loading ? <Loader message="Fetching queries..." /> : (
                    <div className="admission-table-wrapper card-glass">
                        <table className="admission-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Applying For</th>
                                    <th>Parent Name</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Submitted On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admissions.length > 0 ? admissions.map((item) => (
                                    <tr key={item._id} className="table-row-hover">
                                        <td className="font-bold">{item.studentName}</td>
                                        <td>
                                            <span className="class-tag">{item.classApplying}</span>
                                        </td>
                                        <td>{item.parentName}</td>
                                        <td>{item.phone}</td>
                                        <td><StatusBadge status={item.status} /></td>
                                        <td className="text-muted text-sm">
                                            {new Date(item.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button onClick={() => handleViewDetails(item)} className="action-btn" title="View">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} className="action-btn danger" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="empty-table-state">
                                            <FileText size={48} className="opacity-10 mb-2" />
                                            <p>No admission queries found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {pagination.totalCount > 0 && (
                            <div className="pagination-controls-wrapper">
                                <div className="pagination-info-text">
                                    Showing {(pagination.currentPage - 1) * pagination.limit + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} enquiries
                                </div>

                                <div className="pagination-controls">
                                    <button 
                                        disabled={pagination.currentPage === 1}
                                        onClick={() => fetchAdmissions(pagination.currentPage - 1)}
                                        className="page-btn"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="page-info">
                                        Page <strong>{pagination.currentPage}</strong> of {pagination.totalPages}
                                    </span>
                                    <button 
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        onClick={() => fetchAdmissions(pagination.currentPage + 1)}
                                        className="page-btn"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {viewModalOpen && selectedAdmission && (
                <div className="adm-modal-overlay">
                    <div className="adm-modal-container">
                        <div className="adm-modal-header">
                            <div className="header-info">
                                <GraduationCap size={24} className="header-icon" />
                                <div>
                                    <h3>Admission Application</h3>
                                    <p>Detailed view of the inquiry</p>
                                </div>
                            </div>
                            <button className="adm-close-btn" onClick={() => setViewModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="adm-modal-content">
                            <div className="detail-section">
                                <h4><User size={16} /> Student Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Full Name</label>
                                        <p>{selectedAdmission.studentName}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Date of Birth</label>
                                        <p>{new Date(selectedAdmission.dateOfBirth).toLocaleDateString()}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Class Applying For</label>
                                        <p className="highlight-text">{selectedAdmission.classApplying}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4><Phone size={16} /> Contact Details</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Parent/Guardian</label>
                                        <p>{selectedAdmission.parentName}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Phone Number</label>
                                        <p>{selectedAdmission.phone}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email Address</label>
                                        <p>{selectedAdmission.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="detail-item mt-4">
                                    <label><MapPin size={14} /> Home Address</label>
                                    <p className="address-p">{selectedAdmission.address}</p>
                                </div>
                            </div>

                            <div className="status-update-section">
                                <h4>Application Status</h4>
                                <div className="status-options">
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleUpdateStatus(selectedAdmission._id, key)}
                                            className={`status-opt-btn ${selectedAdmission.status === key ? 'active ' + key : ''}`}
                                        >
                                            <config.icon size={14} />
                                            {config.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="adm-modal-footer">
                            <button className="adm-delete-btn" onClick={() => handleDelete(selectedAdmission._id)}>
                                <Trash2 size={16} /> Delete Inquiry
                            </button>
                            <button className="adm-done-btn" onClick={() => setViewModalOpen(false)}>
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAdmissions;
