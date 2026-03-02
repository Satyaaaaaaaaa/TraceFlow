import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/paymentFailed.css';

const PaymentFailed = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { order, error } = location.state || {};

    const handleRetryPayment = () => {
        if (order) {
            navigate('/payment', {
                state: {
                    order: order,
                    paymentID: order.paymentID
                }
            });
        } else {
            navigate('/my-orders');
        }
    };

    const handleGoToOrders = () => {
        navigate('/my-orders');
    };

    return (
        <div className="payment-failed-container">
            <div className="payment-failed-content">
                <div className="failed-icon">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                        <circle cx="40" cy="40" r="38" stroke="#dc3545" strokeWidth="4"/>
                        <path d="M25 25L55 55M55 25L25 55" stroke="#dc3545" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                </div>

                <h2>Payment Failed</h2>
                <p className="error-description">
                    {error || 'We were unable to process your payment. Please try again.'}
                </p>

                {order && (
                    <div className="order-details">
                        <h3>Order Details</h3>
                        <div className="detail-row">
                            <span>Order Number:</span>
                            <strong>{order.orderNumber}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Amount:</span>
                            <strong>₹{order.totalAmount}</strong>
                        </div>
                        <div className="detail-row">
                            <span>Status:</span>
                            <span className="status-badge status-failed">Failed</span>
                        </div>
                    </div>
                )}

                <div className="failed-actions">
                    <button className="btn-retry" onClick={handleRetryPayment}>
                        Retry Payment
                    </button>
                    <button className="btn-orders" onClick={handleGoToOrders}>
                        View My Orders
                    </button>
                </div>

                <div className="help-section">
                    <p>Need help? Contact our support team</p>
                    <a href="mailto:support@traceflow.com">support@traceflow.com</a>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;