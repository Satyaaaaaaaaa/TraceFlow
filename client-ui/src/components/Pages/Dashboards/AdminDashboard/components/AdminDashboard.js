import React from 'react';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBoxes, faTags, faShoppingCart, faReceipt } from '@fortawesome/free-solid-svg-icons';
import '../../AdminDashboard/components/styles/admindashboard.css';

// Import UserManagement, ProductManagement, and OrderManagement Components
import UserManagement from '../../components/User/UserManagement';
import ProductManagement from '../../components/Products/ProductManagement';
import OrderManagement from '../../components/Orders/OrderManagement'; // Import OrderManagement

const AdminDashboard = () => {
  return (
    <Container fluid className="admin-dashboard vh-100">
      {/* Welcome Card */}
      <Card className="text-center mb-4 admin-welcome-card">
        <Card.Body>
          <Card.Title>Welcome, Admin!</Card.Title>
          <Card.Text>Manage your admin tasks from the dashboard below.</Card.Text>
        </Card.Body>
      </Card>

      {/* Dashboard Task Cards */}
      <Row className="text-center">
        {/* User Management */}
        <Col md={4} className="mb-4">
          <Card className="admin-task-card shadow-sm">
            <Card.Body>
              <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3" />
              <Card.Title>User Management</Card.Title>
              <Card.Text>Manage all registered users and their roles.</Card.Text>
              <UserManagement />
            </Card.Body>
          </Card>
        </Col>

        {/* Product Management */}
        <Col md={4} className="mb-4">
          <Card className="admin-task-card shadow-sm">
            <Card.Body>
              <FontAwesomeIcon icon={faBoxes} size="3x" className="mb-3" />
              <Card.Title>Product Management</Card.Title>
              <Card.Text>Manage products, inventory, and stock details.</Card.Text>
              <ProductManagement />
            </Card.Body>
          </Card>
        </Col>

        {/* Order Management */}
        <Col md={4} className="mb-4">
          <Card className="admin-task-card shadow-sm">
            <Card.Body>
              <FontAwesomeIcon icon={faShoppingCart} size="3x" className="mb-3" />
              <Card.Title>Order Management</Card.Title>
              <Card.Text>View and manage customer orders.</Card.Text>
              {/* OrderManagement Component */}
              <OrderManagement />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="text-center">
        {/* Category Management */}
        <Col md={6} className="mb-4">
          <Card className="admin-task-card shadow-sm">
            <Card.Body>
              <FontAwesomeIcon icon={faTags} size="3x" className="mb-3" />
              <Card.Title>Category Management</Card.Title>
              <Card.Text>Organize and manage product categories.</Card.Text>
              <Button variant="warning" size="lg" className="mt-3 w-100">
                Manage Categories
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Payment History */}
        <Col md={6} className="mb-4">
          <Card className="admin-task-card shadow-sm">
            <Card.Body>
              <FontAwesomeIcon icon={faReceipt} size="3x" className="mb-3" />
              <Card.Title>Payment History</Card.Title>
              <Card.Text>Track and manage all payment records.</Card.Text>
              <Button variant="info" size="lg" className="mt-3 w-100">
                View Payment History
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
