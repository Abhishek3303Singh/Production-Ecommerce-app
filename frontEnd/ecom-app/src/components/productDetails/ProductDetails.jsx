import React, { useEffect } from 'react'
import classes from './ProductDetails.module.scss';
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'
import { getProductDetails } from '../../store/productDetailsSlice'
import { STATUSES } from '../../store/productDetailsSlice';
import ReactStars from 'react-rating-stars-component'
import ReactImageMagnify from 'react-image-magnify';
import CustomerRevCard from '../products/CustomerRevCard';
import Loader from '../layout/loader/Loader'
import { FaShoppingCart } from 'react-icons/fa'
import { BsFillLightningFill } from 'react-icons/bs'
import { useState } from 'react';
import { addToCart } from '../../store/cartSlice';
import MetaData from '../routes/MetaData';
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router-dom';
import Rating from "@mui/material/Rating";
import CancelIcon from '@mui/icons-material/Cancel';
import 'animate.css';
import { addReview } from '../../store/addReviewSlice'
import { getOrderDetails, clearError } from '../../store/orderDetailsSlice'



const ProductDetails = () => {
  const { id } = useParams()
  const { product, status, responseStatus } = useSelector((state) => state.productDetails)
  const { order, resError } = useSelector((state) => state.orderDetails)
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const alert = useAlert();
  let percentageOff = (product && product.offerPrice / product.price) * 100
  let offerPercentage = parseFloat(`${percentageOff}`).toFixed(2)
  // console.log(percentageOff, '% Offered Price')

  // // console.log('first url',product.Image[0].url)
  const [image, setImage] = useState(product.Image ? product.Image[0] : [{ url: " " }])
  // const [image, setImage] = useState()

  const [isReadmore, setIsReadmore] = useState(true)
  const [quantity, setQuantity] = useState(1)
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
  const navigate = useNavigate()
  useEffect(() => {
    // console.log('running')
    if (product && product._id !== id) {
      dispatch(getProductDetails(id))
    }
    if (product.Image !== undefined) {
      setImage(product && product?.Image[0])
    }
    // if (resError) {
    //   alert.error('something went Wrong!')
    //   dispatch(clearError())
    // }
    // dispatch(getOrderDetails(id))


    // dispatch(getProductDetails(id))
    // if (product.Image !== undefined) {
    //   setImage(product.Image[0])
    // }
  }, [dispatch, id, responseStatus, product])
  // if(product?.Image==undefined){
  //   return (
  //     <Loader/>
  //   )
  // }
  // else{
  //   setImage(product.Image[0])
  // }
  if (status == STATUSES.LOADING) {
    // console.log('status', image)
    return <>
      <Loader />
    </>
  }
  // else{

  // }

//   useEffect(() => {
// )
//   }, [dispatch])

  if (status == STATUSES.ERROR) {
    return <h2 style={{ color: "red", width: "40%", margin: "auto" }}>Oops! something went wrong. <span style={{ fontSize: "40px" }}> &#128580;</span> </h2>
  }

  function incQuantity() {
    if (quantity >= product.Stock) {
      return
    }
    setQuantity(quantity + 1)
  }
  function decQuantity() {
    if (quantity <= 1) {
      return
    }
    setQuantity(quantity - 1)
  }

  function handleAddToCart() {
    if (isAuthenticated) {
      dispatch(addToCart(id, quantity))
      alert.success('Product added to your cart')
    }
    else {
      navigate('/login')
    }

  }

  function handleAddReview() {
    dispatch(addReview({ id, feedback, ratings }))
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
      <div className={classes.prdDetailsCard}>
        <div className={classes.prdDetailsCard__imgcontainer}>
          {/* <Carousel> */}
          {
            // <img className={classes.prdDetailsCard__imgcontainer__carouselimg} src={image.url}
            //    alt={`${1} slide`} />
            //   product.Image && product.Image.map((item, i) => (
            //     // <img className={classes.prdDetailsCard__imgcontainer__carouselimg} src={item.url}
            //     //   key={item._id} alt={`${i} slide`} />
            // <div className={classes.prdDetailsCard__imgcontainer__carouselimg}>

            status === STATUSES.LOADING ? <Loader /> :
              <ReactImageMagnify {...{
                smallImage: {
                  alt: 'produc-image',
                  isFluidWidth: true,
                  src: image.url
                },
                largeImage: {
                  src: image.url,
                  width: 1200,
                  height: 1800
                }
              }} />
          }
          {/* // </div> */}
          {/* //   )) */}

          {/* </Carousel> */}
        </div>
        <div className={classes.prdDetailsCard__detailsBlock1}>
          <div className={classes.prdDetailsCard__detailsBlock1__1}>
            <h2>{product.name}</h2>
            <p>product # {product._id}</p>
          </div>
          <div className={classes.prdDetailsCard__detailsBlock1__2}>
            <ReactStars {...options} />

            <span>{product.ratings} Ratings &amp; {product.reviewsCount} Reviews</span>

          </div>
          <div className={classes.prdDetailsCard__detailsBlock1__3}>
            <h1>Price: &#x20B9;{product.offerPrice}{" "} <span>&#x20B9;{product.price}</span> </h1>
            <h3>{(100 - offerPercentage).toFixed(2)}% off</h3>
            <div className={classes.proDetailsCard__detailsBlock1__3__image}>

              {
                product.Image && product.Image.map((item, i) => (
                  <img className={classes.prdDetailsCard__detailsBlock1__3__image__slide} src={item.url}
                    key={item.url} alt={`${i} slide`} onMouseEnter={() => setImage(item)} />
                ))
              }

              {/* <img src={image.url} alt="" style={{width:"10"}} /> */}

            </div>
            <div className={classes.prdDetailsCard__detailsBlock1__3__1}>
              <div className={classes.prdDetailsCard__detailsBlock1__3__1__1}>
                <button style={{ backgroundColor: "red" }} onClick={decQuantity}>-</button>
                <input readOnly type="number" value={quantity} />
                <button style={{ backgroundColor: "blue" }} onClick={incQuantity}>+</button>
              </div>
              <button className={classes.prdDetailsCard__detailsBlock1__3__1__add} onClick={handleAddToCart}><FaShoppingCart /> Add to cart</button>
              <button className={classes.prdDetailsCard__detailsBlock1__3__1__buy}><BsFillLightningFill />Buy Now</button>

            </div>
            <p>
              status:{""}
              <b className={product.Stock > 1 ? 'inStock' : 'OutOfStock'}>
                {product.Stock > 1 ? "InStock" : "OutOfStock"}
              </b>

            </p>

          </div>
          <div className={classes.prdDetailsCard__detailsBlock1__4}>
            {/* Description: <p>{product.description}</p> */}
            Description: <p>{product?.description && isReadmore ? product.description.slice(0, 150) : product.description}</p>
            {product.description && product.description.length > 150
              && <span onClick={() => setIsReadmore(!isReadmore)}>
                {isReadmore ? '...read more' : '...read less'}
              </span>
            }


          </div>{
            isAuthenticated ? <button className={classes.prdDetailsCard__detailsBlock1__submitReview} onClick={handleShowtextArea}>Add Review</button> : ''
          }

        </div>


      </div>

      <div className={showTextarea ? classes.AddReviews : classes.AddReviewsHide}>
        <h1>Add Review</h1>
        <div className={classes.AddReviews__textArea}>
          <textarea value={feedback} name="" id="" cols="40" rows="4" onChange={(e) => setFeedback(e.target.value)}></textarea>

        </div>
        <div className={classes.AddReviews__ratingStars}>
          <Rating
            name="simple-controlled"
            value={ratings}
            onChange={(event, newValue) => {
              setRatings(newValue);
            }}
          />
        </div>
        <div className={classes.AddReviews__reviewSubmitBtn}>
          <button style={{ backgroundColor: '#2874f0', color: '#fff' }} onClick={handleAddReview} >Submit</button>
          <button style={{ background: 'transparent', color: 'red' }} onClick={() => setShowTextarea(!showTextarea)}><CancelIcon /></button>
        </div>
      </div>
      <h3 className={classes.reviweHeading}>Ratings & Reviews</h3>
      {/* {product.customerReview && product.customerReview[0] ? (
        <div className={classes.review}>
          {product.customerReview.map((revw) => <CustomerRevCard revw={revw} />)}

        </div>
      ) : (
        <p className={classes.noReview}>No Reviews Yet &#128532;</p>
      )} */}

      {product.customerReview && product.customerReview[0] ? (
        <div className={classes.review}>
          {/* {product.customerReview.map((revw) => <CustomerRevCard revw={revw} />)} */}
          <CustomerRevCard revw={product.customerReview} />

        </div>
      ) : (
        <p className={classes.noReview}>No Reviews Yet &#128532;</p>
      )}


    </>








  )
}

export default ProductDetails;  