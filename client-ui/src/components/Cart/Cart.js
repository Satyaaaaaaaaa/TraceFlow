import React, { useContext } from 'react';
import {
  MDBCardText, MDBBtn, MDBCard, MDBCardBody, MDBCardImage, MDBCol, MDBContainer, MDBIcon, MDBInput, MDBRow, MDBTypography,
} from 'mdb-react-ui-kit';
import { CartContext } from '../Cart/CartContext';
import './styles/Cart.css';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, updateCartItem } = useContext(CartContext);
  const navigate = useNavigate();

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1
    updateCartItem(cartItemId, newQuantity);
  };

  const handleRemove = (cartItemId) => {
    removeFromCart(cartItemId); // Call the removeFromCart function from CartContext
  };

  return (
    <section className="h-100 h-custom" style={{ backgroundColor: "#eee" }}>
      <MDBContainer className="py-5 h-100">
        <MDBRow className="justify-content-center align-items-center h-100">
          <MDBCol size="12">
            <MDBCard className="card-registration card-registration-2" style={{ borderRadius: "15px" }}>
              <MDBCardBody className="p-0">
                <MDBRow className="g-0">
                  <MDBCol lg="8">
                    <div className="p-5">
                      <div className="d-flex justify-content-between align-items-center mb-5">
                        <MDBTypography tag="h1" className="fw-bold mb-0 text-black">
                          Shopping Cart
                        </MDBTypography>
                        <MDBTypography className="mb-0 text-muted">
                          {cartItems.length} items
                        </MDBTypography>
                      </div>

                      <hr className="my-4" />

                      {cartItems.map((item) => (
                        <MDBRow key={item.id} className="mb-4 d-flex justify-content-between align-items-center">
                          <MDBCol md="2" lg="2" xl="2">
                            <MDBCardImage src={item.Product.image} fluid className="rounded-3" alt={item.Product.name} />
                          </MDBCol>
                          <MDBCol md="3" lg="3" xl="3">
                            <MDBTypography tag="h6" className="text-black mb-0">{item.Product.name}</MDBTypography>
                          </MDBCol>
                          <MDBCol md="3" lg="3" xl="3" className="d-flex align-items-center">
                            <MDBBtn color="link" className="px-2">
                              <MDBIcon fas icon="minus" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} />
                            </MDBBtn>
                            <MDBInput type="number" min="1" value={item.quantity} size="sm" onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10))} />
                            <MDBBtn color="link" className="px-2">
                              <MDBIcon fas icon="plus" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} />
                            </MDBBtn>
                          </MDBCol>
                          <MDBCol md="2" lg="2" xl="2" className="text-end">
                            <MDBTypography tag="h6" className="mb-0">
                              INR {item.Product.price}
                            </MDBTypography>
                          </MDBCol>
                          <MDBCol md="1" lg="1" xl="1" className="text-end">
                            {/* Remove Button */}
                            <MDBBtn color="danger" size="sm" onClick={() => handleRemove(item.id)}>
                              Remove
                            </MDBBtn>
                          </MDBCol>
                        </MDBRow>
                      ))}

                      <hr className="my-4" />

                      <div className="pt-5">
                        <MDBTypography tag="h6" className="mb-0">
                          <MDBCardText tag="a" href="/" className="text-body">
                            <MDBIcon fas icon="long-arrow-alt-left me-2" /> Back to shop
                          </MDBCardText>
                        </MDBTypography>
                      </div>
                    </div>
                  </MDBCol>
                  <MDBCol lg="4" className="bg-grey">
                    <div className="p-5">
                      <MDBTypography tag="h3" className="fw-bold mb-5 mt-2 pt-1">
                        Summary
                      </MDBTypography>

                      <hr className="my-4" />

                      <div className="d-flex justify-content-between mb-4">
                        <MDBTypography tag="h5" className="text-uppercase">
                          items | {cartItems.length}
                        </MDBTypography>
                        <MDBTypography tag="h5">
                          INR {cartItems.reduce((total, item) => total + (item.Product.price * item.quantity), 0).toFixed(2)}
                        </MDBTypography>
                      </div>

                      <hr className="my-4" />

                      <div className="d-flex justify-content-between mb-5">
                        <MDBTypography tag="h5" className="text-uppercase">
                          Total price
                        </MDBTypography>
                        <MDBTypography tag="h5">
                          INR {cartItems.reduce((total, item) => total + (item.Product.price * item.quantity), 0).toFixed(2)}
                        </MDBTypography>
                      </div>

                      <MDBBtn color="dark" block size="lg" onClick={() => navigate('/order')}>
                        Checkout
                      </MDBBtn>
                    </div>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section>
  );
};

export default Cart;
