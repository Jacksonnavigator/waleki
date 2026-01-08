import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';

const AlertCenter = ({ alerts = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        setUnreadCount(alerts.filter(a => !a.read).length);
    }, [alerts]);

    const getIcon = (type) => {
        switch (type) {
            case 'critical': return <AlertTriangle size={18} />;
            case 'warning': return <AlertTriangle size={18} />;
            case 'info': return <Info size={18} />;
            case 'success': return <CheckCircle size={18} />;
            default: return <Bell size={18} />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'critical': return { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' };
            case 'warning': return { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' };
            case 'info': return { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' };
            case 'success': return { bg: '#f0fdf4', border: '#86efac', text: '#166534' };
            default: return { bg: '#f8fafc', border: '#cbd5e1', text: '#475569' };
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div style={{ position: 'relative' }}>
            <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .alert-badge {
          animation: bounce 2s ease-in-out infinite;
        }
      `}</style>

            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    padding: '10px',
                    background: isOpen ? 'linear-gradient(135deg, #0369a1, #0284c7)' : 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: isOpen ? 'white' : '#64748b'
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="alert-badge" style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px 6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        minWidth: '20px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Alerts Panel */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    width: '420px',
                    maxHeight: '500px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    animation: 'slideIn 0.3s ease',
                    zIndex: 1000
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                                Notifications
                            </h3>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                                {alerts.length} total • {unreadCount} unread
                            </p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: '#64748b'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Alerts List */}
                    <div style={{
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        {alerts.length === 0 ? (
                            <div style={{
                                padding: '40px',
                                textAlign: 'center',
                                color: '#94a3b8'
                            }}>
                                <Bell size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                <p style={{ fontSize: '14px', fontWeight: 500 }}>No notifications</p>
                            </div>
                        ) : (
                            alerts.map((alert, index) => {
                                const colors = getColor(alert.type);
                                return (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '16px 20px',
                                            borderBottom: index < alerts.length - 1 ? '1px solid #f1f5f9' : 'none',
                                            background: alert.read ? 'white' : '#f8fafc',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = alert.read ? 'white' : '#f8fafc'}
                                    >
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                            <div style={{
                                                padding: '8px',
                                                background: colors.bg,
                                                borderRadius: '10px',
                                                color: colors.text,
                                                flexShrink: 0
                                            }}>
                                                {getIcon(alert.type)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: '#0f172a',
                                                    marginBottom: '4px'
                                                }}>
                                                    {alert.title}
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: '#64748b',
                                                    marginBottom: '8px',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {alert.message}
                                                </div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#94a3b8',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Clock size={11} />
                                                    {formatTime(alert.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertCenter;
