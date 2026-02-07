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

  const cacheRef = useRef({});
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/products/${keyword}`);
    } else {
      navigate("/products");
    }
    setSuggestions([]);
  };

  const fetchSuggestion = async (searchKey) => {
    const normalizedKey = searchKey.toLowerCase();

    if (!normalizedKey.trim()) {
      setSuggestions([]);
      return;
    }

    //CACHE CHECKing
    if (cacheRef.current[normalizedKey]) {
      setSuggestions(cacheRef.current[normalizedKey]);
      return;
    }

    try {
      const res = await fetch(
        `${apiUrl}/api/v1/search/suggestion?keyword=${normalizedKey}`,
        { credentials: "include" }
      );

      const data = await res.json();
        // caching the res data
      cacheRef.current[normalizedKey] = data.suggestionName;
      setSuggestions(data.suggestionName);
    } catch (err) {
      console.error(err);
    }
  };

  //  DEBOUNCING to dealy api call 
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestion(keyword);
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

      
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search products..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <button onClick={handleSearch}>
            <FaSearch />
          </button>

         
          {suggestions.length > 0 && (
            <div className="suggestion-box">
              <ul>
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      navigate(`/products/${item}`);
                      setSuggestions([]);
                      setKeyword(item);
                      
                    }}
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