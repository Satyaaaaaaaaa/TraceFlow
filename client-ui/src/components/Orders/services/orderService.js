import axios from 'axios';

export const getOrders = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/order/`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error; // Propagate the error to be handled by the calling function
    }
};

export const getOrder = async (id) => {
    try {
        const response = await axios.get(`/order/get/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching order ${id}:`, error);
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`/create`, orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const updateOrder = async (id, orderData) => {
    try {
        const response = await axios.patch(`/order/update/${id}`, orderData);
        return response.data;
    } catch (error) {
        console.error(`Error updating order ${id}:`, error);
        throw error;
    }
};

export const deleteOrder = async (id) => {
    try {
        const response = await axios.delete(`/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting order ${id}:`, error);
        throw error;
    }
};
