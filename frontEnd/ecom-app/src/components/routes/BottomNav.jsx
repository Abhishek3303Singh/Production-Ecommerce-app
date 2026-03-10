import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './bottomNav.css';
import MobileCategorySideBar from '../products/MobileCategorySideBar';

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Get cart items from Redux
    const { cartItems } = useSelector((state) => state.cart);
    const { user, isAuthenticated } = useSelector((state) => state.user);

    // Calculate total number of items in cart
    const cartItemsCount = cartItems?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;

    // Scroll to top when route changes
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [location.pathname]);

    // Get user's first name or display name
    const getUserDisplayName = () => {
        if (!user) return 'Profile';

        // Try to get first name from different possible fields
        const fullName = user.name || '';
        const firstName = fullName.split(' ')[0];
        return firstName || 'Profile';
    };

    const handleNavigation = (path) => {
        navigate(path);
    };
    function toggleCategorySidebar(){
        setIsSidebarOpen(!isSidebarOpen)
    }

    return (
        <div className="bottom-nav">
            <div className="bottom-nav-icons">
                {/* Home Link */}
                <button
                    className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/')}
                >
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Home</span>
                </button>

                {/* Products Link - NEW */}
                <button
                    className={`nav-item ${location.pathname.includes('/products') ? 'active' : ''}`}
                    onClick={() => handleNavigation('/products')}
                >
                    <span className="nav-icon">🛍️</span>
                    <span className="nav-label">Products</span>
                </button>

                <button
                    className={`nav-item ${isSidebarOpen ? 'active' : ''}`}
                    onClick={toggleCategorySidebar}
                    >
                    <span className="nav-icon">📊</span>
                    <span className="nav-label">Categories</span>
                </button>

                {/* Cart Link with Item Count */}
                <button
                    className={`nav-item cart-item ${location.pathname === '/cart' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/cart')}
                >
                    <span className="nav-icon">🛒</span>
                    <span className="nav-label">Cart</span>
                    {cartItemsCount > 0 && (
                        <span className="cart-badge">{cartItemsCount}</span>
                    )}
                </button>

                {/* Profile/Auth Link */}
                <button
                    className={`nav-item ${location.pathname.includes('/profile') || location.pathname.includes('/login') ? 'active' : ''}`}
                    onClick={() => handleNavigation(isAuthenticated ? '/profile' : '/login')}
                >
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">
                        {isAuthenticated ? getUserDisplayName() : 'Login'}
                    </span>
                </button>
            </div>

            <MobileCategorySideBar 
            isOpen={isSidebarOpen}
            onClose={()=>setIsSidebarOpen(false)}
            />
        </div>
    );
};

export default BottomNav;