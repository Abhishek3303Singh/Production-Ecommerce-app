import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import './profile.css';
import { logout } from '../../store/userSlice';

// Icons
import { 
    FaUser, 
    FaBox, 
    FaHeart, 
    FaTag, 
    FaHeadset,
    FaEye,
    FaKey,
    FaStore,
    FaFileAlt,
    FaQuestionCircle,
    FaSignOutAlt,
    FaChevronRight,
    FaGift,
    FaStar
} from 'react-icons/fa';

const Profile = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const dispatch= useDispatch()

    // Loading recently viewed from localStorage
    useEffect(() => {
        const viewed = localStorage.getItem('recentlyViewed');
        if (viewed) {
            setRecentlyViewed(JSON.parse(viewed).slice(0, 5)); // Show only 5
        }
    }, []);

    // Geting user initials for avatar
    const getUserInitials = () => {
        if (!user?.name) return 'U';
        return user.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };
    const handleLogout = ()=>{
        dispatch(logout())
        navigate('/login')
    }

    const menuSections = [
        {
            title: 'My Account',
            items: [
                { icon: <FaUser />, label: 'Profile Information', path: '/profile/info', badge: null },
                { icon: <FaBox />, label: 'My Orders', path: '/my/orders', badge: '3' },
                { icon: <FaHeart />, label: 'Wishlist', path: '/wishlist', badge: '12' },
                { icon: <FaTag />, label: 'Coupons', path: '/coupons', badge: '2' },
                { icon: <FaEye />, label: 'Recently Viewed', path: '#recent', badge: recentlyViewed.length },
            ]
        },
        {
            title: 'Settings',
            items: [
                { icon: <FaKey />, label: 'Change Password', path: '/changepassword', badge: null },
                { icon: <FaHeadset />, label: 'Help & Support', path: '/support', badge: null },
            ]
        },
        {
            title: 'Earn with F&H',
            items: [
                { icon: <FaStore />, label: 'Sell on F&H', path: '/sell', badge: 'New' },
                { icon: <FaGift />, label: 'Refer & Earn', path: '/refer', badge: '₹100' },
            ]
        },
        {
            title: 'Feedback & Information',
            items: [
                { icon: <FaFileAlt />, label: 'Terms & Policies', path: '/terms', badge: null },
                { icon: <FaQuestionCircle />, label: 'Browse FAQs', path: '/faqs', badge: null },
            ]
        }
    ];

    return (
        <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-cover">
                    <img 
                        src="https://images.unsplash.com/photo-1557683316-973673baf926?w=500" 
                        alt="cover" 
                        className="cover-image"
                    />
                </div>
                <div className="profile-info">
                    <div className="profile-avatar">
                        {/* <img src={user?.user?.ProfilePic?.url} alt="" /> */}
                        <span className="avatar-text">{getUserInitials()}</span>
                    </div>
                    <div className="profile-details">
                        <h1 className="profile-name">{user?.name || 'User'}</h1>
                        <p className="profile-email">{user?.email || 'email@example.com'}</p>
                        <p className="profile-phone">{user?.phone || 'Add phone number'}</p>
                        <p className="profile-joined">Member since {formatDate(user?.createdAt)}</p>
                    </div>
                    <button className="edit-profile-btn">
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <FaBox className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">3</span>
                        <span className="stat-label">Orders</span>
                    </div>
                </div>
                <div className="stat-card">
                    <FaHeart className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">12</span>
                        <span className="stat-label">Wishlist</span>
                    </div>
                </div>
                <div className="stat-card">
                    <FaTag className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">2</span>
                        <span className="stat-label">Coupons</span>
                    </div>
                </div>
                <div className="stat-card">
                    <FaEye className="stat-icon" />
                    <div className="stat-info">
                        <span className="stat-value">{recentlyViewed.length}</span>
                        <span className="stat-label">Viewed</span>
                    </div>
                </div>
            </div>

            {/* Recently Viewed Section (if items exist) */}
            {recentlyViewed.length > 0 && (
                <div className="recent-section">
                    <div className="section-header">
                        <h2>Recently Viewed</h2>
                        <Link to="/recently-viewed" className="view-all">
                            View All <FaChevronRight />
                        </Link>
                    </div>
                    <div className="recent-grid">
                        {recentlyViewed.map((item) => (
                            <div 
                                key={item._id} 
                                className="recent-item"
                                onClick={() => navigate(`/product/${item._id}`)}
                            >
                                <img 
                                    src={item.thumbnail || 'https://via.placeholder.com/100'} 
                                    alt={item.title}
                                    className="recent-image"
                                />
                                <p className="recent-title">{item.title}</p>
                               
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Menu Sections */}
            <div className="menu-sections">
                {menuSections.map((section, idx) => (
                    <div key={idx} className="menu-section">
                        <h3 className="section-title">{section.title}</h3>
                        <div className="menu-items">
                            {section.items.map((item, itemIdx) => (
                                <Link 
                                    to={item.path} 
                                    key={itemIdx} 
                                    className="menu-item"
                                    onClick={(e) => {
                                        if (item.path === '#recent') {
                                            e.preventDefault();
                                            document.getElementById('recent')?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                >
                                    <span className="item-icon">{item.icon}</span>
                                    <span className="item-label">{item.label}</span>
                                    {item.badge && (
                                        <span className="item-badge">{item.badge}</span>
                                    )}
                                    <FaChevronRight className="item-arrow" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {user?.role === "Admin" && (
    <div className="admin-section">
        <div className="admin-shield">
            <span className="shield-icon">🛡️</span>
            <span className="shield-text">Admin Access</span>
        </div>
        
        <div className="admin-card">
            <div className="admin-card-header">
                <span className="admin-icon">⚡</span>
                <h3 className="admin-title">Administrator Dashboard</h3>
            </div>
            
            <p className="admin-description">
                Manage products, orders, users and monitor platform analytics
            </p>
            
            <div className="admin-stats-mini">
                <div className="admin-stat-item">
                    <span className="stat-value">🔐</span>
                    <span className="stat-label">Secure</span>
                </div>
                <div className="admin-stat-item">
                    <span className="stat-value">📊</span>
                    <span className="stat-label">Analytics</span>
                </div>
                <div className="admin-stat-item">
                    <span className="stat-value">⚙️</span>
                    <span className="stat-label">Controls</span>
                </div>
            </div>
            
            <button 
                className="admin-dashboard-btn"
                onClick={() => navigate('/admin/dashboard')}
            >
                <span className="btn-icon">🚀</span>
                Launch Dashboard
                <span className="btn-arrow">→</span>
            </button>
            
            <div className="admin-badge">
                <span className="badge-dot"></span>
                <span>Super Admin Privileges</span>
            </div>
        </div>
    </div>
)}

            {/* Logout Button */}
            <div className="logout-section">
                <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                </button>
            </div>

            {/* App Download Banner */}
            <div className="app-banner">
                <div className="app-info">
                    <FaStar className="app-icon" />
                    <div>
                        <h4>Get the F&H App</h4>
                        <p>Faster & easier shopping</p>
                    </div>
                </div>
                <button className="download-btn">Download</button>
            </div>
        </div>
    );
};

export default Profile;