import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutGrid, Save, Plus, Minus, X, Users, Lock, ChevronRight, Trash2, Edit3 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import roleService from '../services/roleService';
import permissionService from '../services/permissionService';
import sidebarService from '../services/sidebarService';
import Loader from '../components/Loader';
import './AccessControl.css';

const AccessControl = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [sidebarMenus, setSidebarMenus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // View State: 'list' | 'create' | 'edit'
    const [viewState, setViewState] = useState('list');

    // Form State
    const [formData, setFormData] = useState({
        _id: null,
        name: '',
        description: '',
        permissionIds: [],
        sidebarMenuIds: []
    });

    const location = useLocation();
    const navigate = useNavigate();

    // UI State for Expand/Collapse sidebar menus
    const [collapsedParents, setCollapsedParents] = useState([]);

    const toggleParentCollapse = (parentId, e) => {
        e.preventDefault();
        setCollapsedParents(prev =>
            prev.includes(parentId) ? prev.filter(id => id !== parentId) : [...prev, parentId]
        );
    };

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
        fetchSidebarMenus();
    }, []);

    const fetchRoles = async () => {
        try {
            const data = await roleService.getRoles();
            setRoles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch roles failed:', error);
            setRoles([]);
        }
    };

    const fetchPermissions = async () => {
        try {
            const data = await permissionService.getPermissions();
            setPermissions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch permissions failed:', error);
            setPermissions([]);
        }
    };

    const fetchSidebarMenus = async () => {
        try {
            const data = await sidebarService.getAllMenus();
            setSidebarMenus(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Fetch sidebar menus failed:', error);
            setSidebarMenus([]);
        }
    };

    const handleOpenCreate = () => {
        setFormData({ _id: null, name: '', description: '', permissionIds: [], sidebarMenuIds: [] });
        setViewState('create');
    };

    const handleOpenEdit = (role) => {
        setFormData({
            _id: role._id,
            name: role.name,
            description: role.description || '',
            permissionIds: role.permissionIds?.map(p => p._id || p) || [],
            sidebarMenuIds: role.sidebarMenuIds?.map(s => s._id || s) || []
        });
        setViewState('edit');
    };

    const handleCancel = () => {
        setViewState('list');
    };

    const handleTogglePermission = (id) => {
        setFormData(prev => {
            const exists = prev.permissionIds.includes(id);
            return {
                ...prev,
                permissionIds: exists ? prev.permissionIds.filter(p => p !== id) : [...prev.permissionIds, id]
            };
        });
    };

    const handleToggleSidebar = (id) => {
        setFormData(prev => {
            const exists = prev.sidebarMenuIds.includes(id);
            return {
                ...prev,
                sidebarMenuIds: exists ? prev.sidebarMenuIds.filter(s => s !== id) : [...prev.sidebarMenuIds, id]
            };
        });
    };

    const handleSelectAllSidebar = () => {
        if (formData.sidebarMenuIds.length === sidebarMenus.length) {
            setFormData(prev => ({ ...prev, sidebarMenuIds: [] }));
        } else {
            setFormData(prev => ({ ...prev, sidebarMenuIds: sidebarMenus.map(m => m._id) }));
        }
    };

    const handleSelectAllPermissions = (modulePermissions = null) => {
        if (modulePermissions) {
            const allModulePermIds = modulePermissions.map(p => p._id);
            const allSelected = allModulePermIds.every(id => formData.permissionIds.includes(id));
            if (allSelected) {
                setFormData(prev => ({ ...prev, permissionIds: prev.permissionIds.filter(id => !allModulePermIds.includes(id)) }));
            } else {
                setFormData(prev => ({ ...prev, permissionIds: [...new Set([...prev.permissionIds, ...allModulePermIds])] }));
            }
        } else {
            if (formData.permissionIds.length === permissions.length) {
                setFormData(prev => ({ ...prev, permissionIds: [] }));
            } else {
                setFormData(prev => ({ ...prev, permissionIds: permissions.map(p => p._id) }));
            }
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return toast.error('Role name is required');

        setIsLoading(true);
        setLoadingMessage(viewState === 'create' ? 'Creating Role...' : 'Updating Role...');

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                permissionIds: formData.permissionIds,
                sidebarMenuIds: formData.sidebarMenuIds
            };

            if (viewState === 'create') {
                await roleService.createRole(payload);
                toast.success('Role created successfully!');
            } else {
                await roleService.updateRole(formData._id, payload);
                toast.success('Role updated successfully!');
            }

            fetchRoles();
            setViewState('list');
        } catch (error) {
            console.error('Save role failed:', error);
            toast.error(error.message || 'Failed to save role');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Role?',
            text: 'This will permanently remove this role and its associated permissions. Action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Delete Role',
            cancelButtonText: 'Cancel',
            background: '#ffffff',
            color: '#1e3a8a',
            backdrop: 'rgba(0,0,0,0.4) blur(4px)'
        });

        if (result.isConfirmed) {
            setIsLoading(true);
            setLoadingMessage('Deleting Role...');
            try {
                await roleService.deleteRole(id);
                toast.success('Role deleted successfully!');
                fetchRoles();
            } catch (error) {
                console.error('Delete role failed:', error);
                toast.error(error.message || 'Failed to delete role');
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const mod = perm.module || 'Other';
        if (!acc[mod]) acc[mod] = [];
        acc[mod].push(perm);
        return acc;
    }, {});

    // Build hierarchical sidebar menu list
    const getSortedHierarchicalMenus = (menus) => {
        const allModuleIds = new Set(menus.map(m => String(m.module_id)));
        const parents = [];
        const childrenMap = {};

        menus.forEach(menu => {
            const rawParentId = String(menu.parent_module_id || '-1');
            if (rawParentId === '-1' || !allModuleIds.has(rawParentId)) {
                parents.push(menu);
            } else {
                if (!childrenMap[rawParentId]) childrenMap[rawParentId] = [];
                childrenMap[rawParentId].push(menu);
            }
        });

        const sortedList = [];
        parents.forEach(parent => {
            const parentKey = String(parent.module_id);
            const children = childrenMap[parentKey] || [];
            sortedList.push({ ...parent, hasChildren: children.length > 0, parentId: parent._id });
            children.forEach(child => {
                sortedList.push({ ...child, isChildNode: true, parentId: parent._id });
            });
        });

        return sortedList;
    };

    const sortedSidebarMenus = getSortedHierarchicalMenus(sidebarMenus);

    return (
        <div className="access-control-container fade-in">
            <Toaster position="top-right" />
            <div className="content-pane">
                {viewState === 'list' ? (
                    <>
                        {/* Header */}
                        <div className="page-header">
                            <div>
                                <h1>Role Management</h1>
                                <p>Manage school roles and fine-tune access control permissions.</p>
                            </div>
                            <button className="primary-button" onClick={handleOpenCreate}>
                                <Plus size={18} /> Create Role
                            </button>
                        </div>

                        {/* Empty State */}
                        {roles.length === 0 && !isLoading && (
                            <div className="ac-empty-state">
                                <ShieldCheck size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <h3>No Roles Found</h3>
                                <p>Create your first role to start managing access control.</p>
                                <button className="primary-button" onClick={handleOpenCreate} style={{ marginTop: '1rem' }}>
                                    <Plus size={18} /> Create First Role
                                </button>
                            </div>
                        )}

                        {/* Roles Grid */}
                        <div className="roles-grid">
                            {roles.map(role => (
                                <div key={role._id} className="role-card glass-card">
                                    <div>
                                        <div className="role-card-header">
                                            <div className="role-icon-wrapper">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <div className="role-card-title">{role.name}</div>
                                                {role.description && (
                                                    <div className="role-card-desc">{role.description}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="role-card-meta">
                                            <div className="meta-badge">
                                                <Lock size={13} /> {role.permissionIds?.length || 0} Permissions
                                            </div>
                                            <div className="meta-badge">
                                                <LayoutGrid size={13} /> {role.sidebarMenuIds?.length || 0} Menus
                                            </div>
                                            {role.isDefault && (
                                                <div className="meta-badge meta-badge-primary">
                                                    <ShieldCheck size={13} /> Default
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="role-card-actions">
                                        <button className="secondary-button" onClick={() => handleOpenEdit(role)}>
                                            <Edit3 size={16} /> Edit
                                        </button>
                                        {!role.isDefault && (
                                            <button className="danger-button" onClick={() => handleDelete(role._id)}>
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="create-role-view">
                        {/* Form Header */}
                        <div className="page-header">
                            <div>
                                <h1>{viewState === 'create' ? 'Create New Role' : `Edit Role: ${formData.name}`}</h1>
                                <p>Configure precise access levels and sidebar visibility for this role.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button type="button" className="secondary-button" onClick={handleCancel}>
                                    <X size={16} /> Cancel
                                </button>
                                <button type="button" className="primary-button" onClick={handleSave} disabled={isLoading}>
                                    <Save size={18} /> Save Role
                                </button>
                            </div>
                        </div>

                        {/* Role Name Input */}
                        <div className="form-header">
                            <div className="input-group">
                                <label>Role Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    className="premium-input"
                                    placeholder="e.g. Senior Teacher, Academic Head"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="input-group" style={{ maxWidth: '600px' }}>
                                <label>Description</label>
                                <input
                                    type="text"
                                    className="premium-input"
                                    placeholder="Brief description of this role's responsibilities"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Two-column form content */}
                        <div className="form-content">
                            {/* Sidebar Visibility */}
                            <div className="selection-section">
                                <div className="section-title">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <LayoutGrid size={18} /> Sidebar Visibility
                                    </div>
                                    <button type="button" className="text-button" onClick={handleSelectAllSidebar}>
                                        {formData.sidebarMenuIds.length === sidebarMenus.length && sidebarMenus.length > 0 ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="checkbox-list">
                                    {sortedSidebarMenus.map(menu => {
                                        if (menu.isChildNode && collapsedParents.includes(menu.parentId)) return null;
                                        const isSelected = formData.sidebarMenuIds.includes(menu._id);
                                        return (
                                            <div key={menu._id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {!menu.isChildNode && menu.hasChildren ? (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleParentCollapse(menu.parentId, e)}
                                                        className="ac-collapse-btn"
                                                    >
                                                        {collapsedParents.includes(menu.parentId) ? <Plus size={13} /> : <Minus size={13} />}
                                                    </button>
                                                ) : !menu.isChildNode ? (
                                                    <div style={{ width: '22px', flexShrink: 0 }} />
                                                ) : null}
                                                <label
                                                    className={`premium-checkbox-label ${isSelected ? 'selected' : ''}`}
                                                    style={{ ...(menu.isChildNode ? { marginLeft: '28px' } : {}), flex: 1, marginBottom: 0 }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleSidebar(menu._id)}
                                                    />
                                                    <span className="item-name">
                                                        {menu.classChange === 'menu-title'
                                                            ? <strong style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{menu.title}</strong>
                                                            : menu.title
                                                        }
                                                    </span>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Module Permissions */}
                            <div className="selection-section" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                                <div className="section-title">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ShieldCheck size={18} /> Module Permissions
                                    </div>
                                    <button type="button" className="text-button" onClick={() => handleSelectAllPermissions()}>
                                        {formData.permissionIds.length === permissions.length && permissions.length > 0 ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="modules-grid">
                                    {Object.keys(groupedPermissions).map(moduleName => (
                                        <div key={moduleName} className="module-group">
                                            <div className="module-group-header">
                                                <h4><ChevronRight size={15} /> {moduleName}</h4>
                                                <button
                                                    type="button"
                                                    className="text-button"
                                                    onClick={() => handleSelectAllPermissions(groupedPermissions[moduleName])}
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    {groupedPermissions[moduleName].every(p => formData.permissionIds.includes(p._id)) ? 'Deselect' : 'Select All'}
                                                </button>
                                            </div>
                                            <div className="checkbox-list">
                                                {groupedPermissions[moduleName].map(perm => {
                                                    const isSelected = formData.permissionIds.includes(perm._id);
                                                    return (
                                                        <label key={perm._id} className={`premium-checkbox-label ${isSelected ? 'selected' : ''}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleTogglePermission(perm._id)}
                                                            />
                                                            <div>
                                                                <span className="item-name">{perm.name}</span>
                                                                {perm.description && (
                                                                    <span className="item-desc">{perm.description}</span>
                                                                )}
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {isLoading && <Loader message={loadingMessage || 'Processing...'} />}
        </div>
    );
};

export default AccessControl;
