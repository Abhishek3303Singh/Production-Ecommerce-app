import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { BiMenuAltRight } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoLocationOutline } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import Dropdown from "./Dropdown";
import cartIcon from "../../images/cart1.png";
import MatchHighlight from "../../utils/MatchHighlight";
import './navbar.css'

const apiUrl = process.env.REACT_APP_API_BASE_URL;

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(null);

  const cacheRef = useRef({});
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const themeColor = useSelector((state) => state.createBanner.headerThemeColor);

  // Load shipping info from localStorage
  useEffect(() => {
    const loadShippingInfo = () => {
      try {
        const raw = localStorage.getItem("ShippingInfo");
        if (raw) {
          const parsed = JSON.parse(raw);
          setShippingInfo(parsed);
        }
      } catch (err) {
        console.error("Failed to parse ShippingInfo:", err);
        setShippingInfo(null);
      }
    };

    loadShippingInfo();
    window.addEventListener("storage", loadShippingInfo);
    return () => window.removeEventListener("storage", loadShippingInfo);
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/products/${keyword}`);
    } else {
      navigate("/products");
    }
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const fetchSuggestion = async (searchKey) => {
    const normalizedKey = searchKey.toLowerCase();
    if (!normalizedKey.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (cacheRef.current[normalizedKey]) {
      setSuggestions(cacheRef.current[normalizedKey]);
      setShowSuggestions(true);
      return;
    }
    try {
      const res = await fetch(
        `${apiUrl}/api/v1/search/suggestion?keyword=${normalizedKey}`,
        { credentials: "include" }
      );
      const data = await res.json();
      cacheRef.current[normalizedKey] = data.suggestionName;
      setSuggestions(data.suggestionName);
      setShowSuggestions(data.suggestionName.length > 0);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (keyword.trim()) {
        navigate(`/products/${keyword}`);
      } else {
        navigate("/products");
      }
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (item) => {
    setKeyword(item);
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(`/products/${item}`);
  };

  // Debounce API call
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword.trim()) {
        fetchSuggestion(keyword);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Location display text
  const locationText = shippingInfo
    ? `Deliver to ${shippingInfo.name || 'You'}`
    : "Location not set";

  const locationSubText = shippingInfo
    ? `${shippingInfo.city || ''}${shippingInfo.instate ? `, ${shippingInfo.instate}` : ''} ${shippingInfo.pincode || ''}`.trim()
    : "Select delivery location";

  return (
    <header
      className="header"
      style={{
        backgroundImage:`linear-gradient(${themeColor}, white)`,
        transition: 'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'background-color',
      }}
    >
      <div className="header-inner">
        
        {/* Logo */}
        <div className="header-logo">
          <Link to="/">FunHub</Link>
        </div>

        {/* Center: Location + Search (wraps below on mobile) */}
        <div className="header-center-group">
          <div
            className="location-pill"
            onClick={() => navigate('/shipping')}
            title={shippingInfo ? `${shippingInfo.address}, ${shippingInfo.city}` : "Add delivery address"}
          >
            <IoLocationOutline />
            <div className="location-text">
              <span className="location-main">{locationText}</span>
              <span className="location-sub">{locationSubText}</span>
            </div>
          </div>

          <div className="search-wrapper" ref={searchRef}>
            <input
              type="text"
              placeholder="Search for Products, Brands and More"
              value={keyword}
              onKeyPress={handleKeyPress}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => keyword.trim() && suggestions.length > 0 && setShowSuggestions(true)}
            />
            <button onClick={handleSearch}>
              <FaSearch />
            </button>

            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestion-box">
                <ul>
                  {suggestions.map((item, index) => (
                    <li key={index} onClick={() => handleSuggestionClick(item)}>
                      {MatchHighlight(item, keyword)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="header-nav-desktop">
          <Link to="/products">Products</Link>
          <Link to="/orders">Orders & Returns</Link>
          <Link to="/cart" className="cart-link">
            <span>{cartItems.length}</span>
            <img src={cartIcon} alt="cart" width="24" />
          </Link>

          {isAuthenticated ? (
            <button className="auth-btn" onClick={() => setDropdown(!dropdown)}>
              {user?.name} <IoMdArrowDropdown />
            </button>
          ) : (
            <button className="auth-btn">
              <Link to="/login">Login</Link>
            </button>
          )}
        </nav>

        {/* Mobile Toggle — z-index 1002 so never hidden */}
        <div className="menu-toggle">
          {!openMenu ? (
            <BiMenuAltRight onClick={() => setOpenMenu(true)} />
          ) : (
            <AiOutlineClose onClick={() => setOpenMenu(false)} />
          )}
        </div>

        {/* Mobile Overlay */}
        <div
          className={`mobile-overlay ${openMenu ? 'active' : ''}`}
          onClick={() => setOpenMenu(false)}
        />

        {/* Mobile Slide-out Drawer */}
        <nav className={`header-nav-mobile ${openMenu ? 'active' : ''}`}>
          <div className="mobile-nav-header">
            {/* <span className="mobile-nav-title">Menu</span>
            <AiOutlineClose onClick={() => setOpenMenu(false)} /> */}
          </div>
          <ul>
            <li><Link to="/products" onClick={() => setOpenMenu(false)}>Products</Link></li>
            <li><Link to="/orders" onClick={() => setOpenMenu(false)}>Orders & Returns</Link></li>
            <li>
              <Link to="/cart" onClick={() => setOpenMenu(false)}>
                Cart <span className="mobile-cart-count">({cartItems.length})</span>
              </Link>
            </li>
            {!isAuthenticated && (
              <li><Link to="/signup" onClick={() => setOpenMenu(false)}>SignUp</Link></li>
            )}
          </ul>
          <div className="mobile-nav-footer">
            {isAuthenticated ? (
              <button
                className="auth-btn"
                onClick={() => { setDropdown(!dropdown); setOpenMenu(false); }}
              >
                {user?.name} <IoMdArrowDropdown />
              </button>
            ) : (
              <button className="auth-btn">
                <Link to="/login" onClick={() => setOpenMenu(false)}>Login</Link>
              </button>
            )}
          </div>
        </nav>

        {/* Desktop Dropdown */}
        {isAuthenticated && dropdown && <Dropdown />}
      </div>
    </header>
  );
};

export default Navbar;