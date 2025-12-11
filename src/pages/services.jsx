// pages/Services.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/services.css";

const Services = () => {
  return (
    <>
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="services-hero">
        <div className="services-hero-content">
          <h1>Our Services</h1>
          <p>
            WALEKI provides smart IoT and technology solutions tailored to your needs. Explore our diverse services designed to help you manage resources, monitor data, and make informed decisions.
          </p>
        </div>
      </section>

      {/* Services Cards Section */}
      <section className="services-section">
        <h2>What We Offer</h2>
        <div className="services-grid">
          <div className="service-card">
            <img src="../assets/service1.jpg" alt="Service 1" />
            <h3>Real-Time Monitoring</h3>
            <p>Track water levels and resource usage instantly with our smart sensors.</p>
          </div>
          <div className="service-card">
            <img src="../assets/service2.jpg" alt="Service 2" />
            <h3>Data Analytics</h3>
            <p>Get actionable insights with detailed reports and analytics dashboards.</p>
          </div>
          <div className="service-card">
            <img src="../assets/service3.jpg" alt="Service 3" />
            <h3>Mobile Control</h3>
            <p>Control your systems anywhere, anytime, with our mobile app.</p>
          </div>
          <div className="service-card">
            <img src="../assets/service4.jpg" alt="Service 4" />
            <h3>Consulting & Support</h3>
            <p>Receive expert guidance and support to optimize your resources.</p>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="services-cta">
        <h2>Ready to get started?</h2>
        <p>Contact us today and see how WALEKI can transform your operations.</p>
        <a href="/contact" className="hero-btn primary">Contact Us</a>
      </section>

      <Footer />
    </>
  );
};

export default Services;
