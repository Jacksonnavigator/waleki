import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import "../styles/landing.css";
import "../styles/navbar.css";
import "../styles/footer.css";
import PageTransition from "../components/PageTransition";

import aboutImage from "../assets/about-well.png";
import monitorImage from "../assets/monitor-dashboard.jpg";
import communityLogo from "../assets/community-logo.png";

const LandingPage = () => {
  return (
    <PageTransition>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Water Monitoring for a Sustainable Future</h1>
          <p>
            WALEKI provides smart IoT-based water monitoring solutions that help
            businesses, farms, and communities manage water resources efficiently.
            Gain control, real-time access, and optimize resources instantly.
          </p>
          <div className="hero-buttons">
            {/* Navigate to Register */}
            <Link to="/register" className="hero-btn primary">
              GET STARTED
            </Link>

            {/* Navigate to About */}
            <Link to="/about" className="hero-btn secondary">
              LEARN MORE
            </Link>
          </div>

          {/* Hero Stats */}
          <div className="hero-stats">
            <div className="stat">
              <h3>+10K</h3>
              <p>Sensors Deployed</p>
            </div>
            <div className="stat">
              <h3>24/7</h3>
              <p>Real-Time Monitoring</p>
            </div>
            <div className="stat">
              <h3>+100K</h3>
              <p>Communities Served</p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="scroll-indicator">
            <span>↓</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-image">
            <div className="image-mask">
              <img src={aboutImage} alt="About Waleki" />
            </div>
          </div>
          <div className="about-text">
            <h2>About</h2>
            <p>
              WALEKI provides smart IoT-based water monitoring solutions that
              help businesses, farms, and communities manage water resources
              efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Ways to Monitor Section */}
      <section className="monitor-section">
        <div className="monitor-container">
          <h2>Ways to Monitor</h2>
          <div className="monitor-content">
            <div className="monitor-list">
              <ul>
                <li>
                  Real-Time Monitoring <span className="arrow">→</span> Track
                  water levels instantly
                </li>
                <li>
                  Mobile App <span className="arrow">→</span> Control anytime,
                  anywhere
                </li>
                <li>
                  Dashboard <span className="arrow">→</span> Centralized reporting
                </li>
                <li>
                  Reports & Analytics <span className="arrow">→</span> Data-driven decisions
                </li>
              </ul>
            </div>
            <div className="monitor-image">
              <div className="monitor-mask">
                <img src={monitorImage} alt="Monitoring Dashboard" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Core Features</h2>
        <div className="features-container">
          <div className="feature-card">
            <i className="fas fa-tint"></i>
            <h3>Real-Time Monitoring</h3>
            <p>Track water levels instantly and prevent wastage.</p>
            <div className="feature-image">
              <img src={require("../assets/feature1.jpg")} alt="Feature 1" />
            </div>
          </div>

          <div className="feature-card">
            <i className="fas fa-mobile-alt"></i>
            <h3>Mobile App</h3>
            <p>Control anytime, anywhere from your smartphone.</p>
            <div className="feature-image">
              <img src={require("../assets/feature2.jpg")} alt="Feature 2" />
            </div>
          </div>

          <div className="feature-card">
            <i className="fas fa-chart-line"></i>
            <h3>Dashboard</h3>
            <p>Centralized reporting and analytics for smarter decisions.</p>
            <div className="feature-image">
              <img src={require("../assets/feature3.jpg")} alt="Feature 3" />
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action / Demo Section */}
      <section className="cta-section">
        <h2>Ready to Monitor Your Water Systems?</h2>
        <p>Get started today or request a demo to see WALEKI in action.</p>
        <div className="cta-buttons">
          <Link to="/register" className="hero-btn primary">
            Get Started
          </Link>

          <Link to="/about" className="hero-btn secondary">
            Request Demo
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Our Communities Say</h2>
        <div className="testimonials-container">
          <div className="testimonial-card">
            <p>
              "WALEKI helped our farm manage water resources efficiently. Highly
              recommended!"
            </p>
            <h4>- John Doe, Farmer</h4>
          </div>
          <div className="testimonial-card">
            <p>
              "The mobile app makes monitoring so easy. Real-time alerts are
              lifesaving."
            </p>
            <h4>- Jane Smith, Community Manager</h4>
          </div>
          <div className="testimonial-card">
            <p>
              "Reliable and easy-to-use solution for water monitoring. Fantastic
              support team."
            </p>
            <h4>- Ahmed Ali, Water Utility</h4>
          </div>
        </div>
      </section>

      {/* Trusted Communities Section */}
      <section className="trusted-section">
        <h2>Trusted by +100K Communities</h2>
        <div className="trusted-logos">
          <img src={communityLogo} alt="Community Logo" />
          <img src={communityLogo} alt="Community Logo" />
          <img src={communityLogo} alt="Community Logo" />
          <img src={communityLogo} alt="Community Logo" />
        </div>
      </section>

      <Footer />
    </PageTransition>
  );
};

export default LandingPage;
