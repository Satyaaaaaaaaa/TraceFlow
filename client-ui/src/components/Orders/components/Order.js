import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../../Cart/CartContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../styles/Order.css';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaBox, FaMapMarkerAlt, FaPlus, FaCheckCircle,
  FaShieldAlt, FaLock, FaTruck, FaUndo, FaTag, FaStar,
  FaChevronDown, FaChevronUp, FaStore, FaInfoCircle,
  FaLeaf, FaMobileAlt, FaUniversity, FaCreditCard, FaWallet,
  FaMoneyBillWave, FaCheck, FaExclamationCircle, FaClock,
} from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const getEstimatedDelivery = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

const PAYMENT_METHODS = [
  {
    id: 'upi', label: 'UPI', icon: <FaMobileAlt />, desc: 'GPay, PhonePe, Paytm & more',
    subOptions: [
      { id: 'gpay', label: 'Google Pay' },
      { id: 'phonepe', label: 'PhonePe' },
      { id: 'paytm', label: 'Paytm' },
      { id: 'other_upi', label: 'Other UPI ID' },
    ],
  },
  { id: 'netbanking', label: 'Net Banking', icon: <FaUniversity />, desc: 'All major banks' },
  { id: 'card', label: 'Credit / Debit Card', icon: <FaCreditCard />, desc: 'Visa, Mastercard, RuPay' },
  { id: 'wallet', label: 'Wallets', icon: <FaWallet />, desc: 'Mobikwik, Freecharge & more' },
  { id: 'cod', label: 'Cash on Delivery', icon: <FaMoneyBillWave />, desc: 'Pay at your doorstep' },
];

const StockBadge = ({ qty }) => {
  if (qty > 10) return <span className="stock-badge in-stock"><FaCheck /> In Stock</span>;
  if (qty > 0) return <span className="stock-badge low-stock"><FaExclamationCircle /> Only {qty} left</span>;
  return <span className="stock-badge out-stock">Out of Stock</span>;
};

