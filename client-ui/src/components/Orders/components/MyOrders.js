import React, { useEffect, useState } from 'react';
import { getOrders } from '../services/orderService'; // Adjust based on your actual path
import {
    MDBTable,
    MDBTableBody,
    MDBTableHead,
    MDBSpinner,
    MDBCard,
    MDBCardBody,
    MDBBadge,
    MDBCardImage
} from 'mdb-react-ui-kit';

const MyOrders = ({ userID }) => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserOrders = async () => {
            if (!userID) {
                setError("User ID is required to fetch orders.");
                setIsLoading(false);
                return;
            }

            try {
                const data = await getOrders(userID); // Pass userID here if supported

                const userOrders = data
                    .map(order => ({
                        ...order,
                        status: order.status.toLowerCase(),
                    }))
                    .filter(order => order.userID === userID);

                setOrders(userOrders);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to fetch orders. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserOrders();
    }, [userID]);

    if (isLoading) {
        return <MDBSpinner />;
    }

    return (
        <div className="container">
            <h2 className="my-4">My Orders</h2>
            {error && (
                <MDBCard className="mb-3">
                    <MDBCardBody>
                        <MDBBadge color="danger">{error}</MDBBadge>
                    </MDBCardBody>
                </MDBCard>
            )}
            {orders.length === 0 ? (
                <MDBCard className="mb-3">
                    <MDBCardBody>
                        <MDBBadge color="info">You have no orders.</MDBBadge>
                    </MDBCardBody>
                </MDBCard>
            ) : (
                <MDBTable>
                    <MDBTableHead>
                        <tr>
                            <th>Order ID</th>
                            <th>Items</th>
                            <th>Total Price</th>
                            <th>Order Date</th>
                        </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>
                                    <ul className="list-unstyled">
                                        {order.OrderItems.map(item => (
                                            <li key={item.Product.id} className="d-flex align-items-center mb-2">
                                                <MDBCardImage 
                                                    src={item.Product.image} 
                                                    fluid 
                                                    className="rounded-3 small-image me-2" 
                                                    alt={item.Product.name} 
                                                    style={{ width: '50px', height: '50px', marginRight: '10px' }} 
                                                />
                                                <div className="d-flex justify-content-between w-100">
                                                    <span>{item.Product.name}</span> 
                                                    <span className="text-center">X{item.quantity}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>INR {order.totalAmount}</td>
                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </MDBTableBody>
                </MDBTable>
            )}
        </div>
    );
};

export default MyOrders;
