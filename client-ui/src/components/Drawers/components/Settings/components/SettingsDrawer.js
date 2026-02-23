import React from 'react';
import ProfileInfo from '../../Profile/components/ProfileInfo';
import { Button } from 'react-bootstrap'; // Ensure you have Bootstrap Button for styling
import { FaArrowLeft } from 'react-icons/fa'; // Import back arrow icon

const SettingsDrawer = ({ 
  onUpdateProfileClick, 
  onDeleteAccount, 
  userInfo,
  // CHANGE ROLE PROPS
  onChangeRole,
  showChangeRole, 
  selectedRole,
  setSelectedRole,
  handleChangeRole,
  handleCancelChangeRole,
  currentRole,

  onLogout, 
  onBackClick 
}) => {
  return (
      <div className="settings-drawer">
        {/* Back Button */}
        <Button variant="link" onClick={onBackClick} className="position-absolute top-0 start-0 m-3">
          <FaArrowLeft />
        </Button>
        <h3>Profile Settings</h3>
        <ProfileInfo
          userInfo={userInfo}
          onUpdateProfileClick={onUpdateProfileClick}
          onDeleteAccount={onDeleteAccount}

          onChangeRole={onChangeRole}
          showChangeRole={showChangeRole}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          handleChangeRole={handleChangeRole}
          handleCancelChangeRole={handleCancelChangeRole}
          currentRole={currentRole}

          onLogout={onLogout}
        />
      </div>
  );
};

export default SettingsDrawer;
