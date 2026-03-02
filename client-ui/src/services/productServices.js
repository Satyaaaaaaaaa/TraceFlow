import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProductDetails = (id) => {
    return axios.get(`${API_URL}/product/${id}`, { headers: getAuthHeaders() });
};

export const createProduct = (productData) => {
    return axios.post(`${API_URL}/product`, productData, { headers: getAuthHeaders() });
};

/*
export const syncProductToBlockchain = async (productId) => {
    const response = await axios.post(
        `${API_URL}/product/sync-blockchain/${productId}`, 
        {}, 
        { headers: getAuthHeaders() }
    );
    return response.data;
};
*/

export const getUserProducts = async () => {
    const response = await axios.get(`${API_URL}/product/user/products`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const listProducts = ({ limit, offset }) => {
    return axios.get(`${API_URL}/search`, {
        params: { limit, offset }
    });
};

export const updateProduct = async (productId, productData) => {
    const token = sessionStorage.getItem('authToken');
    const response = await axios.patch(
        `${API_URL}/product/${productId}`,
        productData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};

export const deleteProduct = async (productId) => {
    const token = sessionStorage.getItem('authToken');
    const response = await axios.delete(
        `${API_URL}/product/${productId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};