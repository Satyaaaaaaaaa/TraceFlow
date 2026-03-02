// src/components/Products/ProductCard.js
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../Cart/CartContext';
import { FaShoppingBag, FaHeart } from 'react-icons/fa';
import './styles/ProductCard.css';

const API_URL = process.env.REACT_APP_API_URL;

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(product);
    } catch (err) {
      alert('Please login to add items to cart');
    } finally {
      setTimeout(() => setAdding(false), 800);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setWishlisted(v => !v);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Build image src — handles both relative API paths and full URLs
  const imgSrc = product.image?.startsWith('http')
    ? product.image
    : `${API_URL}${product.image}`;

  // Fake a discount badge for visual richness (or use real data if available)
  const discount = product.discount || product.discountPercent || null;
  const originalPrice = product.originalPrice || product.comparePrice || null;

  return (
    <div className="pc-card" onClick={handleCardClick}>

      {/* ── Image area ── */}
      <div className="pc-img-wrap">
        <img
          src={imgSrc}
          alt={product.name}
          className="pc-img"
          onError={e => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f5f5f5" width="200" height="200"/%3E%3C/svg%3E';
          }}
        />
        {/* Discount badge */}
        {discount && (
          <span className="pc-discount-badge">-{discount}%</span>
        )}
      </div>

      {/* ── Info area ── */}
      <div className="pc-info">

        <h3 className="pc-name">{product.name}</h3>

        {/* Category */}
        {product.category && (
          <p className="pc-category">{product.category}</p>
        )}

        {/* Price row */}
        <div className="pc-price-row">
          <span className="pc-price">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          {originalPrice && (
            <span className="pc-original-price">
              ${parseFloat(originalPrice).toFixed(2)}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="pc-actions" onClick={e => e.stopPropagation()}>
          {/* Cart icon button */}
          <button
            className={`pc-btn-cart ${adding ? 'pc-btn-cart--added' : ''}`}
            onClick={handleAddToCart}
            title="Add to cart"
          >
            <FaShoppingBag />
          </button>

          {/* Buy Now */}
          <button
            className="pc-btn-buy"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`);
            }}
          >
            BUY NOW
          </button>

          {/* Wishlist */}
          <button
            className={`pc-btn-wish ${wishlisted ? 'pc-btn-wish--on' : ''}`}
            onClick={handleWishlist}
            title="Wishlist"
          >
            <FaHeart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;