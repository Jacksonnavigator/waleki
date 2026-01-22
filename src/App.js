import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Layout from './components/layout';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import Monitor from './pages/dashboard/monitor';
import Health from './pages/dashboard/health';
import Analytics from './pages/dashboard/Analytics';
import Settings from './pages/dashboard/Settings';
import Profile from './pages/dashboard/Profile';
import HelpPage from './pages/dashboard/Help';
import RemoteDesktop from './pages/remote-desktop/RemoteDesktop';
import PiRemoteDesktop from './pages/pi-remote-desktop/PiRemoteDesktop';
import About from './pages/about';
import Services from './pages/services';
import Contacts from './pages/contacts';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SplashScreen from './components/SplashScreen';
import NotFound from './pages/NotFound';
import './App.css';

// Wrapper component to handle splash screen on route changes
function AppContent() {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(false);
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Show splash screen on route change (except for initial load handled by index.html)
    if (!isInitialLoad && location.pathname !== currentPath) {
      setShowSplash(true);
      setCurrentPath(location.pathname);
    } else {
      setIsInitialLoad(false);
    }
  }, [location.pathname, currentPath, isInitialLoad]);

  // Update document title based on current route
  useEffect(() => {
    const pageName = getPageName(location.pathname);
    document.title = pageName !== 'Loading' ? `Waleki | ${pageName}` : 'Waleki - Water Well Management';
  }, [location.pathname]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Routes that should show splash screen
  const splashRoutes = ['/dashboard', '/monitor', '/login', '/register'];
  const shouldShowSplash = showSplash && splashRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowSplash && (
        <SplashScreen 
          onComplete={handleSplashComplete} 
          minDisplayTime={1200} 
          pageName={getPageName(location.pathname)}
        />
      )}
      
      <div style={{ opacity: shouldShowSplash ? 0 : 1, transition: 'opacity 0.3s ease' }}>
        <Routes>
          {/* Redirect root path to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Public Pages - Use Layout (Landing page layout) */}
          <Route path="/home" element={<LandingPage />} />
          <Route path="/about" element={
            <Layout>
              <About />
            </Layout>
          } />
          <Route path="/services" element={
            <Layout>
              <Services />
            </Layout>
          } />
          <Route path="/contact" element={
            <Layout>
              <Contacts />
            </Layout>
          } />
          
          {/* Auth Pages - No Layout (standalone design) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Dashboard Pages - Use DashboardLayout */}
          <Route path="/dashboard" element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          } />

          <Route path="/monitor" element={
            <DashboardLayout>
              <Monitor />
            </DashboardLayout>
          } />

          <Route path="/analytics" element={
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          } />

          <Route path="/health" element={
            <DashboardLayout>
              <Health />
            </DashboardLayout>
          } />

          <Route path="/settings" element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          } />

          <Route path="/profile" element={
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          } />

          <Route path="/need-help" element={
            <DashboardLayout>
              <HelpPage />
            </DashboardLayout>
          } />
          {/* Remote Desktop Page (admin only) */}
          <Route path="/remote-desktop" element={
            <DashboardLayout>
              <RemoteDesktop />
            </DashboardLayout>
          } />
          {/* Pi Remote Desktop Page (admin only) */}+
          <Route path="/pi-remote-desktop" element={
            <DashboardLayout>
              <PiRemoteDesktop />
            </DashboardLayout>
          } />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

// Helper function to get page name for splash screen and document title
function getPageName(pathname) {
  const names = {
    '/': 'Home',
    '/home': 'Home',
    '/about': 'About Us',
    '/services': 'Services',
    '/contact': 'Contact',
    '/login': 'Sign In',
    '/register': 'Sign Up',
    '/dashboard': 'Dashboard',
    '/monitor': 'Monitor',
    '/analytics': 'Analytics',
    '/health': 'Health',
    '/settings': 'Settings',
    '/profile': 'Profile',
    '/need-help': 'Help',
    '/help': 'Help'
  };
  return names[pathname] || 'Page Not Found';
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider> 
  );
}

export default App;
