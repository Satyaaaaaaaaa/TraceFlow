import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaShieldAlt, FaUsers, FaUserShield, FaStore, FaLink, FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import './styles/admindashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    sellers: 0,
    syncedToChain: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const usersData = response.data.data || [];
      setUsers(usersData);

      // Calculate stats
      const admins = usersData.filter(u => u.role === 'admin').length;
      const sellers = usersData.filter(u => u.role === 'seller').length;
      const synced = usersData.filter(u => u.blockchainStatus === true || u.blockchainStatus === 1).length;

      setStats({
        totalUsers: usersData.length,
        admins,
        sellers,
        syncedToChain: synced
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const handleSyncUser = async (userId, username) => {
    try {
      const token = sessionStorage.getItem('authToken');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/user/sync-blockchain`,
        { userId, username },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh users
      fetchUsers();
    } catch (err) {
      console.error('Sync error:', err);
      alert('Failed to sync user to blockchain');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'danger';
      case 'seller': return 'success';
      case 'buyer': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    if (status === 'active' || status === 'Active') return 'success';
    if (status === 'suspended' || status === 'Suspended') return 'danger';
    return 'warning';
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <Container className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading dashboard...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <Container fluid className="admin-dashboard-container">
        {/* Header */}
        <div className="admin-dashboard-header">
          <div className="header-icon">
            <FaShieldAlt />
          </div>
          <h1>Admin Dashboard</h1>
          <p className="header-subtitle">Manage users, roles, and blockchain sync</p>
        </div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col xs={12} sm={6} lg={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-header">
                  <div className="stat-info">
                    <FaUsers className="stat-icon text-primary" />
                    <span className="stat-label">Total Users</span>
                  </div>
                </div>
                <div className="stat-value">{stats.totalUsers}</div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-header">
                  <div className="stat-info">
                    <FaUserShield className="stat-icon text-danger" />
                    <span className="stat-label">Admins</span>
                  </div>
                </div>
                <div className="stat-value">{stats.admins}</div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-header">
                  <div className="stat-info">
                    <FaStore className="stat-icon text-success" />
                    <span className="stat-label">Sellers</span>
                  </div>
                </div>
                <div className="stat-value">{stats.sellers}</div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-header">
                  <div className="stat-info">
                    <FaLink className="stat-icon text-info" />
                    <span className="stat-label">Synced to Chain</span>
                  </div>
                </div>
                <div className="stat-value">{stats.syncedToChain}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Users Table */}
        <Card className="users-table-card">
          <Card.Body>
            <div className="table-header">
              <div className="table-title">
                <FaUsers className="me-2" />
                <h5>All Users</h5>
              </div>
              <Button variant="success" size="sm" className="create-user-btn">
                <FaUserPlus className="me-2" />
                Create User
              </Button>
            </div>

            <div className="table-responsive">
              <Table hover className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Blockchain</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="user-name">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="user-email">{user.email}</td>
                        <td>
                          <Badge 
                            bg={getRoleBadgeColor(user.role)}
                            className="role-badge"
                          >
                            {user.role || 'User'}
                          </Badge>
                        </td>
                        <td>
                          <div className="status-indicator">
                            <span className={`status-dot ${getStatusColor('active')}`}></span>
                            <span>Active</span>
                          </div>
                        </td>
                        <td>
                          {user.blockchainStatus ? (
                            <div className="blockchain-address">
                              0x{Math.random().toString(36).substring(2, 6)}...
                              {Math.random().toString(36).substring(2, 6)}
                            </div>
                          ) : (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="sync-btn"
                              onClick={() => handleSyncUser(user.id, user.username)}
                            >
                              <FaLink className="me-1" />
                              Sync
                            </Button>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              variant="link"
                              size="sm"
                              className="action-btn edit-btn"
                              title="Edit user"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="action-btn delete-btn"
                              title="Delete user"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AdminDashboard;