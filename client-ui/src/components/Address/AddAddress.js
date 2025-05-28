import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MDBContainer, MDBInput, MDBBtn, MDBIcon } from 'mdb-react-ui-kit';

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
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    const token = sessionStorage.getItem('authToken');

    try {
      await axios.post('/address', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setMessage('Address added successfully!');
      setTimeout(() => navigate('/order'), 1500);
    } catch (error) {
      console.error(error);
      setMessage('Failed to add address. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MDBContainer className="py-5 px-4 shadow-3 rounded bg-light" style={{ maxWidth: '600px' }}>
      <h2 className="text-center mb-4" style={{ fontWeight: '700' }}>
        <MDBIcon icon="map-marker-alt" className="me-2 text-primary" />
        Add New Address
      </h2>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {[
          ['name', 'Full Name'],
          ['phoneNumber', 'Phone Number'],
          ['pincode', 'Pincode'],
          ['city', 'City'],
          ['state', 'State'],
          ['locality', 'Locality'],
          ['buildingName', 'Building/Flat Name'],
          ['landmark', 'Landmark (Optional)']
        ].map(([name, label]) => (
          <MDBInput
            key={name}
            name={name}
            label={label}
            required={name !== 'landmark'}
            onChange={handleChange}
            className="mb-3"
            disabled={submitting}
          />
        ))}

        <MDBBtn type="submit" color="primary" className="w-100" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Address'}
        </MDBBtn>

        <MDBBtn
          color="secondary"
          outline
          className="w-100 mt-3"
          onClick={() => navigate('/order')}
        >
          <MDBIcon icon="arrow-left" className="me-2" />
          Back to Orders
        </MDBBtn>
      </form>
    </MDBContainer>
  );
};

export default AddAddress;
