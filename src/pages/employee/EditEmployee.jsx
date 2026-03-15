import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Lock, Shield, ArrowLeft, Save, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { staffService, roleService } from '../../services';
import Loader from '../../components/Loader';
import './Staff.css';

/* ─── Reusable Stylish Role Selector ─── */
const RoleSelector = ({ roles, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = roles.find(r => r._id === value);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="role-selector" ref={ref}>
            <button
                type="button"
                className={`role-selector-trigger ${open ? 'open' : ''} ${!value ? 'placeholder' : ''}`}
                onClick={() => setOpen(o => !o)}
            >
                <div className="role-selector-left">
                    <div className={`role-selector-dot ${value ? 'active' : ''}`} />
                    <span>{selected ? selected.name : 'Select a role for this staff member'}</span>
                </div>
                <ChevronDown size={16} className={`role-selector-chevron ${open ? 'rotated' : ''}`} />
            </button>

            {open && (
                <div className="role-selector-dropdown">
                    <div className="role-selector-header">
                        <Shield size={14} />
                        <span>Available Roles</span>
                    </div>
                    {roles.length === 0 ? (
                        <div className="role-selector-empty">No roles available. Create one first.</div>
                    ) : (
                        roles.map(role => (
                            <button
                                key={role._id}
                                type="button"
                                className={`role-selector-option ${value === role._id ? 'selected' : ''}`}
                                onClick={() => { onChange(role._id); setOpen(false); }}
                            >
                                <div className="role-option-info">
                                    <div className="role-option-icon">
                                        <Shield size={14} />
                                    </div>
                                    <div>
                                        <div className="role-option-name">{role.name}</div>
                                        {role.description && (
                                            <div className="role-option-desc">{role.description}</div>
                                        )}
                                    </div>
                                </div>
                                {value === role._id && <Check size={15} className="role-option-check" />}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── Main Edit Staff Component ─── */
const EditEmployee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [staffData, rolesData] = await Promise.all([
                    staffService.getStaffById(id),
                    roleService.getRoles()
                ]);
                setRoles(Array.isArray(rolesData) ? rolesData : []);
                setFormData({
                    name: staffData.name || '',
                    email: staffData.email || '',
                    password: '',
                    roleId: staffData.roleId?._id || staffData.roleId || ''
                });
            } catch (error) {
                toast.error('Failed to load staff details');
                navigate('/staff/list');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.roleId) {
            toast.error('Please select a role for this staff member');
            return;
        }
        setIsSaving(true);
        try {
            const payload = { name: formData.name, email: formData.email, roleId: formData.roleId };
            if (formData.password) payload.password = formData.password;
            
            await staffService.updateStaff(id, payload);
            toast.success('Staff member updated successfully!');
            navigate('/staff/list');
        } catch (error) {
            toast.error(error.message || 'Failed to update staff member');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="staff-page-container fade-in">
            <div className="staff-content-pane staff-form-view">
                <header className="staff-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <button className="staff-back-btn" onClick={() => navigate('/staff/list')}>
                                <ArrowLeft size={16} />
                            </button>
                            <h1>Edit Staff Member</h1>
                        </div>
                        <p>Update staff details and access role assignment.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="button" className="staff-secondary-btn" onClick={() => navigate('/staff/list')}>
                            Cancel
                        </button>
                        <button type="submit" form="edit-staff-form" className="staff-primary-btn" disabled={isSaving}>
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Update Staff'}
                        </button>
                    </div>
                </header>

                <div className="staff-form-card">
                    <form id="edit-staff-form" onSubmit={handleSubmit}>
                        <div className="staff-form-grid">
                            {/* Full Name */}
                            <div className="staff-form-group">
                                <label className="staff-label">
                                    <User size={14} /> Full Name <span className="req">*</span>
                                </label>
                                <div className="staff-input-wrap">
                                    <User size={16} className="staff-input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full name"
                                        className="staff-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="staff-form-group">
                                <label className="staff-label">
                                    <Mail size={14} /> Email Address <span className="req">*</span>
                                </label>
                                <div className="staff-input-wrap">
                                    <Mail size={16} className="staff-input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email address"
                                        className="staff-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password (optional for edit) */}
                            <div className="staff-form-group">
                                <label className="staff-label">
                                    <Lock size={14} /> New Password <span style={{ opacity: 0.5, fontWeight: 400 }}>(leave blank to keep)</span>
                                </label>
                                <div className="staff-input-wrap">
                                    <Lock size={16} className="staff-input-icon" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="staff-input"
                                    />
                                </div>
                            </div>

                            {/* Role Selector */}
                            <div className="staff-form-group">
                                <label className="staff-label">
                                    <Shield size={14} /> Access Role <span className="req">*</span>
                                </label>
                                <RoleSelector
                                    roles={roles}
                                    value={formData.roleId}
                                    onChange={(id) => setFormData(prev => ({ ...prev, roleId: id }))}
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {(isLoading || isSaving) && <Loader message={isSaving ? 'Updating staff member...' : 'Loading...'} />}
        </div>
    );
};

export default EditEmployee;
