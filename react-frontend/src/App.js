import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ShopProvider } from "./context/ShopContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load components
const HomePage = lazy(() => import("./Pages/HomePage"));
const ProductDetails = lazy(() => import("./Pages/ProductDetails"));
const VisualSearchPage = lazy(() => import("./Pages/VisualSearch"));
const ProfilePage = lazy(() => import("./Pages/ProfilePage"));
const ShoppingCart = lazy(() => import("./Pages/ShoppingCart"));
const Checkout = lazy(() => import("./Pages/CheckOut"));
const CategoryPage = lazy(() => import("./Pages/CategoryPage"));
const Dashboard = lazy(() => import("./seller Dashboard/pages/Dashboard"));
const LoginPage = lazy(() => import("./Pages/LoginPage"));
const SignupPage = lazy(() => import("./Pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./Pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./Pages/ResetPasswordPage"));
const SearchResults = lazy(() => import("./Pages/SearchResults"));

// Protected Route Component
const ProtectedRoute = ({ children, requireSeller = false }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // For seller dashboard, check if user has business account type
  if (requireSeller && user.account_type !== "business") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const isSellerDashboard = location.pathname.startsWith("/seller-dashboard");
  const isAuthPage =
    location.pathname === "/login" || 
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password");

  return (
    
    <AuthProvider>
      <ShopProvider>
        <div className="d-flex flex-column min-vh-100">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          {!isSellerDashboard && !isAuthPage && <Header />}
          <main className="flex-grow-1">
            <Suspense fallback={<LoadingSpinner fullPage />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:resettoken" element={<ResetPasswordPage />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/category/:categoryName" element={<CategoryPage />} />
                <Route path="/visual-search" element={<VisualSearchPage />} />
                <Route path="/cart" element={<ShoppingCart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/search" element={<SearchResults />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller-dashboard/*"
                  element={
                    <ProtectedRoute requireSeller={true}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          {!isSellerDashboard && !isAuthPage && <Footer />}
          {!isSellerDashboard && !isAuthPage && <Chatbot />}
        </div>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;