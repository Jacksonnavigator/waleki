'use client';

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "./Sidebar";
import DashboardNavbar from "./DashboardNavbar";
import Chatbot from "./Chatbot";
import "../styles/DashboardLayout.css";

const DashboardLayout = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Protect dashboard routes - redirect if not authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      console.log("⚠️ No authenticated user, redirecting to login");
      navigate("/login");
    }
  }, [currentUser, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if user is not authenticated
  if (!currentUser) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      {/* Top Navbar - Full Width */}
      <div className="dashboard-navbar-container">
        <DashboardNavbar 
          mobileSidebarOpen={mobileSidebarOpen}
          onMobileSidebarToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
      </div>
      
      {/* Main Content Area with Sidebar */}
      <div className="dashboard-with-sidebar">
        {/* Modern Sidebar Navigation */}
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        
        {/* Page Content */}
        <main className={`dashboard-main with-sidebar-offset ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${mobileSidebarOpen ? 'mobile-sidebar-open' : 'mobile-sidebar-closed'}`}>
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Chatbot - Always visible on dashboard */}
      <Chatbot />
    </div>
  );
};

export default DashboardLayout;
