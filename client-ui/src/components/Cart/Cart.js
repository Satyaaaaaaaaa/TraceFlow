import React, { useContext, useState } from 'react';
import { CartContext } from '../Cart/CartContext';
import './styles/Cart.css';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShieldAlt, FaTag } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const Cart = () => {
  const { cartItems, removeFromCart, updateCartItem } = useContext(CartContext);
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState('');

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItem(cartItemId, newQuantity);
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + parseFloat(item.Product.price) * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <div className="container">

        {/* Header */}
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span className="item-count">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="cart-layout">

          {/* ── Items Panel ── */}
          <div className="cart-items-panel">

            {/* Table header */}
            {cartItems.length > 0 && (
              <div className="cart-table-header">
                <span>Product</span>
                <span>Quantity</span>
                <span className="col-total">Total</span>
                <span className="col-action">Action</span>
              </div>
            )}

            {/* Items */}
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <p>Your cart is empty.</p>
                <button className="checkout-btn" style={{ width: 'auto', padding: '12px 28px' }} onClick={() => navigate('/')}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="cart-item-row">

                  {/* Product info */}
                  <div className="cart-item-info">
                    <img
                      src={`${API_URL}${item.Product.image}`}
                      alt={item.Product.name}
                      className="cart-item-img"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="72" height="72"%3E%3Crect fill="%23e8e8e8" width="72" height="72"/%3E%3C/svg%3E';
                      }}
                    />
                    <div>
                      <p className="cart-item-name">{item.Product.name}</p>
                      <p className="cart-item-meta">INR {parseFloat(item.Product.price).toFixed(2)} each</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="cart-item-price">
                    INR {(parseFloat(item.Product.price) * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove */}
                  <div className="cart-item-action">
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>

                </div>
              ))
            )}

            {/* Back link */}
            <div className="cart-back-link">
              <a href="/">
                <FaArrowLeft /> Back to shop
              </a>
            </div>

          </div>

          {/* ── Summary Panel ── */}
          <div className="cart-summary-panel">
            <h3 className="summary-title">Order Summary</h3>

            {/* Voucher */}
            <div className="voucher-row">
              <div className="voucher-input-wrap">
                <FaTag className="voucher-icon" />
                <input
                  type="text"
                  className="voucher-input"
                  placeholder="Discount voucher"
                  value={voucher}
                  onChange={(e) => setVoucher(e.target.value)}
                />
              </div>
              <button className="voucher-btn">Apply</button>
            </div>

            <hr className="summary-divider" />

            <div className="summary-row">
              <span className="label">Subtotal</span>
              <span className="value">INR {subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span className="label">Delivery fee</span>
              <span className="value">Free</span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-total-row">
              <span className="label">Total</span>
              <span className="value">INR {subtotal.toFixed(2)}</span>
            </div>

            <button
              className="checkout-btn"
              disabled={cartItems.length === 0}
              onClick={() => navigate('/order')}
            >
              Checkout Now
            </button>

            <div className="warranty-note">
              <FaShieldAlt className="warranty-icon" />
              <p>Secure checkout. Your payment info is never stored.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;