import React, {useState} from 'react'
import { addToCart } from '../../store/cartSlice';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa'
import { BsFillLightningFill } from 'react-icons/bs'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux';

 const AddToCart = ({ id , product}) => {
    const [quantity, setQuantity] = useState(1)
    const { user, isAuthenticated } = useSelector((state) => state.user)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    function incQuantity() {
        if (quantity >= product.Stock) {
          return
        }
        setQuantity(prev => Math.min(prev + 1, product.Stock));
    
    
      }
      function decQuantity() {
        if (quantity <= 1) {
          return
        }
        setQuantity(prev => Math.max(prev - 1, 1));
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
  return (
    <>
    <div className='prdDetailsCard__detailsBlock1__3__1__1'>
                <h1 className='Qty-text'>Qty:</h1>
                <button className='inc-Qty' style={{ backgroundColor: "red" }} onClick={decQuantity}>-</button>
                <input className='Qty' readOnly type="number" value={quantity} />
                <button className='dec-Qty' style={{ backgroundColor: "blue" }} onClick={incQuantity}>+</button>
              </div>
              <div className='cat-btn-cont'>
                <button className='prdDetailsCard__detailsBlock1__3__1__add' onClick={handleAddToCart}><FaShoppingCart /> Add to cart</button>
                <button className='prdDetailsCard__detailsBlock1__3__1__buy'><BsFillLightningFill />Buy Now At &#x20B9;{product.offerPrice}</button>
              </div>
    
    </>
  )
}

export default React.memo(AddToCart)