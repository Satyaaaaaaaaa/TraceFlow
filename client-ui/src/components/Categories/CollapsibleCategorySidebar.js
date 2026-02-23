import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaTv, FaMobileAlt, FaLaptop, FaTshirt, FaShoePrints, 
  FaClock, FaSprayCan, FaHeartbeat, FaShoppingBasket, 
  FaUtensils, FaCouch, FaPaintRoller, FaBook, FaRunning,
  FaGamepad, FaCar, FaTools, FaPaw, FaBaby, FaBars, 
  FaChevronDown, FaPlug, FaBox, FaTabletAlt, FaHeadphones,
  FaCamera, FaKeyboard, FaMale, FaFemale, FaChild,
  FaVest, FaMitten, FaGlasses, FaWallet, FaGem, FaHandSparkles,
  FaAirFreshener, FaMagic, FaCut, FaPumpSoap, FaPills, FaStethoscope,
  FaDumbbell, FaLeaf, FaHeart, FaSeedling, FaCookie, 
  FaBoxOpen, FaPepperHot, FaMugHot, FaBed, FaChair,  FaUmbrellaBeach, 
  FaPaintBrush, FaLightbulb, FaWineBottle, FaGraduationCap, FaBookOpen, 
  FaFileSignature, FaPen, FaPalette, FaSpa, FaHiking, FaChess, FaBicycle, 
  FaGhost, FaBrain, FaRobot,FaChessBoard, FaPuzzlePiece, FaMotorcycle, FaCarBattery, 
  FaHardHat, FaSoap,FaBolt, FaFaucet,  FaDog, FaCat, FaBone, FaFish, FaShapes, FaBabyCarriage
} from 'react-icons/fa';
import './styles/CollapsibleCategorySidebar.css';

const iconComponents = {
  FaTv, FaMobileAlt, FaLaptop, FaTshirt, FaShoePrints, 
  FaClock, FaSprayCan, FaHeartbeat, FaShoppingBasket, 
  FaUtensils, FaCouch, FaPaintRoller, FaBook, FaRunning,
  FaGamepad, FaCar, FaTools, FaPaw, FaBaby, FaBars, 
  FaChevronDown, FaPlug, FaBox, FaTabletAlt, FaHeadphones,
  FaCamera, FaKeyboard, FaMale, FaFemale, FaChild,
  FaVest, FaMitten, FaGlasses, FaWallet, FaGem, FaHandSparkles,
  FaAirFreshener, FaMagic, FaCut, FaPumpSoap, FaPills, FaStethoscope,
  FaDumbbell, FaLeaf, FaHeart, FaSeedling, FaCookie,
  FaBoxOpen, FaPepperHot, FaMugHot, FaBed, FaChair, FaUmbrellaBeach, FaPaintBrush, 
  FaLightbulb, FaWineBottle, FaGraduationCap, FaBookOpen, FaFileSignature, FaPen,
  FaPalette, FaSpa, FaHiking, FaChess, FaBicycle, FaGhost, FaBrain, FaRobot,
  FaChessBoard, FaPuzzlePiece, FaMotorcycle, FaCarBattery, FaHardHat, FaSoap,
  FaBolt, FaFaucet, FaDog, FaCat, FaBone, FaFish, FaShapes, FaBabyCarriage
};

const CollapsibleCategorySidebar = ({ isOpen, onToggle, onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(!isOpen);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setIsCollapsed(!isOpen);
    if (!isOpen) setExpandedId(null);
  }, [isOpen]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/category/tree`);
      setCategories(response.data.categories || []);
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    setExpandedId(null);
    if (onToggle) onToggle(!newCollapsed);
  };

  const toggleExpand = (e, catId) => {
    e.stopPropagation();
    if (isCollapsed) return;
    setExpandedId(expandedId === catId ? null : catId);
  };

  const handleSelect = (item, type) => {
    if (onCategorySelect) {
      onCategorySelect({ ...item, type });
    }
    window.dispatchEvent(new CustomEvent('categorySelected', { 
      detail: { ...item, type } 
    }));
  };

    const getIcon = (iconName) => {
    if (!iconName) return <FaBox />;
    const IconComponent = iconComponents[iconName] || FaBox;
    return <IconComponent />;
  };

  if (loading) {
    return (
      <div className={`category-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isCollapsed ? '☰' : '✕'}
          </button>
          {!isCollapsed && <h3 className="sidebar-title">Categories</h3>}
        </div>
        <div className="sidebar-loading">
          <div>Loading categories...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`category-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isCollapsed ? '☰' : '✕'}
          </button>
          {!isCollapsed && <h3 className="sidebar-title">Categories</h3>}
        </div>
        <div className="sidebar-error">
          <div>{error}</div>
          <button onClick={fetchCategories} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`category-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? '☰' : '✕'}
        </button>
        {!isCollapsed && <h3 className="sidebar-title">Categories</h3>}
      </div>

      <div className="sidebar-content">
        {categories.length === 0 ? (
          <div className="sidebar-empty">No categories found</div>
        ) : (
          <ul className="category-list">
            {categories.map((category) => {
              const hasSubs = category.subcategories?.length > 0;
              const isExpanded = expandedId === category.id;

              return (
                <li 
                  key={category.id} 
                  className={`category-item ${isExpanded ? 'expanded' : ''}`}
                >
                  <div className="category-row">
                    <button 
                      className="icon-btn"
                      onClick={() => handleSelect(category, 'category')}
                      title={category.name}
                    >
                      {getIcon(category.icon)}
                    </button>

                    {!isCollapsed && (
                      <>
                        <button 
                          className="name-btn"
                          onClick={() => handleSelect(category, 'category')}
                        >
                          {category.name}
                        </button>

                        {hasSubs && (
                          <button 
                            className="expand-btn"
                            onClick={(e) => toggleExpand(e, category.id)}
                          >
                            <FaChevronDown className={isExpanded ? 'rotated' : ''} />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {!isCollapsed && isExpanded && hasSubs && (
                    <div className="submenu">
                      <button 
                        className="submenu-item view-all"
                        onClick={() => handleSelect(category, 'category')}
                      >
                        📁 View All {category.name}
                      </button>
                      
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          className="submenu-item"
                          onClick={() => handleSelect(sub, 'subcategory')}
                        >
                          <span className="sub-icon">{getIcon(sub.icon)}</span>
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CollapsibleCategorySidebar;