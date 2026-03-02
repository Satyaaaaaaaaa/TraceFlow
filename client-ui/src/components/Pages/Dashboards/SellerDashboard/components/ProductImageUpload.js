import React, { useRef } from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { FaUpload, FaTimes, FaImage } from 'react-icons/fa';
import axios from 'axios';

const ProductImageUpload = ({ images, setImages }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setUploadError('Please upload only JPG, PNG, or WEBP images');
      return;
    }

    // Validate file sizes (5MB max per file)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setUploadError('Each image must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // Upload all files in one request
      const formData = new FormData();
      files.forEach(file => {
        formData.append('image', file);
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${sessionStorage.getItem('authToken')}`
          }
        }
      );

      console.log('Upload response:', response.data);

      let uploadedUrls = [];

      // Handle single file response
      if (response.data.imageUrl) {
        uploadedUrls = [response.data.imageUrl];
      }
      // Handle multiple files response
      else if (response.data.imageUrls && Array.isArray(response.data.imageUrls)) {
        uploadedUrls = response.data.imageUrls;
      }
      // Fallback: extract from files array
      else if (response.data.files && Array.isArray(response.data.files)) {
        uploadedUrls = response.data.files.map(file => 
          file.imageUrl || `/${file.path}` || file.path
        );
      }

      console.log('Extracted URLs:', uploadedUrls);

      // Filter out any null/undefined values
      const validUrls = uploadedUrls.filter(url => url != null && url !== '');
      
      if (validUrls.length === 0) {
        throw new Error('No valid image URLs returned from upload');
      }
      
      // Add new images to existing ones
      setImages(prev => [...prev, ...validUrls]);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.error || error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="mb-4">
      <Form.Group>
        <Form.Label className="fw-bold">Product Images *</Form.Label>
        
        <div className="mb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />
          
          <Button
            variant="outline-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-100"
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Uploading...
              </>
            ) : (
              <>
                <FaUpload className="me-2" />
                Choose Images
              </>
            )}
          </Button>
        </div>

        {uploadError && (
          <Alert variant="danger" dismissible onClose={() => setUploadError('')}>
            {uploadError}
          </Alert>
        )}

        {images.length > 0 && (
          <div>
            <p className="small text-muted mb-2">
              {images.length} image{images.length !== 1 ? 's' : ''} uploaded
            </p>
            <Row xs={2} md={3} lg={4} className="g-2">
              {images.map((imageUrl, index) => (
                <Col key={index}>
                  <Card className="position-relative">
                    <div style={{ height: '120px', overflow: 'hidden' }}>
                      <Card.Img
                        variant="top"
                        src={`${process.env.REACT_APP_API_URL}${imageUrl}`}
                        style={{ 
                          objectFit: 'cover', 
                          width: '100%', 
                          height: '100%' 
                        }}
                        onError={(e) => {
                          console.error('Image load error for:', imageUrl);
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1"
                      onClick={() => handleRemoveImage(index)}
                      style={{ 
                        borderRadius: '50%', 
                        width: '30px', 
                        height: '30px',
                        padding: 0
                      }}
                    >
                      <FaTimes />
                    </Button>
                    {index === 0 && (
                      <div 
                        className="position-absolute bottom-0 start-0 m-1 bg-primary text-white px-2 py-1"
                        style={{ fontSize: '0.7rem', borderRadius: '3px' }}
                      >
                        Primary
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {images.length === 0 && (
          <div 
            className="text-center py-5 border border-2 border-dashed rounded"
            style={{ borderColor: '#dee2e6' }}
          >
            <FaImage size={48} className="text-muted mb-3" />
            <p className="text-muted mb-0">No images uploaded yet</p>
            <p className="small text-muted">Click "Choose Images" to upload</p>
          </div>
        )}

        <Form.Text className="text-muted">
          Upload product images (JPG, PNG, WEBP). First image will be the primary image.
          Max 5MB per image.
        </Form.Text>
      </Form.Group>
    </div>
  );
};

export default ProductImageUpload;