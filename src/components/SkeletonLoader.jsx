import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div className="skeleton-line" style={{ width: '60%', height: '20px', marginBottom: '16px' }} />
                        <div className="skeleton-line" style={{ width: '100%', height: '40px', marginBottom: '12px' }} />
                        <div className="skeleton-line" style={{ width: '80%', height: '16px', marginBottom: '8px' }} />
                        <div className="skeleton-line" style={{ width: '90%', height: '16px' }} />
                    </div>
                );

            case 'stat':
                return (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div className="skeleton-circle" style={{ width: '40px', height: '40px', marginBottom: '12px' }} />
                        <div className="skeleton-line" style={{ width: '50%', height: '14px', marginBottom: '8px' }} />
                        <div className="skeleton-line" style={{ width: '70%', height: '24px' }} />
                    </div>
                );

            case 'table':
                return (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                                <div className="skeleton-line" style={{ width: '20%', height: '16px' }} />
                                <div className="skeleton-line" style={{ width: '30%', height: '16px' }} />
                                <div className="skeleton-line" style={{ width: '25%', height: '16px' }} />
                                <div className="skeleton-line" style={{ width: '25%', height: '16px' }} />
                            </div>
                        ))}
                    </div>
                );

            default:
                return (
                    <div className="skeleton-line" style={{ width: '100%', height: '20px' }} />
                );
        }
    };

    return (
        <>
            <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .skeleton-line,
        .skeleton-circle {
          background: linear-gradient(
            90deg,
            #f1f5f9 0%,
            #e2e8f0 50%,
            #f1f5f9 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
          border-radius: 8px;
        }

        .skeleton-circle {
          border-radius: 50%;
        }
      `}</style>

            {[...Array(count)].map((_, i) => (
                <div key={i} style={{ marginBottom: count > 1 ? '16px' : '0' }}>
                    {renderSkeleton()}
                </div>
            ))}
        </>
    );
};

export default SkeletonLoader;
