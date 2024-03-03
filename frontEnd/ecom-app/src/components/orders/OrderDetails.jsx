import React from 'react'
import './orderDetails.css'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails, clearError } from '../../store/orderDetailsSlice'
import { useEffect } from 'react'
import Loader from '../layout/loader/Loader'
import { useAlert } from 'react-alert'
import OrderStatus from './OrderStatus'
const OrderDetails = () => {
    const { id } = useParams()
    const dispatch = useDispatch();
    const alert = useAlert()
    const { order, status, resError } = useSelector((state) => state.orderDetails)
    // console.log(order, 'order')
    useEffect(() => {
        if(resError){
            alert.error(order?.order.message)
            dispatch(clearError())
        }
        dispatch(getOrderDetails(id))
    }, [dispatch, id, order && order?.orderStatus])
    // console.log(id, 'order id')

    let ordStatus=0

    let cls = 'inprocess'
    if(order?.order?.orderStatus === 'Delivered'){
        cls='delivered'
        ordStatus = 4
    }
    else if(order?.order?.orderStatus === 'Shipped'){
        cls='shipped'
        ordStatus = 1
    }
    else if(order?.order?.orderStatus === 'Out for Delivery'){
        cls='outDelivery'
        ordStatus = 3
    }
    else if(order?.order?.orderStatus === 'On The Way'){
        cls='onWay'
        ordStatus = 2
    }
    if (order.status == undefined) {
        return (
            <Loader/>
        )
    }

    return (
        <>
            <div className="orderDetails-container">
                <div className="left-orderDetails-container">
                    <div className="heading-orderDetails">
                        <h3>Hi RAj !</h3>
                        {/* <p>Raj &#160; raj@gmail.com</p> */}
                    </div>

                    <div className="orderDetails-address">
                        {/* <h2>DELIVERY ADDRESS</h2> */}
                        <h3>Order #{order && order?.order?._id}</h3>
                    </div>
                    <div className='address-text-orderDetails'>
                        <div className="address-delivery">
                            <h3>Delivery Address</h3>
                            <h4><span>Name:&#160;</span>{order?.order?.shippingAddress?.name}</h4>
                            <p><span>Phone:&#160;</span>{order?.order?.shippingAddress?.phoneNo}</p>
                            <p><span>Address:&#160;</span>{order?.order?.shippingAddress?.address}, City:&#160; {order?.order?.shippingAddress?.city}, &#160;
                                State:&#160;{order?.order?.shippingAddress?.instate}, Pincode:&#160; {order?.order?.shippingAddress?.pincode}, <b>Landmark:&#160;</b>{order?.order?.shippingAddress?.landmark}</p>
                        </div>

                        <div className="help">
                            <h3>Contact Help</h3>
                            <p>+91 80876653303</p>
                            <p>funnnhub@gmail.com</p>
                        </div>
                        <div className="orderDetails-status">
                            <h3>Order-Status</h3>
                            <p>Ordered-Date:&#160; {order?.order.paidAtDate.split('T')[0]}</p>
                            {/* <p>Status:&#160; <span style={order?.order.orderStatus === 'Delivered'?{color:'#16bd03'}:{color:'rgb(255, 64, 0)'}}>{order?.order.orderStatus} </span> </p> */}
                            <p>Status:&#160; <span className={cls}>{order?.order.orderStatus} </span> </p>

                            {
                                        order?.order.orderStatus === 'Delivered' && (
                                            <p>Delivered on {new Date().toLocaleString("en-US", { month: "long" }).substring(0,3)}-
                                            {new Date().toLocaleString("en-US", { day : '2-digit'})}-{new Date().getFullYear()}</p>
                                        )
                                    }
                        </div>
                        <div className="orderDetails-payment-status">
                            <h3>Payment-Status</h3>
                            <p style={order?.order.paymentInformation.status=='succeeded'? {color:'#16bd03'}:{color:'rgb(255, 64, 0)'}}>{order?.order.paymentInformation.status}</p>
                            <p>Paid-Date:&#160; {order?.order?.paidAtDate.split('T')[0]}</p>
                            
                        </div>





                    </div>
                    {
                        order?.order.orderProduct.map((item) => (
                            <div className='ordersDetails-img-container' key={item.product} >
                                <img src={item.image} alt="Product Image" />
                                <p>Smart Watch</p>
                                <p>Total: {item.quantity} x {item.offerPrice}=&#8377;{item.quantity * item.offerPrice} </p>
                                {/* <p>Total: 2 x 10000=&#8377;20000 </p> */}

                            </div>
                        ))
                    }

                </div>
                <div className="right-orderDetails-container">
                    <div className="orderDetails-payment-details">
                        <h3>Order Summary</h3>
                        <div className="orderDetails-price-details">
                            <div className='orderDetails-price-txt'>
                                {/* <p>Price(Items:{cartItems.length})</p> */}
                                <p>Price(Items-{order?.order.orderProduct.length})</p>

                                <p>Tax</p>
                                <p>Delivery Charges</p>


                            </div>
                            <div className='orderDetails-amount'>
                                {/* <p>&#8377;{subTotalAmmount}</p> */}
                                <p>&#8377;{order?.order.productPrice}</p>

                                {/* <p>&#8377; {gst.toFixed(2)}</p> */}
                                <p>&#8377; {order?.order.vatPrice.toFixed(2)}</p>

                                <p style={{ color: 'green' }}>{order?.order.shippingPrice>0?order?.order.shippingPrice:'Free'}</p>
                                {/* <p style={{ color: 'green' }}>Free</p> */}

                            </div>

                        </div>
                        <div className='orderDetails-cart-total'>
                            <div className='orderDdetails-Total-Amount'><h2>Payable Amount</h2></div>
                            {/* <div className='Total-Amount'><h2>&#8377; {Math.round(PayableAmount)}</h2></div> */}
                            <div className='orderDdetails-Total-Amount'><h2>&#8377; {order?.order.totalPrice}</h2></div>

                        </div>
                        {/* <p className='orderDetails-offer-text-cart'>Your Total Savings on this order &#8377; 1000</p> */}
                    </div>


                    {/* <div className='order-payment'> */}
                        {/* <button className='order-payment-btn' onClick={handleMakePayment} >Make Payment</button> */}
                        {/* <button className='order-payment-btn'  >Make Payment</button> */}

                    {/* </div> */}
                </div>


            </div>

            <OrderStatus activeStep={ordStatus}/>



        </>
    )
}

export default OrderDetails;


