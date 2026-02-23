import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDrawer from '../../Drawers/components/Profile/components/ProfileDrawer';
import logo from '../../Assets/logo.png';
//import cartIcon from '../../Assets/cart_icon.png';
import Spinner from '../../Spinner';
import { CartContext } from '../../Cart/CartContext';
import '../styles/navbar.css';
import { FaPlus, FaBars, FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import axios from 'axios';
import { useEffect, useRef } from 'react';

export default function Navbar({ isAuthenticated, userInfo, onMenuToggle, onLogout }) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState ('');
  const navigate = useNavigate();
  const { cartItems } = useContext(CartContext);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const handleProfileClick = () => {
    setShowDrawer(!showDrawer);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
  };

  const handleAddProductClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/seller-dashboard');
    }, 1500);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Add your search logic here
  //SEARCH SUGGESTIONS LOGIC

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(async () => {
        try {
          const response = await axios.get('/search/suggestions', {
            params: { q: searchQuery, limit: 5 }
          });
          if (response.data.status) {
            setSuggestions(response.data.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      }, 300); // Debounce
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="spinner-overlay">
        <Spinner />
      </div>
    );
  }

  return (
    <nav className="modern-navbar">
      <div className="navbar-content">
        {/* Left Section: Menu + Logo */}
        <div className="navbar-left">
          <button 
            className="hamburger-btn" 
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <FaBars />
          </button>

          <a href="/" className="navbar-logo-link">
            <div className="logo-container">
              <img src={logo} alt="TraceStore" className="logo-image" />
              <span className="logo-text">TraceStore</span>
            </div>
          </a>
        </div>


        {/* Center Section: Search */}
        <div className="navbar-center">
          <div className="search-container">
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  ref={inputRef} 
                  type="search"
                  className="search-input"
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}  
                  onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)} 
                  aria-label="Search"
                  autoComplete="off" 
                />
                <button type="submit" className="search-button">
                  Search
                </button>
              </div>
            </form>
            
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsRef} className="suggestions-dropdown">
                <ul className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <FaSearch className="suggestion-icon" />
                      <span className="suggestion-text">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>  
        </div>

        {/* Right Section: Icons */}
        <div className="navbar-right">
          {userInfo && userInfo.role === 'SELLER' && (
            <button 
              className="icon-btn add-product-btn" 
              onClick={handleAddProductClick}
              aria-label="Add Product"
              title="Add Product"
            >
              <FaPlus />
            </button>
          )}

          <button 
            className="icon-btn cart-btn" 
            onClick={handleCartClick}
            aria-label="View Cart"
            title="Cart"
          >
            <FaShoppingCart />
            {cartItems.length > 0 && (
              <span className="cart-badge">{cartItems.length}</span>
            )}
          </button>

          <button 
            className="icon-btn profile-btn" 
            onClick={handleProfileClick}
            aria-label="Profile"
            title="Profile"
          >
            <FaUser />
          </button>
        </div>
      </div>

      {/* Profile Drawer */}
      {showDrawer && (
        <ProfileDrawer
          isOpen={showDrawer}
          onClose={handleCloseDrawer}
          isAuthenticated={isAuthenticated}
          userInfo={userInfo}
          onLogout={onLogout}
        />
      )}
    </nav>
  );
}