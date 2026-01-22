import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <Navbar />
      
      <main className="main-content">
        {children}
      </main>

      <Footer />

      {/* Floating Social Buttons - HORIZONTAL like NMB */}
      <div className="floating-social">
        <button className="social-btn fb">f</button>
        <button className="social-btn tw">𝕏</button>
        <button className="social-btn ig">📷</button>
        <button className="social-btn ln">in</button>
        <button className="join-us-btn">JOIN US</button>
      </div>

      {/* Settings Button */}
      <button className="settings-float">⚙️</button>

      {/* Chat Widget */}
      <div className="chat-widget">
        <div className="chat-avatar">
          <span style={{fontSize: '2rem'}}>👤</span>
        </div>
      </div>
    </div>
  );
};

export default Layout;
