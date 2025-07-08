import React, { createContext, useContext, useReducer, useEffect } from "react";

// 1. Create Context
const ShopContext = createContext();

// 2. API Base URL (adjust to your backend URL)
const API_BASE_URL = "http://localhost:5000/api";

// 3. Get auth token from localStorage (adjust based on your auth implementation)
const getAuthToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("authToken");
};

// 4. Check if user is logged in
const isUserLoggedIn = () => {
  return !!getAuthToken();
};

// 5. Initial State with localStorage persistence for guest users
const getInitialState = () => {
  if (typeof window !== "undefined") {
    const savedCart = localStorage.getItem("cart");
    const savedWishlist = localStorage.getItem("wishlist");
    return {
      cart: savedCart ? JSON.parse(savedCart) : [],
      wishlist: savedWishlist ? JSON.parse(savedWishlist) : [],
      orders: [],
      loading: false,
      orderLoading: false,
      user: null,
    };
  }
  return { 
    cart: [], 
    wishlist: [], 
    orders: [], 
    loading: false, 
    orderLoading: false, 
    user: null 
  };
};

// 6. Reducer Function (Handles ALL actions)
const shopReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ORDER_LOADING":
      return { ...state, orderLoading: action.payload };

    case "SET_USER":
      return { ...state, user: action.payload };

    case "SET_CART":
      return { ...state, cart: action.payload };

    case "SET_WISHLIST":
      return { ...state, wishlist: action.payload };

    case "SET_ORDERS":
      return { ...state, orders: action.payload };

    case "ADD_ORDER":
      return { ...state, orders: [action.payload, ...state.orders] };

    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map(order =>
          order.order_id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        ),
      };

    // Cart Actions
    case "ADD_TO_CART":
      const existingCartItem = state.cart.find(
        (item) =>
          String(item.id) === String(action.payload.id) && String(item.color) === String(action.payload.color)
      );

      const updatedCart = existingCartItem
        ? state.cart.map((item) =>
            String(item.id) === String(action.payload.id) && String(item.color) === String(action.payload.color)
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        : [...state.cart, action.payload];

      return { ...state, cart: updatedCart };

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter(
          (item) =>
            !(
              String(item.id) === String(action.payload.id) &&
              String(item.color) === String(action.payload.color)
            )
        ),
      };

    case "UPDATE_CART_ITEM_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          String(item.id) === String(action.payload.id) && String(item.color) === String(action.payload.color)
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "CLEAR_CART":
      return { ...state, cart: [] };

    // Wishlist Actions
    case "TOGGLE_WISHLIST_ITEM":
      const existsInWishlist = state.wishlist.some(
        (item) => String(item.id) === String(action.payload.id)
      );

      const updatedWishlist = existsInWishlist
        ? state.wishlist.filter((item) => String(item.id) !== String(action.payload.id))
        : [...state.wishlist, action.payload];

      return { ...state, wishlist: updatedWishlist };

    case "REMOVE_WISHLIST_ITEM":
      return {
        ...state,
        wishlist: state.wishlist.filter(
          (item) => String(item.id) !== String(action.payload.id)
        ),
      };

    case "CLEAR_WISHLIST":
      return { ...state, wishlist: [] };

    default:
      return state;
  }
};

