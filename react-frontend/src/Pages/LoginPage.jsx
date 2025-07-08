import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      const user = await login(email, password);
      if (user.account_type === "business") {
        navigate("/seller-dashboard");
        toast.success("Welcome to your Seller Dashboard!");
      } else {
        navigate("/");
        toast.success("Welcome back!");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div id="login-page" className="min-vh-100 bg-light">
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
        .form-control, .form-select {
          border-radius: 25px;
          padding: 0.75rem 1.25rem;
        }
        .form-control:focus, .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        .alert-dismissible .btn-close {
          padding: 0.75rem;
          background-size: 0.8rem;
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
                  <i className="bi bi-box-arrow-in-right"></i>Login
                </h4>
                <p className="mb-0 text-muted opacity-90">Sign in to your account</p>
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
          <h2 className="fw-bold h1 mb-3">Welcome Back</h2>
          <div className="section-divider"></div>
        </div>

        <div className="row justify-content-center">
          <div className="col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4">
            <div className="glass-card rounded-4 p-4">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show rounded-4 mb-4" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-3 text-danger" style={{ fontSize: '1.2rem' }}></i>
                    <div>{error}</div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                  ></button>
                </div>
              )}

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
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-bold small">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-end mb-4">
                  <Link
                    to="/forgot-password"
                    className="text-decoration-none"
                    style={{ color: '#667eea', fontWeight: '500', transition: 'color 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                    onMouseLeave={(e) => e.target.style.color = '#667eea'}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="refresh-btn rounded-pill py-2"
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Logging In...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill py-2 d-flex align-items-center justify-content-center"
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
                    <img
                      src="/assets/images/google-icon.jpg"
                      alt="Google Icon"
                      style={{ width: '18px', height: '18px', marginRight: '8px' }}
                    />
                    Login with Google
                  </button>
                </div>
                <div className="text-center mt-4">
                  <span className="text-muted">Don't have an account? </span>
                  <Link
                    to="/signup"
                    className="text-decoration-none"
                    style={{ color: '#667eea', fontWeight: '500', transition: 'color 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                    onMouseLeave={(e) => e.target.style.color = '#667eea'}
                  >
                    Sign Up
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;