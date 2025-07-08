// import React, { createContext, useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // Check if user is logged in on app load
// useEffect(() => {
//   const fetchUser = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         setUser(null);
//         setLoading(false);
//         return;
//       }
  
//       // Verify token structure before making request
//       if (token.split('.').length !== 3) {
//         throw new Error("Invalid token format");
//       }
  
//       const response = await axios.get("http://localhost:5000/api/auth/me", {
//         withCredentials: true,
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
  
//       if (response.data.success && response.data.user) {
//         setUser(response.data.user);
//       } else {
//         throw new Error("Invalid user data");
//       }
//     } catch (error) {
//       console.error("Failed to fetch user:", error);
//       // Clear invalid token
//       localStorage.removeItem("token");
//       delete axios.defaults.headers.common['Authorization'];
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   fetchUser();
// }, []);
//   // Signup function - creates account but doesn't log in
//   const signup = async (userData) => {
//     try {
//       // Transform data to match backend expectations
//       const payload = {
//         account_type: userData.accountType,
//         email: userData.accountType === 'personal' ? userData.email : userData.businessEmail,
//         password: userData.password,
//         ...(userData.accountType === 'personal' ? {
//           first_name: userData.firstName,
//           last_name: userData.lastName,
//           phone: userData.phone,
//           country: userData.country
//         } : {
//           business_name: userData.businessName,
//           business_email: userData.businessEmail,
//           tax_id: userData.taxId,
//           website: userData.website || null,
//           business_type: userData.businessType,
//           product_category: userData.productCategory,
//           owner_name: userData.fullName,
//           owner_phone: userData.phone,
//           id_number: userData.idNumber,
//           bank_name: userData.bankName,
//           account_number: userData.accountNumber,
//           swift_code: userData.swiftCode,
//           country: userData.country
//         })
//       };

