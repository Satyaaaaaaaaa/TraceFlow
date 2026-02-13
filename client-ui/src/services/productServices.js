import axios from 'axios';

// Ensure you have a way to get the auth token, e.g., from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const API_URL = 'http://localhost:3002/products'; // Your backend API URL

// This function now fetches both SQL data and Fabric history
export const getProductDetails = (id) => {
    return axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
};

export const createProduct = (productData) => {
    return axios.post(API_URL, productData, { headers: getAuthHeaders() });
};

export const listProducts = ({ limit, offset }) => {
  return axios.get('/search', {
    params: { limit, offset }
  });
};

// Add other API calls as needed
