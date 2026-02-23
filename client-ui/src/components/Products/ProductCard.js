// src/components/Products/ProductCard.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../Cart/CartContext'; // Import your CartContext
import './styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext); // Access addToCart from CartContext

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevents triggering card click when button is clicked
    addToCart(product); // Call addToCart with the product
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={index < rating ? 'star filled' : 'star'}> ★</span>
    ));
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
      </div>
      <h3>{product.name}</h3>
      <div className="product-rating">
        {renderStars(product.rating)}
      </div>
      <p>{product.description}</p>
      <div className="product-price-container">
        <span className="product-price-unit">{product.priceUnit.toUpperCase()}</span>
        <span className="product-price">{product.price}</span>
      </div>
      <button className="buy-now-btn" onClick={handleAddToCart}>
        Add to cart
      </button>
    </div>
  );
};

export default ProductCard;
