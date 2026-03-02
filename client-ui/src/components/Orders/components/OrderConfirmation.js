import React, { useContext, useEffect } from 'react';
import { MDBBtn, MDBTypography, MDBContainer, MDBRow, MDBCol, MDBCardImage } from 'mdb-react-ui-kit';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../Cart/CartContext';
import '../styles/OrderConfirmation.css';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderData = location.state?.orderData;
    const { cartItems, removeFromCart } = useContext(CartContext); // Get removeFromCart function

    useEffect(() => {
        if (orderData && cartItems.length > 0) {
            // Clear each cart item one by one using removeFromCart
            cartItems.forEach(item => {
                removeFromCart(item.id);
            });
        }
    }, [orderData, cartItems, removeFromCart]);

    if (!cartItems || cartItems.length === 0) {
        return (
            <MDBContainer className="py-5 text-center">
                <MDBTypography tag="h1" className="mb-4">Order Confirmation</MDBTypography>
                <MDBTypography tag="h6" className="text-danger">Your cart is empty. No order details available.</MDBTypography>
                <MDBBtn color="dark" onClick={() => navigate('/')} className="mt-4">
                    Back to Home
                </MDBBtn>
            </MDBContainer>
        );
    }

    const handleBackToHome = () => {
        navigate('/'); // Navigate to home
    };

    return (
        <MDBContainer className="py-5 text-center">
            <MDBTypography tag="h1" className="mb-4">Order Confirmation</MDBTypography>
            <MDBTypography tag="h6" className="mb-4">
                Thank you for your order! Your order has been successfully placed.
            </MDBTypography>
            <MDBTypography tag="h6" className="mb-4">
                A confirmation email has been sent to your registered email address.
            </MDBTypography>

            {orderData ? (
                <>
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
                </>
            ) : (
                <MDBTypography tag="h6" className="text-danger">No order details available.</MDBTypography>
            )}

            <MDBBtn color="dark" onClick={handleBackToHome} className="mt-4">
                Back to Home
            </MDBBtn>
        </MDBContainer>
    );
};

export default OrderConfirmation;
