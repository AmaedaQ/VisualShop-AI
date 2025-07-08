import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const SignupPage = () => {
  const [accountType, setAccountType] = useState("personal");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    businessName: "",
    businessEmail: "",
    taxId: "",
    website: "",
    businessType: "",
    productCategory: "",
    fullName: "",
    idNumber: "",
    bankName: "",
    accountNumber: "",
    swiftCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePassword = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await signup({
        accountType,
        ...formData,
      });

      if (result.success) {
        toast.success(result.message);
        navigate("/login");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="signup-page" className="min-vh-100 bg-light">
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
        .account-type-btn {
          transition: all 0.3s ease;
        }
        .account-type-btn:hover {
          transform: scale(1.05);
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
                  <i className="bi bi-person-plus"></i>Sign Up
                </h4>
                <p className="mb-0 text-muted opacity-90">Create a new account</p>
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
          <h2 className="fw-bold h1 mb-3">Create an Account</h2>
          <div className="section-divider"></div>
        </div>

        <div className="row justify-content-center">
          <div className="col-11 col-sm-9 col-md-8 col-lg-6 col-xl-5">
            <div className="glass-card rounded-4 p-4">
              <div className="btn-group w-100 mb-4" role="group">
                <button
                  type="button"
                  className={`btn ${accountType === "personal" ? "refresh-btn" : "btn-outline-secondary"} rounded-pill account-type-btn`}
                  onClick={() => setAccountType("personal")}
                  style={{ flex: 1 }}
                >
                  Personal
                </button>
                <button
                  type="button"
                  className={`btn ${accountType === "business" ? "refresh-btn" : "btn-outline-secondary"} rounded-pill account-type-btn`}
                  onClick={() => setAccountType("business")}
                  style={{ flex: 1 }}
                >
                  Business
                </button>
              </div>

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

              {accountType === "personal" ? (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="firstName" className="form-label fw-bold small">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        placeholder="First name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="lastName" className="form-label fw-bold small">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        placeholder="Last name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-bold small">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="phone" className="form-label fw-bold small">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        placeholder="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="country" className="form-label fw-bold small">Country</label>
                      <select
                        className="form-select"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>Country</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="personalPassword" className="form-label fw-bold small">Password</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          id="personalPassword"
                          placeholder="Password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <button
                          className="btn btn-outline-secondary rounded-pill"
                          type="button"
                          onClick={() => togglePassword("password")}
                        >
                          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="confirmPersonalPassword" className="form-label fw-bold small">Confirm Password</label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          id="confirmPersonalPassword"
                          placeholder="Confirm Password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                        <button
                          className="btn btn-outline-secondary rounded-pill"
                          type="button"
                          onClick={() => togglePassword("confirmPassword")}
                        >
                          <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                    </div>
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
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Sign Up
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit}>
                  <p className="text-muted mb-4">
                    Register as a <strong>business</strong> or nonprofit to sell goods.
                  </p>
                  <h6 className="fw-bold mb-3">Business Information</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="businessName" className="form-label fw-bold small">Business Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="businessName"
                        placeholder="Business name"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="businessEmail" className="form-label fw-bold small">Business Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="businessEmail"
                        placeholder="Business email"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="taxId" className="form-label fw-bold small">Tax ID / VAT Number</label>
                      <input
                        type="text"
                        className="form-control"
                        id="taxId"
                        placeholder="Tax ID / VAT Number"
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="website" className="form-label fw-bold small">Website (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="website"
                        placeholder="Website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="businessCountry" className="form-label fw-bold small">Business Country</label>
                      <select
                        className="form-select"
                        id="businessCountry"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>Business Country</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="businessType" className="form-label fw-bold small">Business Type</label>
                      <select
                        className="form-select"
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>Business Type</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="LLC">LLC</option>
                        <option value="Corporation">Corporation</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="productCategory" className="form-label fw-bold small">Product Category</label>
                    <select
                      className="form-select"
                      id="productCategory"
                      name="productCategory"
                      value={formData.productCategory}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>Product Category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <h6 className="fw-bold mb-3">Owner Details</h6>
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label fw-bold small">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      placeholder="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="businessPhone" className="form-label fw-bold small">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="businessPhone"
                      placeholder="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="idNumber" className="form-label fw-bold small">Government ID Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="idNumber"
                      placeholder="Government ID Number"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <h6 className="fw-bold mb-3">Payment Information</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="bankName" className="form-label fw-bold small">Bank Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="bankName"
                        placeholder="Bank Name"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="accountNumber" className="form-label fw-bold small">Account Number</label>
                      <input
                        type="text"
                        className="form-control"
                        id="accountNumber"
                        placeholder="Account Number"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="swiftCode" className="form-label fw-bold small">SWIFT Code</label>
                    <input
                      type="text"
                      className="form-control"
                      id="swiftCode"
                      placeholder="SWIFT Code"
                      name="swiftCode"
                      value={formData.swiftCode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <h6 className="fw-bold mb-3">Password Setup</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="businessPassword" className="form-label fw-bold small">Password</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          id="businessPassword"
                          placeholder="Password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <button
                          className="btn btn-outline-secondary rounded-pill"
                          type="button"
                          onClick={() => togglePassword("password")}
                        >
                          <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="confirmBusinessPassword" className="form-label fw-bold small">Confirm Password</label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="form-control"
                          id="confirmBusinessPassword"
                          placeholder="Confirm Password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                        <button
                          className="btn btn-outline-secondary rounded-pill"
                          type="button"
                          onClick={() => togglePassword("confirmPassword")}
                        >
                          <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                        </button>
                      </div>
                    </div>
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
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Sign Up
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center mt-4">
                <span className="text-muted">or continue with </span>
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill py-2 d-flex align-items-center justify-content-center mx-auto mt-2"
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
                  Sign up with Google
                </button>
              </div>

              <div className="text-center mt-4">
                <span className="text-muted">Already have an account? </span>
                <Link
                  to="/login"
                  className="text-decoration-none"
                  style={{ color: '#667eea', fontWeight: '500', transition: 'color 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                  onMouseLeave={(e) => e.target.style.color = '#667eea'}
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;