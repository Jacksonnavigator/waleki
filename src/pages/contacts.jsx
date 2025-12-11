// pages/Contacts.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/contacts.css";

const Contacts = () => {
  return (
    <>
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="contacts-hero">
        <div className="contacts-hero-content">
          <h1>Contact Us</h1>
          <p>
            Have questions or need assistance? Reach out to the Waleki team and
            we’ll get back to you promptly.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="form-container">
          <h2>Send Us a Message</h2>
          <form>
            <input type="text" name="name" placeholder="Your Name" required />
            <input type="email" name="email" placeholder="Your Email" required />
            <input type="text" name="subject" placeholder="Subject" required />
            <textarea name="message" placeholder="Your Message" rows="6" required></textarea>
            <button type="submit" className="hero-btn primary">Send Message</button>
          </form>
        </div>

        {/* Optional Contact Info */}
        <div className="contact-info">
          <div className="info-card">
            <h3>Email</h3>
            <p>info@waleki.com</p>
          </div>
          <div className="info-card">
            <h3>Phone</h3>
            <p>+255 123 456 789</p>
          </div>
          <div className="info-card">
            <h3>Address</h3>
            <p>123 Tech Street, Dar es Salaam, Tanzania</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contacts;
