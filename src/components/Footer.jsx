// components/Footer.jsx
import React from "react";

const Footer = () => {
  const styles = {
    footer: {
      position: "relative",
      background: "linear-gradient(135deg, #f9fbfc, #eef3f7)",
      padding: "80px 80px 30px",
      fontFamily: "'Open Sans', sans-serif",
      color: "#444",
      overflow: "hidden",
    },
    wave: {
      position: "absolute",
      top: "-1px",
      left: 0,
      width: "100%",
      height: "60px",
      background:
        "url('https://svgshare.com/i/16yX.svg') repeat-x",
      backgroundSize: "cover",
      zIndex: 1,
    },
    footerContent: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      marginBottom: "50px",
      position: "relative",
      zIndex: 2,
    },
    footerSection: {
      flex: 1,
      minWidth: "220px",
      marginRight: "40px",
    },
    lastSection: {
      marginRight: 0,
    },
    sectionTitle: {
      color: "#222",
      marginBottom: "20px",
      fontWeight: "600",
      fontSize: "18px",
    },
    walekiTitle: {
      fontSize: "28px",
      fontWeight: "800",
      marginBottom: "15px",
      color: "#007bff",
    },
    walekiText: {
      fontSize: "15px",
      lineHeight: 1.7,
      marginBottom: "20px",
    },
    newsletterSignup: {
      display: "flex",
      border: "1px solid #ddd",
      borderRadius: "50px",
      overflow: "hidden",
      maxWidth: "320px",
    },
    newsletterInput: {
      flexGrow: 1,
      border: "none",
      padding: "12px 18px",
      fontSize: "15px",
      outline: "none",
      color: "#444",
    },
    signupButton: {
      background: "linear-gradient(135deg, #007bff, #0056b3)",
      border: "none",
      padding: "0 20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      color: "#fff",
      fontSize: "20px",
      fontWeight: "bold",
      transition: "all 0.3s ease",
    },
    footerList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    footerListItem: {
      marginBottom: "12px",
    },
    footerLink: {
      textDecoration: "none",
      color: "#444",
      fontSize: "15px",
      position: "relative",
      display: "inline-block",
    },
    underline: {
      position: "absolute",
      left: 0,
      bottom: "-2px",
      height: "2px",
      width: "0%",
      background: "#007bff",
      transition: "width 0.3s ease",
    },
    footerBottom: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid #ddd",
      paddingTop: "20px",
      fontSize: "14px",
      color: "#666",
      zIndex: 2,
      position: "relative",
      flexWrap: "wrap",
      gap: "15px",
    },
    footerSocialLink: {
      color: "#666",
      fontSize: "22px",
      marginLeft: "15px",
      transition: "color 0.3s ease, transform 0.3s ease",
      textDecoration: "none",
    },
  };

  return (
    <footer style={styles.footer}>
      {/* Wave Divider */}
      <div style={styles.wave}></div>

      {/* Footer Sections */}
      <div style={styles.footerContent}>
        {/* Newsletter */}
        <div style={styles.footerSection}>
          <h3 style={styles.walekiTitle}>Waleki</h3>
          <p style={styles.walekiText}>
            Stay updated — sign up for the Waleki newsletter:
          </p>
          <div style={styles.newsletterSignup}>
            <input
              type="email"
              placeholder="Enter your email"
              style={styles.newsletterInput}
            />
            <button style={styles.signupButton}>→</button>
          </div>
        </div>

        {/* Company Links */}
        <div style={styles.footerSection}>
          <h4 style={styles.sectionTitle}>Company</h4>
          <ul style={styles.footerList}>
            {["Home", "About", "Services", "Contact"].map((item) => (
              <li key={item} style={styles.footerListItem}>
                <a href={`#${item.toLowerCase()}`} style={styles.footerLink}>
                  {item}
                  <span style={styles.underline}></span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Documentation */}
        <div style={{ ...styles.footerSection, ...styles.lastSection }}>
          <h4 style={styles.sectionTitle}>Documentation</h4>
          <ul style={styles.footerList}>
            {["Help Centre", "Contact", "Terms", "Privacy Policy"].map(
              (item) => (
                <li key={item} style={styles.footerListItem}>
                  <a
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    style={styles.footerLink}
                  >
                    {item}
                    <span style={styles.underline}></span>
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div style={styles.footerBottom}>
        <div>
          <a
            href="https://instagram.com/yourpage"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerSocialLink}
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="https://twitter.com/yourpage"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerSocialLink}
          >
            <i className="fab fa-twitter"></i>
          </a>
          <a
            href="https://facebook.com/yourpage"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerSocialLink}
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a
            href="https://linkedin.com/company/yourpage"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerSocialLink}
          >
            <i className="fab fa-linkedin-in"></i>
          </a>
        </div>
        <p>© Waleki Inc. All Rights Reserved 2025</p>
      </div>
    </footer>
  );
};

export default Footer;
