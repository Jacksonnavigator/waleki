import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import walekiLogo from '../../assets/waleki.png';

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#000';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: bgColor,
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideIn 0.3s ease',
      minWidth: '300px',
      maxWidth: '400px'
    }}>
      <Icon size={20} />
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{message}</span>
    </div>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { login, error, setError, loading } = useAuth();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Add your image paths here
  const slideImages = [
    '/assets/well-bg.jpg',
    '/assets/bg1.jpg',
    '/assets/bg2.jpg',
    '/assets/bg3.jpg',
  ];

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slideImages.length]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting || loading) return;

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData.username, formData.password);
      
      // Show success toast
      showToast('Login successful! Redirecting to dashboard...', 'success');
      
      // Navigate after a short delay to show the toast
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Login failed:', err);
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = isSubmitting || loading || !formData.username || !formData.password;

  return (
    <div className="login-container">
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          background: #FAFAFA;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* Left Side - Slideshow */
        .login-left {
          flex: 1;
          background: #000;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 0;
          position: relative;
          overflow: hidden;
        }

        .slideshow-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 1s ease-in-out;
        }

        .slide.active {
          opacity: 1;
        }

        .slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .slideshow-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.5) 0%,
            rgba(0, 0, 0, 0.3) 50%,
            rgba(0, 0, 0, 0.7) 100%
          );
          z-index: 1;
        }

        .brand-content {
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .brand-logo {
          width: 120px;
          height: 120px;
          margin: 0 auto 32px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
        }

        .brand-logo:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
        }

        .brand-logo img {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }

        .brand-title {
          font-size: 64px;
          font-weight: 700;
          color: white;
          margin-bottom: 20px;
          letter-spacing: -2px;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
        }

        .brand-subtitle {
          font-size: 22px;
          color: rgba(255, 255, 255, 0.95);
          font-weight: 500;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
        }

        .slide-indicators {
          position: absolute;
          bottom: 48px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 2;
        }

        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator:hover {
          background: rgba(255, 255, 255, 0.6);
        }

        .indicator.active {
          width: 32px;
          border-radius: 5px;
          background: white;
        }

        /* Right Side - Form */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          background: white;
        }

        .login-form-container {
          width: 100%;
          max-width: 460px;
        }

        .form-header {
          margin-bottom: 48px;
        }

        .form-logo {
          width: 56px;
          height: 56px;
          background: #000;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .form-logo img {
          width: 36px;
          height: 36px;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }

        .form-title {
          font-size: 36px;
          font-weight: 700;
          color: #000;
          margin-bottom: 10px;
          letter-spacing: -1px;
        }

        .form-subtitle {
          font-size: 16px;
          color: #666;
          font-weight: 500;
          line-height: 1.5;
        }

        /* Error Message */
        .error-message {
          padding: 16px 18px;
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          animation: slideDown 0.3s ease-out;
        }

        .error-icon {
          color: #DC2626;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .error-text {
          color: #DC2626;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.5;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          position: relative;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #000;
          margin-bottom: 10px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 18px;
          color: #999;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .form-input {
          width: 100%;
          padding: 16px 18px 16px 52px;
          border: 2px solid #E8E8E8;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: all 0.2s ease;
          background: white;
          font-weight: 500;
        }

        .form-input:focus {
          border-color: #000;
          box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
        }

        .form-input:focus + .input-icon {
          color: #000;
        }

        .form-input::placeholder {
          color: #999;
          font-weight: 400;
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #FAFAFA;
        }

        /* Submit Button */
        .submit-button {
          width: 100%;
          padding: 18px;
          background: #000;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s ease;
          margin-top: 12px;
        }

        .submit-button:hover:not(:disabled) {
          background: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 20px;
          margin: 36px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #E8E8E8;
        }

        .divider-text {
          font-size: 13px;
          color: #999;
          font-weight: 600;
        }

        /* Footer Links */
        .form-footer {
          display: flex;
          justify-content: center;
          gap: 32px;
          padding-top: 28px;
          border-top: 1px solid #F0F0F0;
        }

        .footer-link {
          font-size: 14px;
          color: #666;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: #000;
        }

        /* Additional Info */
        .additional-info {
          margin-top: 36px;
          padding: 18px;
          background: #FAFAFA;
          border-radius: 12px;
          text-align: center;
        }

        .additional-info p {
          font-size: 13px;
          color: #666;
          line-height: 1.7;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .login-left {
            display: none;
          }

          .login-right {
            flex: 1;
          }
        }

        @media (max-width: 640px) {
          .login-right {
            padding: 32px 24px;
          }

          .form-title {
            font-size: 30px;
          }

          .brand-title {
            font-size: 48px;
          }

          .login-form-container {
            max-width: 100%;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Left Side - Slideshow */}
      <div className="login-left">
        <div className="slideshow-container">
          {slideImages.map((image, index) => (
            <div 
              key={index} 
              className={`slide ${index === currentSlide ? 'active' : ''}`}
            >
              <img src={image} alt={`Slide ${index + 1}`} />
            </div>
          ))}
          <div className="slideshow-overlay"></div>
        </div>

        <div className="brand-content">
          <div className="brand-logo">
            <img src={walekiLogo} alt="Waleki Logo" />
          </div>
          <h1 className="brand-title">Waleki</h1>
          <p className="brand-subtitle">Water Well Management System</p>
        </div>

        <div className="slide-indicators">
          {slideImages.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="login-right">
        <div className="login-form-container">
          <div className="form-header">
            <div className="form-logo">
              <img src={walekiLogo} alt="Waleki" />
            </div>
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={20} className="error-icon" />
              <span className="error-text">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="form-input"
                  disabled={isSubmitting || loading}
                  autoComplete="username"
                  required
                />
                <User size={20} className="input-icon" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input"
                  disabled={isSubmitting || loading}
                  autoComplete="current-password"
                  required
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isButtonDisabled) {
                      handleSubmit(e);
                    }
                  }}
                />
                <Lock size={20} className="input-icon" />
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isButtonDisabled}
            >
              {isSubmitting || loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">OR</span>
            <div className="divider-line"></div>
          </div>

          <div className="form-footer">
            <Link to="/register" className="footer-link">
              Create Account
            </Link>
            <Link to="/need-help" className="footer-link">
              Need Help?
            </Link>
          </div>

          <div className="additional-info">
            <p>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;