//       const response = await axios.post(
//         "http://localhost:5000/api/auth/register",
//         payload,
//         { 
//           withCredentials: true,
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       if (response.data.success) {
//         return {
//           success: true,
//           message: userData.accountType === "business" 
//             ? "Business account created successfully! Please log in."
//             : "Account created successfully! Please log in."
//         };
//       }
//       throw new Error(response.data.message || "Registration failed");
//     } catch (error) {
//       let errorMessage = "Failed to create account. Please try again.";
      
//       if (error.response) {
//         if (error.response.data.errors) {
//           errorMessage = Object.values(error.response.data.errors)
//             .map(err => err.msg || err)
//             .join('\n');
//         } else if (error.response.data.message) {
//           errorMessage = error.response.data.message;
//         }
//       }
      
//       throw new Error(errorMessage);
//     }
//   };

//   // Login function
//   const login = async (email, password) => {
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/auth/login",
//         { email, password },
//         { 
//           withCredentials: true,
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       const { token, role, account_type } = response.data;
      
//       // Store token in localStorage
//       localStorage.setItem('token', token);
      
//       // Set token in axios defaults for future requests
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
//       // Set user state with all necessary info
//       setUser({
//         email,
//         role,
//         account_type,
//         token
//       });
      
//       toast.success("Login successful!");
//       return { email, role, account_type };
//     } catch (error) {
//       const message = error.response?.data?.message || 
//         "Failed to login. Please check your credentials.";
//       toast.error(message);
//       throw new Error(message);
//     }
//   };
  
//   // Forgot password function
//   const forgotPassword = async (email) => {
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/auth/forgotpassword",
//         { email },
//         { withCredentials: true }
//       );
      
//       // Show success message regardless of whether email exists (for security)
//       toast.success(response.data.message || "If the email exists, a reset link has been sent");
//       return true;
//     } catch (error) {
//       const message = error.response?.data?.message || 
//         "Failed to send password reset email. Please try again.";
//       toast.error(message);
//       throw new Error(message);
//     }
//   };

//   const resetPassword = async (token, newPassword) => {
//     try {
//       const response = await axios.put(
//         `http://localhost:5000/api/auth/resetpassword/${token}`,
//         { password: newPassword },
//         { withCredentials: true }
//       );
      
//       toast.success(response.data.message || "Password reset successfully");
//       return true;
//     } catch (error) {
//       const message = error.response?.data?.message || 
//         "Failed to reset password. The link may have expired or is invalid.";
//       toast.error(message);
//       throw new Error(message);
//     }
//   };

//   const getCurrentUser = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/auth/me", {
//         withCredentials: true
//       });
  
//       if (response.data.success && response.data.user) {
//         setUser(response.data.user);
//         return response.data.user;
//       } else {
//         setUser(null);
//         return null;
//       }
//     } catch (err) {
//       console.error("Error getting current user:", err);
//       setUser(null);
//       return null;
//     }
//   };

//   // logout function
//   const logout = async () => {
//     try {
//       await axios.get("http://localhost:5000/api/auth/logout", {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`
//         }
//       });
      
//       // Clear frontend state
//       localStorage.removeItem('token');
//       delete axios.defaults.headers.common['Authorization'];
//       setUser(null);
      
//       // Show success message and redirect
//       toast.success("Logged out successfully");
//       navigate("/login");
//     } catch (error) {
//       const message = error.response?.data?.message || 
//         "Failed to logout. Please try again.";
//       toast.error(message);
//     }
//   };

//   const value = {
//     user,
//     isAuthenticated: !!user,
//     isSeller: user?.account_type === "business",
//     signup,
//     login,
//     logout,
//     forgotPassword,
//     resetPassword,
//     getCurrentUser,
//     loading,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set up axios interceptor to handle token expiration
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          // Don't redirect here as it might cause infinite loops
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check if user is logged in on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Verify token structure before making request
        if (token.split('.').length !== 3) {
          console.error("Invalid token format");
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return;
        }

        // Set token in axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const response = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success && response.data.user) {
          setUser(response.data.user);
        } else {
          throw new Error("Invalid user data");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        // Clear invalid token
        localStorage.removeItem("token");
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Signup function - creates account but doesn't log in
  const signup = async (userData) => {
    try {
      // Transform data to match backend expectations
      const payload = {
        account_type: userData.accountType,
        email: userData.accountType === 'personal' ? userData.email : userData.businessEmail,
        password: userData.password,
        ...(userData.accountType === 'personal' ? {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          country: userData.country
        } : {
          business_name: userData.businessName,
          business_email: userData.businessEmail,
          tax_id: userData.taxId,
          website: userData.website || null,
          business_type: userData.businessType,
          product_category: userData.productCategory,
          owner_name: userData.fullName,
          owner_phone: userData.phone,
          id_number: userData.idNumber,
          bank_name: userData.bankName,
          account_number: userData.accountNumber,
          swift_code: userData.swiftCode,
          country: userData.country
        })
      };

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        payload,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        return {
          success: true,
          message: userData.accountType === "business" 
            ? "Business account created successfully! Please log in."
            : "Account created successfully! Please log in."
        };
      }
      throw new Error(response.data.message || "Registration failed");
    } catch (error) {
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.response) {
        if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors)
            .map(err => err.msg || err)
            .join('\n');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const { token, role, account_type, user: userData } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios defaults for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state with data from response
      const userInfo = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        account_type: userData.account_type,
        token
      };

      setUser(userInfo);
      
      toast.success("Login successful!");
      return userInfo;
    } catch (error) {
      const message = error.response?.data?.message || 
        "Failed to login. Please check your credentials.";
      toast.error(message);
      throw new Error(message);
    }
  };
  
  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgotpassword",
        { email },
        { withCredentials: true }
      );
      
      // Show success message regardless of whether email exists (for security)
      toast.success(response.data.message || "If the email exists, a reset link has been sent");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 
        "Failed to send password reset email. Please try again.";
      toast.error(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/resetpassword/${token}`,
        { password: newPassword },
        { withCredentials: true }
      );
      
      toast.success(response.data.message || "Password reset successfully");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 
        "Failed to reset password. The link may have expired or is invalid.";
      toast.error(message);
      throw new Error(message);
    }
  };

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return null;
      }

      const response = await axios.get("http://localhost:5000/api/auth/me", {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        return response.data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error("Error getting current user:", err);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      return null;
    }
  };

  // logout function
  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        await axios.get("http://localhost:5000/api/auth/logout", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      // Clear frontend state
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      
      // Show success message and redirect
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      // Even if logout fails on backend, clear frontend state
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      
      const message = error.response?.data?.message || 
        "Logged out locally";
      toast.success(message);
      navigate("/login");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isSeller: user?.account_type === "business",
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
