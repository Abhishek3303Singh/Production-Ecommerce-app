import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MetaData from '../routes/MetaData'
import { useAlert } from 'react-alert'
import ChecktOut from './ChecktOut'
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EventIcon from '@mui/icons-material/Event';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import bank from '../../images/bank.png'
import './payment.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
    CardNumberElement,
    CardCvcElement,
    CardExpiryElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js'
import  {createNewOrder, clearErr} from '../../store/newOrderSlice'
const Payment = () => {
    const dispatch = useDispatch()
    const alert = useAlert()
    const stripe = useStripe()
    const elements = useElements()
    const navigate = useNavigate()
    const PayAmntBtn = useRef(null)
    const { shippingInfo, cartItems } = useSelector((state) => state.cart)
    const { user } = useSelector((state) => state.user)
    const {resError ,newOrder} = useSelector((state)=>state.order);

    const orderDetails = JSON.parse(sessionStorage.getItem('orderInfo'))
    const paymentData = {
        amount:Math.round(orderDetails.PayableAmount * 100)
    }

    useEffect(()=>{
        if(resError){
            alert.error(newOrder.message.split(':')[0])
            dispatch(clearErr())
        }
    },[dispatch,resError,alert])

    const order = {
        shippingAddress:shippingInfo,
        orderProduct : cartItems,
        productPrice:orderDetails.subTotalAmmount,
        vatPrice:orderDetails.gst,
        shippingPrice: orderDetails.shippingCharges,
        totalPrice:orderDetails.PayableAmount
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        PayAmntBtn.current.disabled = true
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },


            };
            const { data } = await axios.post("/api/v1/payment/process",
            paymentData,
                config
            );
            const client_secret = data.client_secret;
            // console.log(client_secret, 'client_secret')
            if (!stripe || !elements) {
                console.log('stripe or elements not found')
                alert.error('stripe or elements not found')
                return
            }
            const result = await stripe.confirmCardPayment(client_secret,
                {
                    payment_method: {
                        card: elements.getElement(CardNumberElement),
                        billing_details: {
                            name: user.name,
                            email: user.email,
                            address: {
                                line1: shippingInfo.address,
                                city: shippingInfo.city,
                                state: shippingInfo.instate,
                                postal_code: shippingInfo.pincode,
                                country: shippingInfo.country
                            },
                        },
                    },
                },
            );
            if(result.error){
                PayAmntBtn.current.disabled = false;
                alert(result.error.message)
            }
            else{
                if(result.paymentIntent.status==='succeeded'){

                    order.paymentInformation = {
                        id:result.paymentIntent.id,
                        status:result.paymentIntent.status
                    };
                    dispatch(createNewOrder(order))
                    navigate('/success')
                }
                else{
                    alert.error('Unable to complete transaction. Please try again later!!')
                }
            }

        }
        catch (e) {
            PayAmntBtn.current.disabled = false;
            alert.error('Request failed!')
            // console.log('error in payment method')
            console.log(e)
            
            
        }

    }
    return (
        <>
            <MetaData title='Payment'></MetaData>
            <ChecktOut activeStep={2} />
            <div className="payment-main-container">
                {/* <img src="" alt="" /> */}
                <div className="payment-container">
                    <h3>Card Details</h3>

                    <form action="" className='payment-form' onSubmit={(e)=>handleSubmit(e)}>


                        <div>
                            <CreditCardIcon />
                            <CardNumberElement className='paymentInput' />
                        </div>
                        <div>
                            <EventIcon />
                            <CardExpiryElement className='paymentInput' />
                        </div>
                        <div>
                            <VpnKeyIcon />
                            <CardCvcElement className='paymentInput' />
                        </div>

                        <input readOnly type="submit" className='payBtn' value={`Pay - ₹${orderDetails && orderDetails.PayableAmount}`} ref={PayAmntBtn} />
                    </form>
                    <img src={bank} alt="" />



                </div>

            </div>

        </>
    )
}

export default Payment