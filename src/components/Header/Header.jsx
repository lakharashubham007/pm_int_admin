import React, { useState, useRef, useEffect } from 'react';
import {
    Menu,
    Search,
    Bell,
    User,
    Settings,
    LogOut,
    ChevronDown,
    X,
    Sun,
    Moon,
    ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getImageUrl, getInitials } from '../../utils/imageHelper';
import './Header.css';

const Header = ({ isSidebarCollapsed, toggleSidebar }) => {
    const { theme, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const { notifications, unreadCount, markAllAsRead } = useNotifications();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (n) => {
        setShowNotifications(false);
        navigate('/orders');
    };

    return (
        <header className="header-container glass">
            <div className="header-left">
                <button className="icon-button menu-toggle" onClick={toggleSidebar}>
                    {isSidebarCollapsed ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search for products, orders or customers..." />
                </div>
            </div>

            <div className="header-right">
                <button
                    className="icon-button theme-toggle"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="notification-wrapper" ref={notificationRef}>
                    <button
                        className="icon-button"
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            if (!showNotifications) markAllAsRead();
                        }}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown fade-in">
                            <div className="dropdown-header">
                                <h3>Notifications</h3>
                                <button className="text-button" onClick={markAllAsRead}>Mark all as read</button>
                            </div>
                            <div className="notification-list">
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                                            onClick={() => handleNotificationClick(n)}
                                        >
                                            <div className="notification-icon">
                                                <ShoppingBag size={16} />
                                            </div>
                                            <div className="notification-content">
                                                <p><strong>{n.title}</strong></p>
                                                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>{n.message}</p>
                                                <span className="time">{n.time}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                                        <Bell size={32} style={{ marginBottom: '0.5rem' }} />
                                        <p>No new notifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="profile-container" ref={profileRef}>
                    <button
                        className="profile-trigger"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="avatar">
                            {user?.profileImage ? (
                                <img
                                    src={getImageUrl(user.profileImage)}
                                    alt="Profile"
                                    className="avatar-img-small"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                            ) : null}
                            <span className="avatar-initials" style={{ display: user?.profileImage ? 'none' : 'flex' }}>
                                {getInitials(user?.name)}
                            </span>
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.name || 'Guest'}</span>
                            <span className="user-role">{user?.role || 'User'}</span>
                            {user?.userType === 'vendor' && user?.businessName && (
                                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', opacity: 0.7, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>
                                    {user.businessName}
                                </span>
                            )}
                        </div>
                        <ChevronDown size={14} className={`chevron ${showProfileMenu ? 'rotate' : ''}`} />
                    </button>

                    {showProfileMenu && (
                        <div className="profile-dropdown fade-in">
                            <div className="dropdown-info">
                                <div className="dropdown-avatar">
                                    {user?.profileImage ? (
                                        <img
                                            src={getImageUrl(user.profileImage)}
                                            alt="Profile"
                                            className="avatar-img-small"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'hsl(var(--primary))' }}>{getInitials(user?.name)}</span>
                                    )}
                                </div>
                                <div className="dropdown-user-details">
                                    <p className="full-name">{user?.name || 'User Profile'}</p>
                                    <p className="email">{user?.email || ''}</p>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button
                                className="dropdown-item"
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    navigate('/profile');
                                }}
                            >
                                <User size={16} /> My Profile
                            </button>
                             <button 
                                 className="dropdown-item"
                                 onClick={() => {
                                     setShowProfileMenu(false);
                                     if (user?.userType === 'vendor') {
                                         navigate('/profile');
                                     } else {
                                         navigate('/settings');
                                     }
                                 }}
                             >
                                 <Settings size={16} /> {user?.userType === 'vendor' ? 'My Store Settings' : 'Account Settings'}
                             </button>

                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item logout-btn" onClick={logout}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
