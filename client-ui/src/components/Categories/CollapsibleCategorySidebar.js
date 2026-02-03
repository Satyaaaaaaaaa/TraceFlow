import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaLaptop, 
  FaTshirt, 
  FaTv, 
  FaDumbbell, 
  FaUtensils, 
  FaBars, 
  FaChevronDown,
  FaBox
} from 'react-icons/fa'; // Static imports - ensure react-icons is installed
import './styles/CollapsibleCategorySidebar.css';

const CollapsibleCategorySidebar = ({ isOpen, onToggle, onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Initialize based on prop if provided, otherwise default collapsed (false for isOpen means true for isCollapsed)
  const [isCollapsed, setIsCollapsed] = useState(isOpen !== undefined ? !isOpen : false);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Icon mapping
  const categoryIcons = {
    'Computer Accessories': { icon: FaLaptop, fallback: '💻' },
    'Fashion': { icon: FaTshirt, fallback: '👕' },
    'Electronics & Appliances': { icon: FaTv, fallback: '📺' },
    'Sports Equipment': { icon: FaDumbbell, fallback: '🏋️' },
    'Food Products': { icon: FaUtensils, fallback: '🍽️' },
  };

  // Sync internal state with parent prop
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsCollapsed(!isOpen);
      // Auto-collapse all categories when sidebar collapses to keep UI clean
      if (!isOpen) {
        setExpandedCategories({});
      }
    }
  }, [isOpen]);

  const renderIcon = (categoryName) => {
    const iconData = categoryIcons[categoryName] || { icon: FaBox, fallback: '📦' };
    const IconComponent = iconData.icon;
    return IconComponent ? <IconComponent /> : <span>{iconData.fallback}</span>;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/category/fetch-categories'); // Ensure this endpoint is correct
        const data = response.data.categories || response.data.data || response.data || [];
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Toggle sidebar width and notify parent
  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    setExpandedCategories({}); // Close all accordions when toggling sidebar
    if (onToggle) {
      onToggle(!newCollapsed); // Parent expects true when OPEN
    }
  };

  // Toggle subcategory dropdown (only when expanded)
  const toggleCategoryExpand = (e, categoryId) => {
    e.stopPropagation(); // Prevent triggering the category selection
    if (!isCollapsed) {
      setExpandedCategories(prev => ({
        ...prev,
        [categoryId]: !prev[categoryId]
      }));
    }
  };

  // Handle category/subcategory selection
  const handleCategoryClick = (category, e) => {
    if (e) e.preventDefault();
    
    // Dispatch event for legacy components listening
    const event = new CustomEvent('categorySelected', { detail: category });
    window.dispatchEvent(event);
    
    // Call prop callback if provided
    if (onCategorySelect) {
      onCategorySelect(category);
    }
    
    // On mobile/small screens, collapse sidebar after selection (optional UX improvement)
    // if (window.innerWidth < 768) {
    //   toggleSidebar();
    // }
  };

  return (
    <div className={`category-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
          {isCollapsed ? <FaBars /> : <span className="close-icon">✕</span>}
        </button>
        {!isCollapsed && <h3 className="sidebar-title">CATEGORIES</h3>}
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {loading ? (
          <div className="sidebar-message">Loading...</div>
        ) : error ? (
          <div className="sidebar-message error">
            <div>{error}</div>
            <small>Check console for details</small>
          </div>
        ) : categories.length === 0 ? (
          <div className="sidebar-message">No categories</div>
        ) : (
          <ul className="category-list">
            {categories.map((category) => (
              <li key={category.id} className="category-item">
                {/* Main Row: Icon + Name (Clickable to filter) */}
                <div 
                  className="category-main-row"
                  onClick={() => handleCategoryClick(category)}
                  title={category.name}
                >
                  <span className="category-icon">
                    {renderIcon(category.name)}
                  </span>
                  
                  {!isCollapsed && (
                    <>
                      <span className="category-name">{category.name}</span>
                      
                      {/* Toggle Button - only if subcategories exist */}
                      {category.subcategories && category.subcategories.length > 0 && (
                        <button 
                          className="expand-btn"
                          onClick={(e) => toggleCategoryExpand(e, category.id)}
                          aria-label="Toggle subcategories"
                        >
                          <FaChevronDown 
                            className={expandedCategories[category.id] ? 'rotated' : ''} 
                          />
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Subcategories Dropdown */}
                {!isCollapsed && expandedCategories[category.id] && (
                  <div className="subcategory-list">
                    {/* Optional "View All" link for the main category */}
                    <a 
                      href={`#category-${category.id}`}
                      className="subcategory-item view-all"
                      onClick={(e) => handleCategoryClick(category, e)}
                    >
                      All {category.name}
                    </a>
                    
                    {/* Actual subcategories */}
                    {category.subcategories?.map((sub) => (
                      <a
                        key={sub.id}
                        href={`#subcategory-${sub.id}`}
                        className="subcategory-item"
                        onClick={(e) => handleCategoryClick({...sub, parent: category}, e)}
                      >
                        {sub.name}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CollapsibleCategorySidebar;