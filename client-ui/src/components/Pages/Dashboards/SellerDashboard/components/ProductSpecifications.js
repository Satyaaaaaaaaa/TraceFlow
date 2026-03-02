import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { FaTimes, FaPlus } from 'react-icons/fa';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL

const ProductSpecifications = ({ selectedCategories, specifications, setSpecifications }) => {
    const [categoryAttributes, setCategoryAttributes] = useState([]);
    const [customSpecs, setCustomSpecs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCategoryAttributes = useCallback(async () => {
        if (selectedCategories.length === 0) {   
            setCategoryAttributes([]);
            return;
        }

        setLoading(true);
        try {
            const promises = selectedCategories.map(cat =>
                axios.get(`${API_URL}/category/${cat.id}/attributes`)
            );

            const responses = await Promise.all(promises);
            console.log('API responses:', responses.map(r => r.data));
            console.log('Selected categories:', selectedCategories);

            const allAttrs = responses.flatMap(r => r.data.data || []);
            const uniqueAttrs = Array.from(
                new Map(allAttrs.map(attr => [attr.attributeName, attr])).values()
            );

            setCategoryAttributes(uniqueAttrs);
        } catch (error) {
            console.error('Error fetching attributes:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategories]);

    useEffect(() => {
        fetchCategoryAttributes();
    }, [fetchCategoryAttributes]);

    const handleSpecChange = (attrName, value) => {
        setSpecifications(prev => ({
          ...prev,
          [attrName]: value
        }));
    };

    const addCustomSpec = () => {
        setCustomSpecs(prev => [...prev, { name: '', value: '' }]);
    };

    const updateCustomSpec = (index, field, value) => {
        const updated = [...customSpecs];
        updated[index][field] = value;
        setCustomSpecs(updated);    
        // Update specifications
        if (updated[index].name && updated[index].value) {
          handleSpecChange(updated[index].name, updated[index].value);
        }
    };

    const removeCustomSpec = (index) => {
        const removed = customSpecs[index];
        setCustomSpecs(prev => prev.filter((_, i) => i !== index));

        // Remove from specifications
        if (removed.name) {
          setSpecifications(prev => {
            const updated = { ...prev };
            delete updated[removed.name];
            return updated;
          });
        }
    };

    if (selectedCategories.length === 0) {
        return (
          <div className="text-muted text-center py-3">
            <small>Select a category to see specification options</small>
          </div>
        );
    }

    if (loading) {
        return <div className="text-center py-3"><small>Loading specifications...</small></div>;
    }

    return (
        <div>
          {/* Predefined Attributes */}
          {categoryAttributes.length > 0 && (
            <Row>
              {categoryAttributes.map(attr => (
                <Col md={6} key={attr.id}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      {attr.attributeName.charAt(0).toUpperCase() + attr.attributeName.slice(1)}
                      {attr.isRequired && <span className="required"> *</span>}
                    </Form.Label>

                    {attr.attributeType === 'dropdown' && attr.predefinedValues ? (
                      <div className="d-flex gap-2">
                        <Form.Select>
                          <option value="">Select {attr.attributeName}</option>
                          {(typeof attr.predefinedValues === 'string' 
                            ? JSON.parse(attr.predefinedValues)   
                            : attr.predefinedValues
                          ).map((val, idx) => (
                            <option key={idx} value={val}>{val}</option>
                          ))}
                          <option value="_custom_">Other (type below)</option>
                        </Form.Select>
                      
                        {specifications[attr.attributeName] === '_custom_' && (
                          <Form.Control
                            type="text"
                            placeholder="Type custom value"
                            onChange={(e) => handleSpecChange(attr.attributeName, e.target.value)}
                            className="form-input"
                          />
                        )}
                      </div>
                    ) : (
                      <Form.Control
                        type={attr.attributeType === 'number' ? 'number' : 'text'}
                        placeholder={`Enter ${attr.attributeName}`}
                        value={specifications[attr.attributeName] || ''}
                        onChange={(e) => handleSpecChange(attr.attributeName, e.target.value)}
                        className="form-input"
                        required={attr.isRequired}
                      />
                    )}
                  </Form.Group>
                </Col>
              ))}
            </Row>
          )}

          {/* Custom Specifications */}
          {customSpecs.map((spec, index) => (
            <Row key={index} className="mb-2">
              <Col md={5}>
                <Form.Control
                  type="text"
                  placeholder="Attribute name"
                  value={spec.name}
                  onChange={(e) => updateCustomSpec(index, 'name', e.target.value)}
                  className="form-input"
                />
              </Col>
              <Col md={5}>
                <Form.Control
                  type="text"
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) => updateCustomSpec(index, 'value', e.target.value)}
                  className="form-input"
                />
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeCustomSpec(index)}
                >
                  <FaTimes />
                </Button>
              </Col>
            </Row>
          ))}

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={addCustomSpec}
            className="mt-2"
          >
            <FaPlus className="me-2" />
            Add Custom Specification
          </Button>

          {/* Show current specs as badges */}
          {Object.keys(specifications).length > 0 && (
            <div className="mt-3">
              <small className="text-muted d-block mb-2">Current Specifications:</small>
              <div className="d-flex flex-wrap gap-2">
                {Object.entries(specifications).map(([key, value]) => (
                  value && value !== '_custom_' && (
                    <Badge key={key} bg="info" text="dark">
                      {key}: {value}
                    </Badge>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
    );
};

export default ProductSpecifications;