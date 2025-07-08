import React, { useState } from "react";
import {
  BiTachometer,
  BiBox,
  BiCart,
  BiClipboard,
  BiLineChart,
  BiCog,
  BiUserCircle,
  BiCalendar,  
  BiLogOut,
  BiMenu,
} from "react-icons/bi";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import ProductsTab from "../components/ProductsTab";
import OrdersTab from "../components/OrdersTab";
import InventoryTab from "../components/InventoryTab";
import AnalyticsTab from "../components/AnalyticsTab";
import SettingsTab from "../components/SettingsTab";
import DashboardTab from "../components/DashboardTab";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleExport = () => {
    toast.info("Export functionality will be implemented soon");
    // In a real implementation, you would add export logic here
  };

  const handlePrint = () => {
    toast.info("Print functionality will be implemented soon");
    // In a real implementation, you would add print logic here
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BiTachometer, color: "#6366f1" },
    { id: "products", label: "Products", icon: BiBox, color: "#8b5cf6" },
    { id: "orders", label: "Orders", icon: BiCart, color: "#06b6d4" },
    { id: "inventory", label: "Inventory", icon: BiClipboard, color: "#10b981" },
    { id: "analytics", label: "Analytics", icon: BiLineChart, color: "#f59e0b" },
    { id: "settings", label: "Settings", icon: BiCog, color: "#ef4444" },
  ];

  const styles = {
    container: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    sidebar: {
      background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      width: sidebarCollapsed ? "70px" : "260px",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 1000,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: "blur(10px)",
      borderRight: "1px solid rgba(148, 163, 184, 0.1)",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
    },
    sidebarInner: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      padding: "16px 0 12px",
    },
    logo: {
      padding: sidebarCollapsed ? "0 16px 16px" : "0 20px 16px",
      textAlign: sidebarCollapsed ? "center" : "left",
      borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
      marginBottom: "16px",
    },
    logoText: {
      fontSize: sidebarCollapsed ? "18px" : "22px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      marginBottom: "2px",
      transition: "all 0.3s ease",
    },
    logoSubtext: {
      fontSize: "11px",
      color: "rgba(148, 163, 184, 0.7)",
      fontWeight: "500",
      opacity: sidebarCollapsed ? 0 : 1,
      height: sidebarCollapsed ? 0 : "auto",
      overflow: "hidden",
      transition: "all 0.3s ease",
    },
    nav: {
      flex: 1,
      padding: "0 12px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      overflowY: "auto",
      maxHeight: "calc(100vh - 200px)",
    },
    navItem: {
      position: "relative",
      borderRadius: "10px",
      overflow: "hidden",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    navLink: {
      display: "flex",
      alignItems: "center",
      padding: sidebarCollapsed ? "12px" : "12px 16px",
      textDecoration: "none",
      color: "rgba(148, 163, 184, 0.8)",
      fontSize: "14px",
      fontWeight: "500",
      borderRadius: "10px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      justifyContent: sidebarCollapsed ? "center" : "flex-start",
    },
    navIcon: {
      fontSize: "20px",
      marginRight: sidebarCollapsed ? "0" : "12px",
      transition: "all 0.3s ease",
      flexShrink: 0,
    },
    navLabel: {
      opacity: sidebarCollapsed ? 0 : 1,
      width: sidebarCollapsed ? 0 : "auto",
      overflow: "hidden",
      whiteSpace: "nowrap",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    activeNavItem: {
      background: "rgba(99, 102, 241, 0.1)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(99, 102, 241, 0.2)",
    },
    activeNavLink: {
      color: "#ffffff",
      fontWeight: "600",
    },
    activeIndicator: {
      position: "absolute",
      left: "0",
      top: "50%",
      transform: "translateY(-50%)",
      width: "3px",
      height: "16px",
      background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "0 3px 3px 0",
    },
    userSection: {
      padding: "12px",
      borderTop: "1px solid rgba(148, 163, 184, 0.1)",
      marginTop: "auto",
    },
    userCard: {
      background: "rgba(148, 163, 184, 0.05)",
      border: "1px solid rgba(148, 163, 184, 0.1)",
      borderRadius: "12px",
      padding: sidebarCollapsed ? "10px 6px" : "12px",
      marginBottom: "10px",
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease",
      textAlign: sidebarCollapsed ? "center" : "left",
      overflow: "hidden",
    },
    userAvatar: {
      width: sidebarCollapsed ? "24px" : "32px",
      height: sidebarCollapsed ? "24px" : "32px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: sidebarCollapsed ? "0" : "6px",
      transition: "all 0.3s ease",
      margin: sidebarCollapsed ? "0 auto" : "0 0 6px 0",
      flexShrink: 0,
    },
    userName: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#ffffff",
      marginBottom: "1px",
      opacity: sidebarCollapsed ? 0 : 1,
      maxHeight: sidebarCollapsed ? 0 : "20px",
      overflow: "hidden",
      transition: "all 0.3s ease",
      lineHeight: "1.2",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    userEmail: {
      fontSize: "10px",
      color: "rgba(148, 163, 184, 0.7)",
      opacity: sidebarCollapsed ? 0 : 1,
      maxHeight: sidebarCollapsed ? 0 : "16px",
      overflow: "hidden",
      transition: "all 0.3s ease",
      lineHeight: "1.2",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    logoutBtn: {
      width: "100%",
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      border: "none",
      borderRadius: "10px",
      padding: sidebarCollapsed ? "10px" : "10px 16px",
      color: "white",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      alignItems: "center",
      justifyContent: sidebarCollapsed ? "center" : "flex-start",
      boxShadow: "0 8px 20px -5px rgba(239, 68, 68, 0.3)",
    },
    logoutIcon: {
      fontSize: "16px",
      marginRight: sidebarCollapsed ? "0" : "10px",
      flexShrink: 0,
    },
    logoutLabel: {
      opacity: sidebarCollapsed ? 0 : 1,
      width: sidebarCollapsed ? 0 : "auto",
      overflow: "hidden",
      whiteSpace: "nowrap",
      transition: "all 0.3s ease",
    },
    toggleBtn: {
      position: "fixed", // Changed from absolute to fixed
      top: "20px",
      left: sidebarCollapsed ? "70px" : "260px",
      transform: "translateX(-50%)",
      width: "28px",
      height: "28px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      border: "none",
      borderRadius: "50%",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      zIndex: 1100, // Increased z-index
      boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.2)",
      transition: "all 0.3s ease",
    },
    mainContent: {
      marginLeft: sidebarCollapsed ? "70px" : "250px",
      minHeight: "100vh",
      background: "linear-gradient(120deg, #f0f7ff 0%, #e6f3ff 50%, #d9e9ff 100%)",
      padding: "2rem",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
    },
    headerCard: {
      background: "rgba(255, 255, 255, 0.95)",
      padding: "2.5rem",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.03)",
      marginBottom: "2.5rem",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(124,58,237,0.05) 100%)",
    },
    headerTitle: {
      fontSize: "2.25rem",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "1rem",
      background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    headerSubtitle: {
      fontSize: "1.125rem",
      color: "#64748b",
      lineHeight: "1.5",
    },
    actionBtn: {
      background: "rgba(255, 255, 255, 0.8)",
      border: "1px solid rgba(148, 163, 184, 0.2)",
      borderRadius: "10px",
      padding: "8px 16px",
      fontSize: "13px",
      fontWeight: "500",
      color: "#475569",
      cursor: "pointer",
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
    },
    primaryBtn: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "1px solid rgba(102, 126, 234, 0.3)",
      boxShadow: "0 4px 15px -3px rgba(102, 126, 234, 0.3)",
    },
    // Modal styles
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
      backdropFilter: "blur(4px)",
    },
    modalContent: {
      background: "white",
      borderRadius: "16px",
      width: "380px",
      maxWidth: "90%",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
      animation: "modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    modalHeader: {
      padding: "20px 20px 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    modalBody: {
      padding: "20px",
      textAlign: "center",
    },
    modalFooter: {
      padding: "0 20px 20px",
      display: "flex",
      gap: "10px",
      justifyContent: "flex-end",
    },
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <nav style={styles.sidebar}>
        <button
          style={styles.toggleBtn}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateX(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateX(-50%) scale(1)";
          }}
        >
          {/* <BiMenu /> */}
        </button>

        <div style={styles.sidebarInner}>
          {/* Logo */}
          <div style={styles.logo}>
            <div style={styles.logoText}>
              {sidebarCollapsed ? "IC" : "IntelliCart"}
            </div>
            <div style={styles.logoSubtext}>Seller Dashboard</div>
          </div>

          {/* Navigation */}
          <nav style={styles.nav}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <div
                  key={item.id}
                  style={{
                    ...styles.navItem,
                    ...(isActive ? styles.activeNavItem : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(148, 163, 184, 0.05)";
                      e.currentTarget.style.transform = "translateX(3px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  {isActive && <div style={styles.activeIndicator}></div>}
                  <a
                    href={`#${item.id}`}
                    style={{
                      ...styles.navLink,
                      ...(isActive ? styles.activeNavLink : {}),
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab(item.id);
                    }}
                  >
                    <Icon
                      style={{
                        ...styles.navIcon,
                        color: isActive ? item.color : "inherit",
                      }}
                    />
                    <span style={styles.navLabel}>{item.label}</span>
                  </a>
                </div>
              );
            })}
          </nav>

          {/* User Section */}
          <div style={styles.userSection}>
            <div style={styles.userCard}>
              <div style={styles.userAvatar}>
                <BiUserCircle size={sidebarCollapsed ? 16 : 18} />
              </div>
              <div style={styles.userName}>
                {user?.businessName || "My Store"}
              </div>
              <div style={styles.userEmail}>
                {user?.businessEmail || user?.email || "seller@example.com"}
              </div>
            </div>

            <button
              style={styles.logoutBtn}
              onClick={() => setShowLogoutModal(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 12px 25px -5px rgba(239, 68, 68, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 20px -5px rgba(239, 68, 68, 0.3)";
              }}
            >
              <BiLogOut style={styles.logoutIcon} />
              <span style={styles.logoutLabel}>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.headerCard}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 style={styles.headerTitle}>
                Welcome to IntelliCart
              </h1>
              <p style={styles.headerSubtitle}>
                We're here to help you grow your business. How can we assist you today?
              </p>
            </div>
            <div className="d-flex gap-2">
              <button style={{...styles.actionBtn, ...styles.primaryBtn}}>
                <BiCalendar style={{marginRight: "6px"}} /> This week
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content" style={{marginTop: "8px"}}>
          {activeTab === "dashboard" && (
            <DashboardTab setActiveTab={setActiveTab} />
          )}
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "inventory" && <InventoryTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div style={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h5 className="modal-title m-0" style={{ fontWeight: "600" }}>
                Confirm Logout
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowLogoutModal(false)}
              ></button>
            </div>
            <div style={styles.modalBody}>
              <div className="mb-3">
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <BiLogOut size={20} color="white" />
                </div>
              </div>
              <p className="mb-2" style={{ fontWeight: "500" }}>
                Are you sure you want to logout?
              </p>
              <p className="text-muted small mb-0">Your session will be terminated.</p>
            </div>
            <div style={styles.modalFooter}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .nav::-webkit-scrollbar {
          width: 4px;
        }
        
        .nav::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .nav::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 2px;
        }
        
        .nav::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
        
        .actionBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px -5px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.95);
        }
        
        .primaryBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px -5px rgba(102, 126, 234, 0.4) !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;