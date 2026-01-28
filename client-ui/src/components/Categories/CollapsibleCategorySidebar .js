import React, { useState, useEffect } from 'react';
import './CollapsibleCategorySidebar.css';
import { 
  FaLaptop, 
  FaTshirt, 
  FaTv, 
  FaDumbbell, 
  FaUtensils,
  FaBars,
  FaChevronDown
} from 'react-icons/fa';

const CollapsibleCategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Map category names to icons
  const categoryIcons = {
    'Computer Accessories': <FaLaptop />,
    'Fashion': <FaTshirt />,
    'Electronics & Appliances': <FaTv />,
    'Sports Equipment': <FaDumbbell />,
    'Food Products': <FaUtensils />,
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/Categories.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCategories(data[0].Categories || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Collapse all categories when sidebar is collapsed
    if (!isCollapsed) {
      setExpandedCategories({});
    }
  };

  const toggleCategory = (categoryId) => {
    if (!isCollapsed) {
      setExpandedCategories(prev => ({
        ...prev,
        [categoryId]: !prev[categoryId]
      }));
    }
  };

  if (loading) {
    return (
      <div className={`category-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>
        <div className="sidebar-content">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`category-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>
        <div className="sidebar-content error">{error}</div>
      </div>
    );
  }

  return (
    <div className={`category-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        {!isCollapsed && <h3 className="sidebar-title">CATEGORIES</h3>}
      </div>

      <div className="sidebar-content">
        {categories.length > 0 ? (
          <ul className="category-list">
            {categories.map((category) => (
              <li key={category.id} className="category-item">
                <div 
                  className="category-header"
                  onClick={() => toggleCategory(category.id)}
                  title={isCollapsed ? category.name : ''}
                >
                  <span className="category-icon">
                    {categoryIcons[category.name] || <FaLaptop />}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="category-name">{category.name}</span>
                      <span className="category-toggle">
                        <FaChevronDown 
                          className={expandedCategories[category.id] ? 'rotated' : ''} 
                        />
                      </span>
                    </>
                  )}
                </div>
                
                {!isCollapsed && expandedCategories[category.id] && (
                  <div className="category-dropdown">
                    <a href={`#${category.name}`} className="category-link">
                      View All {category.name}
                    </a>
                    {/* Add subcategories here if needed */}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-categories">
            {isCollapsed ? '!' : 'No categories available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsibleCategorySidebar;