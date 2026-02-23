import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { 
  FaUserCircle, FaShoppingCart, FaBoxes, FaCrown, FaSignOutAlt, 
  FaExchangeAlt, FaCog, FaQuestionCircle, FaUser
} from 'react-icons/fa';

const ProfileInfo = ({ 
  userInfo,
  userName,
  email,
  role,
  onOrdersClick,
  onSettingsClick,
  onChangeRole,
  onDeleteAccount,
  onLogout,
  navigate,
  showChangeRole,
  selectedRole,
  setSelectedRole,
  handleChangeRole,
  handleCancelChangeRole
}) => {
  return (
    <>
      {/* User Info Section */}
      <div className="user-info-section">
        <div className="user-avatar">
          {userInfo?.profilePic ? (
            <img src={userInfo.profilePic} alt="Profile" className="avatar-img" />
          ) : (
            <FaUserCircle size={64} color="#9ca3af" />
          )}
        </div>
        <h4 className="user-name">{userName}</h4>
        <p className="user-email">{email || 'Not Available'}</p>
        <div className="user-role-badge">
          {role || 'Not Available'}
        </div>
      </div>

      {/* Menu Items */}
      <div className="drawer-menu">
        {/* My Profile - Goes to profile view/edit */}
        <button className="menu-item" onClick={() => navigate('/profile')}>
          <FaUser className="menu-icon" />
          <span>My Profile</span>
        </button>

        {/* My Orders */}
        <button className="menu-item" onClick={onOrdersClick}>
          <FaShoppingCart className="menu-icon" />
          <span>My Orders</span>
        </button>

        {/* Role-specific items */}
        {role === 'SELLER' && (
          <button className="menu-item" onClick={() => navigate('/seller-dashboard')}>
            <FaBoxes className="menu-icon" />
            <span>My Products</span>
          </button>
        )}

        {role === 'ADMIN' && (
          <button className="menu-item" onClick={() => navigate('/admin-dashboard')}>
            <FaCrown className="menu-icon" />
            <span>Admin Dashboard</span>
          </button>
        )}

        <div className="menu-divider" />

        {/* Settings - Opens settings drawer with Update Profile & Delete Account */}
        <button className="menu-item" onClick={onSettingsClick}>
          <FaCog className="menu-icon" />
          <span>Settings</span>
        </button>

        {/* Change Role */}
        <button className="menu-item" onClick={onChangeRole}>
          <FaExchangeAlt className="menu-icon" />
          <span>Change Role</span>
        </button>

        {/* Help & Support - Placeholder for now */}
        <button className="menu-item" onClick={() => navigate('/help-support')}>
          <FaQuestionCircle className="menu-icon" />
          <span>Help & Support</span>
        </button>

        <div className="menu-divider" />

        {/* Sign Out */}
        <button className="menu-item logout" onClick={onLogout}>
          <FaSignOutAlt className="menu-icon" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Change Role Modal */}
      <Modal show={showChangeRole} onHide={handleCancelChangeRole} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Current Role: <strong className="text-primary">{role || 'Not Set'}</strong>
              </Form.Label>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Select New Role</Form.Label>
              <Form.Select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                size="lg"
              >
                <option value="">Choose a role...</option>
                <option value="BUYER">Buyer</option>
                <option value="SELLER">Seller</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Choose whether you want to be a regular buyer or a seller
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelChangeRole}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleChangeRole}
            disabled={!selectedRole}
          >
            Change Role
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfileInfo;