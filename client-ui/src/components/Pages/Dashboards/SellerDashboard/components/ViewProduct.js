import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle, FaEdit, FaArrowLeft, FaBoxOpen, FaDollarSign, FaTags, FaLayerGroup } from 'react-icons/fa';
import axios from 'axios';

const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

const fetchProduct = useCallback(async () => {
  try {
    const token = sessionStorage.getItem('authToken');
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/product/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setProduct(response.data.data || response.data);
  } catch (err) {
    setError('Failed to load product');
  } finally {
    setLoading(false);
  }
}, [id]);

useEffect(() => {
  fetchProduct();
}, [fetchProduct]);

  const isSynced = product?.ProductBlockchainStatus?.blockchainStatus || 
                   product?.blockchainStatus === true || 
                   product?.blockchainStatus === 1;

  const images = product?.images || (product?.image ? [product.image] : []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Product not found'}</Alert>
        <Button variant="secondary" onClick={() => navigate('/my-products')}>
          <FaArrowLeft className="me-2" /> Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', padding: '2rem 0' }}>
      <Container style={{ maxWidth: '1000px' }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button variant="outline-secondary" onClick={() => navigate('/my-products')}>
            <FaArrowLeft className="me-2" /> Back to Products
          </Button>
          <Button variant="success" onClick={() => navigate(`/edit-product/${id}`)}>
            <FaEdit className="me-2" /> Edit Product
          </Button>
        </div>

        <Row className="g-4">
          {/* Left: Images */}
          <Col md={5}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ height: '300px', overflow: 'hidden' }}>
                <img
                  src={images.length > 0 
                    ? `${process.env.REACT_APP_API_URL}${images[selectedImage]}`
                    : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E'
                  }
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E'; }}
                />
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="d-flex gap-2 p-2" style={{ overflowX: 'auto' }}>
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={`${process.env.REACT_APP_API_URL}${img}`}
                      alt={`thumb ${index}`}
                      onClick={() => setSelectedImage(index)}
                      style={{
                        width: '60px', height: '60px', objectFit: 'cover',
                        borderRadius: '8px', cursor: 'pointer',
                        border: selectedImage === index ? '2px solid #667eea' : '2px solid transparent',
                        flexShrink: 0
                      }}
                    />
                  ))}
                </div>
              )}
            </Card>
          </Col>

          {/* Right: Details */}
          <Col md={7}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
              <Card.Body className="p-4">
                {/* Name & Blockchain Status */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h2 style={{ fontWeight: '700', color: '#1a1a1a' }}>{product.name}</h2>
                  {isSynced ? (
                    <Badge bg="success" className="d-flex align-items-center gap-1 px-2 py-2">
                      <FaCheckCircle /> Blockchain Verified
                    </Badge>
                  ) : (
                    <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1 px-2 py-2">
                      <FaExclamationTriangle /> Not Synced
                    </Badge>
                  )}
                </div>

                {/* Price */}
                <div className="d-flex align-items-center gap-2 mb-3 p-3" style={{ backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                  <FaDollarSign style={{ color: '#00897b', fontSize: '1.25rem' }} />
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00897b' }}>
                    ₹{parseFloat(product.price).toFixed(2)}
                  </span>
                  <span style={{ color: '#6c757d' }}>{product.priceUnit?.toUpperCase()}</span>
                </div>

                {/* Quantity */}
                {product.quantity !== undefined && (
                  <div className="d-flex align-items-center gap-2 mb-3 p-3" style={{ backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                    <FaLayerGroup style={{ color: '#667eea', fontSize: '1.1rem' }} />
                    <span style={{ fontWeight: '600' }}>Quantity:</span>
                    <span>{product.quantity}</span>
                  </div>
                )}

                {/* Description */}
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaBoxOpen style={{ color: '#667eea' }} />
                    <span style={{ fontWeight: '700', color: '#4a5568' }}>DESCRIPTION</span>
                  </div>
                  <p style={{ color: '#4a5568', lineHeight: '1.6' }}>{product.description}</p>
                </div>

                {/* Categories */}
                {product.Categories?.length > 0 && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaTags style={{ color: '#667eea' }} />
                      <span style={{ fontWeight: '700', color: '#4a5568' }}>CATEGORIES</span>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {product.Categories.map(cat => (
                        <Badge key={cat.id} bg="info" text="dark" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product ID */}
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted">
                    Product ID: #{product.id} · Added {new Date(product.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ViewProduct;