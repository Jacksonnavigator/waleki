import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, AlertTriangle, XCircle, Settings } from 'lucide-react';
import notificationService from '../services/NotificationService';

const NotificationManager = () => {
  const [permission, setPermission] = useState('default');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState({});
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Initialize on mount
    const init = async () => {
      await notificationService.init();
      setPermission(notificationService.permission);
      updateStatus();
    };
    init();

    // Update status every 30 seconds
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = () => {
    setPermission(notificationService.permission);
    setIsMonitoring(notificationService.checkInterval !== null);
    setMonitoringStatus(notificationService.getMonitoringStatus());
  };

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      setIsMonitoring(true);
    }
  };

  const handleDisableNotifications = () => {
    notificationService.stopMonitoring();
    setIsMonitoring(false);
  };

  const getStatusColor = (isOnline) => {
    return isOnline ? '#16A34A' : '#DC2626';
  };

  const getStatusIcon = (isOnline) => {
    return isOnline ? <CheckCircle size={16} /> : <AlertTriangle size={16} />;
  };

  return (
    <>
      <style jsx>{`
        .notification-manager {
          position: relative;
        }

        .notification-button {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #FAFAFA;
          border: 1px solid #F0F0F0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #666;
        }

        .notification-button:hover {
          background: #F0F0F0;
          color: #00cf45bc;
          transform: translateY(-1px);
        }

        .notification-button.active {
          background: #00cf45bc;
          color: white;
          border-color: #00cf45bc;
        }

        .notification-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #DC2626;
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 12px;
          min-width: 20px;
          text-align: center;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }

        .status-dot {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #16A34A;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .status-dot.inactive {
          background: #999;
        }

        /* Panel */
        .notification-panel {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 380px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border: 1px solid #E8E8E8;
          padding: 20px;
          animation: slideDown 0.2s ease;
          z-index: 1000;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #F0F0F0;
        }

        .panel-title {
          font-size: 18px;
          font-weight: 700;
          color: #000;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #FAFAFA;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #666;
        }

        .close-btn:hover {
          background: #F0F0F0;
          color: #00cf45bc;
        }

        /* Permission Section */
        .permission-section {
          padding: 16px;
          background: #FAFAFA;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .permission-status {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .status-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .status-icon.granted {
          background: #DCFCE7;
          color: #16A34A;
        }

        .status-icon.denied {
          background: #FEE2E2;
          color: #DC2626;
        }

        .status-icon.default {
          background: #F0F0F0;
          color: #666;
        }

        .status-text h4 {
          font-size: 14px;
          font-weight: 700;
          color: #00cf45bc;
          margin-bottom: 2px;
        }

        .status-text p {
          font-size: 12px;
          color: #666;
        }

        .enable-btn {
          width: 100%;
          padding: 12px;
          background: #00cf45bc;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .enable-btn:hover {
          background: #333;
          transform: translateY(-1px);
        }

        .enable-btn.danger {
          background: #DC2626;
        }

        .enable-btn.danger:hover {
          background: #B91C1C;
        }

        /* Monitoring Status */
        .monitoring-section {
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 13px;
          font-weight: 700;
          color: #000;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .node-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .node-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #FAFAFA;
          border-radius: 10px;
          border: 1px solid #F0F0F0;
        }

        .node-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .node-name {
          font-size: 13px;
          font-weight: 600;
          color: #000;
        }

        .node-time {
          font-size: 11px;
          color: #999;
        }

        .node-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .node-status.online {
          background: #DCFCE7;
          color: #16A34A;
        }

        .node-status.offline {
          background: #FEE2E2;
          color: #DC2626;
        }

        .empty-state {
          text-align: center;
          padding: 32px 16px;
          color: #999;
        }

        .empty-state svg {
          margin: 0 auto 12px;
          opacity: 0.5;
        }

        .empty-state p {
          font-size: 13px;
        }

        /* Info Box */
        .info-box {
          padding: 12px;
          background: #F0F9FF;
          border: 1px solid #BAE6FD;
          border-radius: 10px;
          font-size: 12px;
          color: #0369A1;
          line-height: 1.6;
        }

        @media (max-width: 480px) {
          .notification-panel {
            width: calc(100vw - 32px);
            right: -100px;
          }
        }
      `}</style>

      <div className="notification-manager">
        {/* Notification Button */}
        <button
          className={`notification-button ${permission === 'granted' && isMonitoring ? 'active' : ''}`}
          onClick={() => setShowPanel(!showPanel)}
          title="Notifications"
        >
          {permission === 'granted' && isMonitoring ? (
            <Bell size={19} />
          ) : (
            <BellOff size={19} />
          )}
          
          {Object.keys(monitoringStatus).length > 0 && (
            <span className="notification-badge">
              {Object.values(monitoringStatus).filter(s => !s.isOnline).length}
            </span>
          )}

          {isMonitoring && (
            <span className={`status-dot ${isMonitoring ? '' : 'inactive'}`}></span>
          )}
        </button>

        {/* Notification Panel */}
        {showPanel && (
          <div className="notification-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Bell size={20} />
                Notifications
              </div>
              <button className="close-btn" onClick={() => setShowPanel(false)}>
                <XCircle size={18} />
              </button>
            </div>

            {/* Permission Section */}
            <div className="permission-section">
              <div className="permission-status">
                <div className={`status-icon ${permission}`}>
                  {permission === 'granted' ? (
                    <CheckCircle size={20} />
                  ) : permission === 'denied' ? (
                    <XCircle size={20} />
                  ) : (
                    <Bell size={20} />
                  )}
                </div>
                <div className="status-text">
                  <h4>
                    {permission === 'granted'
                      ? 'Notifications Enabled'
                      : permission === 'denied'
                      ? 'Notifications Blocked'
                      : 'Notifications Disabled'}
                  </h4>
                  <p>
                    {permission === 'granted'
                      ? 'Monitoring sensor data flow'
                      : permission === 'denied'
                      ? 'Enable in browser settings'
                      : 'Click below to enable alerts'}
                  </p>
                </div>
              </div>

              {permission === 'default' && (
                <button className="enable-btn" onClick={handleEnableNotifications}>
                  <Bell size={16} />
                  Enable Notifications
                </button>
              )}

              {permission === 'granted' && isMonitoring && (
                <button className="enable-btn danger" onClick={handleDisableNotifications}>
                  <BellOff size={16} />
                  Disable Monitoring
                </button>
              )}
            </div>

            {/* Monitoring Status */}
            {permission === 'granted' && Object.keys(monitoringStatus).length > 0 && (
              <div className="monitoring-section">
                <div className="section-title">Sensor Status</div>
                <div className="node-list">
                  {Object.entries(monitoringStatus).map(([nodeId, status]) => (
                    <div key={nodeId} className="node-item">
                      <div className="node-info">
                        <div>
                          <div className="node-name">{nodeId}</div>
                          <div className="node-time">
                            {status.minutesSinceUpdate}m ago
                          </div>
                        </div>
                      </div>
                      <div className={`node-status ${status.isOnline ? 'online' : 'offline'}`}>
                        {getStatusIcon(status.isOnline)}
                        {status.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {permission === 'granted' && Object.keys(monitoringStatus).length === 0 && (
              <div className="empty-state">
                <Settings size={32} />
                <p>No sensors being monitored yet.<br/>They will appear once data starts flowing.</p>
              </div>
            )}

            {/* Info Box */}
            {permission === 'granted' && (
              <div className="info-box">
                💡 You'll receive alerts when sensors stop sending data for 5+ minutes, and when they resume.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationManager;
