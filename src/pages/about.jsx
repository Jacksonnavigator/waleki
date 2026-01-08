// pages/About.jsx
import React from "react";
import Header from "../components/Navbar"; // your landing page header
import Footer from "../components/Footer"; // your landing page footer
import PageTransition from "../components/PageTransition";
import "../styles/about.css";

const About = () => {
  return (
    <PageTransition>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Waleki</h1>
          <p>
            At Waleki, we’re redefining how technology connects people and
            businesses in Tanzania. Our mission is to create innovative
            solutions that simplify lives and drive progress.
          </p>
          <div className="about-hero-buttons">
            <a href="/services" className="hero-btn primary">Our Services</a>
            <a href="/contact" className="hero-btn secondary">Contact Us</a>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision">
        <div className="mv-container">
          <div className="mv-card">
            <h2>Our Mission</h2>
            <p>
              To deliver innovative digital solutions that empower individuals,
              businesses, and communities to thrive in today’s connected world.
            </p>
          </div>
          <div className="mv-card">
            <h2>Our Vision</h2>
            <p>
              To become Tanzania’s leading technology partner, building
              sustainable solutions that inspire progress and unlock
              opportunities for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          <div className="value-card">
            <img src="./assets/innovation.jpg" alt="Innovation" />
            <h3>Innovation</h3>
            <p>We push boundaries to create cutting-edge solutions.</p>
          </div>
          <div className="value-card">
            <img src="./assets/integrity.jpg" alt="Integrity" />
            <h3>Integrity</h3>
            <p>We operate with transparency, honesty, and accountability.</p>
          </div>
          <div className="value-card">
            <img src="./assets/teamwork.jpg" alt="Teamwork" />
            <h3>Teamwork</h3>
            <p>Collaboration is at the heart of everything we do.</p>
          </div>
          <div className="value-card">
            <img src="../assets/excellence.jpg" alt="Excellence" />
            <h3>Excellence</h3>
            <p>We strive to deliver the highest quality in every project.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          <div className="team-card">
            <img src="./assets/team1.jpg" alt="Team Member" />
            <h3>John Doe</h3>
            <p>CEO & Founder</p>
          </div>
          <div className="team-card">
            <img src="./assets/team2.jpg" alt="Team Member" />
            <h3>Jane Smith</h3>
            <p>CTO</p>
          </div>
          <div className="team-card">
            <img src="./assets/team3.jpg" alt="Team Member" />
            <h3>Michael Lee</h3>
            <p>Head of Design</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </PageTransition>
  );
};

export default About;
