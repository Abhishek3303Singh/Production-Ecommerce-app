import React from 'react'
import './cart.css'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../store/cartSlice'
import { changeQuantity, removeToCart } from '../../store/cartSlice'
import { lineKey } from '../../utils/cartPricing'
import { Link } from 'react-router-dom'


const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

const CartCard = () => {

    const dispatch = useDispatch()
    const { cartItems } = useSelector((state) => state.cart)
    const setQty = (item, quantity) => dispatch(changeQuantity(item.product, item.variantId || null, quantity))
    const remove = (item) => dispatch(removeToCart(item.product, item.variantId || null))
  


    // const incQuantity = (id, quantity, stock) => {
    //     const newQuantity = quantity + 1
    //     if (quantity >= stock) {
    //         return
    //     }
    //     dispatch(addToCart(id, newQuantity))
    // };
    // const decQuantity = (id, quantity, stock) => {
    //     const newQuantity = quantity - 1
    //     if (quantity <= 1) {
    //         return
    //     }
    //     dispatch(addToCart(id, newQuantity))
    // };

    // function handleRemove(id) {
    //     dispatch(removeToCart(id))
    // }
    return (
        <>
            {cartItems && cartItems.map((item) => {
                const cap = Math.min(Number(item.stock) || 10, 10)
                const price = Number(item.price) || 0
                const offer = Number(item.offerPrice) || 0
                const off = price > 0 && offer < price ? Math.round((1 - offer / price) * 100) : 0
                const option = [item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean)
                return (

                    <div className="productContainer" key={lineKey(item)}> 
                        <div className='cart-iamgeContainer'>
                            <div className='cart-image'>
                                <Link to={`/product/${item.product}`}>
                                    <img src={item.image} alt={item.title || item.name} />

                                </Link>
                            </div>
                            <div className='cart-quantity'>
                                <button type='button'className='cart-item-qunty' aria-label='Decrease quantity' 
                                disabled={item.quantity <= 1}
                                onClick={() => setQty(item, item.quantity - 1)}>-</button>
                                <input readOnly type="number" name="" id="" value={item.quantity} aria-label='Quantity' />
                                <button type='button' className='cart-item-qunty'
                                disabled={item.quantity>=cap}
                                onClick={() => setQty(item, item.quantity + 1)}>+</button>

                            </div>

                        </div>
                        <div className='cart-textContainer'>
                            <div className='cart-item-title'>
                                <p className='title-limit'>
                                    {item.name}

                                </p>

                            </div>
                            <div className='price-text'>
                                {option.length > 0  && <p className='cart-variant'>{option.join(' . ')}</p>}
                                <span className='price'>{(money(price))}</span> {' '}
                                
                                <span className='offer-price'>{money(offer)}</span>
                                {off>0 && <span className='perOff'>{off} % Off</span>}
                                <p className='total-price-cart'>Total Price: {money(offer * item.quantity)} </p>
                                {/* <p>
                                    {
                                        item?.size && (
                                            <span> Size:{' '}{item?.size}</span>
                                        )
                                    }
                                    {
                                        item?.color && (
                                            <span> Color:{' '}{item?.color}</span>
                                        )
                                    }
                                </p> */}
                                {/* <p className='delivery-cart'>Delivery {item.offerPrice * item.quantity > 999 ? (<span className='free'>Free</span>) : <span className='free'> ₹ 49</span>}

                                    {item.offerPrice * item.quantity > 999 ? <span className='Delivery-cahge' style={{ fontFamily: "Roboto" }}> ₹ 49</span> : ''} </p> */}
                                <div className='remove'>
                                    <button type='button' onClick={() => remove(item)}>Remove</button>

                                </div>
                            </div>
                        </div>

                    </div>
                )
            }
            )

            }

        </>
    )
}

export default CartCard;
