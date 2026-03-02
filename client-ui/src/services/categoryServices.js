import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const getAllCategories = async () => {
    const response = await axios.get(`${API_URL}/category/fetch-categories`);
    return response.data;
};

export const getCategoryTree = async () => {
    const response = await axios.get(`${API_URL}/categories/tree`);
    return response.data;
};

export const getMainCategories = async () => {
    const response = await getAllCategories();
    if (response.status) {
        // Filter only main categories (parentId === null)
        const mainCategories = response.categories.filter(cat => cat.parentId === null);
        return {
            status: true,
            data: mainCategories
        };
    }
    return response;
};

export const getSubcategories = async (parentId) => {
    const response = await getAllCategories();
    if (response.status) {
        // Filter subcategories by parentId
        const subcategories = response.categories.filter(cat => cat.parentId === Number(parentId));
        return {
            status: true,
            data: subcategories
        };
    }
    return response;
};