// 7. Context Provider Component
export const ShopProvider = ({ children }) => {
  const [state, dispatch] = useReducer(shopReducer, getInitialState());

  // Persist to localStorage for both guest and logged-in users
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.cart));
    localStorage.setItem("wishlist", JSON.stringify(state.wishlist));
  }, [state.cart, state.wishlist]);

  // Load cart and orders from backend when user is logged in
  useEffect(() => {
    if (isUserLoggedIn()) {
      loadCartFromBackend();
      loadUserOrders();
      // Sync local cart to backend
      syncCartToBackend();
    }
  }, []);

  // Helper function to make API calls
  const makeApiCall = async (url, options = {}) => {
    const token = getAuthToken();
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "API call failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  // Load cart from backend
  const loadCartFromBackend = async () => {
    if (!isUserLoggedIn()) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await makeApiCall("/cart");
      if (response.success) {
        dispatch({ type: "SET_CART", payload: response.cart });
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Load user orders from backend
  const loadUserOrders = async () => {
    if (!isUserLoggedIn()) return;

    try {
      dispatch({ type: "SET_ORDER_LOADING", payload: true });
      const response = await makeApiCall("/orders");
      if (response.success) {
        // Ensure orders have cartItems
        const normalizedOrders = response.orders.map(order => ({
          ...order,
          cartItems: order.cartItems || []
        }));
        dispatch({ type: "SET_ORDERS", payload: normalizedOrders });
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      dispatch({ type: "SET_ORDERS", payload: [] }); // Fallback to empty array
    } finally {
      dispatch({ type: "SET_ORDER_LOADING", payload: false });
    }
  };

  // Sync local cart to backend when user logs in
  const syncCartToBackend = async () => {
    if (!isUserLoggedIn() || state.cart.length === 0) return;

    try {
      const response = await makeApiCall("/cart/sync", {
        method: "POST",
        body: JSON.stringify({ cartItems: state.cart }),
      });

      if (response.success) {
        dispatch({ type: "SET_CART", payload: response.cart });
        // Clear localStorage after successful sync
        localStorage.removeItem("cart");
      }
    } catch (error) {
      console.error("Failed to sync cart:", error);
    }
  };

  // Action Creators - Cart Functions (preserved as is)
  const addToCart = async (product) => {
    const cartItem = {
      id: String(product.id),
      product_id: String(product.id),
      name: product.name,
      price: parseFloat(product.price) * (1 - (parseFloat(product.discount || 0) / 100)),
      image: product.image,
      color: String(product.color || ''),
      quantity: product.quantity || 1,
    };

    if (isUserLoggedIn()) {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await makeApiCall("/cart/add", {
          method: "POST",
          body: JSON.stringify(cartItem),
        });

        if (response.success) {
          dispatch({ type: "SET_CART", payload: response.cart });
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);
        // Fallback to local state
        dispatch({ type: "ADD_TO_CART", payload: cartItem });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } else {
      // Guest user - use localStorage
      dispatch({ type: "ADD_TO_CART", payload: cartItem });
    }
  };

  const removeFromCart = async (id, color) => {
    const productId = String(id);
    const colorStr = String(color || '');
    
    if (isUserLoggedIn()) {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await makeApiCall("/cart/remove", {
          method: "DELETE",
          body: JSON.stringify({ product_id: productId, color: colorStr }),
        });

        if (response.success) {
          dispatch({ type: "SET_CART", payload: response.cart });
        }
      } catch (error) {
        console.error("Failed to remove from cart:", error);
        // Fallback to local state
        dispatch({ type: "REMOVE_FROM_CART", payload: { id: productId, color: colorStr } });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } else {
      // Guest user - use localStorage
      dispatch({ type: "REMOVE_FROM_CART", payload: { id: productId, color: colorStr } });
    }
  };

  const updateCartQuantity = async (id, color, quantity) => {
    const productId = String(id);
    const colorStr = String(color || '');
    
    if (quantity <= 0) {
      removeFromCart(productId, colorStr);
      return;
    }

    if (isUserLoggedIn()) {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await makeApiCall("/cart/update", {
          method: "PUT",
          body: JSON.stringify({ product_id: productId, color: colorStr, quantity }),
        });

        if (response.success) {
          dispatch({ type: "SET_CART", payload: response.cart });
        }
      } catch (error) {
        console.error("Failed to update cart:", error);
        // Fallback to local state
        dispatch({
          type: "UPDATE_CART_ITEM_QUANTITY",
          payload: { id: productId, color: colorStr, quantity },
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } else {
      // Guest user - use localStorage
      dispatch({
        type: "UPDATE_CART_ITEM_QUANTITY",
        payload: { id: productId, color: colorStr, quantity },
      });
    }
  };

  const clearCart = async () => {
    if (isUserLoggedIn()) {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const response = await makeApiCall("/cart/clear", {
          method: "DELETE",
        });

        if (response.success) {
          dispatch({ type: "CLEAR_CART" });
        }
      } catch (error) {
        console.error("Failed to clear cart:", error);
        // Fallback to local state
        dispatch({ type: "CLEAR_CART" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } else {
      // Guest user - use localStorage
      dispatch({ type: "CLEAR_CART" });
    }
  };

  // Wishlist functions
  const toggleWishlistItem = (product) => {
    const wishlistItem = {
      id: String(product.id),
      product_id: String(product.id),
      name: product.name,
      price: parseFloat(product.price) * (1 - (parseFloat(product.discount || 0) / 100)),
      image: product.image
    };

    dispatch({ type: "TOGGLE_WISHLIST_ITEM", payload: wishlistItem });
  };

  const removeWishlistItem = (id) => {
    const productId = String(id);
    dispatch({ type: "REMOVE_WISHLIST_ITEM", payload: { id: productId } });
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  // ORDER FUNCTIONS - NEW/UPDATED
  
  // Create order function - Updated to work with your backend
  const createOrder = async (orderData) => {
    try {
      dispatch({ type: "SET_ORDER_LOADING", payload: true });
      
      // Prepare order payload according to your backend structure
      const orderPayload = {
        cartItems: state.cart.map(item => ({
          id: item.product_id || item.id,
          product_id: item.product_id || item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          color: item.color,
          quantity: item.quantity
        })),
        shippingInfo: {
          firstName: orderData.shippingInfo.firstName,
          lastName: orderData.shippingInfo.lastName,
          email: orderData.shippingInfo.email,
          phone: orderData.shippingInfo.phone,
          address: orderData.shippingInfo.address,
          city: orderData.shippingInfo.city,
          state: orderData.shippingInfo.state,
          zip: orderData.shippingInfo.zip,
          country: orderData.shippingInfo.country || 'US',
        },
        paymentMethod: orderData.paymentMethod || 'cod',
        totalAmount: orderData.totalAmount,
      };

      const response = await makeApiCall("/orders/create", {
        method: "POST",
        body: JSON.stringify(orderPayload),
      });

      if (response.success) {
        // Clear cart after successful order
        dispatch({ type: "CLEAR_CART" });
        if (!isUserLoggedIn()) {
          localStorage.removeItem("cart");
        }
        
        // Add the new order to the orders list if user is logged in
        if (isUserLoggedIn()) {
          const newOrder = {
            ...response.order,
            order_id: response.orderId,
            created_at: new Date().toISOString(), // Add timestamp
            cartItems: orderPayload.cartItems // Ensure cartItems is included
          };
          dispatch({ type: "ADD_ORDER", payload: newOrder });
          await loadUserOrders(); // Refresh orders list
        }
        
        return {
          success: true,
          orderId: response.orderId,
          order: response.order
        };
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_ORDER_LOADING", payload: false });
    }
  };

  // Get user orders - Updated
  const getUserOrders = async () => {
    if (!isUserLoggedIn()) return [];

    try {
      const response = await makeApiCall("/orders");
      return response.success ? response.orders : [];
    } catch (error) {
      console.error("Failed to get orders:", error);
      return [];
    }
  };

  // Get single order - Updated to support both authenticated and guest access
  const getOrder = async (orderId, email = null) => {
    try {
      const url = email ? `/orders/${orderId}?email=${email}` : `/orders/${orderId}`;
      const response = await makeApiCall(url);
      return response.success ? response.order : null;
    } catch (error) {
      console.error("Failed to get order:", error);
      return null;
    }
  };

  // Cancel order - NEW
  const cancelOrder = async (orderId) => {
    if (!isUserLoggedIn()) {
      throw new Error("Authentication required to cancel order");
    }

    try {
      dispatch({ type: "SET_ORDER_LOADING", payload: true });
      const response = await makeApiCall(`/orders/${orderId}/cancel`, {
        method: "PUT",
      });

      if (response.success) {
        // Update the order status in local state
        dispatch({
          type: "UPDATE_ORDER_STATUS",
          payload: { orderId, status: "cancelled" }
        });
        
        return { success: true, message: response.message };
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_ORDER_LOADING", payload: false });
    }
  };

  // Track order status - NEW (for real-time updates)
  const refreshOrderStatus = async (orderId) => {
    try {
      const order = await getOrder(orderId);
      if (order) {
        dispatch({
          type: "UPDATE_ORDER_STATUS",
          payload: { orderId: order.order_id, status: order.status }
        });
        return order.status;
      }
    } catch (error) {
      console.error("Failed to refresh order status:", error);
    }
  };

  // Calculate cart totals (preserved as is)
  const getCartTotals = () => {
    const subtotal = state.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const itemCount = state.cart.reduce((total, item) => total + item.quantity, 0);
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      itemCount,
      // You can add shipping, tax calculation here
      shipping: 0,
      tax: 0,
      total: parseFloat(subtotal.toFixed(2)),
    };
  };

  // Helper function to get order by status
  const getOrdersByStatus = (status) => {
    return state.orders.filter(order => order.status === status);
  };

  // Helper function to get recent orders
  const getRecentOrders = (limit = 5) => {
    return state.orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  };

  const value = {
    state,
    actions: {
      // Cart actions (preserved)
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      syncCartToBackend,
      loadCartFromBackend,
      getCartTotals,
      
      // Wishlist actions
      toggleWishlistItem,
      removeWishlistItem,
      clearWishlist,
      
      // Order actions (new/updated)
      createOrder,
      getUserOrders,
      getOrder,
      cancelOrder,
      loadUserOrders,
      refreshOrderStatus,
      getOrdersByStatus,
      getRecentOrders,
    },
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

// 8. Custom Hook for easy consumption
export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};