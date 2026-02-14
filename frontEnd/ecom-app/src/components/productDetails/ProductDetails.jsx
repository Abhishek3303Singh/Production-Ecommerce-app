import React, { useEffect, useMemo } from 'react'
import './productDetails.css'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'
import { getProductDetails } from '../../store/productDetailsSlice'
import { STATUSES } from '../../store/productDetailsSlice';
import ReactStars from 'react-rating-stars-component'

import CustomerRevCard from '../products/CustomerRevCard';
import Loader from '../layout/loader/Loader'

import { useState } from 'react';

import MetaData from '../routes/MetaData';
import { useAlert } from 'react-alert'

import Rating from "@mui/material/Rating";
import CancelIcon from '@mui/icons-material/Cancel';
import 'animate.css';
import { addReview } from '../../store/productDetailsSlice';
import ProductGallery from './ProductGallery';
import AddToCart from './AddToCart';
import { fetchProductLists } from '../../store/recommndedProdSlice';
import RecommendationSlider from './RecommendationSlider';



const ProductDetails = () => {
  const { id } = useParams()
  const { product, status, reviewStatus } = useSelector((state) => state.productDetails)
  const {recommended, status:recomStatus, error} = useSelector((state)=>state.recommendedProd)
  const { order, resError } = useSelector((state) => state.orderDetails)
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const alert = useAlert();
  // let percentageOff = (product && product.offerPrice / product.price) * 100
  // let offerPercentage = parseFloat(`${percentageOff}`).toFixed(2)
  const offerPercentage = useMemo(() => {
    if (!product?.price || !product?.offerPrice) return 0;
    return ((1 - product.offerPrice / product.price) * 100).toFixed(2);
  }, [product?.price, product?.offerPrice]);
  console.log(recommended, 'recom , recommProd')

  // // console.log('first url',product.Image[0].url)
  // const [image, setImage] = useState(product.Image ? product.Image[0] : [{ url: " " }])
  const [image, setImage] = useState(null);

  // const [image, setImage] = useState()

  const [isReadmore, setIsReadmore] = useState(true)

  const [feedback, setFeedback] = useState('');
  const [ratings, setRatings] = useState(0);
  const [showTextarea, setShowTextarea] = useState(false)
  // console.log('url', status)
  const options = {
    edit: false,
    color: "rgb(20, 40, 20, 0.5)",
    activeColor: "rgb(250, 76, 2)",
    size: window.innerHeight < 600 ? 20 : 30,
    value: product.ratings,
    isHalf: true,
  }

  const dispatch = useDispatch();



  // 1️ Fetch product (ONLY when id changes)
  useEffect(() => {
    dispatch(getProductDetails(id));
  }, [dispatch, id]);


  // 2 Sync image when product loads
  useEffect(() => {
    if (product?.Image?.length) {
      setImage(product.Image[0]);
    }
  }, [product?.Image]);
useEffect(()=>{
  // dispatch(fetchProductLists('recentlyViewed'))
  dispatch(fetchProductLists('recommended',id))
  
},[id])
useEffect(()=>{
  window.scrollTo(0,0)
},[id])
// set ids to local storage
useEffect(() => {
  if (!product?._id) return;

  const snapshot = {
    _id: product._id,
    title: product.title,
    thumbnail: product?.Image[0]?.url || "",
  };

  let viewed =
    JSON.parse(localStorage.getItem("recentlyViewed")) || [];

  // Remove duplicate (object comparison by _id)
  viewed = viewed.filter(
    (item) => item._id !== product._id
  );

  // Add to beginning
  viewed.unshift(snapshot);

  // Keep only 10
  viewed = viewed.slice(0, 10);

  localStorage.setItem(
    "recentlyViewed",
    JSON.stringify(viewed)
  );

}, [product?._id, product?.Image]);


  if (status == STATUSES.LOADING) {
    // console.log('status', image)
    return <>
      <Loader />
    </>
  }


  if (status == STATUSES.ERROR) {
    return <h2 style={{ color: "red", width: "40%", margin: "auto" }}>Oops! something went wrong. <span style={{ fontSize: "40px" }}> &#128580;</span> </h2>
  }





  function handleAddReview() {
    // dispatch(addReview({ id, feedback, ratings })).then(()={
    //   dispatch(getProductDetails(id))
    // })

    // dispatch(addReview({ id, feedback, ratings })).then(() => {
    //   dispatch(getProductDetails(id));
    // });


    dispatch(addReview(user.name, { ratings, feedback, id }))

    setShowTextarea(!showTextarea)
    alert.success('Thanku For Your Valuable Feedback!! ')
    setRatings(0)
    setFeedback('')

  }
  const MAX_FEEDBACK_LENGTH = 500;

  const handleChange = (e) => {
    if (e.target.value.length > MAX_FEEDBACK_LENGTH) return;
    setFeedback(e.target.value);
  };



  function handleShowtextArea() {
    // if (order.name === undefined) {
    //   navigate('/cart/error')
    // }
    // else {
    setShowTextarea(!showTextarea)
    // }

  }
  //  console.log(product, 'product')
  //  console.log(product?.customerReview, 'customer review')
  return (
    <>
      <MetaData title={`${product.name}FunHub`}></MetaData>
      <div className='prdDetailsCard'>
        <div className='img-container'>
          <ProductGallery image={image} />

          <div className='img-list'>
            {
              product.Image && product.Image.map((item, i) => (
                <img className='prdDetailsCard__detailsBlock1__3__image__slide' src={item.url}
                  key={item.url} alt={`${i} slide`} onMouseEnter={() => setImage(item)} />
              ))
            }

          </div>




        </div>



        <div className='prdDetailsCard__detailsBlock1'>
          <div className='prdDetailsCard__detailsBlock1__1'>
            <h2>{product.name}</h2>
            <p>product # {product._id}</p>
          </div>
          <div className='prdDetailsCard__detailsBlock1__2'>
            <ReactStars {...options} />

            <span>{product.ratings} Ratings &amp; {product.reviewsCount} Reviews</span>

          </div>
          <div className='prdDetailsCard__detailsBlock1__3'>
            <h1>Price: &#x20B9;{product.offerPrice}{" "} <span>&#x20B9;{product.price}</span> </h1>
            <h3>{offerPercentage}% off</h3>
            <div className='proDetailsCard__detailsBlock1__3__image'>

              {/* {
                product.Image && product.Image.map((item, i) => (
                  <img className='prdDetailsCard__detailsBlock1__3__image__slide' src={item.url}
                    key={item.url} alt={`${i} slide`} onMouseEnter={() => setImage(item)} />
                ))
              } */}

            </div>
            <div className='prdDetailsCard__detailsBlock1__3__1'>

              <AddToCart id={id} product={product} />

            </div>
            <p>
              status:{""}
              <b className={product.Stock > 1 ? 'inStock' : 'OutOfStock'}>
                {product.Stock > 1 ? "InStock" : "OutOfStock"}
              </b>

            </p>

          </div>
          <div className='prdDetailsCard__detailsBlock1__4'>
            {/* Description: <p>{product.description}</p> */}
            Description: <p>{product?.description && isReadmore ? product.description.slice(0, 150) : product.description}</p>
            {product.description && product.description.length > 150
              && <span onClick={() => setIsReadmore(!isReadmore)}>
                {isReadmore ? '...read more' : '...read less'}
              </span>
            }


          </div>{
            isAuthenticated ? <button className='prdDetailsCard__detailsBlock1__submitReview' onClick={handleShowtextArea}>Add Review</button> : ''
          }

        </div>


      </div>

      <div className={showTextarea ? 'AddReviews' : 'AddReviewsHide'}>
        <h1>Add Review</h1>
        <div className='AddReviews__textArea'>
          <textarea maxLength={500} value={feedback} name="" id="" cols="40" rows="4" onChange={handleChange}></textarea>
          <p className="char-count">
            {feedback.length}/{MAX_FEEDBACK_LENGTH}
          </p>

        </div>
        <div className='AddReviews__ratingStars'>
          <Rating
            name="simple-controlled"
            value={ratings}
            onChange={(event, newValue) => {
              setRatings(newValue);
            }}
          />
        </div>
        <div className='AddReviews__reviewSubmitBtn'>
          <button disabled={reviewStatus === STATUSES.LOADING} style={{ backgroundColor: '#2874f0', color: '#fff' }} onClick={handleAddReview} >
            {reviewStatus === STATUSES.LOADING ? "Posting..." : "Submit"}


          </button>
          <button style={{ background: 'transparent', color: 'red' }} onClick={() => setShowTextarea(!showTextarea)}><CancelIcon /></button>
        </div>
      </div>
      <h3 className='reviweHeading'>Ratings & Reviews</h3>

      {product?.customerReview && product?.customerReview?.length > 0 ? (
        <div className="review">
          {/* {product?.customerReview?.map((rev) => ( */}
          <CustomerRevCard revw={product?.customerReview} reviewStatus={reviewStatus} />
          {/* ))} */}
        </div>
      ) : (
        <p className="noReview">No Reviews Yet 😔</p>
      )}

      <RecommendationSlider products={recommended?.recomnededProduct} heading={"Recommended For You"} />

    </>








  )
}

export default ProductDetails;  