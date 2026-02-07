import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MetaData from '../routes/MetaData'
import './confirmOrder.css'
import ChecktOut from './ChecktOut'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import shield from '../../images/shield.png';


const ConfirmOrder = () => {
    const { shippingInfo, cartItems } = useSelector((state) => state.cart)
    const { user } = useSelector((state) => state.user)
    const navigate = useNavigate()
    let TotalAmmount = 0;
    function subTotal(TotalAmmount) {
        for (let i = 0; i < cartItems.length; i++) {
            TotalAmmount += cartItems[i].quantity * cartItems[i].offerPrice
        }
        return TotalAmmount
    }
    let subTotalAmmount = subTotal(TotalAmmount)
    // Include 28% GST
    const gst = (subTotalAmmount * 0.28)
    const shippingCharges = subTotalAmmount >= 999 ? 0 : 49
    const PayableAmount = subTotalAmmount + gst + shippingCharges

    function handleMakePayment() {
        const data = {
            subTotalAmmount,
            shippingCharges,
            gst,
            PayableAmount

        }
        sessionStorage.setItem('orderInfo', JSON.stringify(data))
        navigate('/process/payment')
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
                            <div className='confirm-order-img-container' key={item.product}>
                                <img src={item.image} alt="Product Image" />
                                <p>{item.title}</p>
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
                                <p>Price(Items:{cartItems.length})</p>
                                <p>Tax</p>
                                <p>Delivery Charges</p>


                            </div>
                            <div className='amount'>
                                <p>&#8377;{subTotalAmmount}</p>
                                <p>&#8377; {gst.toFixed(2)}</p>
                                <p style={{ color: 'green' }}>{shippingCharges > 0 ? shippingCharges : 'Free'}</p>
                            </div>

                        </div>
                        <div className='cart-total'>
                            <div className='Total-Amount'><h2>Payable Amount</h2></div>
                            <div className='Total-Amount'><h2>&#8377; {Math.round(PayableAmount)}</h2></div>
                        </div>
                        <p className='offer-text-cart'>Your Total Savings on this order &#8377; 1000</p>
                    </div>


                    <div className='order-payment'>
                        <button className='order-payment-btn' onClick={handleMakePayment} >Make Payment</button>

                    </div>

                    <div className='safe-secure-check-out'>
                            <img src={shield} alt="" />

                            <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>

                        </div>
                </div>


            </div>
        </>
    )
}

export default ConfirmOrder