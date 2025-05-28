import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) throw new Error('Not authenticated');

        const response = await axios.get('/product/user/products', {
          headers: { Authorization: `Bearer ${token}` }
        });

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
    };

    fetchMyProducts();
  }, []);

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
      <h2 className="mb-4 text-center" style={{ fontWeight: '700', letterSpacing: '1px' }}>
        My Products
      </h2>

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {products.map(product => (
          <Col key={product.id}>
            <Card className="shadow-sm h-100">
              <div style={{ height: '180px', overflow: 'hidden' }}>
                <Card.Img
                  variant="top"
                  src={product.image || '/placeholder-image.png'}
                  alt={product.name}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                  {product.name}
                </Card.Title>
                <Card.Text className="mb-2 text-muted" style={{ fontWeight: '500' }}>
                  Price: ₹{product.price.toFixed(2)} {product.priceUnit.toUpperCase()}
                </Card.Text>

                {product.Categories && product.Categories.length > 0 && (
                  <div className="mb-3">
                    {product.Categories.map(cat => (
                      <Badge
                        key={cat.id}
                        bg="info"
                        text="dark"
                        className="me-1"
                        style={{ fontWeight: '500', fontSize: '0.85rem' }}
                      >
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline-primary"
                  className="mt-auto align-self-start"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="text-center mt-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          &larr; Back
        </Button>
      </div>
    </Container>
  );
};

export default MyProducts;
