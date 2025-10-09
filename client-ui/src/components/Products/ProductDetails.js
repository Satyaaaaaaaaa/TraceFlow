import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductDetails } from '../../services/productServices'; // Use the updated service

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await getProductDetails(id);
                setProduct(response.data);
                setError('');
            } catch (err) {
                setError('Failed to fetch product details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found.</div>;

    return (
        <div className="product-details-container">
            <h1>{product.name}</h1>
            <img src={`http://localhost:3001/${product.image}`} alt={product.name} style={{maxWidth: '400px'}} />
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            
            <hr />

            <h3>Product Traceability History</h3>
            {product.traceabilityHistory && product.traceabilityHistory.length > 0 ? (
                <ul className="traceability-list">
                    {product.traceabilityHistory.map((entry, index) => (
                        <li key={index} className="traceability-item">
                            <div className="timestamp">
                                {new Date(entry.timestamp.seconds * 1000).toLocaleString()}
                            </div>
                            <div className="action">
                                <strong>Action:</strong> {entry.value.history.slice(-1)[0].action}
                            </div>
                            <div className="actor">
                                <strong>By:</strong> {entry.value.history.slice(-1)[0].actor}
                            </div>
                            <div className="tx-id">
                                <strong>Transaction ID:</strong> <span>{entry.txId.substring(0, 20)}...</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No traceability history available for this product.</p>
            )}
        </div>
    );
};

export default ProductDetails;





// // src/components/ProductDetails/ProductDetails.js
// import React, { useEffect, useState, useContext } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { CartContext } from '../Cart/CartContext'; // Import your CartContext
// import './styles/ProductDetails.css';

// const ProductDetails = () => {
//   const { productId } = useParams();
//   const { cartItems, addToCart, updateCartItem } = useContext(CartContext); // Destructure cartItems from CartContext
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [reviews, setReviews] = useState([]);
//   const [newReview, setNewReview] = useState('');
//   const [rating, setRating] = useState(0);
//   const [quantity, setQuantity] = useState(1); // New state for quantity

//   useEffect(() => {
//     const fetchProductDetails = async () => {
//       const token = sessionStorage.getItem('authToken');
//       try {
//         const response = await axios.get(`/product/${productId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setProduct(response.data.data);
//         setReviews(response.data.data.reviews || []);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch product details');
//         setLoading(false);
//       }
//     };
//     fetchProductDetails();
//   }, [productId]);

//   const handleAddReview = async () => {
//     const token = sessionStorage.getItem('authToken');
//     try {
//       const response = await axios.post(`/product/${productId}/reviews`, {
//         review: newReview,
//         rating,
//       }, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setReviews([...reviews, response.data]);
//       setNewReview('');
//       setRating(0);
//     } catch (err) {
//       console.error('Failed to add review:', err);
//     }
//   };

//   const handleAddToCart = async () => {
//     if (product) {
//       // Check if the product is already in the cart
//       const existingCartItem = cartItems.find((item) => item.id === product.id);
//       if (existingCartItem) {
//         // If it exists, update the quantity
//         await updateCartItem(existingCartItem.id, existingCartItem.quantity + quantity);
//       } else {
//         // If it doesn't exist, add to cart
//         await addToCart({ ...product, quantity }); // This function already handles the backend
//       }
//       console.log(`Added ${quantity} of ${product.name} to cart`);
//     }
//   };

//   const handleQuantityChange = (change) => {
//     setQuantity((prev) => Math.max(1, prev + change)); // Ensure quantity doesn't go below 1
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   const imageUrl = `http://localhost:3002/${product.image}`;

//   return (
//     <div className="product-details">
//       <div className="product-details-container">
//         <div className="product-image-large">
//           <img src={imageUrl} alt={product.name} className="product-image-large" />
//         </div>
//         <div className="product-info">
//           <h2>{product.name}</h2>
//           <div className="rating">
//             {[...Array(5)].map((_, index) => (
//               <span
//                 key={index}
//                 className={index < product.rating ? 'star filled' : 'star'}
//                 onClick={() => setRating(index + 1)}
//               >
//                 ★
//               </span>
//             ))}
//             <span>{product.rating} ({reviews.length} reviews)</span>
//           </div>
//           <p>{product.description}</p>
//           <div className="product-price-container">
//             <span>Price: {product.price} {product.priceUnit.toUpperCase()}</span>
//           </div>
          
//           {/* Quantity Change Buttons */}
//           <div className="quantity-controls">
//             <button onClick={() => handleQuantityChange(-1)}>-</button>
//             <span>{quantity}</span>
//             <button onClick={() => handleQuantityChange(1)}>+</button>
//           </div>
//           <button className="add-to-cart-btn" onClick={handleAddToCart}>
//             Add to Cart
//           </button>

//           <div className="review-form">
//             <textarea
//               value={newReview}
//               onChange={(e) => setNewReview(e.target.value)}
//               placeholder="Write your review here"
//               rows="3"
//             />
//             <div className="review-rating">
//               <span>Rate the product: </span>
//               {[...Array(5)].map((_, index) => (
//                 <span
//                   key={index}
//                   className={index < rating ? 'star filled' : 'star'}
//                   onClick={() => setRating(index + 1)}
//                 >
//                   ★
//                 </span>
//               ))}
//             </div>
//             <button onClick={handleAddReview}>Submit Review</button>
//           </div>
//           <div className="reviews">
//             {reviews.map((review, index) => (
//               <div key={index} className="review">
//                 <div className="review-rating">
//                   {[...Array(5)].map((_, i) => (
//                     <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
//                   ))}
//                 </div>
//                 <p>{review.text}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetails;
