import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDrawer from '../../Drawers/components/Profile/components/ProfileDrawer';
import logo from '../../Assets/logo.png';
import cartIcon from '../../Assets/cart_icon.png';
import Spinner from '../../Spinner'; // Import Spinner component
import { CartContext } from '../../Cart/CartContext'; // Import CartContext
import '../styles/navbar.css';
import { FaPlus, FaBars } from 'react-icons/fa'; // Import FaBars for hamburger

export default function Navbar({ isAuthenticated, userInfo, onMenuToggle,onLogout }) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading spinner
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext); // Access cart items from context
  const timeoutDuration = 1500; // Define timeout duration

  const handleProfileClick = () => {
    setShowDrawer(!showDrawer);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
  };

  const handleAddProductClick = () => {
    setLoading(true); // Show spinner on click
    setTimeout(() => {
      setLoading(false); // Hide spinner after the timeout
      navigate('/seller-dashboard'); // Navigate to seller-dashboard
    }, timeoutDuration);
  };

  const handleCartClick = () => {
    navigate('/cart'); // Navigate to the cart page
  };

  const handleSearchSubmit = (e) => {
    // Add your search handling logic here
  };
  if (loading) {
    return (
      <div className="spinner-overlay">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="navbar-container">
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          {/* NEW: Hamburger Menu Button */}
          <button 
            className="hamburger-menu-btn" 
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <FaBars />
          </button>

          {/* Logo */}
          <a className="navbar-brand navbar-title" href="/">
            <img src={logo} alt="Logo" className="navbar-logo" />
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <div className="navbar-center">
              <form className="d-flex" role="search" onSubmit={handleSearchSubmit}>
                <input
                  className="form-control me-2"
                  type="search"
                  id="search"
                  placeholder="Search"
                  aria-label="Search"
                />
                <button className="btn btn-outline-success" type="submit">Search</button>
              </form>
            </div>
            <div className="navbar-right">
              {userInfo && userInfo.role === 'SELLER' && (
                <FaPlus className="add-product-icon fs-3" onClick={handleAddProductClick} aria-label="Add Product" />
              )}
              <div className="cart-container" onClick={handleCartClick} aria-label="View Cart">
                <img src={cartIcon} alt="Cart" className="cart-icon" />
                {cartItems.length > 0 && <span className="cart-count">{cartItems.length}</span>}
              </div>
              <i className="profile-icon fs-2" onClick={handleProfileClick} aria-label="Profile" tabIndex={0}>👤</i>
              {showDrawer && (
                <ProfileDrawer
                  isOpen={showDrawer}
                  onClose={handleCloseDrawer}
                  isAuthenticated={isAuthenticated}
                  userInfo={userInfo}
                  onLogout={onLogout}
                />
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
