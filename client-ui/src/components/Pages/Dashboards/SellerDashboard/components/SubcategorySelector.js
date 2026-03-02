import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import { getAllCategories } from '../../../../../services/categoryServices';

const SubcategorySelector = ({ selectedCategories, setSelectedCategories }) => {
  const [allCategories, setAllCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const loadSubcategories = (parentId) => {
      // Filter subcategories by parentId
      const subs = allCategories.filter(cat => cat.parentId === Number(parentId));
      setSubcategories(subs);
    };

    if (selectedMainCategory) {
      loadSubcategories(selectedMainCategory);
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedMainCategory, allCategories]);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response.status) {
        setAllCategories(response.categories);
        // Filter main categories (parentId === null)
        const mains = response.categories.filter(cat => cat.parentId === null);
        setMainCategories(mains);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      setError('Error loading categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMainCategory = () => {
    if (!selectedMainCategory) return;

    const category = mainCategories.find(cat => cat.id === Number(selectedMainCategory));
    if (category && !selectedCategories.find(c => c.id === category.id)) {
      setSelectedCategories(prev => [...prev, category]);
    }
    setSelectedMainCategory('');
    setSubcategories([]);
    setSelectedSubcategory('');
  };

  const handleAddSubcategory = () => {
    if (!selectedSubcategory) return;

    const subcategory = subcategories.find(sub => sub.id === Number(selectedSubcategory));
    if (subcategory && !selectedCategories.find(c => c.id === subcategory.id)) {
      setSelectedCategories(prev => [...prev, subcategory]);
    }
    setSelectedSubcategory('');
  };

  const handleRemoveCategory = (categoryId) => {
    setSelectedCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  if (loading) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" size="sm" />
        <p className="small text-muted mt-2">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Category Selection</Form.Label>
        
        {/* Main Category Selection */}
        <Row className="g-2 mb-3">
          <Col md={8}>
            <Form.Select 
              value={selectedMainCategory}
              onChange={(e) => setSelectedMainCategory(e.target.value)}
              size="sm"
            >
              <option value="">Select Main Category</option>
              {mainCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <button
              type="button"
              className="btn btn-primary btn-sm w-100"
              onClick={handleAddMainCategory}
              disabled={!selectedMainCategory}
            >
              Add Category
            </button>
          </Col>
        </Row>

        {/* Subcategory Selection */}
        {selectedMainCategory && (
          <Row className="g-2 mb-3">
            <Col md={8}>
              <Form.Select 
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                size="sm"
                disabled={subcategories.length === 0}
              >
                <option value="">
                  {subcategories.length === 0 
                    ? 'No subcategories available'
                    : 'Select Subcategory'
                  }
                </option>
                {subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <button
                type="button"
                className="btn btn-secondary btn-sm w-100"
                onClick={handleAddSubcategory}
                disabled={!selectedSubcategory}
              >
                Add Subcategory
              </button>
            </Col>
          </Row>
        )}

        {/* Selected Categories Display */}
        {selectedCategories.length > 0 && (
          <div className="mt-3">
            <Form.Label className="small text-muted">Selected Categories:</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {selectedCategories.map(cat => (
                <Badge 
                  key={cat.id} 
                  bg="primary" 
                  className="d-flex align-items-center py-2 px-3"
                  style={{ fontSize: '0.9rem' }}
                >
                  {cat.name}
                  <FaTimes 
                    className="ms-2" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRemoveCategory(cat.id)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Form.Text className="text-muted">
          Select main categories or drill down to subcategories for more specific classification
        </Form.Text>
      </Form.Group>
    </div>
  );
};

export default SubcategorySelector;