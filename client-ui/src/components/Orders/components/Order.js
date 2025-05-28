import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../../Cart/CartContext';
import axios from 'axios';
import { MDBBtn, MDBTypography, MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardImage } from 'mdb-react-ui-kit';
import { jwtDecode } from 'jwt-decode';
import '../styles/Order.css';
import { useNavigate } from 'react-router-dom';

const Order = () => {
  const { cartItems } = useContext(CartContext);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const navigate = useNavigate();

  const token = sessionStorage.getItem("authToken");

  useEffect(() => {
    if (token) {
      const fetchAddresses = async () => {
        try {
          const response = await axios.get('/address', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setAddresses(response.data.data || []);
        } catch (error) {
          console.error('Error fetching addresses:', error);
        }
      };

      fetchAddresses();
    }
  }, [token]);

  const handleSubmitOrder = async () => {
    if (!token) {
      alert('User not authenticated');
      return;
    }

    const userId = jwtDecode(token).userId;

    if (!selectedAddressId) {
      alert('Please select a delivery address before submitting the order.');
      return;
    }

    const orderData = {
      userID: userId,
      addressID: selectedAddressId, // ✅ Send selected address
      products: cartItems.map(item => ({
        productID: item.Product.id,
        quantity: item.quantity,
      })),
      totalAmount: cartItems.reduce((total, item) => total + item.Product.price * item.quantity, 0),
      status: 'Success',
    };

    try {
      const response = await axios.post('/order/create', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        const message = response.data.message || 'Order submitted successfully!';
        alert(message);
        navigate('/order-confirmation', { state: { orderData } });
      } else {
        throw new Error('Order submission failed');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return <h2 className="text-center">Your cart is empty. Please add items to place an order.</h2>;
  }

  return (
    <MDBContainer className="py-5">
      <MDBRow className="justify-content-center">
        <MDBCol md="8">
          <MDBCard className="shadow-5">
            <MDBCardBody>
              <MDBTypography tag="h1" className="mb-4 text-center">Order Summary</MDBTypography>

              <ul className="list-unstyled">
                {cartItems.map((item) => (
                  <MDBRow key={item.id} className="align-items-center">
                    <MDBCol md="2" lg="2" xl="2">
                      <MDBCardImage src={item.Product.image} fluid className="rounded-3 small-image my-2" alt={item.Product.name} />
                    </MDBCol>
                    <MDBCol>
                      <MDBTypography tag="h6" className="mb-0">{item.Product.name}</MDBTypography>
                    </MDBCol>
                    <MDBCol className="text-end">
                      <MDBTypography tag="h6" className="mb-0">Quantity: {item.quantity}</MDBTypography>
                    </MDBCol>
                    <MDBCol className="text-end">
                      <MDBTypography tag="h6" className="mb-0">INR {item.Product.price.toFixed(2)}</MDBTypography>
                    </MDBCol>
                  </MDBRow>
                ))}
              </ul>

              <hr />

              <MDBRow className="mb-4">
                <MDBCol>
                  <MDBTypography tag="h5">
                    Total Amount: <strong>INR {cartItems.reduce((total, item) => total + (item.Product.price * item.quantity), 0).toFixed(2)}</strong>
                  </MDBTypography>
                </MDBCol>
              </MDBRow>

              {addresses.length > 0 ? (
                <div className="mb-4">
                  <MDBTypography tag="h5" className="text-success">Select Delivery Address:</MDBTypography>
                  <select
                    className="form-select mt-2"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    <option value="" disabled>Select an address</option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.name}, {addr.locality}, {addr.city} - {addr.pincode}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mb-4">
                  <MDBTypography tag="h5" className="text-danger">No delivery address found.</MDBTypography>
                  <MDBBtn color="primary" onClick={() => navigate('/add-address')} className="mt-2">
                    Add Address
                  </MDBBtn>
                </div>
              )}

              <MDBBtn
                color="dark"
                onClick={handleSubmitOrder}
                className="mt-4 w-100"
                disabled={!selectedAddressId}
              >
                Submit Order
              </MDBBtn>

              <MDBBtn
                color="dark"
                onClick={() => navigate('/cart')}
                className="mt-3 w-100"
              >
                Back To Cart
              </MDBBtn>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Order;
