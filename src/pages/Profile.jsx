import React, { useState } from 'react';
import { User, Mail, Shield, Save, Key, Camera, ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';
import { getImageUrl, getInitials } from '../utils/imageHelper';
import './Profile.css';
import Loader from '../components/Loader';

const Profile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        user?.profileImage ? getImageUrl(user.profileImage) : null
    );

    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // ─── Save Profile Info ───────────────────────────────────────
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!profileForm.name.trim()) {
            return toast.error('Name cannot be empty');
        }
        setIsSavingProfile(true);
        try {
            const data = new FormData();
            data.append('name', profileForm.name);
            data.append('email', profileForm.email);
            if (imageFile) data.append('profileImage', imageFile);

            const response = await authService.updateProfile(data);
            setUser(prev => ({
                ...prev,
                name: response.user?.name || profileForm.name,
                email: response.user?.email || profileForm.email,
                profileImage: response.user?.profileImage || prev.profileImage
            }));
            setImageFile(null);
            toast.success('Profile information updated!');
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSavingProfile(false);
        }
    };

    // ─── Change Password ─────────────────────────────────────────
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            return toast.error('All password fields are required');
        }
        if (passwordForm.newPassword.length < 6) {
            return toast.error('New password must be at least 6 characters');
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error('New passwords do not match');
        }
        if (passwordForm.currentPassword === passwordForm.newPassword) {
            return toast.error('New password must be different from current password');
        }

        setIsSavingPassword(true);
        try {
            await authService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            toast.success('Password changed successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to change password');
        } finally {
            setIsSavingPassword(false);
        }
    };

    const passwordStrength = (password) => {
        if (!password) return null;
        if (password.length < 6) return { level: 'weak', color: '#ef4444', label: 'Too short' };
        if (password.length < 8) return { level: 'fair', color: '#f59e0b', label: 'Fair' };
        if (/[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8) return { level: 'strong', color: '#22c55e', label: 'Strong' };
        return { level: 'moderate', color: '#3b82f6', label: 'Good' };
    };

    const strength = passwordStrength(passwordForm.newPassword);

    return (
        <div className="profile-page-container fade-in">
            <div className="profile-content-pane">
                <header className="profile-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                            <button className="profile-back-btn" onClick={() => navigate(-1)}>
                                <ArrowLeft size={16} />
                            </button>
                            <h1>My Profile</h1>
                        </div>
                        <p>Manage your account information, photo, and security settings.</p>
                    </div>
                </header>

                <div className="profile-layout">
                    {/* ─── Identity Card ─── */}
                    <div className="profile-identity-card">
                        {/* Avatar */}
                        <div className="profile-avatar-wrap">
                            <div className="profile-avatar-ring">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="profile-avatar-img" />
                                ) : (
                                    <div className="profile-avatar-initials">{getInitials(user?.name)}</div>
                                )}
                            </div>
                            <label className="profile-camera-btn" htmlFor="profile-upload" title="Change photo">
                                <Camera size={14} />
                            </label>
                            <input
                                type="file"
                                id="profile-upload"
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>

                        {imageFile && (
                            <div className="profile-new-photo-hint">
                                📷 New photo selected. Save profile to apply.
                            </div>
                        )}

                        <div className="profile-identity-info">
                            <h2>{user?.name || 'Admin'}</h2>
                            <div className="profile-role-badge">
                                <Shield size={12} />
                                {user?.role || 'Admin'}
                            </div>
                            <div className="profile-email-chip">
                                <Mail size={12} />
                                {user?.email}
                            </div>
                        </div>

                        <div className="profile-divider" />

                        <div className="profile-meta-list">
                            <div className="profile-meta-row">
                                <span>Account Status</span>
                                <span className="profile-meta-value green">● Active</span>
                            </div>
                            <div className="profile-meta-row">
                                <span>Last Login</span>
                                <span className="profile-meta-value">Today</span>
                            </div>
                            <div className="profile-meta-row">
                                <span>User Type</span>
                                <span className="profile-meta-value">Administrator</span>
                            </div>
                        </div>
                    </div>

                    {/* ─── Right Forms Column ─── */}
                    <div className="profile-forms-col">

                        {/* ── Section 1: Profile Info ── */}
                        <div className="profile-section-card">
                            <div className="profile-section-header">
                                <div className="profile-section-bar" />
                                <div>
                                    <h3>Account Information</h3>
                                    <p>Update your name, email address, and profile photo.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveProfile}>
                                <div className="profile-form-grid">
                                    <div className="profile-form-group">
                                        <label className="profile-label">
                                            <User size={13} /> Full Name <span className="req">*</span>
                                        </label>
                                        <div className="profile-input-wrap">
                                            <User size={15} className="profile-input-icon" />
                                            <input
                                                type="text"
                                                name="name"
                                                value={profileForm.name}
                                                onChange={handleProfileChange}
                                                className="profile-input"
                                                placeholder="Your full name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-form-group">
                                        <label className="profile-label">
                                            <Mail size={13} /> Email Address
                                        </label>
                                        <div className="profile-input-wrap">
                                            <Mail size={15} className="profile-input-icon" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={profileForm.email}
                                                onChange={handleProfileChange}
                                                className="profile-input"
                                                placeholder="Your email address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-form-footer">
                                    <button type="submit" className="profile-primary-btn" disabled={isSavingProfile}>
                                        {isSavingProfile ? (
                                            <><span className="spin-circle" /> Saving...</>
                                        ) : (
                                            <><Save size={16} /> Save Profile</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* ── Section 2: Password Change ── */}
                        <div className="profile-section-card">
                            <div className="profile-section-header">
                                <div className="profile-section-bar" style={{ background: '#f59e0b' }} />
                                <div>
                                    <h3>Security & Password</h3>
                                    <p>Change your login password. Use at least 8 characters with a number and uppercase letter.</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword}>
                                <div className="profile-form-grid">
                                    <div className="profile-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="profile-label"><Lock size={13} /> Current Password <span className="req">*</span></label>
                                        <div className="profile-input-wrap">
                                            <Lock size={15} className="profile-input-icon" />
                                            <input
                                                type={showCurrent ? 'text' : 'password'}
                                                name="currentPassword"
                                                value={passwordForm.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="profile-input"
                                                placeholder="Enter your current password"
                                            />
                                            <button type="button" className="profile-eye-btn" onClick={() => setShowCurrent(s => !s)}>
                                                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="profile-form-group">
                                        <label className="profile-label"><Key size={13} /> New Password <span className="req">*</span></label>
                                        <div className="profile-input-wrap">
                                            <Key size={15} className="profile-input-icon" />
                                            <input
                                                type={showNew ? 'text' : 'password'}
                                                name="newPassword"
                                                value={passwordForm.newPassword}
                                                onChange={handlePasswordChange}
                                                className="profile-input"
                                                placeholder="Enter new password"
                                            />
                                            <button type="button" className="profile-eye-btn" onClick={() => setShowNew(s => !s)}>
                                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                        {strength && (
                                            <div className="password-strength-wrap">
                                                <div className="password-strength-bar">
                                                    <div className="password-strength-fill" style={{ width: strength.level === 'weak' ? '25%' : strength.level === 'fair' ? '50%' : strength.level === 'moderate' ? '75%' : '100%', background: strength.color }} />
                                                </div>
                                                <span style={{ color: strength.color, fontSize: '0.75rem', fontWeight: 600 }}>{strength.label}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="profile-form-group">
                                        <label className="profile-label"><Key size={13} /> Confirm New Password <span className="req">*</span></label>
                                        <div className="profile-input-wrap">
                                            <Key size={15} className="profile-input-icon" />
                                            <input
                                                type={showConfirm ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={passwordForm.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="profile-input"
                                                placeholder="Confirm new password"
                                            />
                                            <button type="button" className="profile-eye-btn" onClick={() => setShowConfirm(s => !s)}>
                                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                        {passwordForm.confirmPassword && passwordForm.newPassword && (
                                            <div style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {passwordForm.newPassword === passwordForm.confirmPassword ? (
                                                    <><CheckCircle size={13} style={{ color: '#22c55e' }} /> <span style={{ color: '#22c55e', fontWeight: 600 }}>Passwords match</span></>
                                                ) : (
                                                    <span style={{ color: '#ef4444', fontWeight: 600 }}>Passwords do not match</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="profile-form-footer">
                                    <button type="submit" className="profile-primary-btn" disabled={isSavingPassword}
                                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                        {isSavingPassword ? (
                                            <><span className="spin-circle" /> Changing...</>
                                        ) : (
                                            <><Key size={16} /> Change Password</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {(isSavingProfile || isSavingPassword) && <Loader message={isSavingPassword ? 'Changing password...' : 'Updating profile...'} />}
        </div>
    );
};

export default Profile;
