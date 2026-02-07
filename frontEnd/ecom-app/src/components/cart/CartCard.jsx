import React from 'react'
import './cart.css'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../store/cartSlice'
import { removeToCart } from '../../store/cartSlice'

const CartCard = () => {

    const dispatch = useDispatch()
    const { cartItems } = useSelector((state) => state.cart)

    const incQuantity=(id, quantity, stock)=>{
        const newQuantity = quantity+1
        if(quantity>=stock){
            return
        }
        dispatch(addToCart(id, newQuantity))
    };
    const decQuantity=(id, quantity, stock)=>{
        const newQuantity = quantity-1
        if(quantity<=1){
            return
        }
        dispatch(addToCart(id, newQuantity))
    };

    function handleRemove(id){
        dispatch(removeToCart(id))
    }
    return (
        <>
            {cartItems && cartItems.map((item) => (

                <div className="productContainer">
                    <div className='cart-iamgeContainer'>
                        <div className='cart-image'>
                            <img src={item.image} alt="" />
                        </div>
                        <div className='cart-quantity'>
                            <button className='cart-item-qunty' onClick={()=>decQuantity(item.product, item.quantity, item.stock)}>-</button>
                            <input readOnly type="number" name="" id="" value={item.quantity} />
                            <button className='cart-item-qunty' onClick={()=>incQuantity(item.product, item.quantity, item.stock)}>+</button>

                        </div>

                    </div>
                    <div className='cart-textContainer'>
                        <div className='cart-item-title'>
                            <p className='title-limit'>
                                {item.name}

                            </p>

                        </div>
                        <div className='price-text'>
                            <span className='price'>&#8377;{item.price}</span> <span className='offer-price'>&#8377; {item.offerPrice}</span>
                            <span className='perOff'>  {(100-(((item.offerPrice/item.price)*100))).toFixed(2)}% Off</span>
                            <p className='total-price-cart'>Total Price: &#8377; {item.offerPrice * item.quantity} </p>
                            <p className='delivery-cart'>Delivery {item.offerPrice*item.quantity>999?(<span className='free'>Free</span> ) :<span className='free'> ₹ 49</span>}
                            
                             {item.offerPrice*item.quantity>999?<span className='Delivery-cahge' style={{fontFamily:"Roboto"}}> ₹ 49</span>:''} </p>
                            <div className='remove'>
                                <button onClick={()=>handleRemove(item.product)}>Remove</button>

                            </div>
                        </div>
                    </div>

                </div>
            ))

            }

        </>
    )
}

export default CartCard;
