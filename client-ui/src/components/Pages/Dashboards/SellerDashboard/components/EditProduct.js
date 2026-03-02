import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaBoxOpen, FaDollarSign, FaTags, FaCamera, FaTimes, FaUpload, FaImage } from 'react-icons/fa';
import axios from 'axios';
import SubcategorySelector from './SubcategorySelector';
import '../styles/AddProductStyles.css';
const API_URL = process.env.REACT_APP_API_URL;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    name: '', description: '', price: '', priceUnit: 'inr', quantity: 1
  });
  const [images, setImages] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

const fetchProduct = useCallback(async () => {
  try {
    const token = sessionStorage.getItem('authToken');
    const response = await axios.get(
      `${API_URL}/product/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const product = response.data.data || response.data;
    setProductData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      priceUnit: product.priceUnit || 'inr',
      quantity: product.quantity || 1
    });
    if (product.image) setImages([product.image]);
    if (product.Categories?.length > 0) setSelectedCategories(product.Categories);
  } catch (err) {
    setError('Failed to load product');
  } finally {
    setFetching(false);
  }
}, [id]);

useEffect(() => {
  fetchProduct();
}, [fetchProduct]);

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await axios.post(
          `${API_URL}/upload/image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${sessionStorage.getItem('authToken')}`
            }
          }
        );
        return response.data.imageUrl || `/${response.data.files[0].path}`;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
      e.target.value = '';
    } catch (err) {
      setError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = sessionStorage.getItem('authToken');
      const payload = {
        ...productData,
        price: parseFloat(productData.price),
        images,
        categoryIds: selectedCategories.map(cat => cat.id)
      };

      const response = await axios.patch(
        `${API_URL}/product/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        setSuccess('Product updated successfully!');
        setTimeout(() => navigate('/my-products'), 2000);
      } else {
        setError(response.data.error || 'Failed to update product');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <div className="add-product-page">
      <Container className="add-product-container">
        <div className="add-product-header">
          <h1>Edit Product</h1>
          <p className="subtitle">Update your product details below.</p>
        </div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" className="mb-4">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Product Information */}
          <Card className="form-section mb-4">
            <Card.Body>
              <div className="section-header">
                <FaBoxOpen className="section-icon-fa" />
                <h5 className="section-title">PRODUCT INFORMATION</h5>
              </div>
              <Form.Group className="mb-3">
                <Form.Label>Product Name <span className="required">*</span></Form.Label>
                <Form.Control type="text" name="name" value={productData.name} onChange={handleChange} className="form-input" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description <span className="required">*</span></Form.Label>
                <Form.Control as="textarea" rows={4} name="description" value={productData.description} onChange={handleChange} className="form-input" required />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Pricing */}
          <Card className="form-section mb-4">
            <Card.Body>
              <div className="section-header">
                <FaDollarSign className="section-icon-fa" />
                <h5 className="section-title">PRICING</h5>
              </div>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price <span className="required">*</span></Form.Label>
                    <Form.Control type="number" step="0.01" name="price" value={productData.price} onChange={handleChange} className="form-input" required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Currency</Form.Label>
                    <Form.Select name="priceUnit" value={productData.priceUnit} onChange={handleChange} className="form-input">
                      <option value="inr">INR</option>
                      <option value="usd">USD</option>
                      <option value="eur">EUR</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity <span className="required">*</span></Form.Label>
                    <div className="quantity-input-wrapper">
                      <button type="button" className="quantity-btn"
                        onClick={() => setProductData(prev => ({ ...prev, quantity: Math.max(1, (parseInt(prev.quantity) || 1) - 1) }))}>−</button>
                      <Form.Control type="number" name="quantity" value={productData.quantity} onChange={handleChange} className="form-input quantity-field" min="1" required />
                      <button type="button" className="quantity-btn"
                        onClick={() => setProductData(prev => ({ ...prev, quantity: (parseInt(prev.quantity) || 0) + 1 }))}>+</button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Category */}
          <Card className="form-section mb-4">
            <Card.Body>
              <div className="section-header">
                <FaTags className="section-icon-fa" />
                <h5 className="section-title">CATEGORY</h5>
              </div>
              <SubcategorySelector selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />
            </Card.Body>
          </Card>

          {/* Images */}
          <Card className="form-section mb-4">
            <Card.Body>
              <div className="section-header">
                <FaCamera className="section-icon-fa" />
                <h5 className="section-title">PRODUCT IMAGES</h5>
              </div>
              <div className="image-upload-area">
                {images.length === 0 ? (
                  <label htmlFor="image-upload" className="upload-placeholder">
                    <FaImage size={48} className="upload-icon" />
                    <p className="upload-text">Click to upload images</p>
                    <p className="upload-subtext">JPG, PNG, WEBP — Max 5MB each</p>
                    <input id="image-upload" type="file" accept="image/*" multiple onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
                  </label>
                ) : (
                  <>
                    <Row className="g-3 mb-3">
                      {images.map((imageUrl, index) => (
                        <Col xs={6} md={4} lg={3} key={index}>
                          <div className="image-preview-card">
                            <img
                              src={imageUrl.startsWith('/uploads') ? `${API_URL}${imageUrl}` : imageUrl}
                              alt={`Product ${index + 1}`}
                              className="preview-image"
                              onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E'; }}
                            />
                            <button type="button" className="remove-image-btn" onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}>
                              <FaTimes />
                            </button>
                            {index === 0 && <div className="primary-badge">Primary</div>}
                          </div>
                        </Col>
                      ))}
                    </Row>
                    <label htmlFor="image-upload" className="add-more-btn">
                      <FaUpload className="me-2" /> Add More Images
                      <input id="image-upload" type="file" accept="image/*" multiple onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
                    </label>
                  </>
                )}
                {uploading && (
                  <div className="uploading-indicator">
                    <Spinner animation="border" size="sm" className="me-2" /> Uploading...
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Actions */}
          <div className="form-actions">
            <Button variant="outline-secondary" onClick={() => navigate('/my-products')} disabled={loading} className="cancel-btn">
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={loading || uploading} className="submit-btn">
              {loading ? <><Spinner animation="border" size="sm" className="me-2" /> Updating...</> : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default EditProduct;