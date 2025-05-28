import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) throw new Error('User not authenticated');

        const response = await axios.get('/order/seller-orders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status) {
          setOrders(response.data.data);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
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
        <h5>{error}</h5>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-3">
          &larr; Back
        </Button>
      </Container>
    );
  }

  if (!orders.length) {
    return (
      <Container className="text-center py-5">
        <h4>No orders found for your products.</h4>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-3">
          &larr; Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-center" style={{ fontWeight: '700', letterSpacing: '1px' }}>
        Orders for Your Products
      </h2>
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Order ID</th>
            <th>Buyer</th>
            <th>Product(s)</th>
            <th>Quantity</th>
            <th>Total Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const totalAmount = order.items.reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0
            );

            return (
              <tr key={order.orderID}>
                <td>{order.orderID}</td>
                <td>{order.buyer?.username || order.buyer?.email || 'N/A'}</td>
                <td>
                  <ul className="mb-0">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.product?.name || 'Unknown'} (INR {item.product?.price?.toFixed(2) || '0.00'})
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ul className="mb-0">
                    {order.items.map((item, idx) => (
                      <li key={idx}>{item.quantity}</li>
                    ))}
                  </ul>
                </td>
                <td>INR {totalAmount.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="text-center mt-4">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          &larr; Back
        </Button>
      </div>
    </Container>
  );
};

export default SellerOrders;
