import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MDBContainer, MDBInput, MDBBtn } from 'mdb-react-ui-kit';

const AddAddress = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    pincode: '',
    city: '',
    state: '',
    locality: '',
    buildingName: '',
    landmark: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("authToken");

    try {
      await axios.post('/address', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      alert('Address added successfully!');
      navigate('/order'); // Go back to Order page
    } catch (error) {
      alert('Failed to add address');
      console.error(error);
    }
  };

  return (
    <MDBContainer className="py-5">
      <h2 className="mb-4">Add New Address</h2>
      <form onSubmit={handleSubmit}>
        {['name', 'phoneNumber', 'pincode', 'city', 'state', 'locality', 'buildingName', 'landmark'].map(field => (
          <MDBInput
            key={field}
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            name={field}
            onChange={handleChange}
            className="mb-3"
            required
          />
        ))}
        <MDBBtn type="submit" color="dark" className="w-100">Save Address</MDBBtn>
        <MDBBtn color="secondary" className="w-100 mt-2" onClick={() => navigate('/order')}>
          Cancel
        </MDBBtn>
      </form>
    </MDBContainer>
  );
};

export default AddAddress;
