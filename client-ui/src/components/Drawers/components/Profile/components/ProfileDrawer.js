import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthOptions from './AuthOptions';
import SettingsDrawer from '../../Settings/components/SettingsDrawer';
import UpdateProfileForm from './UpdateProfileForm';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxes } from '@fortawesome/free-solid-svg-icons';
import { FaCog, FaShoppingCart, FaUserCircle, FaCrown } from 'react-icons/fa';
import '../styles/ProfileDrawer.css';

const ProfileDrawer = ({ isOpen, onClose, isAuthenticated, userInfo, onLogout }) => {
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState(''); //  Ensure email state is included
  const [role, setRole] = useState(''); //  Ensure role state is included
  const [showSettings, setShowSettings] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const navigate = useNavigate();

  //NEW CONSTS FOR CHANGE ROLE
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  //  Debugging logs to check `userInfo`
  useEffect(() => {
    //console.log("UserInfo received in ProfileDrawer:", userInfo);

    if (userInfo) {
      setUserName(userInfo.username || '');
      setFirstName(userInfo.firstName || '');
      setLastName(userInfo.lastName || '');
      setAge(userInfo.age?.toString() || '');
      setEmail(userInfo?.email ?? '');
      setRole(userInfo?.role ?? '');
    }
  }, [userInfo]);

  //  Debugging logs to verify state updates
  useEffect(() => {
    //console.log(" Updated State - Email:", email, " Role:", role);
  }, [email, role]);

  const handleOrdersClick = () => {
    navigate('/my-orders');
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleUpdateProfileClick = () => {
    setShowUpdateProfile(true);
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/user/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ firstName, lastName, age }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Profile updated successfully!');
        setShowUpdateProfile(false);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('There was an error updating your profile. Please try again later.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmation) return;

    try {
      const response = await fetch(`/user/${userInfo.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        onLogout();
        navigate('/login');
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('There was an error deleting your account. Please try again later.');
    }
  };

  const handleCancelUpdate = () => {
    setShowUpdateProfile(false);
  };

  // ================================
  // CHANGE USER FUNCTIONALITY
  // ================================

  const handleChangeRole = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    const confirmation = window.confirm(`Are you sure you want to change your role to ${selectedRole}?`);
    if (!confirmation) return;

    try {
      const response = await fetch(`/user/change-role/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Role changed successfully!');
        setRole(selectedRole);
        setShowChangeRole(false);
        setSelectedRole('');


        if (selectedRole === 'SELLER') {
          navigate('/seller-dashboard');
        } 
        else if (selectedRole === 'BUYER') {
          navigate('/');  // PATH TO USER DASHBOARD
        }
        // RELOAD TO REFLECT CHANGES (NEED TO UPDATE UI AS WELL)
        window.location.reload();
      } 
      
      else {
        alert(result.error || 'Failed to change role');
      }
    } catch (error) {
      console.error('Error changing role:', error);
      alert('There was an error changing your role. Please try again later.');
    }
  };

  const handleOpenChangeRole = () => {
    setSelectedRole(role || 'USER'); // Default to current role or USER
    setShowChangeRole(true);
  };

  const handleCancelChangeRole = () => {
    setShowChangeRole(false);
    setSelectedRole('');
  };

  return (
    <div className={`drawer ${isOpen ? 'drawer-open' : ''}`}>
      <div className="drawer-content">
        <button className="drawer-close" onClick={onClose}>X</button>
        <div className="drawer-top-content">
          {isAuthenticated ? (
            showUpdateProfile ? (
              <UpdateProfileForm
                firstName={firstName}
                lastName={lastName}
                age={age}
                setFirstName={setFirstName}
                setLastName={setLastName}
                setAge={setAge}
                onUpdateProfile={handleUpdateProfile}
                onCancel={handleCancelUpdate}
              />
            ) : showSettings ? (
              <SettingsDrawer
                onClose={() => setShowSettings(false)}
                onUpdateProfileClick={handleUpdateProfileClick}
                onDeleteAccount={handleDeleteAccount}

                //----------ROLE CHANGE PROPS-----------

                onChangeRole={handleOpenChangeRole} 
                showChangeRole={showChangeRole}  
                selectedRole={selectedRole}  
                setSelectedRole={setSelectedRole}  
                handleChangeRole={handleChangeRole}  
                handleCancelChangeRole={handleCancelChangeRole}  
                currentRole={role}

                onBackClick={onClose}
                onLogout={onLogout}
              />
            ) : (
              <>
                <div className="mb-3 text-center">
                  {userInfo?.profilePic ? (
                    <img
                      src={userInfo.profilePic}
                      alt="Profile"
                      className="img-fluid rounded-circle"
                      style={{ width: '150px', height: '150px' }}
                    />
                  ) : (
                    <FaUserCircle size={150} />
                  )}
                  <h4>{userName}</h4>
                  <p>Email: {email || 'Not Available'}</p> {/* Email displayed here */}
                  <p>Role: {role || 'Not Available'}</p>   {/* Role displayed here */}
                </div>

                <div className="d-flex flex-column align-items-center">
                  <Button variant="link" onClick={handleSettingsClick} className="mb-2 text-center">
                    <FaCog className="me-2" /> Profile Settings
                  </Button>
                  <Button variant="link" onClick={handleOrdersClick} className="text-center mb-2">
                    <FaShoppingCart className="me-2" /> My Orders
                  </Button>
                  {role === 'ADMIN' && (
                    <Button
                      variant="link"
                      onClick={() => navigate('/admin-dashboard')}
                      className="text-center"
                    >
                      <FaCrown className="me-2" /> Go to Admin Dashboard
                    </Button>
                  )}

                  {role === 'SELLER' && (
                    <Button
                      variant="link"
                      onClick={() => navigate(('/seller-dashboard'))} //NAVIGATE TO SELLER DASHBOARD
                      className="text-center"
>
                      <FontAwesomeIcon icon={faBoxes} className="me-2" /> My Products
                    </Button>
                  )}
                </div>
              </>
            )
          ) : (
            <AuthOptions
              onLoginClick={() => navigate('/login')}
              onSignupClick={() => navigate('/signup')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDrawer;
