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
import { addReview } from '../../store/addReviewSlice';
import { addOptimisticReview } from '../../store/addReviewSlice';
import ProductGallery from './ProductGallery';
import AddToCart from './AddToCart';
import { nanoid } from '@reduxjs/toolkit';



const ProductDetails = () => {
  const tempId = nanoid()
  const { id } = useParams()
  const { product, status } = useSelector((state) => state.productDetails)
  const { order, resError } = useSelector((state) => state.orderDetails)
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const alert = useAlert();
  // let percentageOff = (product && product.offerPrice / product.price) * 100
  // let offerPercentage = parseFloat(`${percentageOff}`).toFixed(2)
  const offerPercentage = useMemo(() => {
    if (!product?.price || !product?.offerPrice) return 0;
    return ((1 - product.offerPrice / product.price) * 100).toFixed(2);
  }, [product?.price, product?.offerPrice]);
  // console.log(percentageOff, '% Offered Price')

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
    dispatch(addOptimisticReview({
      tempId,
      user:user.name,
      rating: ratings,
      comment: feedback,
      isPending:true
    }))

    dispatch(addReview({
      productId: id,
      review : {ratings, feedback, tempId}
    }))

    setShowTextarea(!showTextarea)
    alert.success('Thanku For Your Valuable Feedback!! ')
    setRatings(0)
    setFeedback('')

  }



  function handleShowtextArea() {
    // if (order.name === undefined) {
    //   navigate('/cart/error')
    // }
    // else {
    setShowTextarea(!showTextarea)
    // }

  }

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
          <textarea value={feedback} name="" id="" cols="40" rows="4" onChange={(e) => setFeedback(e.target.value)}></textarea>

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
          <button style={{ backgroundColor: '#2874f0', color: '#fff' }} onClick={handleAddReview} >Submit</button>
          <button style={{ background: 'transparent', color: 'red' }} onClick={() => setShowTextarea(!showTextarea)}><CancelIcon /></button>
        </div>
      </div>
      <h3 className='reviweHeading'>Ratings & Reviews</h3>

      {product.customerReview && product.customerReview[0] ? (
        <div className='review'>
          {/* {product.customerReview.map((revw) => <CustomerRevCard revw={revw} />)} */}
          <CustomerRevCard revw={product.customerReview} />

        </div>
      ) : (
        <p className='noReview'>No Reviews Yet &#128532;</p>
      )}


    </>








  )
}

export default ProductDetails;  