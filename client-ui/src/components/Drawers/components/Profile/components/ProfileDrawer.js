import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthOptions from './AuthOptions';
import SettingsDrawer from '../../Settings/components/SettingsDrawer';
import UpdateProfileForm from './UpdateProfileForm';
import ProfileInfo from './ProfileInfo';
import '../styles/ProfileDrawer.css';

const ProfileDrawer = ({ isOpen, onClose, isAuthenticated, userInfo, onLogout }) => {
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const navigate = useNavigate();

  // Change role states
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (userInfo) {
      setUserName(userInfo.username || '');
      setFirstName(userInfo.firstName || '');
      setLastName(userInfo.lastName || '');
      setAge(userInfo.age?.toString() || '');
      setEmail(userInfo?.email ?? '');
      setRole(userInfo?.role ?? '');
    }
  }, [userInfo]);

  const handleOrdersClick = () => {
    navigate('/my-orders');
    onClose();
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleUpdateProfileClick = () => {
    setShowUpdateProfile(true);
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user/${userInfo.id}`, {
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

  const handleChangeRole = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    const confirmation = window.confirm(`Are you sure you want to change your role to ${selectedRole}?`);
    if (!confirmation) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user/change-role/`, {
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
        } else if (selectedRole === 'BUYER') {
          navigate('/');
        }
        window.location.reload();
      } else {
        alert(result.error || 'Failed to change role');
      }
    } catch (error) {
      console.error('Error changing role:', error);
      alert('There was an error changing your role. Please try again later.');
    }
  };

  const handleOpenChangeRole = () => {
    setSelectedRole(role || 'BUYER');
    setShowChangeRole(true);
  };

  const handleCancelChangeRole = () => {
    setShowChangeRole(false);
    setSelectedRole('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="drawer-backdrop open" onClick={onClose} />}
      
      {/* Drawer */}
      <div className={`profile-drawer ${isOpen ? 'drawer-open' : ''}`}>
        {/* Header */}
        <div className="drawer-header">
          <h3 className="drawer-title">Account</h3>
          <button className="drawer-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="drawer-body">
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
              <ProfileInfo
                userInfo={userInfo}
                userName={userName}
                email={email}
                role={role}
                onOrdersClick={handleOrdersClick}
                onSettingsClick={handleSettingsClick}
                onChangeRole={handleOpenChangeRole}
                onDeleteAccount={handleDeleteAccount}
                onLogout={onLogout}
                navigate={navigate}
                showChangeRole={showChangeRole}
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                handleChangeRole={handleChangeRole}
                handleCancelChangeRole={handleCancelChangeRole}
              />
            )
          ) : (
            <AuthOptions
              onLoginClick={() => navigate('/login')}
              onSignupClick={() => navigate('/signup')}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileDrawer;