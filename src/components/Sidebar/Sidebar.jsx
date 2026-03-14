import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ChevronRight, ChevronDown, ShieldCheck,
    LayoutDashboard, LayoutGrid, Users, UserCog, Settings,
    ShoppingCart, Tags, FileText, Package, Percent,
    Layers, Briefcase, Bell, BarChart2, Star, Truck,
    AlertCircle, FileStack, Home, Grid, Scale, Network, Bookmark, X,
    BookOpen, UserPlus, Image, Building
} from 'lucide-react';
import './Sidebar.css';

const ICON_MAP = {
    // la- prefixed (legacy)
    'la-area-chart': BarChart2,
    'la-box': Package,
    'la-boxes': Layers,
    'la-briefcase': Briefcase,
    'la-bullhorn': Bell,
    'la-cog': Settings,
    'la-cubes': Package,
    'la-file-alt': FileText,
    'la-file-invoice': FileStack,
    'la-home': Home,
    'la-tachometer-alt': Home,
    'la-dashboard': Home,
    'la-laptop': LayoutDashboard,
    'la-layer-group': Layers,
    'la-percent': Percent,
    'la-shopping-cart': ShoppingCart,
    'la-star': Star,
    'la-tags': Tags,
    'la-truck': Truck,
    'la-user-circle': UserCog,
    'la-users': Users,
    'la-shield': ShieldCheck,
    'la-th-large': Grid,
    'la-th-list': Grid,
    'la-balance-scale': Scale,
    'la-sitemap': Network,
    'la-bookmark': Bookmark,
    'la-copyright': Bookmark,
    'la-trademark': Bookmark,
    'la-circle': AlertCircle,
    // Raw lucide names (from seed data)
    'LayoutGrid': LayoutGrid,
    'LayoutDashboard': LayoutDashboard,
    'Users': Users,
    'UserCog': UserCog,
    'Settings': Settings,
    'Package': Package,
    'ShoppingCart': ShoppingCart,
    'Tags': Tags,
    'FileText': FileText,
    'Percent': Percent,
    'Layers': Layers,
    'Briefcase': Briefcase,
    'Bell': Bell,
    'BarChart2': BarChart2,
    'Star': Star,
    'Truck': Truck,
    'AlertCircle': AlertCircle,
    'FileStack': FileStack,
    'Home': Home,
    'Grid': Grid,
    'Scale': Scale,
    'Network': Network,
    'Bookmark': Bookmark,
    'BookOpen': BookOpen,
    'UserPlus': UserPlus,
    'Image': Image,
    'Building': Building,
    'ShieldCheck': ShieldCheck,
};

const renderIcon = (iconStyle) => {
    if (!iconStyle) return <AlertCircle size={20} />;
    const IconComponent = ICON_MAP[iconStyle];
    if (IconComponent) return <IconComponent size={20} />;
    return <AlertCircle size={20} />;
};

const Sidebar = ({ isCollapsed, isMobile, closeSidebar }) => {
    const [menus, setMenus] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    const location = useLocation();

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const res = await fetch('/api/sidebar/get-menus', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setMenus(data);
                    } else {
                        setMenus([]);
                    }
                } else {
                    console.error('Sidebar API error:', res.status);
                    setMenus([]);
                }
            } catch (error) {
                console.error('Failed to fetch sidebar menus:', error);
                setMenus([]);
            }
        };
        fetchMenus();
    }, []);

    const isActive = (path) => {
        if (!path) return false;
        const currentPath = location.pathname.replace(/^\//, '');
        const targetPath = String(path).replace(/^\//, '');
        return currentPath === targetPath;
    };

    const toggleGroup = (id) => {
        setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const headers = menus.filter(m => m.classChange === 'menu-title');
    const standaloneItems = menus.filter(m => !m.classChange && m.parent_module_id === '-1');

    return (
        <aside className={`sidebar-container glass ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">PM</div>
                    {!isCollapsed && <span className="logo-text">PM International</span>}
                </div>
                {isMobile && !isCollapsed && (
                    <button className="icon-button close-sidebar-btn" onClick={closeSidebar} style={{ marginLeft: 'auto' }}>
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="sidebar-content">
                <ul className="menu-list">
                    {standaloneItems.map((item) => (
                        <li key={item._id} className={`menu-item ${isActive(item.to) ? 'active' : ''}`}>
                            <Link to={`/${item.to}`} className="menu-link">
                                <span className="menu-icon">{renderIcon(item.iconStyle)}</span>
                                {!isCollapsed && <span className="menu-label">{item.title}</span>}
                                {isCollapsed && <div className="tooltip">{item.title}</div>}
                            </Link>
                        </li>
                    ))}
                </ul>

                {headers.map((header) => {
                    const groupItems = menus.filter(m => m.parent_module_id === header.module_id);
                    if (groupItems.length === 0) return null;

                    return (
                        <div key={header._id} className="menu-group">
                            {!isCollapsed && <h4 className="group-title">{header.title}</h4>}
                            <ul className="menu-list">
                                {groupItems.map((item) => {
                                    const hasSubmenu = item.content && item.content.length > 0;
                                    const isExpanded = expandedGroups[item._id];

                                    return (
                                        <li key={item._id} className={`menu-item ${isActive(item.to) ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}>
                                            {hasSubmenu ? (
                                                <div className="menu-link" onClick={() => toggleGroup(item._id)}>
                                                    <span className="menu-icon">{renderIcon(item.iconStyle)}</span>
                                                    {!isCollapsed && <span className="menu-label">{item.title}</span>}
                                                    {!isCollapsed && (isExpanded ? <ChevronDown size={14} className="chevron" /> : <ChevronRight size={14} className="chevron" />)}
                                                </div>
                                            ) : (
                                                <Link to={`/${item.to}`} className="menu-link">
                                                    <span className="menu-icon">{renderIcon(item.iconStyle)}</span>
                                                    {!isCollapsed && <span className="menu-label">{item.title}</span>}
                                                </Link>
                                            )}

                                            {hasSubmenu && isExpanded && !isCollapsed && (
                                                <ul className="submenu-list">
                                                    {item.content.map((sub, idx) => (
                                                        <li key={idx} className={`submenu-item ${isActive(sub.to) ? 'active' : ''}`}>
                                                            <Link to={`/${sub.to}`} className="submenu-link">
                                                                <span className="submenu-prefix">-</span>
                                                                <span className="submenu-label">{sub.title}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {isCollapsed && <div className="tooltip">{item.title}</div>}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>

            <div className="sidebar-footer">
                <div className="pro-card glass">
                    {!isCollapsed ? (
                        <>
                            <h5>Enterprise Plan</h5>
                            <p>Dynamic RBAC Active</p>
                        </>
                    ) : (
                        <ShieldCheck size={20} />
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
