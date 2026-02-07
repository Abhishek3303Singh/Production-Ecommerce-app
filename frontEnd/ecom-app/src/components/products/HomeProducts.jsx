import './homeproduct.css'
import React, {memo} from 'react'
import { useDispatch } from 'react-redux'
import {Link} from 'react-router-dom'
import ReactStars from 'react-rating-stars-component'
import { useState } from 'react'
import 'animate.css';
import './homecss/home.css'





const HomeProducts =({product})=>{
    const [showBtn, setShowBtn] = useState(false)
    const dispatch = useDispatch()
    const options ={
        edit:false,
        color: "rgb(20, 40, 20, 0.5)",
        activeColor:"orange",
        size:window.innerHeight<600?10:25,
        value:product.ratings,
        isHalf:true,
    }
    const off = parseInt((product.offerPrice/product.price) * 100)
    return(
        <>
        <Link className='product-card' to={`/product/${product._id}`} >
        
        <p className='peroff-badge'><span >{100 - off}%</span></p>

        <img loading='lazy' src={product.Image[0].url} alt="productImage" />
        <p className='product-title'>{product.title?product.title:""}</p>
        <p className='char-limit'>{product.name}</p>
        <div className='ratings'>
        <span className='product-price'>&#x20B9; {product.price}</span>
            <p className='star-ratings'><ReactStars {...options}/> </p>
          
            <h3><span className='review'>({product.reviewsCount} Reviews) </span></h3>
        </div>
        
        <button className="product-cart-btn">Add TO Cart</button>
        </Link>
       

        </>
    )
}
export default memo(HomeProducts);