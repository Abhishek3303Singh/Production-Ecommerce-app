import React, { useState, useRef, useMemo, useCallback } from 'react'
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
import offerProd from "../images/prod_offer.png"
import offerProd2 from "../images/offr_prod.png"
import offerProd3 from "../images/offer_prod3.png"
import offerProd4 from "../images/off_prd4.jpeg"
import promotionbnr from "../images/promotion_img.jpg"
import mobilebnr1 from '../images/mobilebanner.jpg'
import mobilebnr3 from '../images/yogabanner.jpg'
import mobilebnr4 from '../images/moblehandband.jpg'
import HomeProductImageCard from './HomeProductImageCard';
import { useInView } from 'react-intersection-observer'

import './homePage.css'
import ProductSlider from './ProductSlider';
import { getBanner } from '../store/addBannerSlice';
import { useNavigate } from 'react-router-dom';

const ProdDet = () => {
    const [imgIndex, setImageIndex] = useState(0)
    const { products, status, } = useSelector((state) => state.product);
    const { banners, status: bannerStatus, resError, isCreated } = useSelector((state) => state.createBanner)
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate()

    const bannerArr = useMemo(() => ([
        { url: mobilebnr4, text: 'Stay Connected, Stay Stylish' },
        { url: mobilebnr1, text: 'Escape into Your Own World of Music' },
        { url: mobilebnr3, text: 'Limited Time Offer: Up to 50% Off!' },
    ]), [])

    const isMobile = window.innerWidth <= 768;




    const dispatch = useDispatch()
    const intervalIdRef = useRef(null);
    const isBannerPause = useRef(false)


    const { ref: desktopRef, inView: desktopInView } = useInView({
        threshold: 0.2,
        rootMargin: '150px',
        triggerOnce: true
    })
    const { ref: mobileRef, inView: mobileInView } = useInView(
        {
            threshold: 0.2,
            triggerOnce: true
        }
    )

    useEffect(() => {
        dispatch(getAllProducts())
        dispatch(getBanner())

    }, [dispatch])
    const maxDesktopIndex = Math.max(products.length - 4, 0);
    const maxMobileIndex = Math.max(products.length - 1, 0)
    const handlePrev = useCallback(() => {

        setCurrentIndex(prevIndex => (prevIndex <= 0 ? maxDesktopIndex : prevIndex - 1));
    }, [maxDesktopIndex]);

    const handleNext = useCallback(() => {
        setCurrentIndex(prevIndex => (prevIndex >= maxDesktopIndex ? 0 : prevIndex + 1));
    }, [maxDesktopIndex]);

    const handlePrevMobile = useCallback(() => {

        setCurrentIndex(prevIndex => (prevIndex <= 0 ? maxMobileIndex : prevIndex - 1));
    }, [maxMobileIndex]);
    const handleNextMobile = useCallback(() => {
        setCurrentIndex(prev => (prev >= maxMobileIndex ? 0 : prev + 1))
    }, [maxMobileIndex])


    const moveToNextBanner = useCallback(() => {
        const images = banners?.banners?.[0]?.Image
        if (!images?.length) {
            return
        }
        if (isBannerPause.current) return

        setImageIndex(prevBannerIndex => (prevBannerIndex === images?.length - 1 ? 0 : prevBannerIndex + 1));

    }, [banners]);

    // console.log(imgIndex, 'imageIndex')
    useEffect(() => {
        const images = banners?.banners?.[0]?.Image
        if (!images?.length) return

        intervalIdRef.current = setInterval(moveToNextBanner, 4000);
        return () => clearInterval(intervalIdRef.current);
    }, [moveToNextBanner]);

    const next = moveToNextBanner
    const prev = () => {
        const images = banners?.banners?.[0]?.Image
        if (!images?.length) return

        setImageIndex(prev =>
            prev === 0 ? images.length - 1 : prev - 1
        )
    }
    const desktopProducts = useMemo(() => {
        return products.slice(currentIndex, currentIndex + 4);
    }, [products, currentIndex]);

    const mobileProduct = useMemo(() => {
        return products.slice(currentIndex, currentIndex + 1);
    }, [products, currentIndex]);

    if (bannerStatus === 'loading' || status === 'loading' || !banners?.banners) {
        return <Loader />
    }

    return (
        <>
            <div>
                {/* ProdDet */}
            </div>
            <div className='home-product-main-container'>

                <div className='sticker'>
                    <h3> Flat 50% OFF <BiRightArrow /></h3></div>

                <div className='image-silder'
                    onMouseEnter={() => (isBannerPause.current = true)}
                    onMouseLeave={() => (isBannerPause.current = false)}
                >
                    <img loading='lazy' src={banners && banners?.banners[0]?.Image[imgIndex]?.url} alt="" />

                    <button className='left' onClick={prev}>&lt;</button>
                    <button className='right' onClick={next}>&gt;</button>
                </div>

                <div className='mobile-image-slider-container'>
                    <img loading='lazy' className='slider-image' src={bannerArr && bannerArr[imgIndex].url} alt="" />
                    <h1 className='slider-text'>
                        {bannerArr && bannerArr[imgIndex].text}
                    </h1>
                </div>

                <div className='prod-card-container'>
                    <div className='pro-card1' onClick={() => { navigate(`/products?productName=Gym`) }}>
                        <h2>Up to 70% off on Gym Products</h2>
                        <img loading='lazy' src={bag} alt="" /></div>
                    <div className='pro-card2' onClick={() => { navigate(`/products?productName=Electronics`) }}>
                        <h2>Up to 50% off | PC Accessiories</h2>
                        <img loading='lazy' src={pcaso} alt="" /></div>

                    <div className='pro-card3' onClick={() => { navigate(`/products?productName=Lifestyle`) }}>
                        <h2>Up to 70% off on lifestyle products</h2>
                        <img loading='lazy' src={prdAdd} alt="" /></div>
                    <div className='pro-card4' onClick={() => { navigate(`/products?productName=Yoga`) }}>
                        <div className='pro-col1'>
                            <div className="prod-subcol1">
                                <h3>Boost Your Fitnesss Here</h3>
                            </div>
                            <div className="prod-subcol2">
                                <img loading='lazy' src={yoga} alt="" />
                            </div>


                        </div>
                        <div className='pro-col2'>


                            <div className="prod-col2-sub1">
                                <img loading='lazy' src={ear} alt="" />
                                <span>EDYELL C6 Bluetoo…</span>

                            </div>
                            <div className="prod-col2-sub2">
                                <img loading='lazy' src={ear2} alt="" />
                                <span> boAt Rockerz 255 P…</span>


                            </div>
                        </div>
                    </div>
                </div>
                {/* Lazy Rendering Slider */}
                <div ref={desktopRef}>
                    {!isMobile &&
                        desktopInView && (


                            <div className='display-main-product-container'>
                                <h2>Best Sellers in Sports, Fitness & Outdoors</h2>
                                <div className='display-product-container'>
                                <div className="product-cont">
                                
                                    <ProductSlider products={desktopProducts} />
                                </div>
                                </div>
                                <button className='left-shift' onClick={handlePrev}>&lt;</button>
                                <button className='right-shift' onClick={handleNext}>&gt;</button>
                            </div>

                        )
                    }

                </div>

                <div ref={mobileRef}>
                    {isMobile &&
                        mobileInView && (
                            <div className='display-main-product-mobile-container'>
                            
                                <h2>Best Sellers in Sports, Fitness & Outdoors</h2>
                                <div className='display-product-mobile-container'>

                                    <div className="product-mobile-cont">
                                        {console.log("mobile card is running!!")}

                                        {/* {
                                            products && products?.slice(currentIndex, currentIndex + 1)?.map((item) => (
                                                <HomeProductImageCard key={item._id} product={item} />

                                            ))
                                        } */}
                                        <ProductSlider products={mobileProduct} />
                                    </div>


                                </div>
                                <div className='mobile-shift-buttons'>
                                    <button className='left-mobile-shift' onClick={handlePrevMobile}>&lt;</button>
                                    <button className='right-mobile-shift' onClick={handleNextMobile}>&gt;</button>

                                </div>

                            </div>

                        )
                    }

                </div>

            </div>

                <div className="homepage-card" >
                    <div className="homeleft-card" onClick={() => { navigate(`/products?productName=Headphone`) }}>

                        <img loading='lazy' src={headphone} alt="" />
                        <div className='overlay'>
                            <h2 className='animated-text'>Step Up Your Sound Game</h2>

                        </div>


                    </div>

                    <div className="right-card">

                        <div className="right-top" onClick={() => { navigate(`/products?productName=Earpods`) }}>
                            <div className='inner-right-top'>
                                <img loading='lazy' src={offerProd} alt="" />
                                <h2>True wireless</h2>
                                <h3>Top Picks</h3>
                            </div>
                            <div className='inner-right-top-two'>
                                <img loading='lazy' src={offerProd2} alt="" />
                                <h2>Wrist Watches</h2>
                                <h3>Min. 70% Off</h3>
                            </div>
                        </div>
                        <div className="bottom-right" onClick={() => { navigate(`/products?productName=Smartband`) }}>
                            <div className='inner-bottom-right'>
                                <img loading='lazy' src={offerProd3} alt="" />
                                <h2>Face Wash</h2>
                                <h3>Min. 50% Off</h3>
                            </div>
                            <div className='inner-bottom-right-two'>
                                <img loading='lazy' src={offerProd4} alt="" />
                                <h2>Lockets</h2>
                                <h3>Min. 50% Off</h3>
                            </div>

                        </div>
                    </div>
                    <div className="end" onClick={() => { navigate(`/products?productName=Smartband`) }}>
                        <img loading='lazy' src={promotionbnr} alt="" />

                    </div>

                </div>


                <div className="mobile-main-container">

                </div>


            </>
            )
}

            export default ProdDet