import React from "react";
import { User, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import "../../styles/register.css"; // shared CSS for login/register

const Register = () => {
  // Handler for clicking the Waleki logo
  const handleWalekiClick = () => {
    // For example, navigate to the homepage or do nothing
    window.location.href = "/";
  };

  return (
    <div className="login-background">
      {/* Header */}
      <header className="login-header-top">
        <h1 className="waleki-logo-header" onClick={handleWalekiClick}>Waleki</h1>
        
        <div className="hamburger-menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </header>

      {/* Card */}
      <div className="login-card-container">
              {/* Logo Above Form */}
      <img src="/assets/waleki.png" alt="Waleki Logo" className="login-logo" />

        <h2 className="form-heading">Create Your Waleki Account</h2>
        <p className="form-subtext">
          Start monitoring your devices and water levels in real-time.
        </p>

        <form className="login-form">
          {/* Full Name */}
          <div className="form-group-login">
            <span className="icon-placeholder">
              <User size={18} />
            </span>
            <input type="text" placeholder="Enter your full name" />
          </div>

          {/* Email */}
          <div className="form-group-login">
            <span className="icon-placeholder">
              <Mail size={18} />
            </span>
            <input type="email" placeholder="Enter your email" />
          </div>

          {/* Password */}
          <div className="form-group-login">
            <span className="icon-placeholder">
              <Lock size={18} />
            </span>
            <input type="password" placeholder="Enter your password" />
          </div>

          {/* Create Account Button */}
          <button type="submit" className="login-btn">
            Create Account
          </button>

          {/* Already have an account */}
          <p className="footer-text">
            Already have an account?{" "}
            <Link to="/login" className="footer-link">
              Login
            </Link>
          </p>

          {/* Divider */}
          <div className="divider">
            <span>Or continue with</span>
          </div>

          {/* Social Button */}
          <button type="button" className="google-btn">
            <img
              src="/assets/google-icon.png"
              alt="Google"
              className="google-icon"
            />
            Sign up with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
