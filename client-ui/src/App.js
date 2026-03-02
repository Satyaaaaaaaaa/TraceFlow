import "./App.css";
import Navbar from "./components/Navbar/components/Navbar";
//import CategoryNavbar from "./components/Categories/CategoryNavbar";
import CollapsibleCategorySidebar from "./components/Categories/CollapsibleCategorySidebar";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Home from "./components/Navbar/components/Home";
import About from "./components/Drawers/components/About/components/About";
import Signup from "./components/Authentication/components/SignupForm";
import Login from "./components/Authentication/components/LoginForm";
import AdminDashboard from "./components/Pages/Dashboards/AdminDashboard/components/AdminDashboard";
import SellerDashboard from "./components/Pages/Dashboards/SellerDashboard/components/SellerDashboard";
import ProfileDrawer from "./components/Drawers/components/Profile/components/ProfileDrawer";
import Cart from "./components/Cart/Cart";
import { CartProvider } from "./components/Cart/CartContext";
import React, { useState, useEffect } from "react";
import Order from "./components/Orders/components/Order";
import OrderConfirmation from "./components/Orders/components/OrderConfirmation";
import MyOrders from "./components/Orders/components/MyOrders";
import ProductDetails from "./components/Products/ProductDetails";
import {jwtDecode} from "jwt-decode"; // Fix import
import AddAddress from "./components/Address/AddAddress";
import SellerOrders from "./components/Pages/Dashboards/SellerDashboard/components/SellerOrders";
import AddProduct from "./components/Pages/Dashboards/SellerDashboard/components/AddProduct";
import MyProducts from "./components/Pages/Dashboards/SellerDashboard/components/MyProducts";

import ForgetPasswordForm from "./components/Authentication/components/ForgotPasswordForm"; // ADDED PATH
//import Product from './components/Products/Product';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // NEW: Sidebar state (starts collapsed)
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      const decodedToken = jwtDecode(token);
      setUserInfo({
        id: decodedToken.userId,
        username: decodedToken.username,
      });
      fetchUserRole(token);
    }
  }, []);

  const fetchUserRole = async (token) => {
    try {
      const response = await fetch('/user/', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUserInfo((prev) => ({
          ...prev,
          ...userData.data, // Store full user data instead of only role
        }));
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  //REFRESHES SESSION WHEN ROLE IS CHANGED 

  const refreshUserData = async () => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      await fetchUserRole(token);
    }
  };

  const handleLogin = (token, user) => {
    sessionStorage.setItem("authToken", token);
    setIsAuthenticated(true);
    setUserInfo({
      id: user.id,
      username: user.username,
    });
    fetchUserRole(token);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUserInfo(null);
    navigate("/", { state: { message: "You have been logged out successfully." } });
  };

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <CartProvider>
      <div className={`App ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

        <Navbar
          isAuthenticated={isAuthenticated}
          userInfo={userInfo}
          onLogout={handleLogout}
          onProfileClick={() => setShowProfileDrawer(true)}
          onMenuToggle={handleMenuToggle}

        />
        <CollapsibleCategorySidebar 
          isOpen={sidebarOpen} 
          onToggle={(isOpenNow) => setSidebarOpen(isOpenNow)}
          onCategorySelect={(category) => {
            // Optional: If you want to handle category selection here too
            console.log('Selected:', category);
            // e.g., navigate(`/products?category=${category.id}`);
          }}
        />

        {/*<CategoryNavbar />*/}
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />}/>

            <Route path="/forgot-password" element={<ForgetPasswordForm onLogin={handleLogin} />} />
            
            <Route
              path="/admin-dashboard"
              element={userInfo?.role === "ADMIN" ? <AdminDashboard /> : <Navigate to="/" />}
            />
            <Route
              path="/seller-dashboard"
              element={userInfo?.role === "SELLER" ? <SellerDashboard /> : <Navigate to="/" />}
            />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<Order />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/my-orders" element={<MyOrders userID={userInfo?.id} />} />
            {/*<Route path="/products" element={<Product />} />*/}
            <Route path="/product/:productID" element={<ProductDetails />} />
            <Route path="/add-address" element={<AddAddress />} />
            <Route path="/seller-orders" element={<SellerOrders />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/my-products" element={<MyProducts />} />

            {/*SPECIFIC ROUTES FOR SELLER*/}
            <Route path="/seller-orders" element={userInfo?.role === "SELLER" ? (<SellerOrders />) : (<Navigate to="/" replace />)} />
            <Route 
              path="/add-product" 
              element={
                userInfo?.role === "SELLER" ? (
                  <AddProduct />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/my-products" 
              element={
                userInfo?.role === "SELLER" ? (
                  <MyProducts />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </div>
        <ProfileDrawer
          isOpen={showProfileDrawer}
          onClose={() => setShowProfileDrawer(false)}
          isAuthenticated={isAuthenticated}
          userInfo={userInfo}
          onLogout={handleLogout}
        />
      </div>
    </CartProvider>
  );
}

export default App;
