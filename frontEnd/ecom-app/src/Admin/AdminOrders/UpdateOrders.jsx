import React, { useState } from 'react'
import './updateOrder.css'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails, clearError } from '../../store/orderDetailsSlice'
import { useEffect } from 'react'
import Loader from '../../components/layout/loader/Loader'
import {clrErr, setUpdateOrderStatus, resetIsUpdate} from '../../store/allOrdersSlice'
import { useAlert } from 'react-alert'
import SideBar from '../SideBar'
const UpdateOrders = () => {
    const { id } = useParams()
    const dispatch = useDispatch();
    const alert = useAlert()
    const { order, status, resError } = useSelector((state) => state.orderDetails)
    const {status:upadteStatus, resError:updateError, updateOrder,isUpdated} = useSelector((state)=>state.allOrders)
    // console.log(order, 'order')
    const [changeOrderStatus, setChangeOrderStatus] = useState('')

    useEffect(() => {
        if (resError) {
            alert.error(order?.order.message)
            dispatch(clearError())
        }
        if(updateError){
            alert.error(updateOrder?.message)
            dispatch(clrErr())
        }
        if(isUpdated){
            alert.success('Order Status Updated successfully')
            dispatch(resetIsUpdate())
        }
        dispatch(getOrderDetails(id))
    }, [dispatch, id, updateError, order?.orderStatus, isUpdated])

    // console.log(changeOrderStatus, 'Order-Status')


    function handleSubmit(){
        dispatch(setUpdateOrderStatus(changeOrderStatus, id))
    }
    // console.log(id, 'order id')

    let cls = 'inprocess'
    if(order?.order?.orderStatus === 'Delivered'){
        cls='delivered'
    }
    else if(order?.order?.orderStatus === 'Shipped'){
        cls='shipped'
    }
    else if(order?.order?.orderStatus === 'Out for Delivery'){
        cls='outDelivery'
    }
    else if(order?.order?.orderStatus === 'On The Way'){
        cls='onWay'
    }

    if (order.status == undefined) {
        return (
            <Loader />
        )
    }

    return (
        <>
            <div className="upade-order-container">
                <div className="order-sidebar">
                    <SideBar />
                </div>

                <div>

                    <header className='update-order-heading'>Update Order Panel</header>

                    <div className="orderDetails-container">

                        <div className="left-orderDetails-container">

                            <div className="orderDetails-address">
                                {/* <h2>DELIVERY ADDRESS</h2> */}
                                <h3>Order #{order && order?.order?._id}</h3>
                            </div>
                            <div className="heading-orderDetails">
                                <h3> User ID. #{order && order?.order?.user?._id}</h3>
                            </div>
                            <div className='address-text-orderUpdate'>
                                <div className="address-delivery">
                                    <h3>Delivery Address</h3>
                                    <h4><span>Name:&#160;</span>{order?.order?.shippingAddress?.name}</h4>
                                    <p><span>Phone:&#160;</span>{order?.order?.shippingAddress?.phoneNo}</p>
                                    <p><span>Address:&#160;</span>{order?.order?.shippingAddress?.address}, City:&#160; {order?.order.shippingAddress.city}, &#160;
                                        State:&#160;{order?.order?.shippingAddress.instate}, Pincode:&#160; {order?.order.shippingAddress.pincode}, <b>Landmark:&#160;</b>{order?.order.shippingAddress.landmark}</p>
                                </div>

                                {/* <div className="help">
                                    <h3>Contact Help</h3>
                                    <p>+91 80876653303</p>
                                    <p>funnnhub@gmail.com</p>
                                </div> */}
                                <div className="orderDetails-status">
                                    <h3>Order-Status</h3>
                                    <p>Ordered-Date:&#160; {order?.order.paidAtDate.split('T')[0]}</p>
                                    {/* <p>Status: <span style={order?.order.orderStatus === 'Delivered'?{color:'#16bd03'}:{color:'rgb(255, 64, 0)'}}>&#160;{order?.order.orderStatus}</span></p> */}
                                    <p>Status: <span className={cls}>&#160;{order?.order.orderStatus}</span></p>
                                    {
                                        order?.order.orderStatus === 'Delivered' && (
                                            <p>Delivered on {new Date().toLocaleString("en-US", { month: "long" }).substring(0,3)}-
                                            {new Date().toLocaleString("en-US", { day : '2-digit'})}-{new Date().getFullYear()}</p>
                                        )
                                    }
                                    
                                </div>
                                <div className="orderDetails-payment-status">
                                    <h3>Payment-Status</h3>
                                    <p style={order?.order.paymentInformation.status == 'succeeded' ? { color: '#16bd03' } : { color: 'rgb(255, 64, 0)' }}>{order?.order.paymentInformation.status}</p>
                                    {/* <p className={cls}>{order?.order.paymentInformation.status}</p> */}
                                    
                                    <p>Paid-Date:&#160; {order?.order.paidAtDate.split('T')[0]}</p>

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

                                        <p style={{ color: 'green' }}>{order?.order.shippingPrice > 0 ? order?.order.shippingPrice : 'Free'}</p>
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

                            <div className='update-order-status'>
                                <h3>Change Order Status</h3>
                                <select name="" id="" className='order-status-select' onChange={(e)=>setChangeOrderStatus(e.target.value)}>
                                    <option value="">Choose Status</option>
                                    {order?.order.orderStatus === 'In process' && (<option value="Shipped">Shipped</option>)}
                                    {order?.order.orderStatus === 'Shipped' && (<option value="On The Way">On The Way</option>)}
                                    {order?.order.orderStatus === 'On The Way' && (<option value="Out for Delivery">Out for Delivery</option>)}
                                    {order?.order.orderStatus === 'Out for Delivery' && (<option value="Delivered">Delivered</option>)}



                                </select>
                            </div>
                            <div className="update-order-status-btn">
                                <button className='status-update-btn' onClick={handleSubmit}>Update</button>

                            </div>
                        </div>


                    </div>
                </div>
            </div>



        </>
    )
}

export default UpdateOrders;



