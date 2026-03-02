import React from 'react';
import { Form } from 'react-bootstrap'; // Import Form here

const ProductImageUpload = ({ onFileChange, uploadProgress }) => {
  return (
    <Form.Group>
      <Form.Label htmlFor="productImage">Image</Form.Label>
      <Form.Control
        type="file"
        id="productImage"
        onChange={onFileChange}
        autoComplete="off"
        className="dashboard-file"
      />
      {uploadProgress > 0 && <div>Uploading: {uploadProgress}%</div>}
    </Form.Group>
  );
};

export default ProductImageUpload;
