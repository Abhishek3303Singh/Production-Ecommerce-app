import React, { useState, useRef } from 'react'
import Loader from '../components/layout/loader/Loader'
import bag from '../images/bag.jpg'
import { BiRightArrow } from 'react-icons/bi'
import { getAllProducts } from "../store/productSlice";
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import prdAdd from '../images/prdAdd.jpg'
import pcaso from '../images/pcaso.jpg'
import yoga from '../images/yoga.jpeg'
import ear from '../images/ear3.png'
import ear2 from '../images/ear2.jpg'
import headphone from '../images/headphonegirl.jpg'
import smartband from '../images/smartband.jpg'
import earpd from '../images/earpd.jpg'
import mobilebnr1 from '../images/mobilebanner.jpg'
import mobilebnr2 from '../images/handband.jpg'
import mobilebnr3 from '../images/yogabanner.jpg'
import mobilebnr4 from '../images/moblehandband.jpg'

import './homePage.css'
import { Link } from 'react-router-dom'
import { getBanner } from '../store/addBannerSlice';
import { useNavigate } from 'react-router-dom';

const ProdDet = () => {
    const [imgIndex, setImageIndex] = useState(0)
    const { products, status, productsCount, responseStatus, itemPerPage, filterProductcount } = useSelector((state) => state.product);
    const { banners, status: bannerStatus, resError, isCreated } = useSelector((state) => state.createBanner)
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate()

    const bannerArr = [
        { url: mobilebnr4, text: 'Stay Connected, Stay Stylish' },
        { url: mobilebnr1, text: 'Escape into Your Own World of Music' },
        { url: mobilebnr3, text: 'Limited Time Offer: Up to 50% Off!' },

    ]


    const dispatch = useDispatch()
    const intervalIdRef = useRef(null);

    useEffect(() => {
        dispatch(getAllProducts())
        dispatch(getBanner())

    }, [])

    const handlePrev = () => {

        setCurrentIndex(prevIndex => (prevIndex === 0 ? products.length - 4 : prevIndex - 1));
    };
    const handlePrevMobile = () => {

        setCurrentIndex(prevIndex => (prevIndex === 0 ? products.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prevIndex => (prevIndex === products.length - 4 ? 0 : prevIndex + 1));
    };
    const handleNextMobile = () => {
        setCurrentIndex(prevIndex => (prevIndex === products.length - 1 ? 0 : prevIndex + 1));
    };
    const moveToNextBanner = () => {
        if (banners && banners.banners[0]?.Image) {
            setImageIndex(prevBannerIndex => (prevBannerIndex === (banners.banners[0].Image.length - 1) ? 0 : prevBannerIndex + 1));
        }
    };

    // console.log(imgIndex, 'imageIndex')
    useEffect(() => {
        intervalIdRef.current = setInterval(moveToNextBanner, 4000);
        return () => clearInterval(intervalIdRef.current);
    }, [banners]);
    const next = () => {
        if (imgIndex == banners?.banners[0]?.Image.length - 1) {

            setImageIndex(0)
        } else {
            setImageIndex(imgIndex + 1)
        }
    }
    const prev = () => {
        if (imgIndex === 0) {
            setImageIndex(banners && banners?.banners[0]?.Image?.length - 1)
        } else {
            setImageIndex(imgIndex - 1)
        }
    }



    if (bannerStatus === 'loading') {
        return (
            <Loader />
        )
    }

    // console.log(banners&&banners?.banners[0].Image, 'banners')


    if (banners?.banners === undefined) {
        return (
            <Loader />
        )
    }

    if (status === 'loading') {
        return (
            <Loader />
        )
    }
    return (
        <>
            <div>
                {/* ProdDet */}
            </div>
            <div className='home-product-main-container'>

                <div className='sticker'>
                    <h3> Flat 50% OFF <BiRightArrow /></h3></div>

                <div className='image-silder'>
                    <img src={banners && banners?.banners[0]?.Image[imgIndex]?.url} alt="" />

                    <button className='left' onClick={prev}>&lt;</button>
                    <button className='right' onClick={next}>&gt;</button>
                </div>

                <div className='mobile-image-slider-container'>
                    <img className='slider-image' src={bannerArr && bannerArr[imgIndex].url} alt="" />
                    <h1 className='slider-text'>
                        {bannerArr && bannerArr[imgIndex].text}
                    </h1>
                </div>

                <div className='prod-card-container'>
                    <div className='pro-card1' onClick={() => { navigate(`/products?productName=Gym`) }}>
                        <h2>Up to 70% off on Gym Products</h2>
                        <img src={bag} alt="" /></div>
                    <div className='pro-card2' onClick={() => { navigate(`/products?productName=Electronics`) }}>
                        <h2>Up to 50% off | PC Accessiories</h2>
                        <img src={pcaso} alt="" /></div>

                    <div className='pro-card3' onClick={() => { navigate(`/products?productName=Lifestyle`) }}>
                        <h2>Up to 70% off on lifestyle products</h2>
                        <img src={prdAdd} alt="" /></div>
                    <div className='pro-card4' onClick={() => { navigate(`/products?productName=Yoga`) }}>
                        <div className='pro-col1'>
                            <div className="prod-subcol1">
                                <h3>Boost Your Fitnesss Here</h3>
                            </div>
                            <div className="prod-subcol2">
                                <img src={yoga} alt="" />
                            </div>


                        </div>
                        <div className='pro-col2'>


                            <div className="prod-col2-sub1">
                                <img src={ear} alt="" />
                                <span>EDYELL C6 Bluetoo…</span>

                            </div>
                            <div className="prod-col2-sub2">
                                <img src={ear2} alt="" />
                                <span> boAt Rockerz 255 P…</span>


                            </div>
                        </div>
                    </div>
                </div>

                <div className='display-main-product-container'>
                    <h2>Best Sellers in Sports, Fitness & Outdoors</h2>
                    <div className='display-product-container'>
                        <Link to={`/product/${products[1]?._id}`}>
                            <div className="product-cont">
                                {/* <img src={products && products[1]?.Image[0].url} alt="" /> */}
                                {
                                    products && products?.slice(currentIndex, currentIndex + 4)?.map((item) => (
                                        <Link to={`/product/${item?._id}`}>
                                            <img src={item?.Image[0]?.url} alt="" srcset="" />
                                        </Link>

                                    ))
                                }
                            </div>
                        </Link>

                    </div>
                    <button className='left-shift' onClick={handlePrev}>&lt;</button>
                    <button className='right-shift' onClick={handleNext}>&gt;</button>
                </div>

                <div className='display-main-product-mobile-container'>
                    <h2>Best Sellers in Sports, Fitness & Outdoors</h2>
                    <div className='display-product-mobile-container'>
                        <Link to={`/product/${products[1]?._id}`}>
                            <div className="product-mobile-cont">
                                {/* <img src={products && products[1]?.Image[0].url} alt="" /> */}
                                {
                                    products && products?.slice(currentIndex, currentIndex + 1)?.map((item) => (
                                        <Link to={`/product/${item?._id}`}>
                                            <img src={item?.Image[0]?.url} alt="" srcset="" />
                                        </Link>

                                    ))
                                }
                            </div>
                        </Link>

                    </div>
                    <div className='mobile-shift-buttons'>
                        <button className='left-mobile-shift' onClick={handlePrevMobile}>&lt;</button>
                        <button className='right-mobile-shift' onClick={handleNextMobile}>&gt;</button>

                    </div>

                </div>


            </div>

            <div className="homepage-card" >
                <div className="homeleft-card" onClick={() => { navigate(`/products?productName=Headphone`) }}>

                    <img src={headphone} alt="" />
                    <div className='overlay'>
                        <h2 className='animated-text'>Step Up Your Sound Game</h2>

                    </div>


                </div>
                <div className="right-card">
                    <div className="middle" onClick={() => { navigate(`/products?productName=Earpods`) }}>
                        <img src={earpd} alt="" />
                        <h2>Don't Miss Out! Exclusive Deals Inside</h2>
                    </div>
                    <div className="end" onClick={() => { navigate(`/products?productName=Smartband`) }}>
                        <img src={smartband} alt="" />
                        <h2>Elevate Your Lifestyle with Intelligent Electronics</h2>

                    </div>
                </div>
            </div>


            <div className="mobile-main-container">

            </div>


        </>
    )
}

export default ProdDet