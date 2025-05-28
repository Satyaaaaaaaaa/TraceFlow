import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const UpdateProductModal = ({ show, onHide, productID, onProductUpdated }) => {
  const [categories, setCategories] = useState([]);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    priceUnit: 'inr',
    image: null,
    categoryIds: [] // For storing selected category IDs
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/Categories.json');
        if (response.data && response.data[0] && response.data[0].Categories) {
          setCategories(response.data[0].Categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchProductDetails = async () => {
      if (productID) {
        try {
          const response = await axios.get(`/product/${productID}`);
          const product = response.data;
          setProductData({
            name: product.name,
            description: product.description,
            price: product.price,
            priceUnit: product.priceUnit,
            image: null, // Keep image null until uploaded
            categoryIds: product.categoryIds || [] // Assume this is an array
          });
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      }
    };

    fetchCategories();
    fetchProductDetails();
  }, [productID]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCategoryChange = (id) => {
    setProductData(prevData => {
      const newCategoryIds = prevData.categoryIds.includes(id)
        ? prevData.categoryIds.filter(catId => catId !== id)
        : [...prevData.categoryIds, id];

      return {
        ...prevData,
        categoryIds: newCategoryIds
      };
    });
  };

  const handleFileChange = (e) => {
    setProductData(prevData => ({
      ...prevData,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = sessionStorage.getItem('authToken');
      let imagePath = '';

      // If the image needs to be uploaded first
      if (productData.image) {
        const formData = new FormData();
        formData.append('image', productData.image);

        const uploadResponse = await axios.post('/upload/image/', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          onUploadProgress: progressEvent => {
            setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
          }
        });
        imagePath = uploadResponse.data.path;
      }

      const payload = {
        name: productData.name,
        description: productData.description,
        image: imagePath || productData.image, // Use the uploaded path or the existing image
        price: parseFloat(productData.price),
        priceUnit: productData.priceUnit,
        categoryIds: productData.categoryIds
      };

      await axios.put(`/product/${productID}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setMessage('Product updated successfully!');
      onProductUpdated(payload); // Call the function to update the product list
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductData({
      name: '',
      description: '',
      price: '',
      priceUnit: 'inr',
      image: null,
      categoryIds: []
    });
    setUploadProgress(0);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant="success">{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formProductName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter product name"
              name="name"
              value={productData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formProductDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter product description"
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formProductImage">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {loading && <Spinner animation="border" />}
            {uploadProgress > 0 && <div>Upload Progress: {uploadProgress}%</div>}
          </Form.Group>

          <Form.Group controlId="formProductPrice">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter product price"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formProductCategories">
            <Form.Label>Categories</Form.Label>
            {categories.map(category => (
              <Form.Check
                key={category.id}
                type="checkbox"
                label={category.name}
                checked={productData.categoryIds.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
              />
            ))}
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Product'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateProductModal;
