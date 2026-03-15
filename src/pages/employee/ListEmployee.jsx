import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Mail, Shield, User, Search, Plus, ChevronLeft, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { staffService } from '../../services';
import Loader from '../../components/Loader';
import './Staff.css';

const ListEmployee = () => {
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const fetchStaff = useCallback(async (page, limit, search) => {
        setIsLoading(true);
        try {
            const data = await staffService.getStaff({ page, limit, search });
            if (Array.isArray(data)) {
                setStaff(data);
                setPagination(prev => ({ ...prev, total: data.length }));
            } else {
                setStaff(data.data || []);
                setPagination(prev => ({ ...prev, total: data.total || 0, page: data.page || page }));
            }
        } catch (error) {
            console.error('Fetch staff failed:', error);
            toast.error('Failed to load staff list');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaff(pagination.page, pagination.limit, searchInput);
    }, [pagination.page, pagination.limit]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }));
            fetchStaff(1, pagination.limit, searchInput);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Remove Staff Member?',
            text: 'This will permanently delete this staff record. Action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Remove Staff',
            cancelButtonText: 'Cancel',
            background: '#ffffff',
            color: '#1e3a8a',
            backdrop: 'rgba(0,0,0,0.4) blur(4px)',
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                await staffService.deleteStaff(id);
                toast.success('Staff member removed successfully');
                fetchStaff(pagination.page, pagination.limit, searchInput);
            } catch (error) {
                toast.error(error.message || 'Deletion failed');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="staff-page-container fade-in">
            <div className="staff-content-pane">
                <header className="staff-header">
                    <div>
                        <h1>Staff Management</h1>
                        <p>Manage all school staff members, roles, and administrative access.</p>
                    </div>
                    <button className="staff-primary-btn" onClick={() => navigate('/staff/create')}>
                        <Plus size={18} /> Add Staff
                    </button>
                </header>

                {/* Filter Bar */}
                <div className="staff-filter-card">
                    <div className="staff-filter-inner">
                        <div className="staff-search-wrap">
                            <Search size={16} className="staff-search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="staff-search-input"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>

                        <button
                            className="staff-icon-btn"
                            onClick={() => fetchStaff(pagination.page, pagination.limit, searchInput)}
                            title="Refresh"
                        >
                            <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
                        </button>

                        {/* Rows dropdown */}
                        <div style={{ position: 'relative', marginLeft: 'auto' }}>
                            <button className="staff-rows-btn" onClick={() => setIsRowsDropdownOpen(o => !o)}>
                                <span>Rows:</span>
                                <strong>{pagination.limit}</strong>
                                <ChevronDown size={14} style={{ transform: isRowsDropdownOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
                            </button>
                            {isRowsDropdownOpen && (
                                <div className="staff-rows-dropdown">
                                    {[10, 25, 50, 100].map(limit => (
                                        <div
                                            key={limit}
                                            className={`staff-rows-option ${pagination.limit === limit ? 'active' : ''}`}
                                            onClick={() => { setPagination(prev => ({ ...prev, limit, page: 1 })); setIsRowsDropdownOpen(false); }}
                                        >
                                            {limit} rows
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="staff-table-wrapper">
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Name & Identity</th>
                                <th>Email Address</th>
                                <th>Assigned Role</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.length > 0 ? staff.map((member, index) => (
                                <tr key={member._id} className="staff-row">
                                    <td className="staff-sno">
                                        {(pagination.page - 1) * pagination.limit + index + 1}
                                    </td>
                                    <td>
                                        <div className="staff-name-cell">
                                            <div className="staff-avatar">
                                                {getInitials(member.name)}
                                            </div>
                                            <div>
                                                <div className="staff-name">{member.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="staff-email-cell">
                                            <Mail size={13} />
                                            {member.email}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="staff-role-badge">
                                            <Shield size={11} />
                                            {member.roleId?.name || 'Unassigned'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="staff-status-badge active">● Active</span>
                                    </td>
                                    <td>
                                        <div className="staff-actions">
                                            <button
                                                className="staff-btn-edit"
                                                onClick={() => navigate(`/staff/edit/${member._id}`)}
                                                title="Edit"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                className="staff-btn-delete"
                                                onClick={() => handleDelete(member._id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : !isLoading ? (
                                <tr>
                                    <td colSpan="6" className="staff-empty">
                                        <User size={36} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                                        <div>No staff members found.</div>
                                        <button className="staff-primary-btn" style={{ marginTop: '1rem' }} onClick={() => navigate('/staff/create')}>
                                            <Plus size={16} /> Add First Staff
                                        </button>
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className="staff-pagination">
                        <span className="staff-pagination-info">
                            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} staff
                        </span>
                        <div className="staff-pagination-btns">
                            <button
                                className="staff-pg-btn"
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="staff-pg-current">{pagination.page} / {totalPages}</span>
                            <button
                                className="staff-pg-btn"
                                disabled={pagination.page >= totalPages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {isLoading && <Loader />}
        </div>
    );
};

export default ListEmployee;
