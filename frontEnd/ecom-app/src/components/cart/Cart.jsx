import React, { useEffect } from 'react'
import CartCard from './CartCard';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import MetaData from '../routes/MetaData';
import { useNavigate } from 'react-router-dom';
import shield from '../../images/shield.png';
import cart4 from '../../images/cart4.png'
import { cartTotal, FREE_SHIPPING_ABOVE } from '../../utils/cartPricing';
const Cart = () => {
    const [emoji, setEmoji] = useState(false)
    const { cartItems } = useSelector((state) => state.cart)
    const t = cartTotal(cartItems)
    const money = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
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
                                Shopping Cart
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
                                            <p>Price ({t.itemCount} item{t.itemCount !== 1 ? 's' : ''})</p>
                                            <p>Discount</p>
                                            <p>Tax (GST 18%)</p>
                                            <p>Delivery Charges</p>


                                        </div>
                                        <div className='amount'>
                                            <p>{money(t.mrp)}</p>
                                            <p style={{ color: 'green' }}>− {money(t.discount)}</p>
                                            <p>{money(t.gst)}</p>

                                            <p style={{ color: 'green' }}>{t.shipping === 0 ? 'Free' : money(t.shipping)}</p>
                                        </div>

                                    </div>
                                    <div className='cart-total'>
                                        <div className='Total-Amount'><h2>Total Amount</h2></div>
                                        <div className='Total-Amount'><h2>{t.total}</h2></div>
                                    </div>
                                    {t.discount > 0 &&
                                        <p className='offer-text-cart'>You will save {money(t.discount)} on this order</p>}
                                    {t.shipping > 0 && (
                                        <p className="offer-text-cart">Add {money(FREE_SHIPPING_ABOVE - t.subTotal)} more for free delivery</p>
                                    )}

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





