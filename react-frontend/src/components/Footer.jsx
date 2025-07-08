import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Footer links data
  const footerLinks = [
    {
      title: "Shop",
      links: [
        { text: "All Products", url: "#" },
        { text: "New Arrivals", url: "#" },
        { text: "Best Sellers", url: "#" },
        { text: "Deals & Offers", url: "#" },
      ],
    },
    {
      title: "Customer Service",
      links: [
        { text: "Contact Us", url: "#" },
        { text: "FAQs", url: "#" },
        { text: "Shipping Policy", url: "#" },
        { text: "Returns & Refunds", url: "#" },
      ],
    },
    {
      title: "About",
      links: [
        { text: "Our Story", url: "#" },
        { text: "Blog", url: "#" },
        { text: "Careers", url: "#" },
        { text: "Privacy Policy", url: "#" },
      ],
    },
  ];

  const socialIcons = [
    { icon: "bi-twitter", url: "#" },
    { icon: "bi-instagram", url: "#" },
    { icon: "bi-facebook", url: "#" },
    { icon: "bi-linkedin", url: "#" },
  ];

  return (
    <footer
      className="bg-dark text-white pt-5 pb-4"
      style={{
        background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="container">
        <div className="row g-4">
          {/* Brand Column */}
          <div className="col-lg-3 mb-4 mb-lg-0">
            <h3 className="h5 fw-bold mb-3 text-white">IntelliCart</h3>
            <p className="text-white-50 mb-4" style={{ opacity: 0.8 }}>
              Enhancing online shopping experience with AI techniques
            </p>
            <div className="d-flex gap-3">
              {socialIcons.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="text-white-50 hover-primary"
                  style={{
                    fontSize: "1.2rem",
                    transition: "all 0.3s ease",
                    opacity: 0.7,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                >
                  <i className={`bi ${social.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Links Columns */}
          {footerLinks.map((column, index) => (
            <div key={index} className="col-6 col-lg-3">
              <h3 className="h6 fw-bold mb-3 text-white">{column.title}</h3>
              <ul className="list-unstyled">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex} className="mb-2">
                    <a
                      href={link.url}
                      className="text-white-50 text-decoration-none hover-white"
                      style={{
                        transition: "all 0.2s ease",
                        opacity: 0.8,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "0.8")
                      }
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright Section */}
        <div className="border-top border-secondary mt-5 pt-4 text-center">
          <p className="text-white-50 small mb-1">
            © {currentYear} IntelliCart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
