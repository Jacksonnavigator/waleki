'use client';

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Droplets, LayoutDashboard, Activity, Settings, LogOut, 
  User, Menu, X, ChevronDown, Bell, Search, BarChart3,
  Gauge, Clock, Zap, HelpCircle
} from "lucide-react";

// Import your logo here
import WalekiLogo from "../assets/waleki.png";
import NotificationManager from '../components/NotificationManager';

const DashboardNavbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Navigation links moved to sidebar
  const navLinks = [];

  const isActivePath = (path) => location.pathname === path;

  const getUserDisplayName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: all var(--transition-normal);
          font-family: var(--font-primary);
          height: var(--size-navbar-height);
        }

        .navbar-scrolled {
          box-shadow: var(--shadow-md);
          border-bottom-color: transparent;
        }

        .navbar-container {
          max-width: 100%;
          margin: 0;
          padding: 0 var(--spacing-xl);
          height: var(--size-navbar-height);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-2xl);
          text-align: left;
          width: 100%;
        }

        /* Left section - Logo */
        .navbar-left {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        /* Right section - All other elements */
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
          flex-shrink: 0;
        }

        /* Logo */
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          text-decoration: none;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .logo-text h1 {
          font-size: 20px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.5px;
        }

        .logo-text p {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-top: 2px;
        }

        /* Nav Links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          justify-content: center;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all var(--transition-fast);
          letter-spacing: -0.2px;
          position: relative;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateY(-1px);
        }

        .nav-link-active {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-weight: 700;
        }

        .nav-link-active:hover {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }

        /* Time Display */
        .time-display {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all var(--transition-fast);
          cursor: default;
        }
        
        .time-display:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .time-icon {
          color: rgba(255, 255, 255, 0.7);
        }

        .time-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .time-value {
          font-size: 13px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.2px;
        }

        .time-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Icon Button */
        .icon-btn {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          color: rgba(255, 255, 255, 0.7);
          padding: var(--spacing-md);
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          transform: translateY(-1px);
        }

        .notification-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: var(--color-error);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: var(--radius-md);
          min-width: 20px;
          text-align: center;
          border: 2px solid var(--color-bg-secondary);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        /* Profile */
        .profile-menu {
          position: relative;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-decoration: none;
        }

        .profile-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2px solid var(--color-border);
          box-shadow: 0 2px 8px rgba(0, 188, 212, 0.15);
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-avatar span {
          color: var(--color-primary);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          align-items: flex-start;
        }

        .profile-name {
          font-size: 14px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.2px;
        }

        .profile-role {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .chevron {
          color: #999;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }

        .chevron-up {
          transform: rotate(180deg);
        }

        /* Dropdown */
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 280px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border: 1px solid #E8E8E8;
          padding: 12px;
          animation: slideDown 0.2s ease;
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

        .dropdown-header {
          padding: 16px;
          border-bottom: 1px solid #F0F0F0;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dropdown-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #00cf45bc 0%, #333 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .dropdown-info {
          flex: 1;
          min-width: 0;
        }

        .dropdown-name {
          font-size: 16px;
          font-weight: 700;
          color: #000;
          margin-bottom: 4px;
          letter-spacing: -0.3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-email {
          font-size: 12px;
          color: #999;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-section {
          margin-bottom: 8px;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .dropdown-item:hover {
          background: #FAFAFA;
          color: #00cf45bc;
          transform: translateX(2px);
        }

        .dropdown-divider {
          height: 1px;
          background: #F0F0F0;
          margin: 8px 0;
        }

        .logout-item {
          color: #DC2626;
        }

        .logout-item:hover {
          background: #FEF2F2;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #FAFAFA;
          border: 1px solid #F0F0F0;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          transition: all 0.2s ease;
        }

        .mobile-menu-btn:hover {
          background: #F0F0F0;
          color: #00cf45bc;
        }

        /* Mobile Menu */
        .mobile-menu {
          display: none;
          background: white;
          border-top: 1px solid #E8E8E8;
          padding: 20px 16px;
          animation: slideDown 0.3s ease;
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          color: #666;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .mobile-nav-link:hover {
          background: #FAFAFA;
          color: #00cf45bc;
        }

        .mobile-nav-link-active {
          background: #00cf45bc;
          color: white;
        }

        .mobile-divider {
          height: 1px;
          background: #F0F0F0;
          margin: 20px 0;
        }

        .mobile-user-section {
          padding: 16px;
          background: #FAFAFA;
          border-radius: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #00cf45bc 0%, #333 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: 700;
        }

        .mobile-user-info {
          flex: 1;
        }

        .mobile-user-name {
          font-size: 15px;
          font-weight: 700;
          color: #00cf45bc;
          margin-bottom: 2px;
        }

        .mobile-user-email {
          font-size: 12px;
          color: #999;
        }

        .mobile-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mobile-action {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 12px;
          background: transparent;
          border: none;
          font-size: 15px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .mobile-action:hover {
          background: #FAFAFA;
          color: #00cf45bc;
        }

        .mobile-action.logout {
          color: #DC2626;
        }

        .mobile-action.logout:hover {
          background: #FEF2F2;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .time-display {
            display: none;
          }
          
          .navbar-container {
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 16px;
            height: 68px;
            gap: 12px;
          }

          .nav-links {
            display: none;
          }

          .icon-btn {
            display: none;
          }

          .profile-info {
            display: none;
          }

          .chevron {
            display: none;
          }

          .profile-btn {
            padding: 6px;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .mobile-menu {
            display: block;
          }

          .logo-text h1 {
            font-size: 18px;
          }

          .logo-text p {
            display: none;
          }

          .logo-icon {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>

      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Left Section - Logo */}
          <div className="navbar-left">
            <Link to="/dashboard" className="logo">
              <div className="logo-icon">
                <img src={WalekiLogo || "/placeholder.svg"} alt="Waleki" />
              </div>
              <div className="logo-text">
                <h1>Waleki</h1>
                <p>Water Monitoring</p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links - Removed (moved to sidebar) */}

          {/* Right Section */}
          <div className="navbar-right">
            {/* Time Display */}
            <div className="time-display">
              <Clock size={16} className="time-icon" />
              <div className="time-text">
                <div className="time-value">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </div>
                <div className="time-label">
                  {currentTime.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <button className="icon-btn" title="Notifications">
              <Bell size={19} />
               <NotificationManager />
            </button>

            {/* Profile Menu */}
            <div className="profile-menu" ref={profileMenuRef}>
              <button
                className="profile-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <div className="profile-avatar">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL || "/placeholder.svg"} alt="Profile" />
                  ) : (
                    <span>{getUserInitials()}</span>
                  )}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{getUserDisplayName()}</div>
                  <div className="profile-role">Admin</div>
                </div>
                <ChevronDown size={16} className={`chevron ${isProfileMenuOpen ? 'chevron-up' : ''}`} />
              </button>

              {isProfileMenuOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {getUserInitials()}
                    </div>
                    <div className="dropdown-info">
                      <div className="dropdown-name">{getUserDisplayName()}</div>
                      <div className="dropdown-email">{currentUser?.email}</div>
                    </div>
                  </div>
                  
                  <div className="dropdown-section">
                    <button className="dropdown-item" onClick={() => { navigate('/profile'); setIsProfileMenuOpen(false); }}>
                      <User size={18} />
                      <span>My Profile</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { navigate('/settings'); setIsProfileMenuOpen(false); }}>
                      <Settings size={18} />
                      <span>Settings</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { navigate('/need-help'); setIsProfileMenuOpen(false); }}>
                      <HelpCircle size={18} />
                      <span>Help Center</span>
                    </button>
                  </div>

                  <div className="dropdown-divider"></div>

                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-user-section">
              <div className="mobile-user-avatar">
                {getUserInitials()}
              </div>
              <div className="mobile-user-info">
                <div className="mobile-user-name">{getUserDisplayName()}</div>
                <div className="mobile-user-email">{currentUser?.email}</div>
              </div>
            </div>

            {/* Mobile Nav Links - Removed (moved to sidebar) */}
            
            <div className="mobile-divider"></div>
            
            <div className="mobile-actions">
              <button className="mobile-action" onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}>
                <User size={18} />
                <span>My Profile</span>
              </button>
              <button className="mobile-action" onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false); }}>
                <Settings size={18} />
                <span>Settings</span>
              </button>
              <button className="mobile-action logout" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default DashboardNavbar;
