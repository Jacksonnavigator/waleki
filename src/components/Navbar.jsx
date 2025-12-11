import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const styles = {
    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 80px",
      backgroundColor: "transparent",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: 1000,
      fontFamily: "'Open Sans', sans-serif",
    },
    logo: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#fff",
      textDecoration: "none",
    },
    links: {
      listStyle: "none",
      display: "flex",
      margin: 0,
      padding: 0,
    },
    linkItem: {
      margin: "0 20px",
    },
    link: {
      textDecoration: "none",
      color: "#fff",
      fontSize: "16px",
      transition: "color 0.3s ease",
    },
    linkHover: {
      color: "#f0f0f0",
    },
    monitorBtn: {
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      padding: "10px 25px",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: 600,
      transition: "background-color 0.3s ease",
    },
    monitorBtnHover: {
      backgroundColor: "#0056b3",
    },
  };

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logo}>
        Waleki
      </Link>
      <ul style={styles.links}>
        <li style={styles.linkItem}>
          <Link to="/" style={styles.link}>Home</Link>
        </li>
        <li style={styles.linkItem}>
          <Link to="/about" style={styles.link}>About</Link>
        </li>
        <li style={styles.linkItem}>
          <Link to="/services" style={styles.link}>Services</Link>
        </li>
        <li style={styles.linkItem}>
          <Link to="/contact" style={styles.link}>Contacts</Link>
        </li>
      </ul>

      {/* Monitor Button with navigation */}
      <button
        style={styles.monitorBtn}
        onClick={() => navigate("/Login")}
        onMouseEnter={(e) =>
          (e.target.style.backgroundColor =
            styles.monitorBtnHover.backgroundColor)
        }
        onMouseLeave={(e) =>
          (e.target.style.backgroundColor = styles.monitorBtn.backgroundColor)
        }
      >
        MONITOR
      </button>
    </nav>
  );
};

export default Navbar;
