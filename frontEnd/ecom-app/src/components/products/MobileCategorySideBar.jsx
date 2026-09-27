import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './mobileCategorysidebar.css';
import { useFilters } from './FilterContext';

const apiUrl = process.env.REACT_APP_API_BASE_URL;

const MobileCategorySideBar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState(0);

    const [selectedProductTypes, setSelectedProductTypes] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState({});

    const [availableProductTypes, setAvailableProductTypes] = useState([]);
    const [availableFilters, setAvailableFilters] = useState({ brands: [], attributes: {} });
    const [loadingStage, setLoadingStage] = useState(null); // 'productTypes' | 'filters' | null

    const categories = [
        { id: 0, name: 'All', count: 118 },
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
    const {filters} = useFilters()

    const activeCategory = (selectedCategories.length === 1 && selectedCategories[0] !== 'All')
        ? selectedCategories[0]
        : null;

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };

    }, [isOpen]);
    useEffect(()=>{
        if(!isOpen) return
        const categoryFromParent = filters.category ? [filters.category] : [];
        setSelectedCategories(categoryFromParent)
        setPriceRange({min: filters.price[0], max: filters.price[1]})
        setSelectedRatings(filters.ratings)
    }, [isOpen, filters])

    // STAGE 1 -> 2: category changes -> fetch product types
    useEffect(() => {
        setSelectedProductTypes([]);
        setSelectedBrands([]);
        setSelectedAttributes({});
        setAvailableFilters({ brands: [], attributes: {} });

        if (!activeCategory) {
            setAvailableProductTypes([]);
            return;
        }

        const fetchProductTypes = async () => {
            setLoadingStage('productTypes');
            try {
                const res = await fetch(
                    `${apiUrl}/api/v1/products/filters?category=${encodeURIComponent(activeCategory)}`,
                    { credentials: 'include' }
                );
                const json = await res.json();
                setAvailableProductTypes(json.data?.productTypes || []);
            } catch (err) {
                console.error('Failed to fetch product types:', err);
                setAvailableProductTypes([]);
            } finally {
                setLoadingStage(null);
            }
        };
        fetchProductTypes();
    }, [activeCategory]);

    // STAGE 2 -> 3: product type selection changes -> fetch brands/attributes
    useEffect(() => {
        setSelectedBrands([]);
        setSelectedAttributes({});

        if (!activeCategory || selectedProductTypes.length === 0) {
            setAvailableFilters({ brands: [], attributes: {} });
            return;
        }

        const fetchFilters = async () => {
            setLoadingStage('filters');
            try {
                const res = await fetch(
                    `${apiUrl}/api/v1/products/filters?category=${encodeURIComponent(activeCategory)}&productType=${encodeURIComponent(selectedProductTypes.join(','))}`,
                    { credentials: 'include' }
                );
                const json = await res.json();
                setAvailableFilters(json.data || { brands: [], attributes: {} });
            } catch (err) {
                console.error('Failed to fetch filters:', err);
                setAvailableFilters({ brands: [], attributes: {} });
            } finally {
                setLoadingStage(null);
            }
        };
        fetchFilters();
    }, [activeCategory, selectedProductTypes]);

    const handleCategoryToggle = (categoryName) => {
        setSelectedCategories(prev =>
            prev.includes(categoryName) ? prev.filter(n => n !== categoryName) : [...prev, categoryName]
        );
    };

    const handleProductTypeToggle = (type) => {
        setSelectedProductTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleBrandToggle = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const handleAttributeToggle = (attrKey, value) => {
        setSelectedAttributes(prev => {
            const current = prev[attrKey] || [];
            const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
            const updated = { ...prev, [attrKey]: next };
            if (next.length === 0) delete updated[attrKey];
            return updated;
        });
    };

    const handlePriceChange = (type, value) => {
        setPriceRange(prev => ({ ...prev, [type]: value }));
    };

    const handleRatingChange = (rating) => setSelectedRatings(rating);

    const applyFilters = () => {
        const params = new URLSearchParams();
        params.append('price[gte]', priceRange.min);
        params.append('price[lte]', priceRange.max);

        if (selectedRatings > 0) {
            params.append('ratings[gte]', selectedRatings);
        }

        const hasAll = selectedCategories.includes('All');
        if (selectedCategories.length > 0 && !hasAll) {
            params.append('category', selectedCategories.join(','));
        }

        if (activeCategory && selectedProductTypes.length > 0) {
            params.append('productType', selectedProductTypes.join(','));
        }

        if (activeCategory && selectedProductTypes.length > 0 && selectedBrands.length > 0) {
            params.append('brand', selectedBrands.join(','));
        }

        if (activeCategory && selectedProductTypes.length > 0) {
            Object.entries(selectedAttributes).forEach(([key, values]) => {
                if (values.length > 0) {
                    params.append(`attributes.${key}`, values.join(','));
                }
            });
        }

        navigate(`/products?${params.toString()}`);
        onClose();
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setPriceRange({ min: 0, max: 50000 });
        setSelectedRatings(0);
        setSelectedProductTypes([]);
        setSelectedBrands([]);
        setSelectedAttributes({});
    };

    const ratings = [4, 3, 2, 1];
    const attributeKeys = Object.keys(availableFilters.attributes || {});

    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
            <div className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Filters</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="sidebar-content">
                    {/* Stage 1: Categories */}
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

                    {selectedCategories.length > 1 && (
                        <p className="filter-hint">Select just one category to see product types.</p>
                    )}

                    {/* Stage 2: Product Types */}
                    {activeCategory && loadingStage === 'productTypes' && (
                        <p className="filter-hint">Loading product types…</p>
                    )}

                    {activeCategory && loadingStage !== 'productTypes' && availableProductTypes.length > 0 && (
                        <div className="filter-section">
                            <h4>Product Type</h4>
                            <div className="category-list">
                                {availableProductTypes.map(type => (
                                    <label key={type} className="category-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedProductTypes.includes(type)}
                                            onChange={() => handleProductTypeToggle(type)}
                                        />
                                        <span className="category-name">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stage 3: Brand + Attributes */}
                    {selectedProductTypes.length > 0 && loadingStage === 'filters' && (
                        <p className="filter-hint">Loading brands…</p>
                    )}

                    {selectedProductTypes.length > 0 && loadingStage !== 'filters' && availableFilters.brands.length > 0 && (
                        <div className="filter-section">
                            <h4>Brand</h4>
                            <div className="category-list">
                                {availableFilters.brands.map(brand => (
                                    <label key={brand} className="category-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedBrands.includes(brand)}
                                            onChange={() => handleBrandToggle(brand)}
                                        />
                                        <span className="category-name">{brand}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedProductTypes.length > 0 && loadingStage !== 'filters' && attributeKeys.map(attrKey => (
                        <div className="filter-section" key={attrKey}>
                            <h4>{attrKey}</h4>
                            <div className="category-list">
                                {availableFilters.attributes[attrKey].map(value => (
                                    <label key={value} className="category-item">
                                        <input
                                            type="checkbox"
                                            checked={(selectedAttributes[attrKey] || []).includes(value)}
                                            onChange={() => handleAttributeToggle(attrKey, value)}
                                        />
                                        <span className="category-name">{value}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Price + Ratings always available, unchanged */}
                    <div className="filter-section">
                        <h4>Price Range</h4>
                        <div className="price-range-container">
                            <div className="price-inputs">
                                <div className="price-input">
                                    <label>Min</label>
                                    <input type="number" value={priceRange.min} onChange={(e) => handlePriceChange('min', Number(e.target.value))} step="500" min="0" max={priceRange.max} />
                                </div>
                                <span className="price-separator">-</span>
                                <div className="price-input">
                                    <label>Max</label>
                                    <input type="number" value={priceRange.max} onChange={(e) => handlePriceChange('max', Number(e.target.value))} step="500" min={priceRange.min} max="50000" />
                                </div>
                            </div>
                            <div className="price-chips">
                                <button className={`price-chip ${priceRange.max === 500 ? 'active' : ''}`} onClick={() => setPriceRange({ min: 0, max: 500 })}>Under ₹500</button>
                                <button className={`price-chip ${priceRange.min === 500 && priceRange.max === 1000 ? 'active' : ''}`} onClick={() => setPriceRange({ min: 500, max: 1000 })}>₹500 - ₹1000</button>
                                <button className={`price-chip ${priceRange.min === 1000 && priceRange.max === 5000 ? 'active' : ''}`} onClick={() => setPriceRange({ min: 1000, max: 5000 })}>₹1000 - ₹5000</button>
                                <button className={`price-chip ${priceRange.min === 5000 && priceRange.max === 10000 ? 'active' : ''}`} onClick={() => setPriceRange({ min: 5000, max: 10000 })}>₹5000 - ₹10000</button>
                                <button className={`price-chip ${priceRange.min === 10000 && priceRange.max === 20000 ? 'active' : ''}`} onClick={() => setPriceRange({ min: 10000, max: 20000 })}>₹10000 - ₹20000</button>
                                <button className={`price-chip ${priceRange.min === 20000 ? 'active' : ''}`} onClick={() => setPriceRange({ min: 20000, max: 50000 })}>Above ₹20000</button>
                            </div>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4>Customer Ratings</h4>
                        <div className="ratings-list">
                            {ratings.map(rating => (
                                <label key={rating} className="rating-item">
                                    <input type="radio" name="rating" checked={selectedRatings === rating} onChange={() => handleRatingChange(rating)} />
                                    <span className="rating-stars">{'★'.repeat(rating)}{'☆'.repeat(4 - rating)}</span>
                                    <span className="rating-text">& Above</span>
                                </label>
                            ))}
                            <label className="rating-item">
                                <input type="radio" name="rating" checked={selectedRatings === 0} onChange={() => handleRatingChange(0)} />
                                <span className="rating-stars">All Ratings</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button className="clear-btn" onClick={clearFilters}>Clear All</button>
                    <button className="apply-btn" onClick={applyFilters}>Apply Filters</button>
                </div>
            </div>
        </>
    );
};

export default MobileCategorySideBar;