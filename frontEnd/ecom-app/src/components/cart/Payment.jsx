import React from 'react'
import { useEffect, useRef } from 'react'
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
import { createNewOrder, clearErr } from '../../store/newOrderSlice'

const apiUrl = process.env.REACT_APP_API_BASE_URL;

const Payment = () => {
    const dispatch = useDispatch()
    const alert = useAlert()
    const stripe = useStripe()
    const elements = useElements()
    const navigate = useNavigate()
    const PayAmntBtn = useRef(null)
    
    const { shippingInfo, cartItems } = useSelector((state) => state.cart)
    const { user } = useSelector((state) => state.user)
    const { resError, newOrder, isCreated } = useSelector((state) => state.order);

    const orderDetails = JSON.parse(sessionStorage.getItem('orderInfo'))
    
    const paymentData = {
        amount: Math.round(orderDetails?.PayableAmount * 100) || 0, 
        currency: 'inr',
        description: `Order payment for ${user?.name || 'Customer'}`, 
        metadata: {
            customer_email: user?.email,
            customer_name: user?.name,
            order_id: Date.now().toString() 
        }
    }

    // console.log('payment running......' , user?.user?._id)

    useEffect(() => {
        if (isCreated) {
           
            sessionStorage.removeItem('orderInfo');
            localStorage.removeItem('cartItems');
            
            alert.success('Order placed successfully!');
            navigate('/success');
        }
    }, [isCreated, navigate, alert]);

    useEffect(() => {
        if (resError) {
            alert.error(newOrder?.message?.split(':')[0] || 'Order creation failed');
            dispatch(clearErr());
        }
    }, [dispatch, resError, alert, newOrder]);

    const order = {
        shippingInfo: shippingInfo,  
        orderItems: cartItems.map(item => ({  
            product: item.product,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        })),
        itemsPrice: orderDetails?.subTotalAmmount || 0,
        taxPrice: orderDetails?.gst || 0,
        shippingPrice: orderDetails?.shippingCharges || 0,
        totalPrice: orderDetails?.PayableAmount || 0
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements) {
            alert.error('Stripe not initialized. Please refresh the page.');
            return;
        }
        
        PayAmntBtn.current.disabled = true;
        
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true
            };

          
            const { data } = await axios.post(
                `${apiUrl}/api/v1/payment/process`,
                paymentData,
                config
            );

            const client_secret = data.client_secret;

           
            const result = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                    billing_details: {
                        name: user?.name || 'Customer',
                        email: user?.email || '',
                        address: {
                            line1: shippingInfo?.address || '',
                            city: shippingInfo?.city || '',
                            state: shippingInfo?.state || shippingInfo?.instate || '', // Handle both field names
                            postal_code: shippingInfo?.pincode || '',
                            country: shippingInfo?.country || 'IN'
                        },
                    },
                },
            });

      
            if (result.error) {
                PayAmntBtn.current.disabled = false;
                alert.error(result.error.message);
                console.error('Payment error:', result.error);
                return; 
            }
            if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
    
                
                const orderWithPayment = {
                    shippingAddress: {
                        name: user?.name || 'Customer',
                        address: shippingInfo?.address || '',
                        city: shippingInfo?.city || '',
                        instate: shippingInfo?.instate || shippingInfo?.state || '',
                        pincode: Number(shippingInfo?.pincode) || 0,
                        landmark: shippingInfo?.landmark || '',
                        country: shippingInfo?.country || 'India',
                        phoneNo: Number(shippingInfo?.phoneNo || user?.phone) || 0
                    },
                    orderProduct: cartItems.map(item => ({
                        product: item.product,
                        name: item.name,
                        price: item.price.toString(),
                        offerPrice: item.offerPrice?.toString() || item.price.toString(),
                        image: item.image,
                        stock: item.stock?.toString() || '0',
                        title: item.title || '',
                        quantity: item.quantity.toString()
                    })),
                    user: user?.user?._id, 
                    paymentInformation: {
                        id: result.paymentIntent.id,
                        status: result.paymentIntent.status
                    },
                    paidAtDate: new Date(), 
                    productPrice: Number((orderDetails?.subTotalAmmount).toFixed(2)) || 0,
                    vatPrice: Number((orderDetails?.gst).toFixed(2)) || 0,
                    shippingPrice: Number((orderDetails?.shippingCharges).toFixed(2)) || 0,
                    totalPrice: Number((orderDetails?.PayableAmount)).toFixed(2) || 0,
                    orderStatus: "In process" 
                };
            
                // console.log('Sending order:', orderWithPayment); 
                await dispatch(createNewOrder(orderWithPayment ));
            }
             else {
                PayAmntBtn.current.disabled = false;
                alert.error('Payment failed. Please try again.');
                console.error('Payment intent status:', result.paymentIntent?.status);
            }

        } catch (error) {
            PayAmntBtn.current.disabled = false;
            
            if (error.response) {
         
                alert.error(error.response.data?.message || 'Payment failed!');
                console.error('Server error:', error.response.data);
            } 
            else if (error.request) {
                
                alert.error('Network error. Please check your connection.');
                console.error('Network error:', error.request);
            }
            else {
                
                alert.error('Request failed!');
                console.error('Error:', error.message);
            }
        }
    };

    return (
        <>
            <MetaData title='Payment' />
            <ChecktOut activeStep={2} />
            <div className="payment-main-container">
                <div className="payment-container">
                    <h3>Card Details</h3>

                    <form className='payment-form' onSubmit={handleSubmit}>
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

                        <input 
                            readOnly 
                            type="submit" 
                            className='payBtn' 
                            value={`Pay - ₹${Number((orderDetails?.PayableAmount).toFixed(2)) || 0}`} 
                            ref={PayAmntBtn} 
                            disabled={!stripe}
                        />
                    </form>
                    <img src={bank} alt="bank payment" />
                </div>
            </div>
        </>
    );
};

export default Payment;