const Order = () => {
  const { cartItems } = useContext(CartContext);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiSubMethod, setUpiSubMethod] = useState('gpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [expandedTax, setExpandedTax] = useState(false);
  const [expandedItems, setExpandedItems] = useState(true);
  const [upiId, setUpiId] = useState('');
  const navigate = useNavigate();
  const token = sessionStorage.getItem('authToken');

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/address`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setAddresses(res.data.data || []))
        .catch(err => console.error('Error fetching addresses:', err));
    }
  }, [token]);

  const subtotal = cartItems.reduce((t, item) => t + parseFloat(item.Product.price) * item.quantity, 0);
  const saleDiscount = subtotal > 1000 ? subtotal * 0.05 : 0;
  const bulkDiscount = cartItems.reduce((t, item) => item.quantity >= 3 ? t + parseFloat(item.Product.price) * item.quantity * 0.02 : t, 0);
  const totalDiscount = couponDiscount + saleDiscount + bulkDiscount;
  const deliveryFee = subtotal > 500 ? 0 : 49;
  const platformFee = 2;
  const gst = (subtotal - totalDiscount) * 0.18;
  const grandTotal = subtotal - totalDiscount + deliveryFee + platformFee + gst;
  const totalSavings = totalDiscount + (deliveryFee === 0 ? 49 : 0);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'TRACE10') {
      setCouponDiscount(subtotal * 0.10);
      setCouponApplied(true);
    } else {
      alert('Invalid coupon code.');
    }
  };

  const handleSubmitOrder = async () => {
    if (!token) { alert('User not authenticated'); return; }
    if (!selectedAddressId) { alert('Please select a delivery address.'); return; }

    const userId = jwtDecode(token).userId;
    const orderData = {
      userID: userId,
      addressID: selectedAddressId,
      products: cartItems.map(item => ({ productID: item.Product.id, quantity: item.quantity })),
    };

    try {
      const response = await axios.post(`${API_URL}/order/create`, orderData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (response.status >= 200 && response.status < 300) {
        const { order, paymentID } = response.data; 

        // Navigate to /payment with order + paymentID
        navigate('/payment', {
          state: { order, paymentID }
        });
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="order-page">
        <div className="container">
          <div className="order-empty">
            <FaBox className="order-empty-icon" />
            <h3>Your cart is empty</h3>
            <p>Add items to your cart before placing an order.</p>
            <button className="order-submit-btn" onClick={() => navigate('/')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="container">

        <div className="order-header">
          <button className="order-back-btn" onClick={() => navigate('/cart')}>
            <FaArrowLeft /> Back to Cart
          </button>
          <h1>Checkout</h1>
          <p className="order-subtitle">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
        </div>

        <div className="order-layout">

          {/* ══ LEFT ══ */}
          <div className="order-left">

            {/* 1. Items */}
            <div className="order-section">
              <button className="section-toggle" onClick={() => setExpandedItems(v => !v)}>
                <div className="section-toggle-left">
                  <FaBox className="section-icon" />
                  <span className="section-title">Order Items</span>
                  <span className="section-badge">{cartItems.length}</span>
                </div>
                {expandedItems ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {expandedItems && (
                <div className="section-body">
                  <div className="order-table-header">
                    <span>Product</span>
                    <span className="th-center">Qty</span>
                    <span className="th-right">Price</span>
                    <span className="th-right">Total</span>
                  </div>

                  {cartItems.map((item) => (
                    <div key={item.id} className="order-item-row">
                      <div className="order-item-info">
                        <div className="order-item-img-wrap">
                          <img
                            src={`${API_URL}${item.Product.image}`}
                            alt={item.Product.name}
                            className="order-item-img"
                            onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23e8e8e8" width="64" height="64"/%3E%3C/svg%3E'; }}
                          />
                        </div>
                        <div className="order-item-meta">
                          <span className="order-item-name">{item.Product.name}</span>
                          {item.Product.variant && <span className="order-item-variant">{item.Product.variant}</span>}
                          <div className="seller-info">
                            <FaStore className="seller-icon" />
                            <span className="seller-name">{item.Product.sellerName || 'TraceFlow Store'}</span>
                            <span className="seller-rating"><FaStar /> 4.3</span>
                          </div>
                          <StockBadge qty={item.Product.quantity} />
                          <div className="item-badges">
                            <span className="item-badge delivery">
                              <FaTruck /> By {getEstimatedDelivery()} · <span className="free-tag">FREE</span>
                            </span>
                            <span className="item-badge return">
                              <FaUndo /> 7-day return
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="order-item-qty th-center">×{item.quantity}</span>
                      <span className="order-item-price th-right">₹{parseFloat(item.Product.price).toFixed(2)}</span>
                      <span className="order-item-total th-right">₹{(parseFloat(item.Product.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Address */}
            <div className="order-section">
              <div className="section-header-static">
                <FaMapMarkerAlt className="section-icon" />
                <span className="section-title">Delivery Address</span>
              </div>
              <div className="section-body">
                <div className="address-select-wrap">
                  <select
                    className="address-select"
                    value={selectedAddressId}
                    onChange={(e) => e.target.value === 'add-new' ? navigate('/add-address') : setSelectedAddressId(e.target.value)}
                  >
                    <option value="" disabled>Choose a saved address</option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.name}, {addr.locality}, {addr.city} — {addr.pincode}
                      </option>
                    ))}
                    <option value="add-new">＋ Add New Address</option>
                  </select>
                  <FaMapMarkerAlt className="select-icon" />
                </div>
                {addresses.length === 0 && (
                  <button className="add-address-btn" onClick={() => navigate('/add-address')}>
                    <FaPlus /> Add a delivery address
                  </button>
                )}
              </div>
            </div>

            {/* 3. Payment */}
            <div className="order-section">
              <div className="section-header-static">
                <FaLock className="section-icon" />
                <span className="section-title">Payment Method</span>
              </div>
              <div className="section-body payment-body">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="payment-option-left">
                      <div className={`radio-dot ${paymentMethod === method.id ? 'active' : ''}`} />
                      <span className="payment-icon">{method.icon}</span>
                      <div className="payment-text">
                        <span className="payment-label">{method.label}</span>
                        <span className="payment-desc">{method.desc}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {paymentMethod === 'upi' && (
                  <div className="upi-sub-options">
                    {PAYMENT_METHODS[0].subOptions.map(opt => (
                      <button
                        key={opt.id}
                        className={`upi-chip ${upiSubMethod === opt.id ? 'active' : ''}`}
                        onClick={() => setUpiSubMethod(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                    {upiSubMethod === 'other_upi' && (
                      <input
                        className="upi-id-input"
                        placeholder="Enter UPI ID (e.g. name@upi)"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ══ RIGHT (Summary) ══ */}
          <div className="order-right">

            {/* Coupon */}
            <div className="summary-card coupon-card">
              <div className="coupon-row">
                <FaTag className="coupon-icon" />
                <input
                  className="coupon-input"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                />
                <button
                  className={`coupon-btn ${couponApplied ? 'applied' : ''}`}
                  onClick={couponApplied
                    ? () => { setCouponApplied(false); setCouponCode(''); setCouponDiscount(0); }
                    : handleApplyCoupon}
                >
                  {couponApplied ? 'Remove' : 'Apply'}
                </button>
              </div>
              {couponApplied
                ? <p className="coupon-success"><FaCheck /> TRACE10 — 10% off applied!</p>
                : <p className="coupon-hint">Try <code>TRACE10</code> for 10% off</p>
              }
            </div>

            {/* Price breakdown */}
            <div className="summary-card">
              <h3 className="summary-title">Price Details</h3>

              <div className="price-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {saleDiscount > 0 && (
                <div className="price-row discount">
                  <span><FaTag className="row-icon" /> Sale Discount</span>
                  <span>− ₹{saleDiscount.toFixed(2)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="price-row discount">
                  <span><FaTag className="row-icon" /> Coupon (TRACE10)</span>
                  <span>− ₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {bulkDiscount > 0 && (
                <div className="price-row discount">
                  <span><FaTag className="row-icon" /> Bulk Discount</span>
                  <span>− ₹{bulkDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="price-row">
                <span><FaTruck className="row-icon" /> Delivery</span>
                <span className={deliveryFee === 0 ? 'free-text' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="price-row">
                <span>
                  Platform Fee
                  <FaInfoCircle className="info-icon" title="Convenience fee" />
                </span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>

              <div className="price-row tax-toggle" onClick={() => setExpandedTax(v => !v)}>
                <span>
                  GST (18%)
                  {expandedTax ? <FaChevronUp className="chevron" /> : <FaChevronDown className="chevron" />}
                </span>
                <span>₹{gst.toFixed(2)}</span>
              </div>

              {expandedTax && (
                <div className="tax-breakdown">
                  <div className="tax-item"><span>CGST (9%)</span><span>₹{(gst / 2).toFixed(2)}</span></div>
                  <div className="tax-item"><span>SGST (9%)</span><span>₹{(gst / 2).toFixed(2)}</span></div>
                </div>
              )}

              <hr className="summary-divider" />

              <div className="grand-total-row">
                <span>Total Payable</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="savings-callout">
                  <FaLeaf /> You save <strong>₹{totalSavings.toFixed(2)}</strong> on this order!
                </div>
              )}
            </div>

            {/* CTA */}
            <button className="order-submit-btn" onClick={handleSubmitOrder} disabled={!selectedAddressId}>
              <FaCheckCircle /> Place Order · ₹{grandTotal.toFixed(2)}
            </button>

            {/* Trust indicators */}
            <div className="trust-block">
              <div className="trust-item">
                <FaLock className="trust-icon" />
                <div><span className="trust-label">100% Secure</span><span className="trust-sub">SSL encrypted</span></div>
              </div>
              <div className="trust-item">
                <FaUndo className="trust-icon" />
                <div><span className="trust-label">Easy Returns</span><span className="trust-sub">7-day window</span></div>
              </div>
              <div className="trust-item">
                <FaShieldAlt className="trust-icon" />
                <div><span className="trust-label">Buyer Protection</span><span className="trust-sub">Full refund guarantee</span></div>
              </div>
            </div>

            {/* Delivery timeline */}
            <div className="delivery-preview">
              <div className="dp-header"><FaClock className="dp-icon" /><span>Estimated Delivery</span></div>
              <div className="dp-timeline">
                <div className="dp-step done"><div className="dp-dot done"><FaCheck /></div><span>Placed</span></div>
                <div className="dp-line" />
                <div className="dp-step"><div className="dp-dot"><FaBox /></div><span>Processing</span></div>
                <div className="dp-line" />
                <div className="dp-step"><div className="dp-dot"><FaTruck /></div><span>Shipped</span></div>
                <div className="dp-line" />
                <div className="dp-step"><div className="dp-dot"><FaMapMarkerAlt /></div><span>{getEstimatedDelivery()}</span></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;