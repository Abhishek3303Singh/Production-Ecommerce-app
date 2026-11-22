import React from 'react'
import { useSelector } from 'react-redux'
import MetaData from '../routes/MetaData'
import './confirmOrder.css'
import ChecktOut from './ChecktOut'
import { Link,Navigate } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import shield from '../../images/shield.png';
import { cartTotal } from '../../utils/cartPricing'

const ConfirmOrder = () => {
    const { shippingInfo, cartItems } = useSelector((state) => state.cart)
    const { user } = useSelector((state) => state.user)
    const navigate = useNavigate()

    const t = cartTotal(cartItems)
    const subTotalAmmount = t.subTotal
    const gst = t.gst
    const shippingCharges = t.shipping
    const PayableAmount = t.total
    if(!cartItems.length){
        return <Navigate to='/cart' replace />
    }
    if(!shippingInfo?.address){
        return <Navigate to='/shipping' replace/>
    }
    // let TotalAmmount = 0;
    // function subTotal(TotalAmmount) {
    //     for (let i = 0; i < cartItems.length; i++) {
    //         TotalAmmount += cartItems[i].quantity * cartItems[i].offerPrice
    //     }
    //     return TotalAmmount
    // }
    // let subTotalAmmount = subTotal(TotalAmmount)
    // Include 28% GST
    // const gst = (subTotalAmmount * 0.18)
    // const shippingCharges = subTotalAmmount >= 499 ? 0 : 40
    // const PayableAmount = subTotalAmmount + gst + shippingCharges

    function handleMakePayment() {
        const data = {
            subTotalAmmount,
            shippingCharges,
            gst,
            PayableAmount

        }
        sessionStorage.setItem('orderInfo', JSON.stringify(data))
        // navigate('/process/payment')
        navigate('/payment/razorpay')
    }

    return (
        <>
            <MetaData title='Confirm-Order' />
            <ChecktOut activeStep={1} />
            <div className="confirm-container">
                <div className="left-confirm-container">
                    <div className="heading-account">
                        <h3>LOGIN</h3>
                        <p>{user.name} &#160; {user.email}</p>
                    </div>
                    <div className="address-confirm">
                        <h2>DELIVERY ADDRESS</h2>
                    </div>
                    <div className='address-text-confirm'>
                        <h4><span>Name:&#160;</span>{shippingInfo.name}</h4>
                        <p><span>Phone:&#160;</span>{shippingInfo.phoneNo}</p>
                        <p><span>Address:&#160;</span>{shippingInfo.address}, City:&#160; {shippingInfo.city}, &#160;
                            State:&#160;{shippingInfo.instate}, Pincode:&#160; {shippingInfo.pincode}, <b>Landmark:&#160;</b>{shippingInfo.landmark}

                        </p>
                        <Link to='/shipping'>Change</Link>
                    </div>
                    {
                        cartItems && cartItems.map((item) => (
                            <div className='confirm-order-img-container' key={`${item.product}:${item.variantId || ''}`}>
                                <img src={item.image} alt={item.title || 'Product'} />
                                <p>{item.title}
                                {(item.size || item.color) && (
                                    <small>({[item.size, item.color].filter(Boolean).join(', ')})</small>
                                )}
                                </p>
                                <p>Total: {item.quantity} x {item.offerPrice}=&#8377;{item.quantity * item.offerPrice} </p>
                            </div>
                        ))
                    }

                </div>
                <div className="right-confirm-container">
                    <div className="order-payment-details">
                        <h3>Order Summary</h3>
                        <div className="price-details">
                            <div className='price-txt'>
                                <p>Price(Items:{t.itemCount})</p>
                                <p>Tax (GST 18%)</p>
                                <p>Delivery Charges</p>


                            </div>
                            <div className='amount'>
                                <p>&#8377;{subTotalAmmount}</p>
                                <p>&#8377; {gst.toFixed(2)}</p>
                                <p style={{ color: 'green' }}> &#8377;{shippingCharges > 0 ? shippingCharges : 'Free'}</p>
                            </div>

                        </div>
                        <div className='cart-total'>
                            <div className='Total-Amount'><h2>Payable Amount</h2></div>
                            <div className='Total-Amount'><h2>&#8377; {Math.round(PayableAmount.toFixed(2))}</h2></div>
                        </div>
                        {/* <p className='offer-text-cart'>Your Total Savings on this order {t.discount.toFixed(0)}</p> */}
                        {t.discount > 0 && (
                            <p className="offer-text-cart">You will save &#8377;{t.discount.toFixed(0)} on this order</p>
                        )}
                    </div>


                    <div className='order-payment'>
                        <button type='button' className='order-payment-btn' onClick={handleMakePayment} >
                            
                            <span className='pay-label'>Make Payment</span>
                            <span className='pay-amount'>&#8377;{PayableAmount.toFixed(2)}</span>
                            
                        </button>

                    </div>

                    <div className='safe-secure-check-out'>
                        <img src={shield} alt="" />

                        <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>

                    </div>
                </div>
                <div className='confirm-pay-spacer' />

            </div>
        </>
    )
}

export default ConfirmOrder