import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './mobileCategorysidebar.css';


const MobileCategorySideBar = ({ isOpen, onClose }) => {
    
    const navigate = useNavigate();

    const [priceRange, setPriceRange] = useState({
        min: 0,
        max: 50000
    });
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState(0);
    const location = useLocation();

    // Sample categories - replace with your actual categories from Redux
    const categories = [
        { id: 1, name: 'Electronics', count: 45 },
        { id: 2, name: 'Fashion', count: 120 },
        { id: 3, name: 'Home & Health', count: 67 },
        { id: 4, name: 'Beauty', count: 34 },
        { id: 5, name: 'Home&Kitchen', count: 89 },
        { id: 6, name: 'Sports & Fitness', count: 23 },
        { id: 7, name: 'Toys & Baby', count: 41 },
        { id: 8, name: 'Groceries', count: 16 },
        { id: 9, name: 'GenZTrends', count: 33 },
        { id: 10, name: 'Lifestyle', count: 18 },
    ];

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleCategoryToggle = (categoryName) => {
        setSelectedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(name => name !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handlePriceChange = (type, value) => {
        setPriceRange(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handleRatingChange = (rating) => {
        setSelectedRatings(rating);
    };

    const applyFilters = () => {
        const params = new URLSearchParams()
        // adding price 
        params.append('price[gte]', priceRange.min)
        params.append('price[lte]', priceRange.max)

        // adding ratings 

        if (selectedRatings > 0) {
            params.append('ratings[gte]', selectedRatings)
        }

        // adding categories (comma ceprated strings)
        if (selectedCategories.length > 0) {
            params.append('category', selectedCategories.join(','))
        }

        // navigating to prod page with filtered url 

        navigate(`/products?${params.toString()}`);
        onClose(); // Close sidebar


    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setPriceRange({ min: 0, max: 50000 });
        setSelectedRatings(0);
    };

    const ratings = [4, 3, 2, 1];

    return (
        <>
        
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

            
            <div className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Filters</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="sidebar-content">
                    {/* Categories Section */}
                    <div className="filter-section">
                        <h4>Categories</h4>
                        <div className="category-list">
                            {categories.map(category => (
                                <label key={category.id} className="category-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.name)}
                                        onChange={() => handleCategoryToggle(category.name)}
                                    />
                                    <span className="category-name">{category.name}</span>
                                    <span className="category-count">{category.count}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price Range filter */}
                    <div className="filter-section">
                        <h4>Price Range</h4>
                        <div className="price-range-container">
                            <div className="price-inputs">
                                <div className="price-input">
                                    <label>Min</label>
                                    <input
                                        type="number"
                                        value={priceRange.min}
                                        onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                                        step="500"
                                        min="0"
                                        max={priceRange.max}
                                    />
                                </div>
                                <span className="price-separator">-</span>
                                <div className="price-input">
                                    <label>Max</label>
                                    <input
                                        type="number"
                                        value={priceRange.max}
                                        onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                                        step="500"
                                        min={priceRange.min}
                                        max="50000"
                                    />
                                </div>
                            </div>

                           
                            <div className="price-chips">
                                <button
                                    className={`price-chip ${priceRange.max === 500 ? 'active' : ''}`}
                                    onClick={() => setPriceRange({ min: 0, max: 500 })}
                                >
                                    Under ₹500
                                </button>
                                <button
                                    className={`price-chip ${priceRange.min === 500 && priceRange.max === 1000 ? 'active' : ''}`}
                                    onClick={() => setPriceRange({ min: 500, max: 1000 })}
                                >
                                    ₹500 - ₹1000
                                </button>
                                <button
                                    className={`price-chip ${priceRange.min === 1000 && priceRange.max === 5000 ? 'active' : ''}`}
                                    onClick={() => setPriceRange({ min: 1000, max: 5000 })}
                                >
                                    ₹1000 - ₹5000
                                </button>
                                <button
                                    className={`price-chip ${priceRange.min === 5000 && priceRange.max === 10000 ? 'active' : ''}`}
                                    onClick={() => setPriceRange({ min: 5000, max: 10000 })}
                                >
                                    ₹5000 - ₹10000
                                </button>
                                <button
                                    className={`price-chip ${priceRange.min === 10000 && priceRange.max === 20000 ? 'active' : ''}`}
                                    onClick={() => setPriceRange({ min: 10000, max: 20000 })}
                                >
                                    ₹10000 - ₹20000
                                </button>
                                <button
                                    className={`price-chip ${priceRange.min === 20000 ? 'active' : ''}`}
                                    onClick={() => setPriceRange({ min: 20000, max: 50000 })}
                                >
                                    Above ₹20000
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Star Ratings Section */}
                    <div className="filter-section">
                        <h4>Customer Ratings</h4>
                        <div className="ratings-list">
                            {ratings.map(rating => (
                                <label key={rating} className="rating-item">
                                    <input
                                        type="radio"
                                        name="rating"
                                        checked={selectedRatings === rating}
                                        onChange={() => handleRatingChange(rating)}
                                    />
                                    <span className="rating-stars">
                                        {'★'.repeat(rating)}{'☆'.repeat(4 - rating)}
                                    </span>
                                    <span className="rating-text">& Above</span>
                                </label>
                            ))}
                            <label className="rating-item">
                                <input
                                    type="radio"
                                    name="rating"
                                    checked={selectedRatings === 0}
                                    onChange={() => handleRatingChange(0)}
                                />
                                <span className="rating-stars">All Ratings</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button className="clear-btn" onClick={clearFilters}>
                        Clear All
                    </button>
                    <button className="apply-btn" onClick={applyFilters}>
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default MobileCategorySideBar;