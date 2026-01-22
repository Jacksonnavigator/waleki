import React from "react";
import { Link } from "react-router-dom";
import { Droplets, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from "lucide-react";
import "../styles/DashboardFooter.css";

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dashboard-footer">
      <div className="footer-container">
        {/* Company Info */}
        <div className="footer-section">
          <div className="footer-logo">
            <Droplets size={32} />
            <h3>Waleki</h3>
          </div>
          <p className="footer-description">
            Advanced water well monitoring system using LoRa technology for real-time data collection and analysis.
          </p>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <Twitter size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <Linkedin size={20} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <Github size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/monitor">Monitor</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            <li><Link to="/help">Help Center</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-section">
          <h4 className="footer-title">Resources</h4>
          <ul className="footer-links">
            <li><Link to="/documentation">Documentation</Link></li>
            <li><Link to="/api">API Reference</Link></li>
            <li><Link to="/support">Support</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4 className="footer-title">Contact Us</h4>
          <ul className="footer-contact">
            <li>
              <Mail size={16} />
              <span>support@waleki.com</span>
            </li>
            <li>
              <Phone size={16} />
              <span>+255 123 456 789</span>
            </li>
            <li>
              <MapPin size={16} />
              <span>Dar es Salaam, Tanzania</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; {currentYear} Waleki. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span className="divider">•</span>
            <Link to="/terms">Terms of Service</Link>
            <span className="divider">•</span>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
