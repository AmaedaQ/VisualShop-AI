// src/components/LoadingSpinner.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LoadingSpinner = ({ fullPage = false }) => {
  return (
    <div
      className={`d-flex justify-content-center align-items-center ${
        fullPage ? "vh-100" : ""
      }`}
    >
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
