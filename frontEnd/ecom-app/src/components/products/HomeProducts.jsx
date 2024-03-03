import './homeproduct.css'
import { getProductDetails } from '../../store/productDetailsSlice'
import { useDispatch } from 'react-redux'
import {Link, useAsyncValue} from 'react-router-dom'
import ReactStars from 'react-rating-stars-component'
import { useState } from 'react'
import 'animate.css';
import './homecss/home.css'
// import { setProductDetails} from '../../store/productDetailsSlice'
import { setProductDetails } from '../../store/productDetailsSlice'
// import image from '../imageFolder/redmi-note-10pro.jpg'

// const Products = () => {
//     return (
//         <>
//             <div class="container">
//                 <div class="card">
//                     <div class="imgBx">
//                         {/* <img src="https://assets.codepen.io/4164355/shoes.png"> */}
//                             <img src="https://assets.codepen.io/4164355/shoes.png" alt="" />
//                             {/* <img src={image} alt="" /> */}

//                     </div>
//                     <div class="contentBx">
//                         <h2>Nike Shoes</h2>
//                         <div class="size">
//                             <h3>Size :</h3>
//                             <span>7</span>
//                             <span>8</span>
//                             <span>9</span>
//                             <span>10</span>
//                         </div>
//                         <div class="color">
//                             <h3>Color :</h3>
//                             <span></span>
//                             <span></span>
//                             <span></span>
//                         </div>
//                         <button className='buy-now'>Buy Now</button>
//                         <button className='add-cart'>Add Cart</button>
//                     </div>
//                 </div>
//             </div>

//         </>
//     )
// }
import {BsFillBookmarkStarFill} from 'react-icons/bs'

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
        <Link className='product-card' to={`/product/${product._id}`} onMouseEnter={()=>setShowBtn(true)} 
        onMouseLeave={()=>setShowBtn(false)} >
        {/* <img src={product.image[0].url} alt="productImage" /> */}
        <p className='rating-badge'><span className='starVal'>{product.ratings}</span><span className='stars'><BsFillBookmarkStarFill /></span></p>
        <p className='peroff-badge'><span >{100 - off}%</span></p>

        <img src={product.Image[0].url} alt="productImage" />
        <p className='product-title'>{product.title?product.title:""}</p>
        <p className='char-limit'>{product.name}</p>
        <div className='ratings'>
        <span className='product-price'>&#x20B9; {product.price}</span>
            <p className='star-ratings'><ReactStars {...options}/> </p>
          
            <h3><span className='review'>({product.reviewsCount} Reviews) </span></h3>
        </div>
        
        <button className={showBtn?'product-cart-btn animate__animated animate__zoomIn':'product-cart-hide'}>Add TO Cart</button>
        </Link>
       

        </>
    )
}
export default HomeProducts;