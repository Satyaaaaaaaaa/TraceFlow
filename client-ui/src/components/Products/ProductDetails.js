import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
import { FaShoppingCart, FaHeart, FaStar, FaCheckCircle, FaArrowLeft, FaClock, FaUser, FaLink } from 'react-icons/fa';
import axios from 'axios';
import { CartContext } from '../Cart/CartContext';
import './styles/ProductDetails.css';

const API_URL = process.env.REACT_APP_API_URL;

const ProductDetails = () => {
  const { productID, id } = useParams();
  const actualId = productID || id;
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [quantity, setQuantity]     = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/product/${actualId}`);
      if (response.data.status) {
        setProduct(response.data.data || response.data);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [actualId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const handleAddToCart = async () => {
      try {
        await addToCart(product, quantity); 
        alert(`Added ${product.name} to cart!`);
      } catch (err) {
        alert('Please login to add items to cart');
      }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product, quantity);
      navigate('/cart');
    } catch (err) {
      alert('Please login to continue');
    }
  };

  if (loading) {
    return (
      <div className="npd-loading">
        <Spinner animation="border" />
        <p>Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Product not found'}</Alert>
        <Button variant="dark" onClick={() => navigate('/')}>
          <FaArrowLeft className="me-2" /> Back to Home
        </Button>
      </Container>
    );
  }

  const images      = product.ProductImages?.map(img => img.imageUrl) || (product.image ? [product.image] : []);
  const isSynced    = product.ProductBlockchainStatus?.blockchainStatus;
  const mainImgSrc  = `${API_URL}${images[selectedImage] || product.image || ''}`;
  const fallback    = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3C/svg%3E';

  return (
    <div className="npd-page">

      {/* Top bar */}
      <div className="npd-topbar">
        <button className="npd-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> <span>Back</span>
        </button>
        {isSynced && (
          <span className="npd-verified-pill">
            <FaCheckCircle /> Blockchain Verified
          </span>
        )}
      </div>

      {/* Main layout */}
      <div className="npd-body">

        {/* ── LEFT: Gallery ── */}
        <div className="npd-gallery">
          {images.length > 1 && (
            <div className="npd-thumbs">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`npd-thumb ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={`${API_URL}${img}`} alt="" onError={e => { e.target.src = fallback; }} />
                </button>
              ))}
            </div>
          )}
          <div className="npd-main-wrap">
            <img
              className="npd-main-img"
              src={mainImgSrc}
              alt={product.name}
              onError={e => { e.target.src = fallback; }}
            />
            {isSynced && (
              <div className="npd-img-badge">
                <FaCheckCircle /> Verified
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Info ── */}
        <div className="npd-info">

          {/* Category tags */}
          {product.Categories?.length > 0 && (
            <div className="npd-tags">
              {product.Categories.map(cat => (
                <span key={cat.id} className="npd-tag">{cat.name}</span>
              ))}
            </div>
          )}

          <h1 className="npd-title">{product.name}</h1>

          {/* Stars */}
          <div className="npd-stars">
            {[1,2,3,4,5].map(n => (
              <FaStar key={n} className={n <= 4 ? 'star-on' : 'star-off'} />
            ))}
            <span className="npd-star-label">4.0 / 5</span>
          </div>

          {/* Price */}
          <div className="npd-price">
            <span className="npd-price-amount">₹{parseFloat(product.price).toFixed(2)}</span>
            <span className="npd-price-unit">{product.priceUnit || 'INR'}</span>
          </div>

          {/* Description */}
          <p className="npd-desc">{product.description}</p>

          <div className="npd-divider" />

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="npd-specs">
              <p className="npd-label">Specifications</p>
              {Object.entries(product.specifications).map(([key, val]) =>
                val && val !== '_custom_' ? (
                  <div key={key} className="npd-spec-row">
                    <span className="npd-spec-key">{key}</span>
                    <span className="npd-spec-val">{val}</span>
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="npd-qty-section">
            <p className="npd-label">Quantity</p>
            <div className="npd-qty-row">
              <div className="npd-qty-ctrl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input
                  type="number"
                  value={quantity}
                  min="1"
                  max={product.quantity || 100}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button onClick={() => setQuantity(Math.min(product.quantity || 100, quantity + 1))}>+</button>
              </div>
              <span className="npd-avail">{product.quantity || 0} available</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="npd-actions">
            <button
              className={`npd-btn-addcart ${cartSuccess ? 'success' : ''}`}
              onClick={handleAddToCart}
            >
              {cartSuccess
                ? <><FaCheckCircle className="me-2" />Added!</>
                : <><FaShoppingCart className="me-2" />Add to Bag</>
              }
            </button>
            <button className="npd-btn-buynow" onClick={handleBuyNow}>
              Buy Now
            </button>
            <button
              className={`npd-btn-wish ${wishlisted ? 'on' : ''}`}
              onClick={() => setWishlisted(v => !v)}
            >
              <FaHeart />
            </button>
          </div>

          {/* Trust strip */}
          <div className="npd-trust">
            <span>✦ Free Shipping on orders over ₹999</span>
            <span>✦ 30-Day Returns</span>
            <span>✦ Secure Checkout</span>
          </div>

        </div>
      </div>

      {/* Blockchain Traceability */}
      {product.traceabilityHistory?.length > 0 && (
        <div className="npd-trace">
          <Container>
            <div className="npd-trace-head">
              <FaCheckCircle className="npd-trace-icon" />
              <div>
                <h3>Product Traceability History</h3>
                <p>This product's journey is recorded on the blockchain for complete transparency.</p>
              </div>
            </div>
            <div className="npd-timeline">
              {product.traceabilityHistory.map((entry, i) => (
                <div key={i} className="npd-tl-item">
                  <div className="npd-tl-dot" />
                  <div className="npd-tl-body">
                    <div className="npd-tl-action">
                      {entry.value.history.slice(-1)[0].action}
                    </div>
                    <div className="npd-tl-meta">
                      <span><FaClock className="npd-mi" />{new Date(entry.timestamp.seconds * 1000).toLocaleString()}</span>
                      <span><FaUser className="npd-mi" />{entry.value.history.slice(-1)[0].actor}</span>
                      <span><FaLink className="npd-mi" /><code>{entry.txId.substring(0, 20)}…</code></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;