// src/context/CartContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
const API_URL = process.env.REACT_APP_API_URL;
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const clearCart = () => {
    setCartItems([]); // Assuming setCartItems is the function to update cart items in your context
};

  // Function to fetch cart items from the backend
  const fetchCartItems = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        setCartItems([]); 
        return;
      }

      // const decoded = jwtDecode(token);
      // const userId = decoded.userId;

      const response = await axios.get(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        setCartItems(response.data.data.CartItems); // Adjust based on your response structure
      } else {
        console.error("Failed to fetch cart items.");
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  // Add item to cart both locally and on the backend
  const addToCart = async (product, quantity = 1) => {
      try {
        const token = sessionStorage.getItem('token') || sessionStorage.getItem("authToken");
        if (!token) {
          alert('Please log in to add items to the cart.');
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.userId;

        const response = await axios.post(`${API_URL}/cart/add`, {
          userId,
          productId: product.id,
          quantity  
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status) {
          await fetchCartItems();
        } else {
          alert('Failed to add product to cart.');
        }
      } catch (error) {
        console.error('Error adding product to cart:', error);
        alert('Please login to add items to cart');
        throw error; // re-throw so ProductDetails catch block works
      }
  };

  // Remove item from cart both locally and on the backend
  const removeFromCart = async (productId) => {
    try {
      const token = sessionStorage.getItem("authToken");
      //const decoded = jwtDecode(token);
      //const userId = decoded.userId;

      const response = await axios.delete(`${API_URL}/cart/remove`, {
        data: {
          cartItemId: productId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        fetchCartItems(); // Refresh cart items
        alert('Product removed from cart successfully!');
      } else {
        alert('Failed to remove product from cart.');
      }
    } catch (error) {
      console.error('Error removing product from cart:', error);
    }
  };

  // Update item quantity in cart
  const updateCartItem = async (cartItemId, quantity) => {
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await axios.put(`${API_URL}/cart/update`, {
        cartItemId,
        quantity,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        fetchCartItems(); // Refresh cart items
        alert('Cart item updated successfully!');
      } else {
        alert('Failed to update cart item.');
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  // Fetch cart items on initial load
  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartItem ,clearCart}}>
      {children}
    </CartContext.Provider>
  );
};
