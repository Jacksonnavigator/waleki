import React from 'react';
import { AlertTriangle, Info, XCircle, CheckCircle } from 'lucide-react';

const ValidationAlert = ({ type = 'warning', message, action, onClose }) => {
    const getIcon = () => {
        switch (type) {
            case 'error': return <XCircle size={20} />;
            case 'success': return <CheckCircle size={20} />;
            case 'info': return <Info size={20} />;
            default: return <AlertTriangle size={20} />;
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'error':
                return {
                    bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                    border: '#fca5a5',
                    text: '#991b1b',
                    icon: '#dc2626'
                };
            case 'success':
                return {
                    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: '#86efac',
                    text: '#166534',
                    icon: '#16a34a'
                };
            case 'info':
                return {
                    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    border: '#93c5fd',
                    text: '#1e40af',
                    icon: '#3b82f6'
                };
            default: // warning
                return {
                    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '#fcd34d',
                    text: '#92400e',
                    icon: '#d97706'
                };
        }
    };

    const styles = getStyles();

    return (
        <div style={{
            background: styles.bg,
            border: `2px solid ${styles.border}`,
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            animation: 'slideDown 0.3s ease'
        }}>
            <style jsx>{`
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
      `}</style>

            <div style={{ color: styles.icon, flexShrink: 0, marginTop: '2px' }}>
                {getIcon()}
            </div>

            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: styles.text,
                    marginBottom: action ? '6px' : '0',
                    lineHeight: 1.5
                }}>
                    {message}
                </div>

                {action && (
                    <div style={{
                        fontSize: '13px',
                        color: styles.text,
                        opacity: 0.8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <span style={{ fontWeight: 600 }}>→</span>
                        {action}
                    </div>
                )}
            </div>

            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: styles.text,
                        opacity: 0.5,
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.background = 'rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.opacity = '0.5';
                        e.target.style.background = 'transparent';
                    }}
                    aria-label="Close alert"
                >
                    <XCircle size={16} />
                </button>
            )}
        </div>
    );
};

export default ValidationAlert;
