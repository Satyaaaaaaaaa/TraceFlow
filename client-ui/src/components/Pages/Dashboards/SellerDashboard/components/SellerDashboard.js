import React from 'react';
import { Container, Row, ButtonGroup, Button } from 'react-bootstrap';
import logo from '../../../../Assets/logo.png'; // Your logo import
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container className="dashboard-container text-center">
      <header className="dashboard-header my-4">
        <img src={logo} alt="TraceFlow Logo" className="logo mb-3" />
        <h2 className="header-title">Seller Dashboard</h2>
      </header>

      <Row className="mb-4 justify-content-center">
        <ButtonGroup>
          <Button variant="dark" onClick={() => navigate('/add-product')}>
            Add Products
          </Button>
          <Button onClick={() => navigate('/seller-orders')}>
            View Orders
          </Button>
          <Button variant="secondary" onClick={() => navigate('/my-products')}>
            View My Products
          </Button>
        </ButtonGroup>
      </Row>
    </Container>
  );
};

export default SellerDashboard;
