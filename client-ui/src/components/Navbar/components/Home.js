import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaStar } from 'react-icons/fa';
import axios from 'axios';
import '../styles/home.css';

const ROWS_PER_PAGE = 3;
const ITEMS_PER_ROW = 4;
const API_URL = process.env.REACT_APP_API_URL;

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleItems, setVisibleItems] = useState(ROWS_PER_PAGE * ITEMS_PER_ROW);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Get URL parameters for filtering
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const subcategoryFilter = searchParams.get('subcategory');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products from:', `${API_URL}/product/`);
      
      const response = await axios.get(`${API_URL}/product/`);
      
      console.log('API Response:', response.data);
      
      const productData = response.data.data || response.data.products || response.data;
      setProducts(Array.isArray(productData) ? productData : []);
      setError(null);

    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    if (!products.length) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(product => {
        if (product.Categories && Array.isArray(product.Categories)) {
          return product.Categories.some(cat => cat.name === categoryFilter);
        }
        return false;
      });
    }

    // Filter by subcategory
    if (subcategoryFilter) {
      filtered = filtered.filter(product => {
        return product.subcategory === subcategoryFilter;
      });
    }

    setFilteredProducts(filtered);
    setVisibleItems(ROWS_PER_PAGE * ITEMS_PER_ROW);
  }, [products, categoryFilter, subcategoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleLoadMore = () => {
    setVisibleItems((prev) => Math.min(prev + ROWS_PER_PAGE * ITEMS_PER_ROW, filteredProducts.length));
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const getFilterText = () => {
    if (subcategoryFilter && categoryFilter) {
      return `${categoryFilter} > ${subcategoryFilter}`;
    }
    if (categoryFilter) {
      return categoryFilter;
    }
    return 'All Products';
  };

  const productsToShow = filteredProducts.slice(0, visibleItems);

  if (loading && visibleItems === ROWS_PER_PAGE * ITEMS_PER_ROW) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading products...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Products</Alert.Heading>
          <p>{error}</p>
          <p className="mb-0">
            <small>API URL: {API_URL}/product/</small>
          </p>
          <Button variant="outline-danger" className="mt-3" onClick={fetchProducts}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="home-page">
      <Container className="py-4">
        {/* Filter Indicator */}
        {(categoryFilter || subcategoryFilter) && (
          <div className="filter-indicator mb-3">
            <span className="filter-label">Showing: </span>
            <Badge bg="primary" className="me-2">{getFilterText()}</Badge>
            <Button 
              variant="link"
              size="sm"
              onClick={() => navigate('/')}
            >
              Clear Filter
            </Button>
          </div>
        )}

        {/* Products Section */}
        <div className="products-section">
          <div className="section-header mb-4">
            <h2>Products</h2>
            <p className="text-muted">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {productsToShow.length > 0 ? (
            <>
              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {productsToShow.map(product => (
                  <Col key={product.id}>
                    <Card 
                      className="product-card h-100"
                      onClick={() => handleProductClick(product.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Product Image */}
                      <div className="product-image-container">
                        <Card.Img
                          variant="top"
                          src={`${API_URL}${product.image}`}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        
                        {/* Blockchain Badge */}
                        {product.ProductBlockchainStatus?.blockchainStatus && (
                          <Badge bg="success" className="blockchain-badge">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>

                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="product-name">{product.name}</Card.Title>
                        
                        <Card.Text className="product-description">
                          {product.description.length > 60 
                            ? `${product.description.substring(0, 60)}...` 
                            : product.description
                          }
                        </Card.Text>

                        {/* Categories */}
                        {product.Categories?.length > 0 && (
                          <div className="mb-2">
                            {product.Categories.slice(0, 2).map(cat => (
                              <Badge key={cat.id} bg="light" text="dark" className="me-1 category-badge">
                                {cat.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Price and Actions */}
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="product-price">
                              ₹{parseFloat(product.price).toFixed(2)}
                            </div>
                            <div className="product-rating">
                              <FaStar className="text-warning" />
                              <span className="ms-1">4.5</span>
                            </div>
                          </div>

                          <div className="d-flex gap-2">
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="flex-grow-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductClick(product.id);
                              }}
                            >
                              <FaShoppingCart className="me-1" /> View
                            </Button>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                              
                              }}
                            >
                              <FaHeart />
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Load More Button */}
              {visibleItems < filteredProducts.length && (
                <div className="text-center mt-4">
                  <Button 
                    variant="outline-primary" 
                    onClick={handleLoadMore}
                  >
                    Load More Products
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <h4>No products found</h4>
              <p className="text-muted">
                {categoryFilter 
                  ? `No products available in "${getFilterText()}" category.` 
                  : 'No products available. Add some products to see them here!'}
              </p>
              {categoryFilter && (
                <Button 
                  variant="primary"
                  onClick={() => navigate('/')}
                >
                  View All Products
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Home;