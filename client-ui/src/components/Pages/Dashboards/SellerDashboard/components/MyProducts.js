import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaEye, FaTrash, FaBoxOpen, FaSync } from 'react-icons/fa';
import { getUserProducts } from '../../../../../services/productServices';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  //const [syncingProductId, setSyncingProductId] = useState(null);
  const [syncMessages, setSyncMessage] = useState({ id: null, type: '', text: '' });
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null, productName: '' });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');

      const response = await axios.get(
        `${API_URL}/product/user/products`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        setProducts(response.data.data);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);
  
  /*
  const handleSyncProduct = async (productId) => {
    setSyncingProductId(productId);
    setSyncMessages(prev => ({ ...prev, [productId]: null }));

    try {
      console.log('Syncing product:', productId); 
      const response = await syncProductToBlockchain(productId); //ADJUST LATER
      
      console.log('Sync response:', response); 
      
      if (response.status) {
        setSyncMessages(prev => ({ 
          ...prev, 
          [productId]: { type: 'success', text: response.message || 'Product synced successfully!' } 
        }));
        
        // Refresh products to get updated blockchain status
        await fetchMyProducts();

        setTimeout(() => {
          setSyncMessages(prev => ({ ...prev, [productId]: null }));
        }, 3000);
      } else {
        throw new Error(response.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error); 
      setSyncMessages(prev => ({ 
        ...prev, 
        [productId]: { 
          type: 'danger', 
          text: error.response?.data?.error || error.message || 'Sync failed' 
        } 
      }));
    } finally {
      setSyncingProductId(null);
    }
  };*/

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.delete(
        `${API_URL}/product/${deleteModal.productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status) {
        setDeleteModal({ show: false, productId: null, productName: '' });
        await fetchMyProducts();
      } else {
        setError(response.data.error || 'Failed to delete');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  // Helper function to get blockchain status
  /* const getBlockchainStatus = (product) => {
    return product.blockchainStatus === true || product.blockchainStatus === 1;
    // Check if ProductBlockchainStatus exists and has blockchainStatus true
    /*if (product.ProductBlockchainStatus?.blockchainStatus) {
      return true;
    }
    // Fallback to product's own blockchainStatus field
    return product.blockchainStatus === true || product.blockchainStatus === 1;
  };*/

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5 text-danger">
        {error}
      </Container>
    );
  }

  if (products.length === 0) {
    return (
      <Container className="text-center py-5">
        <h4>No products found</h4>
        <p>You haven't added any products yet.</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </Container>
    );
  }  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: '700' }}>My Products</h2>
        <Button variant="success" onClick={() => navigate('/add-product')}>
          + Add Product
        </Button>
      </div>

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {products.map(product => {
          //const isSynced = getBlockchainStatus(product);

          return (
            <Col key={product.id}>
              <Card className="shadow-sm h-100 product-card">
                {/* Product Image */}
                <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                  <Card.Img
                    variant="top"
                    src={`${process.env.REACT_APP_API_URL}${product.image}`}
                    alt={product.name}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E';
                    }}
                  />
                  {/* Blockchain Badge */}
                  {/*<div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    {isSynced ? (
                      <Badge bg="success" className="d-flex align-items-center gap-1">
                        <FaCheckCircle /> Synced
                      </Badge>
                    ) : (
                      <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1">
                        <FaExclamationTriangle /> Not Synced
                      </Badge>
                    )}
                  </div>*/}
                </div>

                <Card.Body className="d-flex flex-column">
                  <Card.Title style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                    {product.name}
                  </Card.Title>
                  <Card.Text className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                    ₹{parseFloat(product.price).toFixed(2)} {product.priceUnit?.toUpperCase()}
                  </Card.Text>

                  {/* Categories */}
                  {product.Categories?.length > 0 && (
                    <div className="mb-2 d-flex flex-wrap gap-1">
                      {product.Categories.map(cat => (
                        <Badge key={cat.id} bg="info" text="dark" style={{ fontSize: '0.75rem' }}>
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Sync Message */}
                  {syncMessages[product.id] && (
                    <Alert variant={syncMessages[product.id].type} className="py-1 px-2 mb-2 small">
                      {syncMessages[product.id].text}
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-auto d-flex flex-column gap-2">
                    {/* Sync Button */}
                    {/*{!isSynced && (
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleSyncProduct(product.id)}
                        disabled={syncingProductId === product.id}
                      >
                        {syncingProductId === product.id ? (
                          <><Spinner animation="border" size="sm" className="me-1" /> Syncing...</>
                        ) : (
                          <><FaSync className="me-1" /> Sync to Blockchain</>
                        )}
                      </Button>
                    )}*/}

                    {/* View & Edit Buttons */}
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => navigate(`/view-product/${product.id}`)}
                      >
                        <FaEye className="me-1" /> View
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => navigate(`/edit-product/${product.id}`)}
                      >
                        <FaEdit className="me-1" /> Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setDeleteModal({ 
                          show: true, 
                          productId: product.id, 
                          productName: product.name 
                        })}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Delete Confirmation Modal */}
      {/* Delete Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, productId: null, productName: '' })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{deleteModal.productName}</strong>? This cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, productId: null, productName: '' })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
            {deleting ? <><Spinner animation="border" size="sm" className="me-1" /> Deleting...</> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyProducts;
  