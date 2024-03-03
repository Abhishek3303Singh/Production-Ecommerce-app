import { Link, useNavigate } from 'react-router-dom'
import '../style/style.css'
import { useHistory } from "react-router-dom"

import { BsSearch } from 'react-icons/bs'

import classes from './Nav.module.scss';
import { BiMenuAltRight } from 'react-icons/bi';
import { AiOutlineClose } from 'react-icons/ai';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {IoMdArrowDropdown} from 'react-icons/io'
import Dropdown from './Dropdown';
import {FaSearch} from 'react-icons/fa'
import cartIcon from '../../images/cart1.png'

// import { BsFillSearchHeartFill } from 'react-icons/bs';
// import {SiGnuprivacyguard} from 'react-icons/si'
// import { useHistory } from "react-router-dom"


const Nav = () => {

    const [openMenu, setopenMenu] = useState(false)
    const [dropdown, setDropdown] = useState(false)
    // const [size ,setSize] = useState({width:undefined, height:undefined})

    // useEffect(()=>{
    //     const handleResize =()=>{
    //         setSize({
    //             width:window.innerWidth,
    //             height:window.innerHeight
    //         });
    //     };
    //     window.addEventListener('resize', handleResize);
    //     return ()=>window.removeEventListener('resize', handleResize)
    // },[])

    // useEffect(()=>{
    //     if(size.width>768 && openMenu){
    //         setopenMenu(false)
    //     }
    // }, [size.width, openMenu])
    // const history = useHistory()
    const navigate = useNavigate()
    const [keyword, setKeyword] = useState("");
    const { cartItems } = useSelector((state) => state.cart)

    const { user, status, isAuthenticated } = useSelector((state) => state.user)

    const handleSearch = () => {

        if (keyword.trim()) {
            // console.log("keyword",keyword)
            navigate(`/products/${keyword}`)
        }
        else {
            navigate("/products")
        }
    }

    function toggleHendeler() {
        setopenMenu(!openMenu)
    }

  

    return (
        <>
            <header className={classes.header}>
                <div className={classes.header__content}>
                    <h4 className={classes.header__content__logo}><Link to='/'>
                        {/* <img src={logo} alt="" /> */}FunHub
                        </Link></h4>



                    <nav className={`${classes.header__content__nav} ${openMenu ? classes.isMenu : ''}`}>
                        <ul>
                            <li ><Link to='/products'>Products</Link> <div><span></span></div></li>
                            {/* <li><Link to='/product'>About</Link></li> */}
                            <li>
                                <Link to='/cart' ><span>{cartItems.length}</span> <img src={cartIcon} alt="" /></Link>
                            </li>
                            {/* <li style={{ marginBottom: "0px" }} className={classes.header__content__nav__auth}>
                                {userAuth ? <Link to='/login'></Link> :
                                    <Link to='/signup' >SignUp</Link>}
                            </li> */}
                            <li style={{ marginBottom: "0px" }} className={classes.header__content__nav__auth}>
                                {isAuthenticated ? '' :
                                    <Link to='/signup' >SignUp</Link>}
                            </li>

                        </ul>
                        {/* <button > */}
                            {isAuthenticated ? <button onClick={()=>setDropdown(!dropdown)}>{user&&user.name}<IoMdArrowDropdown/> </button>
                                : <button> <Link to='/login'>Login</Link></button>}
                        {/* </button> */}
                        
                    </nav>
                    <div className={classes.header__content__input}><input type="text" placeholder='Search products..'
                        onChange={(e) => setKeyword(e.target.value)} /><button onClick={handleSearch}><FaSearch /></button></div>
                    <div className={classes.header__content__toggle}>

                        {!openMenu ? <BiMenuAltRight onClick={toggleHendeler} /> : <AiOutlineClose onClick={toggleHendeler} />}
                    </div>
                </div>
                
                <div className={classes.header__dropdownController}>
                {isAuthenticated&& dropdown && <div className='animate__animated animate__flipInX'><Dropdown/></div>}

                </div>

            </header>
            {/* {dropdown&&<Dropdown/>} */}
            <div className={classes.inputSearch}>
                <input type="text" placeholder='Search here...' onChange={(e) => setKeyword(e.target.value)} /> <button onClick={handleSearch} on >search</button>
            </div>


        </>
    )
}
export default Nav;