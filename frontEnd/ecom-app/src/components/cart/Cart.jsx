import React, { useEffect } from 'react'
import CartCard from './CartCard';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import MetaData from '../routes/MetaData';
import { useNavigate } from 'react-router-dom';
import shield from '../../images/shield.png';
import cart4 from '../../images/cart4.png'

const Cart = () => {
    const [emoji, setEmoji] = useState(false)
    const { cartItems } = useSelector((state) => state.cart)

    // Calculate Price and offerPrice of CartItems
    let TotalAmount = 0;
    let offerAmount = 0;
    function amountCal(cartItems, TotalAmount, offerAmount) {
        for (let i = 0; i < cartItems.length; i++) {
            TotalAmount += (cartItems[i].price) * (cartItems[i].quantity)
            // console.log(TotalAmount, 'TotalAmount1')
            offerAmount += (cartItems[i].offerPrice) * (cartItems[i].quantity)
        }
        return [TotalAmount, offerAmount];
    }
    // function call 
    let amt = amountCal(cartItems, TotalAmount, offerAmount)
    let deliveryCharges = amt[0] >= 999 ? 0 : 49;

    const navigate = useNavigate()

    const handlePlaceOrder = () => {
        navigate("/login?redirect=shipping")
    }


    return (
        <>
            <MetaData title='My Cart'></MetaData>
            <div className="cart-card">
                {
                    cartItems.length === 0 ? (
                        <div className="cart-image-container">

                            <img src={cart4} alt="" />

                            <p>Your Cart is Empty {emoji ? <span style={{ color: 'red', fontSize: '30px' }}>&#128525;</span> :
                                <span style={{ color: 'red', fontSize: '30px' }}>&#128532;</span>} </p>
                            <Link to='/products' onMouseEnter={() => setEmoji(true)} onMouseLeave={() => setEmoji(false)}>View Products</Link>
                        </div>
                    ) : (
                        <>
                            <header className='cartHeader'>
                                My Cart
                            </header>
                            <div className="cartMainContainer">
                                <div className='product-cart-container'>
                                    <CartCard />

                                    <div className='order-place'>
                                        <button onClick={handlePlaceOrder}>PLACE ORDER</button>

                                    </div>


                                </div>

                                <div className='price-container' style={{}}>
                                    <h3>PRICE DETAILS</h3>
                                    <div className="price-details">
                                        <div className='price-txt'>
                                            <p>Price</p>
                                            <p>Discount</p>
                                            <p>Delivery Charges</p>


                                        </div>
                                        <div className='amount'>
                                            <p>&#8377; {amt[0]}</p>
                                            <p>&#8377; {amt[0] - amt[1]}</p>
                                            <p style={{ color: 'green' }}>{deliveryCharges === 0 ? 'Free' : '49'}</p>
                                        </div>

                                    </div>
                                    <div className='cart-total'>
                                        <div className='Total-Amount'><h2>Total Amount</h2></div>
                                        <div className='Total-Amount'><h2>&#8377; {amt[1] + deliveryCharges}</h2></div>
                                    </div>                       <p className='offer-text-cart'>You will save ₹ {amt[0] - amt[1]} on this order</p>

                                    <div className='safe-secure'>
                                        <img src={shield} alt="" />

                                        <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>

                                    </div>


                                </div>


                            </div>


                            <div className='order-place-mobile'>
                                <button className='order-place-mobile-btn' onClick={handlePlaceOrder}>PLACE ORDER</button>

                              

                            </div>

                            <div className='safe-secure-mobile'>
                                        <img src={shield} alt="" />

                                        <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>

                                    </div>
                        </>
                    )
                }

            </div>


        </>
    )
}

export default Cart;





