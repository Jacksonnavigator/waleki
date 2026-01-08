import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Droplets, Bell, User, Database,
  Save, RefreshCw, Trash2, Plus, Edit, CheckCircle, XCircle,
  AlertTriangle, Eye, EyeOff, Copy, Download, Upload, Zap,
  Server, Wifi, Shield, Clock, MapPin, Activity, BarChart3
} from 'lucide-react';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { database } from '../../config/firebase';
import notificationService from '../../services/NotificationService';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#000';
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertTriangle;

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

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('nodes');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Node Settings
  const [nodes, setNodes] = useState({});
  const [editingNode, setEditingNode] = useState(null);
  const [nodeForm, setNodeForm] = useState({
    nodeId: '',
    h1_m: '',
    location: '',
    region: '',
    activated: false
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    checkInterval: 60,
    timeoutThreshold: 300,
    autoRefresh: true,
    refreshInterval: 30,
    dataRetention: 30,
    alertsEnabled: true
  });

  // User Preferences
  const [userPreferences, setUserPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'Africa/Dar_es_Salaam',
    dateFormat: 'MM/DD/YYYY',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  // Backend Status
  const [backendStatus, setBackendStatus] = useState({
    database: 'unknown',
    connection: 'unknown',
    lastUpdate: null,
    latency: 0
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch all settings from Firebase
  useEffect(() => {
    console.log('🔧 Loading settings...');

    const rootRef = ref(database);

    const unsubscribe = onValue(rootRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Load node configurations
        if (data.config && data.config.nodes) {
          setNodes(data.config.nodes);
        }

        // Load system settings
        if (data.config && data.config.settings) {
          setSystemSettings(prev => ({ ...prev, ...data.config.settings }));
        }

        // Load user preferences
        if (data.config && data.config.preferences) {
          setUserPreferences(prev => ({ ...prev, ...data.config.preferences }));
        }

        // Update backend status
        if (data.SystemStatus) {
          setBackendStatus({
            database: data.SystemStatus.internet ? 'connected' : 'disconnected',
            connection: 'active',
            lastUpdate: data.SystemStatus.timestamp,
            latency: Math.random() * 100 // Simulated, replace with actual ping
          });
        }
      }

      setLoading(false);
    }, (error) => {
      console.error('❌ Error loading settings:', error);
      showToast('Failed to load settings', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save node configuration
  const handleSaveNode = async () => {
    if (!nodeForm.nodeId || !nodeForm.h1_m) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      const nodeRef = ref(database, `config/nodes/${nodeForm.nodeId}`);
      await set(nodeRef, {
        h1_m: parseFloat(nodeForm.h1_m),
        location: nodeForm.location || 'Tanzania',
        region: nodeForm.region || 'Arusha',
        activated: nodeForm.activated
      });

      showToast(`${nodeForm.nodeId} ${editingNode ? 'updated' : 'created'} successfully!`, 'success');
      setEditingNode(null);
      setNodeForm({ nodeId: '', h1_m: '', location: '', region: '', activated: false });
    } catch (error) {
      console.error('❌ Error saving node:', error);
      showToast('Failed to save node configuration', 'error');
    }
    setSaving(false);
  };

  // Delete node
  const handleDeleteNode = async (nodeId) => {
    if (!window.confirm(`Are you sure you want to delete ${nodeId}?`)) {
      return;
    }

    setSaving(true);
    try {
      const nodeRef = ref(database, `config/nodes/${nodeId}`);
      await remove(nodeRef);
      showToast(`${nodeId} deleted successfully`, 'success');
    } catch (error) {
      console.error('❌ Error deleting node:', error);
      showToast('Failed to delete node', 'error');
    }
    setSaving(false);
  };

  // Toggle node activation
  const handleToggleNodeActivation = async (nodeId) => {
    setSaving(true);
    try {
      const nodeRef = ref(database, `config/nodes/${nodeId}/activated`);
      const newStatus = !nodes[nodeId].activated;
      await set(nodeRef, newStatus);
      showToast(`${nodeId} ${newStatus ? 'activated' : 'deactivated'}`, 'success');
    } catch (error) {
      console.error('❌ Error toggling node:', error);
      showToast('Failed to update node status', 'error');
    }
    setSaving(false);
  };

  // Save system settings
  const handleSaveSystemSettings = async () => {
    setSaving(true);
    try {
      const settingsRef = ref(database, 'config/settings');
      await set(settingsRef, systemSettings);

      // Update notification service if needed
      if (systemSettings.alertsEnabled) {
        notificationService.CHECK_INTERVAL_MS = systemSettings.checkInterval * 1000;
        notificationService.TIMEOUT_MS = systemSettings.timeoutThreshold * 1000;
      }

      showToast('System settings saved successfully!', 'success');
    } catch (error) {
      console.error('❌ Error saving system settings:', error);
      showToast('Failed to save system settings', 'error');
    }
    setSaving(false);
  };

  // Save user preferences
  const handleSaveUserPreferences = async () => {
    setSaving(true);
    try {
      const preferencesRef = ref(database, 'config/preferences');
      await set(preferencesRef, userPreferences);
      showToast('Preferences saved successfully!', 'success');
    } catch (error) {
      console.error('❌ Error saving preferences:', error);
      showToast('Failed to save preferences', 'error');
    }
    setSaving(false);
  };

  // Export configuration
  const handleExportConfig = () => {
    const config = {
      nodes,
      systemSettings,
      userPreferences,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waleki-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Configuration exported successfully!', 'success');
  };

  // Import configuration
  const handleImportConfig = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const config = JSON.parse(e.target.result);

        // Import nodes
        if (config.nodes) {
          const nodesRef = ref(database, 'config/nodes');
          await set(nodesRef, config.nodes);
        }

        // Import settings
        if (config.systemSettings) {
          const settingsRef = ref(database, 'config/settings');
          await set(settingsRef, config.systemSettings);
        }

        // Import preferences
        if (config.userPreferences) {
          const preferencesRef = ref(database, 'config/preferences');
          await set(preferencesRef, config.userPreferences);
        }

        showToast('Configuration imported successfully!', 'success');
      } catch (error) {
        console.error('❌ Error importing config:', error);
        showToast('Failed to import configuration', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Edit node
  const handleEditNode = (nodeId) => {
    const node = nodes[nodeId];
    setNodeForm({
      nodeId,
      h1_m: node.h1_m.toString(),
      location: node.location || '',
      region: node.region || '',
      activated: node.activated
    });
    setEditingNode(nodeId);
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
        <p style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .settings-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* Header */
        .settings-header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #0369a1, #0284c7);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(3, 105, 161, 0.25);
        }

        .header-text h1 {
          font-size: 24px;
          font-weight: 700;
          color: #000;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }

        .header-text p {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-header {
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0369a1, #0284c7);
          color: white;
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.25);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #0c4a6e, #0369a1);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(3, 105, 161, 0.35);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.8);
          color: #0369a1;
          border: 2px solid #e2e8f0;
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          border-color: #0369a1;
          background: white;
        }

        /* Status Cards */
        .status-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .status-card {
          background: #FAFAFA;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #F0F0F0;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .status-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-icon.success {
          background: #DCFCE7;
          color: #16A34A;
        }

        .status-icon.warning {
          background: #FEF3C7;
          color: #D97706;
        }

        .status-icon.error {
          background: #FEE2E2;
          color: #DC2626;
        }

        .status-label {
          font-size: 12px;
          color: #999;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .status-value {
          font-size: 18px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.3px;
        }

        /* Tabs */
        .settings-content {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
        }

        .tabs-sidebar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          height: fit-content;
          position: sticky;
          top: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .tab-button {
          width: 100%;
          padding: 14px 16px;
          background: transparent;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 8px;
          text-align: left;
        }

        .tab-button:hover {
          background: #FAFAFA;
          color: #000;
        }

        .tab-button.active {
          background: linear-gradient(135deg, #0369a1, #0284c7);
          color: white;
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
        }

        .tab-badge {
          margin-left: auto;
          padding: 4px 8px;
          background: #F0F0F0;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }

        .tab-button.active .tab-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        /* Content Area */
        .content-area {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 32px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        }

        .content-header {
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid #F0F0F0;
        }

        .content-title {
          font-size: 20px;
          font-weight: 700;
          color: #000;
          margin-bottom: 8px;
          letter-spacing: -0.3px;
        }

        .content-subtitle {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
        }

        /* Node List */
        .nodes-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .node-item {
          padding: 20px;
          background: #FAFAFA;
          border-radius: 12px;
          border: 1px solid #F0F0F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
        }

        .node-item:hover {
          border-color: #E8E8E8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .node-info {
          flex: 1;
        }

        .node-name {
          font-size: 16px;
          font-weight: 700;
          color: #000;
          margin-bottom: 4px;
        }

        .node-details {
          font-size: 13px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .node-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: white;
          border: 1px solid #E8E8E8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #666;
        }

        .btn-icon:hover {
          border-color: #000;
          color: #000;
          transform: translateY(-1px);
        }

        .btn-icon.danger:hover {
          border-color: #DC2626;
          color: #DC2626;
          background: #FEF2F2;
        }

        /* Form */
        .form-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #000;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          font-size: 13px;
          font-weight: 700;
          color: #000;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .form-input, .form-select {
          padding: 12px 16px;
          border: 2px solid #E8E8E8;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
          background: white;
        }

        .form-input:focus, .form-select:focus {
          border-color: #0369a1;
          box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
        }

        .form-input:disabled {
          background: #FAFAFA;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 0;
        }

        .checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .checkbox-label {
          font-size: 14px;
          font-weight: 500;
          color: #000;
          cursor: pointer;
        }

        /* Buttons */
        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .btn-dark {
          background: linear-gradient(135deg, #0369a1, #0284c7);
          color: white;
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.25);
        }

        .btn-dark:hover {
          background: linear-gradient(135deg, #0c4a6e, #0369a1);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(3, 105, 161, 0.35);
        }

        .btn-outline {
          background: rgba(255, 255, 255, 0.8);
          color: #0369a1;
          border: 2px solid #e2e8f0;
        }

        .btn-outline:hover {
          border-color: #0369a1;
          background: white;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Settings Grid */
        .settings-grid {
          display: grid;
          gap: 24px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #FAFAFA;
          border-radius: 12px;
          border: 1px solid #F0F0F0;
        }

        .setting-info {
          flex: 1;
        }

        .setting-name {
          font-size: 15px;
          font-weight: 700;
          color: #000;
          margin-bottom: 4px;
        }

        .setting-description {
          font-size: 13px;
          color: #666;
        }

        .setting-control {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .input-small {
          width: 100px;
          padding: 8px 12px;
          border: 2px solid #E8E8E8;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
        }

        /* Status Indicator */
        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-indicator.active {
          background: #DCFCE7;
          color: #16A34A;
        }

        .status-indicator.inactive {
          background: #F5F5F5;
          color: #999;
        }

        /* Info Box */
        .info-box {
          padding: 16px;
          background: #F0F9FF;
          border: 1px solid #BAE6FD;
          border-radius: 12px;
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .info-box svg {
          color: #0369A1;
          flex-shrink: 0;
        }

        .info-text {
          font-size: 13px;
          color: #0369A1;
          line-height: 1.6;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .settings-content {
            grid-template-columns: 1fr;
          }

          .tabs-sidebar {
            position: static;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .status-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .settings-page {
            padding: 16px;
          }

          .settings-header {
            padding: 24px;
          }

          .header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .status-cards {
            grid-template-columns: 1fr;
          }

          .tabs-sidebar {
            grid-template-columns: 1fr;
          }

          .content-area {
            padding: 24px;
          }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="settings-header">
        <div className="header-top">
          <div className="header-left">
            <div className="header-icon">
              <SettingsIcon size={24} style={{ color: 'white' }} />
            </div>
            <div className="header-text">
              <h1>Settings & Configuration</h1>
              <p>Manage system settings, nodes, and preferences</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-header btn-secondary" onClick={() => navigate('/dashboard')}>
              <Activity size={16} />
              Dashboard
            </button>
            <button className="btn-header btn-primary" onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="status-cards">
          <div className="status-card">
            <div className="status-header">
              <div className={`status-icon ${backendStatus.database === 'connected' ? 'success' : 'error'}`}>
                <Database size={18} />
              </div>
              <div>
                <div className="status-label">Database</div>
                <div className="status-value">{backendStatus.database}</div>
              </div>
            </div>
          </div>

          <div className="status-card">
            <div className="status-header">
              <div className={`status-icon ${backendStatus.connection === 'active' ? 'success' : 'warning'}`}>
                <Wifi size={18} />
              </div>
              <div>
                <div className="status-label">Connection</div>
                <div className="status-value">{backendStatus.connection}</div>
              </div>
            </div>
          </div>

          <div className="status-card">
            <div className="status-header">
              <div className="status-icon success">
                <Server size={18} />
              </div>
              <div>
                <div className="status-label">Latency</div>
                <div className="status-value">{Math.round(backendStatus.latency)}ms</div>
              </div>
            </div>
          </div>

          <div className="status-card">
            <div className="status-header">
              <div className="status-icon success">
                <Activity size={18} />
              </div>
              <div>
                <div className="status-label">Nodes</div>
                <div className="status-value">{Object.keys(nodes).length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="settings-content">
        {/* Sidebar Tabs */}
        <div className="tabs-sidebar">
          <button
            className={`tab-button ${activeTab === 'nodes' ? 'active' : ''}`}
            onClick={() => setActiveTab('nodes')}
          >
            <Droplets size={18} />
            <span>Nodes</span>
            <span className="tab-badge">{Object.keys(nodes).length}</span>
          </button>

          <button
            className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <Server size={18} />
            <span>System</span>
          </button>

          <button
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <User size={18} />
            <span>Preferences</span>
          </button>

          <button
            className={`tab-button ${activeTab === 'backend' ? 'active' : ''}`}
            onClick={() => setActiveTab('backend')}
          >
            <Database size={18} />
            <span>Backend</span>
          </button>

          <button
            className={`tab-button ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            <Shield size={18} />
            <span>Backup</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {/* NODES TAB */}
          {activeTab === 'nodes' && (
            <>
              <div className="content-header">
                <h2 className="content-title">Node Configuration</h2>
                <p className="content-subtitle">
                  Manage sensor nodes, configure cable lengths, and control activation status
                </p>
              </div>

              {/* Existing Nodes */}
              <div className="nodes-list">
                {Object.entries(nodes).map(([nodeId, node]) => (
                  <div key={nodeId} className="node-item">
                    <div className="node-info">
                      <div className="node-name">{nodeId}</div>
                      <div className="node-details">
                        <span>h₁: {node.h1_m}m</span>
                        <span>•</span>
                        <span>{node.location}, {node.region}</span>
                        <span>•</span>
                        <span className={`status-indicator ${node.activated ? 'active' : 'inactive'}`}>
                          {node.activated ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {node.activated ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="node-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleToggleNodeActivation(nodeId)}
                        title={node.activated ? 'Deactivate' : 'Activate'}
                      >
                        {node.activated ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleEditNode(nodeId)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDeleteNode(nodeId)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add/Edit Node Form */}
              <div className="form-section">
                <h3 className="section-title">
                  <Plus size={18} />
                  {editingNode ? `Edit ${editingNode}` : 'Add New Node'}
                </h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Node ID *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={nodeForm.nodeId}
                      onChange={(e) => setNodeForm({ ...nodeForm, nodeId: e.target.value })}
                      placeholder="e.g., Node1"
                      disabled={!!editingNode}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cable Length (h₁) *</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={nodeForm.h1_m}
                      onChange={(e) => setNodeForm({ ...nodeForm, h1_m: e.target.value })}
                      placeholder="e.g., 50.5"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={nodeForm.location}
                      onChange={(e) => setNodeForm({ ...nodeForm, location: e.target.value })}
                      placeholder="e.g., Tanzania"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Region</label>
                    <input
                      type="text"
                      className="form-input"
                      value={nodeForm.region}
                      onChange={(e) => setNodeForm({ ...nodeForm, region: e.target.value })}
                      placeholder="e.g., Arusha"
                    />
                  </div>

                  <div className="form-group full-width">
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="activated"
                        className="checkbox"
                        checked={nodeForm.activated}
                        onChange={(e) => setNodeForm({ ...nodeForm, activated: e.target.checked })}
                      />
                      <label htmlFor="activated" className="checkbox-label">
                        Activate node immediately
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="btn btn-dark"
                    onClick={handleSaveNode}
                    disabled={saving}
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : editingNode ? 'Update Node' : 'Add Node'}
                  </button>
                  {editingNode && (
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setEditingNode(null);
                        setNodeForm({ nodeId: '', h1_m: '', location: '', region: '', activated: false });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="info-box">
                <AlertTriangle size={20} />
                <p className="info-text">
                  <strong>Important:</strong> Cable length (h₁) must be measured accurately from the surface to the cable end.
                  The sensor reading (h₂) will be subtracted from this value to calculate water height.
                  Nodes must be activated to appear in monitoring dashboards.
                </p>
              </div>
            </>
          )}

          {/* SYSTEM TAB */}
          {activeTab === 'system' && (
            <>
              <div className="content-header">
                <h2 className="content-title">System Settings</h2>
                <p className="content-subtitle">
                  Configure monitoring intervals, timeouts, and system behavior
                </p>
              </div>

              <div className="settings-grid">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Check Interval</div>
                    <div className="setting-description">How often to check for sensor timeouts (seconds)</div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="number"
                      className="input-small"
                      value={systemSettings.checkInterval}
                      onChange={(e) => setSystemSettings({ ...systemSettings, checkInterval: parseInt(e.target.value) })}
                      min="10"
                      max="300"
                    />
                    <span style={{ fontSize: '13px', color: '#666' }}>sec</span>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Timeout Threshold</div>
                    <div className="setting-description">Time before offline alert is sent (seconds)</div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="number"
                      className="input-small"
                      value={systemSettings.timeoutThreshold}
                      onChange={(e) => setSystemSettings({ ...systemSettings, timeoutThreshold: parseInt(e.target.value) })}
                      min="60"
                      max="1800"
                    />
                    <span style={{ fontSize: '13px', color: '#666' }}>sec</span>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Auto Refresh</div>
                    <div className="setting-description">Automatically refresh dashboard data</div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={systemSettings.autoRefresh}
                      onChange={(e) => setSystemSettings({ ...systemSettings, autoRefresh: e.target.checked })}
                    />
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Refresh Interval</div>
                    <div className="setting-description">Dashboard refresh rate (seconds)</div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="number"
                      className="input-small"
                      value={systemSettings.refreshInterval}
                      onChange={(e) => setSystemSettings({ ...systemSettings, refreshInterval: parseInt(e.target.value) })}
                      min="10"
                      max="300"
                      disabled={!systemSettings.autoRefresh}
                    />
                    <span style={{ fontSize: '13px', color: '#666' }}>sec</span>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Data Retention</div>
                    <div className="setting-description">How long to keep sensor data (days)</div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="number"
                      className="input-small"
                      value={systemSettings.dataRetention}
                      onChange={(e) => setSystemSettings({ ...systemSettings, dataRetention: parseInt(e.target.value) })}
                      min="7"
                      max="365"
                    />
                    <span style={{ fontSize: '13px', color: '#666' }}>days</span>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Enable Alerts</div>
                    <div className="setting-description">Send notifications for sensor status changes</div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={systemSettings.alertsEnabled}
                      onChange={(e) => setSystemSettings({ ...systemSettings, alertsEnabled: e.target.checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-dark"
                  onClick={handleSaveSystemSettings}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save System Settings'}
                </button>
              </div>

              <div className="info-box">
                <AlertTriangle size={20} />
                <p className="info-text">
                  <strong>Note:</strong> Changes to check interval and timeout threshold will take effect immediately
                  for the notification system. Lower check intervals consume more resources but provide faster detection.
                </p>
              </div>
            </>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <>
              <div className="content-header">
                <h2 className="content-title">User Preferences</h2>
                <p className="content-subtitle">
                  Customize your experience with theme, language, and notification settings
                </p>
              </div>

              <div className="form-section">
                <h3 className="section-title">
                  <User size={18} />
                  Display Settings
                </h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Theme</label>
                    <select
                      className="form-select"
                      value={userPreferences.theme}
                      onChange={(e) => setUserPreferences({ ...userPreferences, theme: e.target.value })}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <select
                      className="form-select"
                      value={userPreferences.language}
                      onChange={(e) => setUserPreferences({ ...userPreferences, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select
                      className="form-select"
                      value={userPreferences.timezone}
                      onChange={(e) => setUserPreferences({ ...userPreferences, timezone: e.target.value })}
                    >
                      <option value="Africa/Dar_es_Salaam">East Africa Time (EAT)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date Format</label>
                    <select
                      className="form-select"
                      value={userPreferences.dateFormat}
                      onChange={(e) => setUserPreferences({ ...userPreferences, dateFormat: e.target.value })}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">
                  <Bell size={18} />
                  Notification Preferences
                </h3>

                <div className="settings-grid">
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-name">Email Notifications</div>
                      <div className="setting-description">Receive alerts via email</div>
                    </div>
                    <div className="setting-control">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={userPreferences.notifications.email}
                        onChange={(e) => setUserPreferences({
                          ...userPreferences,
                          notifications: { ...userPreferences.notifications, email: e.target.checked }
                        })}
                      />
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-name">Push Notifications</div>
                      <div className="setting-description">Browser push notifications</div>
                    </div>
                    <div className="setting-control">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={userPreferences.notifications.push}
                        onChange={(e) => setUserPreferences({
                          ...userPreferences,
                          notifications: { ...userPreferences.notifications, push: e.target.checked }
                        })}
                      />
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-name">SMS Notifications</div>
                      <div className="setting-description">Receive alerts via SMS (requires setup)</div>
                    </div>
                    <div className="setting-control">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={userPreferences.notifications.sms}
                        onChange={(e) => setUserPreferences({
                          ...userPreferences,
                          notifications: { ...userPreferences.notifications, sms: e.target.checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-dark"
                  onClick={handleSaveUserPreferences}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </>
          )}

          {/* BACKEND TAB */}
          {activeTab === 'backend' && (
            <>
              <div className="content-header">
                <h2 className="content-title">Backend Status</h2>
                <p className="content-subtitle">
                  Monitor Firebase connection, database status, and system health
                </p>
              </div>

              <div className="settings-grid">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Firebase Status</div>
                    <div className="setting-description">Real-time database connection</div>
                  </div>
                  <div className="setting-control">
                    <span className={`status-indicator ${backendStatus.database === 'connected' ? 'active' : 'inactive'}`}>
                      {backendStatus.database === 'connected' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {backendStatus.database}
                    </span>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Connection Type</div>
                    <div className="setting-description">Network connection status</div>
                  </div>
                  <div className="setting-control">
                    <span className="status-indicator active">
                      <Wifi size={12} />
                      {backendStatus.connection}
                    </span>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Average Latency</div>
                    <div className="setting-description">Response time to Firebase</div>
                  </div>
                  <div className="setting-control">
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>
                      {Math.round(backendStatus.latency)}ms
                    </span>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Last Update</div>
                    <div className="setting-description">Most recent data timestamp</div>
                  </div>
                  <div className="setting-control">
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#666' }}>
                      {backendStatus.lastUpdate ? new Date(backendStatus.lastUpdate).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-box">
                <Database size={20} />
                <p className="info-text">
                  <strong>Firebase Configuration:</strong> Real-time database connection is active and monitoring {Object.keys(nodes).length} nodes.
                  All data is synced automatically. Check the Dashboard for live sensor readings.
                </p>
              </div>
            </>
          )}

          {/* BACKUP TAB */}
          {activeTab === 'backup' && (
            <>
              <div className="content-header">
                <h2 className="content-title">Backup & Restore</h2>
                <p className="content-subtitle">
                  Export and import system configuration, node settings, and preferences
                </p>
              </div>

              <div className="settings-grid">
                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Export Configuration</div>
                    <div className="setting-description">Download all settings as JSON file</div>
                  </div>
                  <div className="setting-control">
                    <button className="btn btn-dark" onClick={handleExportConfig}>
                      <Download size={16} />
                      Export
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <div className="setting-name">Import Configuration</div>
                    <div className="setting-description">Restore settings from JSON file</div>
                  </div>
                  <div className="setting-control">
                    <label htmlFor="import-file" style={{ margin: 0 }}>
                      <input
                        type="file"
                        id="import-file"
                        accept=".json"
                        onChange={handleImportConfig}
                        style={{ display: 'none' }}
                      />
                      <button
                        className="btn btn-outline"
                        onClick={() => document.getElementById('import-file').click()}
                      >
                        <Upload size={16} />
                        Import
                      </button>
                    </label>
                  </div>
                </div>
              </div>

              <div className="info-box">
                <Shield size={20} />
                <p className="info-text">
                  <strong>Backup includes:</strong> All node configurations, system settings, user preferences, and monitoring thresholds.
                  Import will overwrite current settings. Always keep a recent backup before making major changes.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;