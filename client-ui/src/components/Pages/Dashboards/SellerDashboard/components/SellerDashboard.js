import React from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FaStore, 
  FaPlusCircle,
  FaShoppingCart,
  FaClipboardList
} from 'react-icons/fa';
import '../styles/sellerdashboard.css';

const SellerDashboard = () => {
  const navigate = useNavigate();

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: FaStore, 
      active: true 
    },
    { 
      id: 'add-products', 
      label: 'Add Products', 
      icon: FaPlusCircle, 
      path: '/add-product' 
    },
    { 
      id: 'view-orders', 
      label: 'View Orders', 
      icon: FaShoppingCart, 
      path: '/seller-orders' 
    },
    { 
      id: 'my-products', 
      label: 'My Products', 
      icon: FaClipboardList, 
      path: '/my-products' 
    }
  ];

  return (
    <div className="seller-dashboard-page">
      <Container fluid className="seller-dashboard-container">
        {/* Header */}
        <div className="seller-dashboard-header">
          <div className="header-icon">
            <FaStore />
          </div>
          <h1>Seller Dashboard</h1>
          <p className="header-subtitle">Manage your store, products, and orders</p>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-nav-tabs">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-tab ${item.active ? 'active' : ''}`}
              onClick={() => item.path && navigate(item.path)}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Placeholder content - you can add more sections here later */}
        <div className="dashboard-content">
          <p className="text-center text-muted">
            Select an option from the menu above to get started
          </p>
        </div>
      </Container>
    </div>
  );
};

export default SellerDashboard;