'use client';

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronRight, Menu, LayoutDashboard, Activity, BarChart3, 
  Gauge, AlertCircle, Users, Settings, Zap, HelpCircle,
  TrendingUp, MapPin
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  const navItems = [
    {
      section: 'MAIN',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/monitor', label: 'Live Monitoring', icon: <Activity size={20} /> },
      ]
    },
    {
      section: 'INSIGHTS',
      items: [
        { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
        { path: '/health', label: 'System Health', icon: <Gauge size={20} /> },
        { path: '/pi-remote-desktop', label: 'Pi Remote Desktop', icon: <Zap size={20} /> },
        { path: '#', label: 'Alerts & Events', icon: <AlertCircle size={20} /> },
      ]
    },
    {
      section: 'MANAGEMENT',
      items: [
        { path: '#', label: 'Map View', icon: <MapPin size={20} /> },
        { path: '#', label: 'Sustainability', icon: <TrendingUp size={20} /> },
        { path: '#', label: 'Users & Roles', icon: <Users size={20} /> },
      ]
    },
    {
      section: 'SETTINGS',
      items: [
        { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
        { path: '/need-help', label: 'Help Center', icon: <HelpCircle size={20} /> },
      ]
    }
  ];

  const isActivePath = (path) => {
    if (path === '#') return false;
    return location.pathname === path;
  };

  const AlertBadge = ({ count }) => {
    if (!count || count <= 0) return null;
    return <span className="alert-badge">{count > 99 ? '99+' : count}</span>;
  };

  return (
    <>
      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: var(--size-navbar-height);
          height: calc(100vh - var(--size-navbar-height));
          width: var(--size-sidebar);
          background: linear-gradient(180deg,rgb(0, 11, 97) 0%, rgba(0, 0, 224, 1) 35%,  rgb(77, 145, 255)  100%);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: width var(--transition-normal);
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .sidebar.collapsed {
          width: var(--size-sidebar-collapsed);
        }

        .sidebar-header {
          padding: var(--spacing-md);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          min-height: 60px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          text-decoration: none;
          color: white;
          flex: 1;
          min-width: 0;
          transition: opacity var(--transition-fast);
        }

        .sidebar.collapsed .sidebar-logo {
          justify-content: center;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: rgba(0, 188, 212, 0.2);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(0, 188, 212, 0.3);
        }

        .logo-icon img {
          width: 24px;
          height: 24px;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }

        .logo-text {
          flex: 1;
          overflow: hidden;
          transition: opacity var(--transition-fast);
        }

        .sidebar.collapsed .logo-text {
          display: none;
        }

        .logo-text h2 {
          font-size: 18px;
          margin: 0;
          color: white;
          white-space: nowrap;
        }

        .logo-text p {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          margin: 2px 0 0 0;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .toggle-btn {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: var(--radius-md);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .toggle-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-lg) 0;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .nav-section {
          padding: 0 var(--spacing-sm);
        }

        .nav-section-title {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: opacity var(--transition-fast);
        }

        .sidebar.collapsed .nav-section-title {
          opacity: 0;
          height: 0;
          padding: 0;
          margin: 0;
        }

        .nav-items {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          cursor: pointer;
          position: relative;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: var(--color-accent);
          color: var(--color-primary);
          font-weight: 600;
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: white;
          border-radius: 0 2px 2px 0;
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-label {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: opacity var(--transition-fast);
        }

        .sidebar.collapsed .nav-label {
          opacity: 0;
          width: 0;
        }

        .alert-badge {
          background: var(--color-error);
          color: white;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          margin-left: auto;
          flex-shrink: 0;
          min-width: 20px;
          text-align: center;
        }

        .sidebar.collapsed .alert-badge {
          position: absolute;
          right: -8px;
          top: 4px;
          width: 20px;
          height: 20px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-footer {
          padding: var(--spacing-lg) var(--spacing-md);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(16, 185, 129, 0.1);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--color-success);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--color-success);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-text {
          flex: 1;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sidebar.collapsed .status-indicator {
          padding: 0;
          background: transparent;
          border: none;
          justify-content: center;
        }

        .sidebar.collapsed .status-dot {
          width: 10px;
          height: 10px;
        }

        .sidebar.collapsed .status-text {
          display: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Tooltip for collapsed mode */
        .tooltip {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-sm);
          font-size: 12px;
          white-space: nowrap;
          margin-left: var(--spacing-md);
          opacity: 0;
          pointer-events: none;
          transition: opacity var(--transition-fast);
          z-index: 1001;
        }

        .sidebar.collapsed .nav-item:hover .tooltip {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: var(--size-navbar-height);
            height: calc(100vh - var(--size-navbar-height));
            width: var(--size-sidebar-collapsed);
            transition: width var(--transition-normal);
            z-index: 10;
          }

          .sidebar:not(.collapsed) {
            position: absolute;
            width: var(--size-sidebar);
            z-index: 1000;
          }
        }
      `}</style>

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="toggle-btn"
            onClick={onToggle}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <div className="sidebar-content">
          {navItems.map((section) => (
            <div key={section.section} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              <div className="nav-items">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
                  >
                    <div className="nav-icon">{item.icon}</div>
                    <span className="nav-label">{item.label}</span>
                    {item.label === 'Alerts & Events' && <AlertBadge count={3} />}
                    {!isCollapsed && <div className="tooltip">{item.label}</div>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <div className="status-text">System Healthy</div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
