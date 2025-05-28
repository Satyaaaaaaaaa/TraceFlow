import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Spinner, Button, Alert, ProgressBar } from 'react-bootstrap';
import ProductForm from './ProductForm';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    priceUnit: 'inr',
    image: null,
    categoryId: ''
  });
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/Categories.json');
        if (response.data && response.data[0] && response.data[0].Categories) {
          setCategories(response.data[0].Categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setMessage('Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleCategoryChange = (id) => {
    setProductData(prevData => ({ ...prevData, categoryId: id }));
  };

  const handleFileChange = (e) => {
    setProductData(prevData => ({ ...prevData, image: e.target.files[0] }));
  };

  const resetForm = () => {
    setProductData({
      name: '',
      description: '',
      price: '',
      priceUnit: 'inr',
      image: null,
      categoryId: ''
    });
    setUploadProgress(0);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = sessionStorage.getItem('authToken');
      let imagePath = '';

      if (productData.image) {
        const formData = new FormData();
        formData.append('image', productData.image);

        const uploadResponse = await axios.post('/upload/image/', formData, {
          headers: { Authorization: `Bearer ${token}` },
          onUploadProgress: progressEvent => {
            setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
          }
        });
        imagePath = uploadResponse.data.path;
      }

      const payload = {
        name: productData.name,
        description: productData.description,
        image: imagePath || productData.image,
        price: parseFloat(productData.price),
        priceUnit: productData.priceUnit,
        categoryIds: productData.categoryId ? [productData.categoryId] : []
      };

      await axios.post('/product/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Product added successfully!');
      resetForm();
    } catch (error) {
      console.error('Error adding product:', error.response?.data || error.message);
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="dashboard-container py-5">
      {loading && (
        <Row className="justify-content-center">
          <Spinner animation="border" variant="primary" />
        </Row>
      )}

      {!loading && (
        <>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <h2 className="mb-4 text-center" style={{ fontWeight: '700', letterSpacing: '1px' }}>
                Add New Product
              </h2>

              {message && (
                <Alert variant={message.startsWith('Error') ? 'danger' : 'success'}>
                  {message}
                </Alert>
              )}

              <ProductForm
                productData={productData}
                categories={categories}
                selectedCategory={productData.categoryId}
                loading={loading}
                onInputChange={handleInputChange}
                onCategoryChange={handleCategoryChange}
                onFileChange={handleFileChange}
                onSubmit={handleSubmit}
              />

              {uploadProgress > 0 && uploadProgress < 100 && (
                <ProgressBar
                  now={uploadProgress}
                  label={`${uploadProgress}%`}
                  className="my-3"
                  animated
                  striped
                />
              )}
            </Col>
          </Row>

          {/* Back button fixed at the bottom */}
          <Row className="mt-5 justify-content-center">
            <Col md={8} lg={6} className="text-center">
              <Button variant="secondary" onClick={() => navigate('/seller-dashboard')}>
                &larr; Back
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default AddProduct;
