import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/payment.css';
const API_URL = process.env.REACT_APP_API_URL

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get order details from navigation state
    const { order, paymentID } = location.state || {};
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentProvider, setPaymentProvider] = useState('Razorpay');

    useEffect(() => {
        // Redirect if no order data
        if (!order || !paymentID) {
            navigate('/cart');
        }
    }, [order, paymentID, navigate]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            // Step 1: Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
            }

            // Step 2: Initiate payment with backend
            const token = sessionStorage.getItem('token');
            const initiateResponse = await fetch(`${API_URL}/order/payment/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderID: order.id,
                    paymentProvider: paymentProvider
                })
            });

            const initiateData = await initiateResponse.json();

            if (!initiateData.status) {
                throw new Error(initiateData.error || 'Failed to initiate payment');
            }

            // Step 3: Open Razorpay payment popup
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_dummy', // Replace with your key
                amount: initiateData.amount * 100, // Amount in paise
                currency: initiateData.currency,
                name: 'TraceFlow',
                description: `Order #${order.orderNumber}`,
                order_id: initiateData.razorpayOrderID, // This would come from Razorpay integration
                handler: async function (response) {
                    // Step 4: Payment successful - update backend
                    await handlePaymentSuccess(response);
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#3399cc'
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                        setError('Payment cancelled by user');
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', async function (response) {
                await handlePaymentFailure(response);
            });

            razorpay.open();

        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (razorpayResponse) => {
        try {
            // Update payment status in backend
            const updateResponse = await fetch(`${API_URL}/order/payment/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paymentID: paymentID,
                    status: 'Success',
                    transactionID: razorpayResponse.razorpay_payment_id
                })
            });

            const updateData = await updateResponse.json();

            if (updateData.status) {
                // Navigate to order confirmation
                navigate('/order-confirmation', {
                    state: {
                        order: updateData.order,
                        payment: updateData.payment
                    }
                });
            } else {
                throw new Error('Failed to update payment status');
            }

        } catch (err) {
            console.error('Payment update error:', err);
            setError('Payment successful but failed to update. Please contact support.');
            setLoading(false);
        }
    };

    const handlePaymentFailure = async (razorpayResponse) => {
        try {
            // Update payment status as failed
            await fetch(`${API_URL}/order/payment/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paymentID: paymentID,
                    status: 'Failed',
                    failureReason: razorpayResponse.error.description
                })
            });

            // Navigate to payment failed page
            navigate('/payment-failed', {
                state: {
                    order: order,
                    error: razorpayResponse.error.description
                }
            });

        } catch (err) {
            console.error('Failed to update payment failure:', err);
            setError('Payment failed. Please try again.');
            setLoading(false);
        }
    };

    const handleTestPayment = async () => {
        // For testing without Razorpay
        setLoading(true);
        try {
            const updateResponse = await fetch(`${API_URL}/order/payment/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paymentID: paymentID,
                    status: 'Success',
                    transactionID: `TEST_${Date.now()}`
                })
            });

            const updateData = await updateResponse.json();

            if (updateData.status) {
                navigate('/order-confirmation', {
                    state: {
                        order: updateData.order,
                        payment: updateData.payment
                    }
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!order) {
        return <div className="payment-container">Loading...</div>;
    }

    return ( 
        <div className="payment-container">
            <div className="payment-content">
                <div className="payment-header">
                    <h2>Complete Your Payment</h2>
                    <p>Order #{order.orderNumber}</p>
                </div>

                <div className="order-summary-card">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                        <span>Order Total:</span>
                        <span className="amount">₹{order.totalAmount}</span>
                    </div>
                    <div className="summary-row">
                        <span>Status:</span>
                        <span className="status-badge status-pending">{order.status}</span>
                    </div>
                </div>

                <div className="payment-methods">
                    <h3>Select Payment Method</h3>
                    <div className="payment-options">
                        <label className="payment-option">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="Razorpay"
                                checked={paymentProvider === 'Razorpay'}
                                onChange={(e) => setPaymentProvider(e.target.value)}
                            />
                            <div className="option-content">
                                <strong>Razorpay</strong>
                                <span>Credit/Debit Card, UPI, Netbanking</span>
                            </div>
                        </label>

                        <label className="payment-option">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="Google Pay"
                                checked={paymentProvider === 'Google Pay'}
                                onChange={(e) => setPaymentProvider(e.target.value)}
                            />
                            <div className="option-content">
                                <strong>Google Pay</strong>
                                <span>Pay using Google Pay</span>
                            </div>
                        </label>

                        <label className="payment-option">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="PhonePe"
                                checked={paymentProvider === 'PhonePe'}
                                onChange={(e) => setPaymentProvider(e.target.value)}
                            />
                            <div className="option-content">
                                <strong>PhonePe</strong>
                                <span>Pay using PhonePe</span>
                            </div>
                        </label>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                <div className="payment-actions">
                    <button
                        className="btn-pay"
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : `Pay ₹${order.totalAmount}`}
                    </button>

                    <button
                        className="btn-test-pay"
                        onClick={handleTestPayment}
                        disabled={loading}
                    >
                        Test Payment (Skip Gateway)
                    </button>

                    <button
                        className="btn-cancel"
                        onClick={() => navigate('/my-orders')}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>

                <div className="security-badge">
                    🔒 Your payment is secured with SSL encryption
                </div>
            </div>
        </div>
    );
};

export default Payment;