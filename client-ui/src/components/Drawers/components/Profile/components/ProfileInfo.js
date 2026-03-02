import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { 
  FaUserCircle, FaShoppingCart, FaBoxes, FaCrown, FaSignOutAlt, 
  FaExchangeAlt, FaCog, FaQuestionCircle, FaUser, FaLink, FaCheckCircle
} from 'react-icons/fa';
import { getUserBlockchainStatus, syncUserToBlockchain } from '../../../../../services/userServices';

const ProfileInfo = ({ 
  userInfo,
  userName,
  email,
  role,
  onOrdersClick,
  onSettingsClick,
  onSellerDashboardClick,
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
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [syncSuccess, setSyncSuccess] = useState('');

  useEffect(() => {
    fetchBlockchainStatus();
  }, []);

  const fetchBlockchainStatus = async () => {
    try {
      const response = await getUserBlockchainStatus();
      if (response.status) {
        setBlockchainStatus(response.data.blockchainStatus);
      }
    } catch (error) {
      console.error('Error fetching blockchain status:', error);
    }
  };

  const handleSyncBlockchain = async () => {
    setSyncLoading(true);
    setSyncError('');
    setSyncSuccess('');

    try {
      const response = await syncUserToBlockchain();
      if (response.status) {
        setBlockchainStatus(true);
        setSyncSuccess('Successfully synced to blockchain!');
        setTimeout(() => setSyncSuccess(''), 3000);
      } else {
        setSyncError(response.error || 'Sync failed');
      }
    } catch (error) {
      setSyncError(error.response?.data?.error || 'Failed to sync to blockchain');
    } finally {
      setSyncLoading(false);
    }
  };

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

        {/* Blockchain Status Section */}
        <div className="mt-3">
          {blockchainStatus === null ? (
            <div className="text-muted small">Loading blockchain status...</div>
          ) : blockchainStatus ? (
            <div className="d-flex align-items-center justify-content-center text-success">
              <FaCheckCircle className="me-2" />
              <span className="small">Verified on Blockchain</span>
            </div>
          ) : (
            <div>
              <Alert variant="warning" className="small mb-2">
                Not synced to blockchain
              </Alert>
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={handleSyncBlockchain}
                disabled={syncLoading}
                className="w-100"
              >
                {syncLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <FaLink className="me-2" />
                    Sync to Blockchain
                  </>
                )}
              </Button>
            </div>
          )}

          {syncError && (
            <Alert variant="danger" className="small mt-2 mb-0">
              {syncError}
            </Alert>
          )}

          {syncSuccess && (
            <Alert variant="success" className="small mt-2 mb-0">
              {syncSuccess}
            </Alert>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="drawer-menu">
        <button className="menu-item" onClick={() => navigate('/profile')}>
          <FaUser className="menu-icon" />
          <span>My Profile</span>
        </button>

        <button className="menu-item" onClick={onOrdersClick}>
          <FaShoppingCart className="menu-icon" />
          <span>My Orders</span>
        </button>

        {role === 'SELLER' && (
          <button className="menu-item" onClick={onSellerDashboardClick}>
            <FaBoxes className="menu-icon" />
            <span>Seller Dashboard</span>
          </button>
        )}

        {role === 'ADMIN' && (
          <button className="menu-item" onClick={() => navigate('/admin-dashboard')}>
            <FaCrown className="menu-icon" />
            <span>Admin Dashboard</span>
          </button>
        )}

        <div className="menu-divider" />

        <button className="menu-item" onClick={onSettingsClick}>
          <FaCog className="menu-icon" />
          <span>Settings</span>
        </button>

        <button className="menu-item" onClick={onChangeRole}>
          <FaExchangeAlt className="menu-icon" />
          <span>Change Role</span>
        </button>

        <button className="menu-item" onClick={() => navigate('/help-support')}>
          <FaQuestionCircle className="menu-icon" />
          <span>Help & Support</span>
        </button>

        <div className="menu-divider" />

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