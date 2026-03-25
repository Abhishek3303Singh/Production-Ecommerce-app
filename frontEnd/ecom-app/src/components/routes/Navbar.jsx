import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { BiMenuAltRight } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import { IoMdArrowDropdown } from "react-icons/io";
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

  const cacheRef = useRef({});
  const searchRef = useRef(null); 
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  //Handling click outside to close suggestions
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

    // Cache check
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

  //Handling suggestion click
  const handleSuggestionClick = (item) => {
    setKeyword(item);
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(`/products/${item}`);
  };

  //  Debouncing to delay API call
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

  return (
    <header className="header">
      <div className="header-content">

        <div className="header-logo">
          <Link to="/">F&H</Link>
        </div>

        <nav className={`header-nav ${openMenu ? "active" : ""}`}>
          <ul>
            <li>
              <Link to="/products">Products</Link>
            </li>

            <li className="cart-link">
              <Link to="/cart">
                <span>{cartItems.length}</span>
                <img src={cartIcon} alt="cart" width="28" />
              </Link>
            </li>

            {!isAuthenticated && (
              <li>
                <Link to="/signup">SignUp</Link>
              </li>
            )}
          </ul>

          {isAuthenticated ? (
            <button
              className="auth-btn"
              onClick={() => setDropdown(!dropdown)}
            >
              {user?.name} <IoMdArrowDropdown />
            </button>
          ) : (
            <button className="auth-btn">
              <Link to="/login">Login</Link>
            </button>
          )}
        </nav>

        {/*  Search wrapper with ref for click outside detection */}
        <div className="search-wrapper" ref={searchRef}>
          <input
            type="text"
            placeholder="Search products..."
            value={keyword}
            onKeyPress={handleKeyPress}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => keyword.trim() && suggestions.length > 0 && setShowSuggestions(true)}
          />

          <button onClick={handleSearch}>
            <FaSearch />
          </button>

          {/*  Only show suggestions when showSuggestions is true */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestion-box">
              <ul>
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                  >
                    {MatchHighlight(item, keyword)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="menu-toggle">
          {!openMenu ? (
            <BiMenuAltRight onClick={() => setOpenMenu(true)} />
          ) : (
            <AiOutlineClose onClick={() => setOpenMenu(false)} />
          )}
        </div>
      </div>

      {isAuthenticated && dropdown && <Dropdown />}
    </header>
  );
};

export default Navbar;