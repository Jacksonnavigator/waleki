import React, { useEffect, useState } from 'react';
import walekiLogo from '../assets/waleki.png';

const SplashScreen = ({ onComplete, minDisplayTime = 1200, pageName = 'Loading' }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onComplete]);

  return (
    <div className="splash-screen-component" style={{ opacity: isVisible ? 1 : 0 }}>
      <style jsx>{`
        .splash-screen-component {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
        }

        .splash-screen-component::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.02) 0%, transparent 50%);
          animation: bgPulse 8s ease-in-out infinite;
        }

        @keyframes bgPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .splash-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }

        .logo-badge {
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          animation: logoEntry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }

        .logo-badge::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          border-radius: 28px;
          opacity: 0;
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes logoEntry {
          0% {
            transform: scale(0.3) rotate(-10deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.1) rotate(2deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        .logo-image {
          width: 72px;
          height: 72px;
          object-fit: contain;
          animation: logoFloat 3s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .brand-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: textEntry 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
        }

        @keyframes textEntry {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .brand-title {
          font-size: 48px;
          font-weight: 700;
          color: white;
          letter-spacing: -1px;
          margin: 0;
        }

        .brand-subtitle {
          font-size: 16px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.5px;
        }

        .page-indicator {
          margin-top: 16px;
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          animation: pageIndicatorEntry 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s backwards;
        }

        @keyframes pageIndicatorEntry {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .page-name {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.5px;
        }

        .loading-section {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          animation: loadingEntry 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s backwards;
        }

        .progress-bar-container {
          width: 240px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.8), rgba(255,255,255,0.3));
          background-size: 200% 100%;
          border-radius: 2px;
          animation: progressFlow 1.5s ease-in-out infinite;
        }

        @keyframes progressFlow {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .loading-dots-container {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .loading-text {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 0.5px;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: dotPulse 1.4s ease-in-out infinite;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes dotPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @media (max-width: 640px) {
          .logo-badge {
            width: 100px;
            height: 100px;
            border-radius: 24px;
          }

          .logo-image {
            width: 60px;
            height: 60px;
          }

          .brand-title {
            font-size: 36px;
          }

          .brand-subtitle {
            font-size: 14px;
          }

          .progress-bar-container {
            width: 200px;
          }

          .page-name {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="splash-content">
        {/* Logo Badge */}
        <div className="logo-badge">
          <img 
            src={walekiLogo} 
            alt="Waleki Logo" 
            className="logo-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Brand Text */}
        <div className="brand-section">
          <h1 className="brand-title">Waleki</h1>
          <p className="brand-subtitle">Water Well Management</p>
          
          {/* Page Indicator */}
          {pageName && (
            <div className="page-indicator">
              <span className="page-name">{pageName}</span>
            </div>
          )}
        </div>

        {/* Loading Animation */}
        <div className="loading-section">
          <div className="progress-bar-container">
            <div className="progress-bar"></div>
          </div>
          <div className="loading-dots-container">
            <span className="loading-text">Loading</span>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;