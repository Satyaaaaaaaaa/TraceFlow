import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../../Products/ProductCard'; 
import Spinner from '../../Spinner'; 
import '../styles/home.css'; 

const ROWS_PER_PAGE = 3;
const ITEMS_PER_ROW = 4;

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleItems, setVisibleItems] = useState(ROWS_PER_PAGE * ITEMS_PER_ROW);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get URL parameters for filtering
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const subcategoryFilter = searchParams.get('subcategory');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/product/');
        const productData = response.data.data;
        setProducts(Array.isArray(productData) ? productData : []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products when category or subcategory changes
  useEffect(() => {
    if (!products.length) return;

    let filtered = [...products];

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter(product => {
        // Check if product has Categories array
        if (product.Categories && Array.isArray(product.Categories)) {
          return product.Categories.some(cat => 
            cat.name === categoryFilter
          );
        }
        return false;
      });
    }

    // Filter by subcategory (you would need a subcategory field in your product data)
    if (subcategoryFilter) {
      filtered = filtered.filter(product => {
        // Assuming you have a subcategory field in your product
        return product.subcategory === subcategoryFilter;
      });
    }

    setFilteredProducts(filtered);
    setVisibleItems(ROWS_PER_PAGE * ITEMS_PER_ROW); // Reset visible items when filtering
  }, [products, categoryFilter, subcategoryFilter]);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleItems((prev) => Math.min(prev + ROWS_PER_PAGE * ITEMS_PER_ROW, filteredProducts.length));
      setLoading(false);
    }, 1000);
  };

  const productsToShow = filteredProducts.slice(0, visibleItems);

  // Get filter display text
  const getFilterText = () => {
    if (subcategoryFilter && categoryFilter) {
      return `${categoryFilter} > ${subcategoryFilter}`;
    }
    if (categoryFilter) {
      return categoryFilter;
    }
    return 'All Products';
  };

  return (
    <div className="home-container">
      {/* Filter indicator */}
      {(categoryFilter || subcategoryFilter) && (
        <div className="filter-indicator">
          <span className="filter-label">Showing: </span>
          <strong>{getFilterText()}</strong>
          <button 
            className="clear-filter-btn"
            onClick={() => window.location.href = '/'}
          >
            Clear Filter
          </button>
        </div>
      )}

      {loading && visibleItems === ROWS_PER_PAGE * ITEMS_PER_ROW ? (
        <Spinner />
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          {productsToShow.length > 0 ? (
            <>
              <div className="products-grid">
                {productsToShow.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {!loading && visibleItems < filteredProducts.length && (
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Load More
                </button>
              )}
            </>
          ) : (
            <div className="no-products">
              <h3>No products found</h3>
              <p>
                {categoryFilter 
                  ? `No products available in "${getFilterText()}" category.` 
                  : 'No products available at the moment.'}
              </p>
              {categoryFilter && (
                <button 
                  className="view-all-btn"
                  onClick={() => window.location.href = '/'}
                >
                  View All Products
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;