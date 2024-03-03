import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { getAllProducts } from "../../store/productSlice";
import { STATUSES } from "../../store/productSlice";
import Loader from "../layout/loader/Loader";
import { useParams } from "react-router-dom";
import './products.css';
import HomeProduct from "./HomeProducts";
import Pagination from 'react-js-pagination'
import Typography from '@material-ui/core/Typography'
// import { Slider } from "@material-ui/core";
// import {Box} from '@material-ui/Box'
import Box from "@mui/material/Box";
import Slider from '@mui/material/Slider';
import Rating from "@mui/material/Rating";
import MetaData from '../routes/MetaData';
import { useLocation } from "react-router-dom";
import jump from '../../images/jump.png'
import watch4 from '../../images/watch4.png'
import electronicsicon from '../../images/electronics.png'
import sports from '../../images/sports1.png'
import fashion from '../../images/fashion.png'


const categories = [
    'SmartPhones',
    'Laptop',
    'Camera',
    'Music',
    'Headphone',
    'Lifestyle',
    'Gym',
    'Yoga',
    'Earpos',
    'Smartband',
    'Electronics',
    'Others'

]

const Products = () => {
    const [currPage, setCurrPage] = useState(1)
    const [price, setPrice] = useState([0, 50000])
    const [category, setCategory] = useState("")
    const [ratings, setRatings] = useState(0)
    const { keyword } = useParams();
    const location = useLocation()
    
    const searchParams = new URLSearchParams(location.search)
    const paramName = searchParams.get('productName')
    const dispatch = useDispatch();
    const { products, status, productsCount, responseStatus, itemPerPage, filterProductcount } = useSelector((state) => state.product);
    // console.log('products', products)
    const setCurrPageNum = (e) => {
        setCurrPage(e)
    }

    console.log('ratings', paramName)
    useEffect(()=>{
        setCategory(paramName)
    },[])

    const handlePrice = (event, newPrice) => {
        setPrice(newPrice)
    }
    
    console.log('keyword', category)

    useEffect(() => {
        dispatch(getAllProducts(keyword, currPage, price, category, ratings))
    }, [dispatch, keyword, currPage, price, category, ratings])

    // let count = filterProductcount

    if (status == STATUSES.LOADING) {
        return <>
            <Loader />
        </>
    }
    if (status == STATUSES.ERROR) {
        return <h2 style={{ color: "red", width: "40%", margin: "auto" }}>Oops! something went wrong. <span style={{ fontSize: "40px" }}> &#128580;</span> </h2>
    }
    return (
        <>
            <MetaData title="PRODUCTS-FunHub"></MetaData>

            <div className="banner-container">
                <div className="banner-left">
                    <div className="inner-left">
                        <h2>iSmart Watch</h2>
                        <p>Wear Style. Wear Technology...</p>

                    </div>
                    <div className="inner-right">
                        {/* <div style={imageContainer}>
                        <ImageSlider slides={slides} />
                    </div> */}
                        <img style={{ width: "25vmax" }} src={jump} alt="" srcset="" />
                    </div>
                </div>
                <div className="banner-right">
                    <img src={watch4} alt="" />


                </div>
            </div>
            {/* <h2 className='ProductHeading'>Products</h2> */}
            <div className="category-container">
                <div className="categ1">
                    <div className="imgCategory">
                        <img src={electronicsicon} alt="" />
                    </div>
                    <div className="text-category">
                        <h3>Electronics</h3>
                    </div>
                </div>
                <div className="categ2">
                    <div className="imgCategory">
                        <img style={{ width: '13vmax' }} src={sports} alt="" />
                    </div>
                    <div className="text-category">
                        <h3>Sports</h3>
                    </div>

                </div>
                <div className="categ3">
                    <div className="imgCategory">
                        <img src={fashion} alt="" />
                    </div>
                    <div className="text-category">
                        <h3>Fashion</h3>
                    </div>
                </div>
            </div>

            <h2 className='ProductHeading'>Products</h2>
            <div className="product-main-container">
                <div className="containerProduct" id="containerProduct"  >
                    {
                        products && products.map((prd) => (
                            <HomeProduct key={prd._id} product={prd}></HomeProduct>
                        ))
                    }
                </div>
                <div className="filter-container">
                    <div className="price-filter">
                        <h4>Filter</h4>
                        <div className="box-text">

                            <span>MIN:&#x20B9;{price[0]}</span>  <span>MAX:&#x20B9;{price[1]}</span>
                        </div>
                        {/* <span>MIN:{price[0]}</span>  <span>MAX:{price[1]}</span> */}
                        <div className="box-slider">
                            <Box sx={{ width: '70%', margin:'auto' }}>
                                <Slider
                                    value={price}
                                    onChange={handlePrice}
                                    valueLabelDisplay="auto"
                                    aria-label="Custom marks"
                                    // marks={marks}
                                    min={0}
                                    max={50000}

                                />
                            </Box>

                        </div>
                    </div>
                    <div className="category-box">
                        <h4 className="">Categories</h4>
                        <ul className="categBox">
                            {
                                categories.map((item) => (
                                    <li className="categ-item" key={item} onClick={() => setCategory(item)}>
                                        {item}
                                    </li>
                                ))
                            }
                        </ul>
                        <fieldset>
                            {/* <Typography>Ratings</Typography> */}
                            <Typography component="legend">Ratings</Typography>
                            <Rating
                                name="simple-controlled"
                                value={ratings}
                                onChange={(event, newValue) => {
                                    setRatings(newValue);
                                }}
                            />

                        </fieldset>
                    </div> 

                </div>
            </div>
            {itemPerPage < productsCount && (
                <div className="pagination-container">
                    <Pagination
                        activePage={currPage}
                        itemsCountPerPage={itemPerPage}
                        totalItemsCount={productsCount}
                        onChange={setCurrPageNum}
                        nextPageText='Next'
                        prevPageText='Prev'
                        firstPageText='First'
                        lastPageText='Last'
                        itemClass="page-item"
                        linkClass="page-link"
                        activeClass="activePageItem"
                        activeLinkClass="activeLink"
                    />
                </div>
            )}

        </>
    )
}

export default Products;