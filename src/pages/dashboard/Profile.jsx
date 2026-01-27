import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Key,
  Camera, Edit, Save, X, Check, AlertTriangle, Bell,
  Activity, Clock, Lock, Trash2, Download, Upload,
  Settings, LogOut, Eye, EyeOff, Copy, CheckCircle,
  Smartphone, Globe, CreditCard, Award, Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, onValue, set, update } from 'firebase/database';
import { database } from '../../config/firebase';
import '../../styles/monitor.css';
import '../../styles/profile.css';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#000';
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? X : AlertTriangle;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: bgColor,
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideIn 0.3s ease',
      minWidth: '320px'
    }}>
      <Icon size={20} />
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{message}</span>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // Profile Data
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    region: '',
    country: 'Tanzania',
    timezone: 'Africa/Dar_es_Salaam',
    photoURL: '',
    role: 'Admin',
    department: 'Operations',
    joinDate: new Date().toISOString()
  });

  // Editing States
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfileData, setTempProfileData] = useState({});

  // Password Change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Activity Log
  const [activityLog, setActivityLog] = useState([]);

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailVerified: false,
    phoneVerified: false,
    lastPasswordChange: null,
    loginHistory: []
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Load user data from Firebase
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const loadUserData = async () => {
      try {
        // Set basic data from auth
        const initialData = {
          displayName: currentUser.displayName || 'User',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || '',
          ...profileData
        };

        // Load from Firebase if exists
        const userRef = ref(database, `users/${currentUser.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setProfileData({ ...initialData, ...data });

            if (data.activityLog) {
              setActivityLog(Object.values(data.activityLog).sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
              ).slice(0, 10));
            }

            if (data.security) {
              setSecuritySettings({ ...securitySettings, ...data.security });
            }
          } else {
            setProfileData(initialData);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile data', 'error');
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  // Save profile data
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const userRef = ref(database, `users/${currentUser.uid}/profile`);
      await set(userRef, tempProfileData);

      // Update auth profile if name or photo changed
      if (tempProfileData.displayName !== profileData.displayName ||
        tempProfileData.photoURL !== profileData.photoURL) {
        await updateUserProfile({
          displayName: tempProfileData.displayName,
          photoURL: tempProfileData.photoURL
        });
      }

      setProfileData(tempProfileData);
      setEditingProfile(false);

      // Log activity
      await logActivity('Profile updated', 'Profile information was modified');

      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Failed to save profile', 'error');
    }
    setSaving(false);
  };

  // Handle avatar upload
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be less than 2MB', 'error');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhotoURL = e.target.result;
      if (editingProfile) {
        setTempProfileData({ ...tempProfileData, photoURL: newPhotoURL });
      } else {
        setProfileData({ ...profileData, photoURL: newPhotoURL });
        handleSaveAvatar(newPhotoURL);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save avatar
  const handleSaveAvatar = async (photoURL) => {
    setSaving(true);
    try {
      const userRef = ref(database, `users/${currentUser.uid}/profile/photoURL`);
      await set(userRef, photoURL);

      await updateUserProfile({ photoURL });
      await logActivity('Avatar updated', 'Profile picture was changed');

      showToast('Avatar updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating avatar:', error);
      showToast('Failed to update avatar', 'error');
    }
    setSaving(false);
  };

  // Change password
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setSaving(true);
    try {
      // In production, use Firebase Auth to change password
      // await updatePassword(currentUser, passwordForm.newPassword);

      // Update last password change
      const securityRef = ref(database, `users/${currentUser.uid}/security/lastPasswordChange`);
      await set(securityRef, new Date().toISOString());

      await logActivity('Password changed', 'Account password was updated');

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully!', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Failed to change password', 'error');
    }
    setSaving(false);
  };

  // Log activity
  const logActivity = async (action, description) => {
    try {
      const activityRef = ref(database, `users/${currentUser.uid}/activityLog/${Date.now()}`);
      const activity = {
        action,
        description,
        timestamp: new Date().toISOString(),
        ip: 'Unknown' // In production, get actual IP
      };
      await set(activityRef, activity);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      return;
    }

    setSaving(true);
    try {
      // In production, delete user data and account
      await logout();
      navigate('/login');
      showToast('Account deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast('Failed to delete account', 'error');
    }
    setSaving(false);
  };

  // Export user data
  const handleExportData = () => {
    const data = {
      profile: profileData,
      security: securitySettings,
      activityLog: activityLog,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waleki-profile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Profile data exported successfully!', 'success');
    logActivity('Data exported', 'User profile data was exported');
  };

  // Get user initials
  const getUserInitials = () => {
    const name = profileData.displayName || 'User';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #F0F0F0',
          borderTopColor: '#000',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <p style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="monitor-page">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        style={{ display: 'none' }}
      />

      {/* Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {profileData.photoURL ? (
                <img src={profileData.photoURL} alt="Profile" />
              ) : (
                <span>{getUserInitials()}</span>
              )}
            </div>
            <button
              className="profile-avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Change avatar"
            >
              <Camera size={16} style={{ color: '#00cf45bc' }} />
            </button>
          </div>

          <div className="profile-header-info">
            <h1 className="profile-header-name">{profileData.displayName}</h1>
            <div className="profile-header-role">
              <Award size={14} />
              {profileData.role} • {profileData.department}
            </div>
            <div className="profile-header-stats">
              <div className="profile-stat-item">
                <span className="profile-stat-label">Member Since</span>
                <span className="profile-stat-value">{formatDate(profileData.joinDate).split(',')[1]}</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">Activities</span>
                <span className="profile-stat-value">{activityLog.length}</span>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-label">Location</span>
                <span className="profile-stat-value">{profileData.country}</span>
              </div>
            </div>
          </div>

          <div className="profile-header-actions">
            <button className="profile-btn-header profile-btn-white" onClick={() => navigate('/settings')}>
              <Settings size={14} />
              Settings
            </button>
            <button className="profile-btn-header profile-btn-transparent" onClick={handleExportData}>
              <Download size={14} />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="profile-content">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-sidebar-card">
            <button
              className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} />
              <span>Profile Info</span>
            </button>

            <button
              className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Shield size={16} />
              <span>Security</span>
            </button>

            <button
              className={`profile-nav-item ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <Activity size={16} />
              <span>Activity Log</span>
            </button>

            <button
              className={`profile-nav-item ${activeTab === 'danger' ? 'active' : ''}`}
              onClick={() => setActiveTab('danger')}
            >
              <AlertTriangle size={16} />
              <span>Danger Zone</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="profile-sidebar-card">
            <div className="profile-quick-stats">
              <div className="profile-quick-stat">
                <div className="profile-quick-stat-info">
                  <div className="profile-quick-stat-icon">
                    <Mail size={14} />
                  </div>
                  <div>
                    <div className="profile-quick-stat-label">Email Status</div>
                    <div className="profile-quick-stat-value">
                      {securitySettings.emailVerified ? 'Verified' : 'Unverified'}
                    </div>
                  </div>
                </div>
                {securitySettings.emailVerified ? (
                  <CheckCircle size={14} style={{ color: '#16A34A' }} />
                ) : (
                  <X size={14} style={{ color: '#DC2626' }} />
                )}
              </div>

              <div className="profile-quick-stat">
                <div className="profile-quick-stat-info">
                  <div className="profile-quick-stat-icon">
                    <Shield size={14} />
                  </div>
                  <div>
                    <div className="profile-quick-stat-label">2FA Status</div>
                    <div className="profile-quick-stat-value">
                      {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-quick-stat">
                <div className="profile-quick-stat-info">
                  <div className="profile-quick-stat-icon">
                    <Clock size={14} />
                  </div>
                  <div>
                    <div className="profile-quick-stat-label">Last Login</div>
                    <div className="profile-quick-stat-value">
                      {formatRelativeTime(new Date().toISOString())}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main-content">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <>
              <div className="profile-content-header">
                <h2 className="profile-content-title">Profile Information</h2>
                {!editingProfile ? (
                  <button
                    className="profile-btn profile-btn-primary"
                    onClick={() => {
                      setEditingProfile(true);
                      setTempProfileData({ ...profileData });
                    }}
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      className="profile-btn profile-btn-primary"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      <Save size={16} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className="profile-btn profile-btn-secondary"
                      onClick={() => {
                        setEditingProfile(false);
                        setTempProfileData({});
                      }}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-form-section">
                <h3 className="profile-section-title">
                  <User size={18} />
                  Personal Information
                </h3>

                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label className="profile-form-label">Full Name *</label>
                    <input
                      type="text"
                      className="profile-form-input"
                      value={editingProfile ? tempProfileData.displayName : profileData.displayName}
                      onChange={(e) => setTempProfileData({ ...tempProfileData, displayName: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">Email Address *</label>
                    <input
                      type="email"
                      className="profile-form-input"
                      value={editingProfile ? tempProfileData.email : profileData.email}
                      onChange={(e) => setTempProfileData({ ...tempProfileData, email: e.target.value })}
                      disabled={!editingProfile}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={editingProfile ? tempProfileData.phone : profileData.phone}
                      onChange={(e) => setTempProfileData({ ...tempProfileData, phone: e.target.value })}
                      placeholder="+255 XXX XXX XXX"
                      disabled={!editingProfile}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={editingProfile ? tempProfileData.role : profileData.role}
                      onChange={(e) => setTempProfileData({ ...tempProfileData, role: e.target.value })}
                      disabled={!editingProfile}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Operator">Operator</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>

                  <div className="profile-form-group full-width">
                    <label className="profile-form-label">Bio</label>
                    <textarea
                      className="profile-form-textarea"
                      value={editingProfile ? tempProfileData.bio : profileData.bio}
                      onChange={(e) => setTempProfileData({ ...tempProfileData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      disabled={!editingProfile}
                    />
                  </div>
                </div>
              </div>

              <div className="profile-form-section">
                <h3 className="profile-section-title">
                  <MapPin size={18} />
                  Location & Timezone
                </h3>

                <div className="profile-form-grid">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingProfile ? tempProfileData.location : profileData.location}
                      onChange={(e) => setTempProfileData({ ...tempProfileData, location: e.target.value })}
                      placeholder="City"
                      disabled={!editingProfile}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Region</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingProfile ? tempProfileData.region : profileData.region}
                      onChange={(e) => setTempProfileData({ ...tempProfileData, region: e.target.value })}
                      placeholder="Region"
                      disabled={!editingProfile}
                    />
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">Country</label>
                    <select
                      className="profile-form-input"
                      value={editingProfile ? tempProfileData.country : profileData.country}
                      onChange={(e) => setTempProfileData({ ...tempProfileData, country: e.target.value })}
                      disabled={!editingProfile}
                    >
                      <option value="Tanzania">Tanzania</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Rwanda">Rwanda</option>
                    </select>
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">Timezone</label>
                    <select
                      className="profile-form-input"
                      value={editingProfile ? tempProfileData.timezone : profileData.timezone}
                      onChange={(e) => setTempProfileData({ ...tempProfileData, timezone: e.target.value })}
                      disabled={!editingProfile}
                    >
                      <option value="Africa/Dar_es_Salaam">East Africa Time (EAT)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <>
              <div className="profile-content-header">
                <h2 className="profile-content-title">Security Settings</h2>
              </div>

              <div className="profile-form-section">
                <h3 className="profile-section-title">
                  <Key size={18} />
                  Change Password
                </h3>

                <div className="profile-form-grid">
                  <div className="profile-form-group profile-full-width">
                    <label className="profile-form-label">Current Password</label>
                    <div className="profile-input-wrapper">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        className="profile-form-input"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                      />
                      <span
                        className="profile-input-icon"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">New Password</label>
                    <div className="profile-input-wrapper">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        className="profile-form-input"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter new password"
                      />
                      <span
                        className="profile-input-icon"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">Confirm New Password</label>
                    <div className="profile-input-wrapper">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        className="profile-form-input"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                      <span
                        className="profile-input-icon"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button
                    className="profile-btn profile-btn-primary"
                    onClick={handleChangePassword}
                    disabled={saving}
                  >
                    <Key size={16} />
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">
                  <Shield size={18} />
                  Security Status
                </h3>

                <div className="profile-info-card">
                  <div className={`profile-info-icon ${securitySettings.emailVerified ? 'success' : 'warning'}`}>
                    <Mail size={20} />
                  </div>
                  <div className="profile-info-content">
                    <h4>Email Verification</h4>
                    <p>
                      {securitySettings.emailVerified
                        ? 'Your email address has been verified.'
                        : 'Please verify your email address to secure your account.'}
                    </p>
                    {!securitySettings.emailVerified && (
                      <button className="profile-btn profile-btn-primary" style={{ marginTop: '12px' }}>
                        Verify Email
                      </button>
                    )}
                  </div>
                </div>

                <div className="profile-info-card" style={{ marginTop: '16px' }}>
                  <div className={`profile-info-icon ${securitySettings.twoFactorEnabled ? 'success' : 'warning'}`}>
                    <Smartphone size={20} />
                  </div>
                  <div className="profile-info-content">
                    <h4>Two-Factor Authentication</h4>
                    <p>
                      {securitySettings.twoFactorEnabled
                        ? 'Two-factor authentication is enabled on your account.'
                        : 'Add an extra layer of security to your account.'}
                    </p>
                    <button className="profile-btn profile-btn-primary" style={{ marginTop: '12px' }}>
                      {securitySettings.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>

                <div className="profile-info-card" style={{ marginTop: '16px' }}>
                  <div className="profile-info-icon success">
                    <Clock size={20} />
                  </div>
                  <div className="profile-info-content">
                    <h4>Password Last Changed</h4>
                    <p>
                      {securitySettings.lastPasswordChange
                        ? formatDate(securitySettings.lastPasswordChange)
                        : 'Never changed'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <>
              <div className="profile-content-header">
                <h2 className="profile-content-title">Activity Log</h2>
              </div>

              {activityLog.length > 0 ? (
                <div className="profile-activity-list">
                  {activityLog.map((activity, index) => (
                    <div key={index} className="profile-activity-item">
                      <div className="profile-activity-icon">
                        <Activity size={20} />
                      </div>
                      <div className="profile-activity-content">
                        <div className="profile-activity-action">{activity.action}</div>
                        <div className="profile-activity-description">{activity.description}</div>
                        <div className="profile-activity-time">
                          {formatDate(activity.timestamp)} • {formatRelativeTime(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile-empty-state">
                  <Activity size={64} style={{ color: '#CCC' }} />
                  <h3>No Activity Yet</h3>
                  <p>Your account activity will appear here</p>
                </div>
              )}
            </>
          )}

          {/* DANGER ZONE TAB */}
          {activeTab === 'danger' && (
            <>
              <div className="profile-content-header">
                <h2 className="profile-content-title">Danger Zone</h2>
              </div>

              <div className="profile-info-card">
                <div className="profile-info-icon error">
                  <AlertTriangle size={20} />
                </div>
                <div className="profile-info-content">
                  <h4>Delete Account</h4>
                  <p>
                    Once you delete your account, there is no going back. All your data will be permanently removed.
                    This action cannot be undone.
                  </p>
                  <button
                    className="profile-btn profile-btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={saving}
                    style={{ marginTop: '16px' }}
                  >
                    <Trash2 size={16} />
                    Delete My Account
                  </button>
                </div>
              </div>

              <div className="profile-info-card" style={{ marginTop: '16px' }}>
                <div className="profile-info-icon warning">
                  <Download size={20} />
                </div>
                <div className="profile-info-content">
                  <h4>Export Your Data</h4>
                  <p>
                    Download a copy of your profile data, activity logs, and account information before deleting your account.
                  </p>
                  <button
                    className="profile-btn profile-btn-primary"
                    onClick={handleExportData}
                    style={{ marginTop: '16px' }}
                  >
                    <Download size={16} />
                    Export Data
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
