import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// import { getProductDetails } from '../../services/productService'; // OPTIONAL: If you want to use your service, swap this in
import { CartContext } from '../Cart/CartContext'; // Update path as needed
import './styles/ProductDetails.css';

const ProductDetails = () => {
  // Support for either param (`id` or `productID`)
  const { id, productID } = useParams();
  const finalId = id || productID;
  
  const { cartItems, addToCart, updateCartItem } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('authToken');
        /*
        // Use this if you prefer your productService
        const response = await getProductDetails(finalId);
        const data = response.data; 
        */
        // Axios version:
        const response = await axios.get(`/product/${finalId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data || response.data; // Structure failsafe
        setProduct(data);
        setReviews(data.reviews || []);
        setError('');
      } catch (err) {
        setError('Failed to fetch product details.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (finalId) fetchProduct();
  }, [finalId]);

  // Add Review
  const handleAddReview = async () => {
    if (!newReview || !rating) return;
    const token = sessionStorage.getItem('authToken');
    try {
      const response = await axios.post(
        `/product/${finalId}/reviews`,
        { review: newReview, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews([...reviews, response.data]);
      setNewReview('');
      setRating(0);
    } catch (err) {
      console.error('Failed to add review:', err);
    }
  };

  // Add to Cart 
  const handleAddToCart = async () => {
    if (product) {
      const existingCartItem = cartItems.find((item) => item.id === product.id);
      if (existingCartItem) {
        await updateCartItem(existingCartItem.id, existingCartItem.quantity + quantity);
      } else {
        await addToCart({ ...product, quantity });
      }
    }
  };

  // Change quantity
  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  // Image host fallback (edit this depending on your actual setup)
  const imageUrl = product ? (
    // Prefer one or the other:
    product.image ? (
      `http://localhost:3002/${product.image}` // Or 3001 if that's your image server
    ) : ''
  ) : '';

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="product-details">
      <div className="product-details-container">
        {/* IMAGE */}
        <div className="product-image-large">
          {imageUrl && (
            <img src={imageUrl} alt={product.name} className="product-image-large" style={{ maxWidth: '400px' }} />
          )}
        </div>
        {/* INFO + CART + REVIEWS */}
        <div className="product-info">
          <h2>{product.name}</h2>
          <div className="rating">
            {[...Array(5)].map((_, index) => (
              <span
                key={index}
                className={index < (product.rating || 0) ? 'star filled' : 'star'}
              >★</span>
            ))}
            <span>{product.rating} ({reviews.length} reviews)</span>
          </div>
          <p>{product.description}</p>
          <div className="product-price-container">
            <span>Price: {product.price}{product.priceUnit ? ` ${String(product.priceUnit).toUpperCase()}` : ''}</span>
          </div>
          {/* QUANTITY CONTROLS */}
          <div className="quantity-controls">
            <button onClick={() => handleQuantityChange(-1)}>-</button>
            <span>{quantity}</span>
            <button onClick={() => handleQuantityChange(1)}>+</button>
          </div>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
          {/* TRACEABILITY HISTORY */}
          <hr />
          <h3>Product Traceability History</h3>
          {product.traceabilityHistory && product.traceabilityHistory.length > 0 ? (
            <ul className="traceability-list">
              {product.traceabilityHistory.map((entry, index) => (
                <li key={index} className="traceability-item">
                  <div className="timestamp">
                    {entry.timestamp && entry.timestamp.seconds
                      ? new Date(entry.timestamp.seconds * 1000).toLocaleString()
                      : ''}
                  </div>
                  <div className="action">
                    <strong>Action:</strong>{' '}
                    {entry.value &&
                      entry.value.history &&
                      entry.value.history.length &&
                      entry.value.history.slice(-1)[0].action}
                  </div>
                  <div className="actor">
                    <strong>By:</strong>{' '}
                    {entry.value &&
                      entry.value.history &&
                      entry.value.history.length &&
                      entry.value.history.slice(-1)[0].actor}
                  </div>
                  <div className="tx-id">
                    <strong>Transaction ID:</strong>{' '}
                    <span>
                      {entry.txId
                        ? entry.txId.substring(0, 20) + '...'
                        : ''}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No traceability history available for this product.</p>
          )}
          {/* REVIEW FORM */}
          <div className="review-form">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Write your review here"
              rows="3"
            />
            <div className="review-rating">
              <span>Rate the product: </span>
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={index < rating ? 'star filled' : 'star'}
                  onClick={() => setRating(index + 1)}
                  style={{ cursor: 'pointer' }}
                >★</span>
              ))}
            </div>
            <button onClick={handleAddReview} disabled={!newReview || !rating}>Submit Review</button>
          </div>
          {/* REVIEWS */}
          <div className="reviews">
            {reviews.length > 0 ? reviews.map((review, idx) => (
              <div key={idx} className="review">
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
                  ))}
                </div>
                <p>{review.text || review.review}</p>
              </div>
            )) : <p>No reviews yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
