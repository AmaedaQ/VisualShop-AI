import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    
    try {
      await forgotPassword(email);
      setEmailSent(true);
      toast.success('Password reset link sent to your email!');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="forgot-password-page" className="min-vh-100 bg-light">
      <style jsx>{`
        .hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }
        .refresh-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 25px;
          padding: 0.5rem 1.5rem;
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }
        .section-divider {
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          width: 60px;
          margin: 0 auto 2rem;
        }
        .form-control {
          border-radius: 25px;
          padding: 0.75rem 1.25rem;
        }
        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
      `}</style>

      <div className="hero-gradient text-white py-3">
        <div className="container py-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
                onClick={() => navigate(-1)}
                style={{
                  width: '40px',
                  height: '40px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <button
                className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
                onClick={() => navigate("/")}
                style={{
                  width: '40px',
                  height: '40px',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <i className="bi bi-house-door"></i>
              </button>
              <div>
                <h4 className="mb-1 fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-shield-lock"></i>Reset Password
                </h4>
                <p className="mb-0 text-muted opacity-90">Recover your account</p>
              </div>
            </div>
            <Link to="/" className="d-none d-md-block">
              <img
                src="/assets/images/logo-copy.png"
                alt="Company Logo"
                style={{ height: '40px', transition: 'transform 0.3s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold h1 mb-3">Reset Your Password</h2>
          <div className="section-divider"></div>
        </div>

        <div className="row justify-content-center">
          <div className="col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4">
            <div className="glass-card rounded-4 p-4">
              {!emailSent ? (
                <>
                  <div className="text-center mb-4">
                    <i className="bi bi-shield-lock" style={{ fontSize: '3rem', color: '#667eea' }}></i>
                    <h4 className="fw-bold mt-3">Forgot Password?</h4>
                    <p className="text-muted">
                      Enter your email to receive a password reset link
                    </p>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-bold small">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="d-flex justify-content-center mt-4">
                      <button
                        type="submit"
                        className="refresh-btn rounded-pill px-4 py-2"
                        disabled={loading}
                        style={{ opacity: loading ? 0.7 : 1 }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-envelope me-2"></i>
                            Send Reset Link
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <i className="bi bi-check-circle" style={{ fontSize: '3rem', color: '#28a745' }}></i>
                    <h4 className="fw-bold mt-3">Email Sent!</h4>
                    <p className="text-muted">
                      We've sent a password reset link to your email address. Please check your inbox.
                    </p>
                    <Link
                      to="/login"
                      className="btn btn-outline-secondary rounded-pill py-2"
                      style={{ transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Back to Login
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;