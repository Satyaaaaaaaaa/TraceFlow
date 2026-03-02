import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Remove getOrders import since we're using fetch directly
import {
    MDBContainer,
    // Remove unused table imports
    MDBSpinner,
    MDBCard,
    MDBCardBody,
    MDBBadge,
    MDBCardImage,
    MDBBtn,
    MDBTypography,
    MDBRow,
    MDBCol
} from 'mdb-react-ui-kit';
import '../styles/Order.css';

const MyOrders = ({ userID }) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                
                const response = await fetch('http://localhost:3001/order', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                
                if (data.status) {
                    setOrders(data.data || []);
                } else {
                    setError('Failed to fetch orders');
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to fetch orders. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserOrders();
    }, [userID]);

    const getStatusColor = (status) => {
        const statusColors = {
            'Pending': 'warning',
            'Paid': 'success',
            'Failed': 'danger',
            'Shipped': 'info',
            'Completed': 'success',
            'Cancelled': 'secondary',
            'Delivered': 'success'
        };
        return statusColors[status] || 'secondary';
    };

    const getStatusText = (status) => {
        const statusText = {
            'Pending': 'Awaiting Payment',
            'Paid': 'Payment Successful',
            'Failed': 'Payment Failed',
            'Shipped': 'Shipped',
            'Completed': 'Delivered',
            'Cancelled': 'Cancelled',
            'Delivered': 'Delivered'
        };
        return statusText[status] || status;
    };

    const handlePayNow = async (order) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/order/${order.id}/payments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (data.status && data.data && data.data.length > 0) {
                const pendingPayment = data.data.find(p => p.status === 'Pending');
                
                if (pendingPayment) {
                    navigate('/payment', {
                        state: {
                            order: {
                                id: order.id,
                                orderNumber: order.orderNumber,
                                totalAmount: order.totalAmount,
                                status: order.status
                            },
                            paymentID: pendingPayment.id
                        }
                    });
                } else {
                    alert('No pending payment found for this order');
                }
            }
        } catch (err) {
            console.error('Error getting payment details:', err);
            alert('Failed to initiate payment');
        }
    };

    const handleRetryPayment = (order) => {
        handlePayNow(order);
    };

    if (isLoading) {
        return (
            <MDBContainer className="text-center my-5">
                <MDBSpinner role="status">
                    <span className="visually-hidden">Loading...</span>
                </MDBSpinner>
            </MDBContainer>
        );
    }

    return (
        <MDBContainer className="my-4">
            <MDBTypography tag="h2" className="mb-4">My Orders</MDBTypography>
            
            {error && (
                <MDBCard className="mb-3">
                    <MDBCardBody>
                        <MDBBadge color="danger" className="p-2">{error}</MDBBadge>
                    </MDBCardBody>
                </MDBCard>
            )}

            {orders.length === 0 ? (
                <MDBCard className="mb-3">
                    <MDBCardBody className="text-center py-5">
                        <MDBBadge color="info" className="p-3 mb-3">
                            You have no orders yet.
                        </MDBBadge>
                        <div className="mt-3">
                            <MDBBtn onClick={() => navigate('/products')}>
                                Start Shopping
                            </MDBBtn>
                        </div>
                    </MDBCardBody>
                </MDBCard>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <MDBCard key={order.id} className="mb-4 order-card">
                            {/* Order Header */}
                            <MDBCardBody className="order-header bg-light">
                                <MDBRow className="align-items-center">
                                    <MDBCol md="6">
                                        <MDBTypography tag="h5" className="mb-2">
                                            Order #{order.orderNumber || order.id}
                                        </MDBTypography>
                                        <small className="text-muted">
                                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </small>
                                    </MDBCol>
                                    <MDBCol md="6" className="text-end">
                                        <MDBBadge 
                                            color={getStatusColor(order.status)} 
                                            className="p-2"
                                        >
                                            {getStatusText(order.status)}
                                        </MDBBadge>
                                    </MDBCol>
                                </MDBRow>
                            </MDBCardBody>

                            {/* Order Items */}
                            <MDBCardBody>
                                {order.OrderItems && order.OrderItems.length > 0 ? (
                                    <ul className="list-unstyled mb-0">
                                        {order.OrderItems.map(item => (
                                            <li key={item.id} className="order-item-row mb-3 pb-3 border-bottom">
                                                <MDBRow className="align-items-center">
                                                    <MDBCol md="2">
                                                        <MDBCardImage 
                                                            src={item.Product?.image || '/placeholder.png'} 
                                                            fluid 
                                                            className="rounded-3" 
                                                            alt={item.Product?.name}
                                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                        />
                                                    </MDBCol>
                                                    <MDBCol md="6">
                                                        <MDBTypography tag="h6" className="mb-1">
                                                            {item.Product?.name || 'Product'}
                                                        </MDBTypography>
                                                        <small className="text-muted">
                                                            Quantity: {item.quantity}
                                                        </small>
                                                    </MDBCol>
                                                    <MDBCol md="4" className="text-end">
                                                        <MDBTypography tag="strong" className="text-success">
                                                            ₹{item.Product?.price}
                                                        </MDBTypography>
                                                    </MDBCol>
                                                </MDBRow>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted">No items in this order</p>
                                )}
                            </MDBCardBody>

                            {/* Order Footer */}
                            <MDBCardBody className="order-footer bg-light">
                                <MDBRow className="align-items-center">
                                    <MDBCol md="6">
                                        <MDBTypography tag="h5" className="mb-0">
                                            Total: <span className="text-success">₹{order.totalAmount}</span>
                                        </MDBTypography>
                                    </MDBCol>
                                    <MDBCol md="6" className="text-end">
                                        {order.status === 'Pending' && (
                                            <MDBBtn 
                                                color="success" 
                                                className="me-2"
                                                onClick={() => handlePayNow(order)}
                                            >
                                                Pay Now
                                            </MDBBtn>
                                        )}

                                        {order.status === 'Failed' && (
                                            <MDBBtn 
                                                color="warning" 
                                                className="me-2"
                                                onClick={() => handleRetryPayment(order)}
                                            >
                                                Retry Payment
                                            </MDBBtn>
                                        )}

                                        <MDBBtn 
                                            color="primary" 
                                            outline
                                            onClick={() => navigate(`/order/${order.id}`)}
                                        >
                                            View Details
                                        </MDBBtn>
                                    </MDBCol>
                                </MDBRow>
                            </MDBCardBody>
                        </MDBCard>
                    ))}
                </div>
            )}
        </MDBContainer>
    );
};

export default MyOrders;