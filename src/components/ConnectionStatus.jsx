import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';

const ConnectionStatus = ({ isConnected, lastUpdate }) => {
    const getTimeSince = (timestamp) => {
        if (!timestamp) return 'Never';
        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now - then) / 1000);

        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 20px',
            background: isConnected
                ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
                : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            borderRadius: '12px',
            border: `2px solid ${isConnected ? '#86efac' : '#fca5a5'}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
            <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .status-dot {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

            {/* Connection Icon */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: isConnected ? '#16a34a' : '#dc2626'
            }}>
                {isConnected ? <Wifi size={18} /> : <WifiOff size={18} />}
                <span className={isConnected ? 'status-dot' : ''} style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isConnected ? '#16a34a' : '#dc2626'
                }} />
            </div>

            {/* Status Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isConnected ? '#166534' : '#991b1b'
                }}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {lastUpdate && (
                    <span style={{
                        fontSize: '11px',
                        color: isConnected ? '#15803d' : '#b91c1c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <Clock size={11} />
                        Updated {getTimeSince(lastUpdate)}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ConnectionStatus;
