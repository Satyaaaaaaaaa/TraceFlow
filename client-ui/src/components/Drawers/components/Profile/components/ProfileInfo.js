// src/components/Drawers/components/ProfileInfo.js
import React from 'react';
import { Button, Modal, Form } from 'react-bootstrap'; //ADDED MODAL AND FORM 

const ProfileInfo = ({ 
  onUpdateProfileClick, 
  onDeleteAccount,
  onChangeRole,
  showChangeRole,
  selectedRole,
  setSelectedRole,
  handleChangeRole,
  handleCancelChangeRole,
  currentRole, 
  onLogout 
}) => (
  <>
    <div className="text-center">
      <div className="d-flex flex-column align-items-center">
        <Button 
          variant="outline-primary" 
          className="mb-2 w-100" 
          onClick={onUpdateProfileClick}
        >
          Update Profile
        </Button>
        <Button 
          variant="outline-danger" 
          className="mb-2 w-100" 
          onClick={onDeleteAccount}
        >
          Delete Account
        </Button>
        <Button 
          variant="warning" 
          className="mb-2 w-100 text-white fw-bold" 
          onClick={onChangeRole}
        >
          Change Role
        </Button>
        <Button 
          variant="outline-danger" 
          className="w-100" 
          onClick={onLogout}
        >
          Logout
        </Button>
      </div>
    </div>

    {/*==========================================CHANGE MODAL STYLING==========================================*/}

    <Modal show={showChangeRole} onHide={handleCancelChangeRole} centered>
      <Modal.Header closeButton>
        <Modal.Title>Change User Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Current Role: <strong className="text-primary">{currentRole || 'Not Set'}</strong></Form.Label>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Select New Role</Form.Label>
            <Form.Select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
              size="lg"
            >
              <option value="">Choose a role...</option>
              <option value="USER">User</option>
              <option value="SELLER">Seller</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Choose whether you want to be a regular user or a seller
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

export default ProfileInfo;