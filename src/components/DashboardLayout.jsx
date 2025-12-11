import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DashboardNavbar from "./DashboardNavbar";
import Chatbot from "./Chatbot";
import "../styles/DashboardLayout.css";

const DashboardLayout = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

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
      {/* Sticky Navbar */}
      <div className="dashboard-navbar-container">
        <DashboardNavbar />
      </div>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {children}
        </div>
      </main>

      {/* Floating Chatbot - Always visible on dashboard */}
      <Chatbot />

      {/* Footer */}
      <div className="dashboard-footer-container">
      </div>
    </div>
  );
};

export default DashboardLayout;