import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserBlockchainStatus = async () => {
    const response = await axios.get(`${API_URL}/user/blockchain-status`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const syncUserToBlockchain = async () => {
    const response = await axios.post(`${API_URL}/user/sync-blockchain`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};