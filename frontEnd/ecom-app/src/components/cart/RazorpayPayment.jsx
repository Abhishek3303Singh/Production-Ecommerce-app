import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAlert } from 'react-alert';
import axios from 'axios';
import './RazorpayPayment.css';
import MetaData from '../routes/MetaData';
import ChecktOut from './ChecktOut';
import { clearCartItems } from '../../store/cartSlice';

const apiUrl = process.env.REACT_APP_API_BASE_URL;

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const RazorpayPayment = () => {
    const dispatch = useDispatch();
    const alert = useAlert();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const payingRef = useRef(false);   // blocks double clicks even before state updates

    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const orderDetails = JSON.parse(sessionStorage.getItem('orderInfo'));

    if (!orderDetails) return <Navigate to="/cart" replace />;

    const stopLoading = () => {
        payingRef.current = false;
        setLoading(false);
    };

    const handlePayment = async () => {
        if (payingRef.current) return;
        payingRef.current = true;
        setLoading(true);

        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                alert.error('Failed to load payment gateway. Please try again.');
                return stopLoading();
            }

            // The server prices the cart itself; we send ids and quantities only
            const { data } = await axios.post(
                `${apiUrl}/api/v1/razorpay/order`,
                {
                    items: cartItems.map((i) => ({ product: i.product, quantity: i.quantity })),
                    shippingAddress: {
                        name: shippingInfo?.name || user?.name,
                        address: shippingInfo?.address,
                        city: shippingInfo?.city,
                        instate: shippingInfo?.instate,
                        pincode: shippingInfo?.pincode,
                        landmark: shippingInfo?.landmark,
                        country: shippingInfo?.country || 'India',
                        phoneNo: shippingInfo?.phoneNo,
                        lat: shippingInfo?.lat,
                        lng: shippingInfo?.lng,
                    },
                },
                { withCredentials: true }
            );

            if (!data.success) throw new Error(data.message || 'Failed to create order');

            // Server total differs from what the customer saw: stop and let them review
            if (Math.abs(data.totals.totalPrice - orderDetails.PayableAmount) > 1) {
                sessionStorage.setItem('orderInfo', JSON.stringify({
                    subTotalAmmount: data.totals.productPrice,
                    gst: data.totals.vatPrice,
                    shippingCharges: data.totals.shippingPrice,
                    PayableAmount: data.totals.totalPrice,
                }));
                alert.info('Some prices have changed. Please review your order.');
                stopLoading();
                return navigate('/cart');
            }

            const options = {
                key: data.key_id,
                amount: data.order.amount,       // paise, from the server
                currency: data.order.currency,
                name: 'F&H',
                description: `Payment for ${cartItems.length} item(s)`,
                order_id: data.order.id,
                handler: async (response) => {
                    try {
                        const verifyRes = await axios.post(
                            `${apiUrl}/api/v1/razorpay/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            { withCredentials: true }
                        );

                        if (!verifyRes.data.success) throw new Error('verify failed');

                        sessionStorage.removeItem('orderInfo');
                        dispatch(clearCartItems())
                        alert.success('Payment successful! Order placed.');
                        navigate('/payment/success', {
                            state: {
                                method: 'razorpay',
                                amount: data.totals.totalPrice,
                                transactionId: response.razorpay_payment_id,
                                orderId: verifyRes.data.orderId,
                            },
                        });
                    } catch (error) {
                        stopLoading();
                        if (error.response?.status === 409) {
                            // Stock ran out while paying; the server is refunding
                            alert.error(error.response.data.message);
                        } else {
                            // Payment may have gone through; the webhook can still confirm the order
                            alert.info('We could not confirm your payment yet. If money was deducted, your order will be confirmed shortly. Check My Orders or contact support.');
                        }
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: String(shippingInfo?.phoneNo || ''),
                },
                theme: { color: '#131921' },
                modal: {
                    ondismiss: () => {
                        stopLoading();
                        alert.info('Payment cancelled');
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', (r) => alert.error(r.error?.description || 'Payment failed. Please try again.'));
            razorpay.open();   // the button stays disabled until the popup is dismissed or finishes
        } catch (error) {
            stopLoading();
            if (error.response) alert.error(error.response.data?.message || 'Server error');
            else if (error.request) alert.error('Network error. Please check your connection.');
            else alert.error(error.message || 'Payment failed');
        }
    };

    return (
    <>
     <MetaData title="Payment" />
    <ChecktOut activeStep={2} />
        <div className="razorpay-container">
            <h3>Pay securely</h3>
            <div className="amount-display">Total Amount: ₹{orderDetails.PayableAmount?.toFixed(2)}</div>

            <button className="pay-now-btn" onClick={handlePayment} disabled={loading}>
                {loading ? 'Please wait...' : `Pay ₹${orderDetails.PayableAmount?.toFixed(2)}`}
            </button>

            <div className="payment-methods-info">
                <p>✅ UPI, Credit/Debit cards, Net Banking and wallets</p>
                <p>🔒 Secure payments powered by Razorpay</p>
            </div>
        </div>
        </>
    );
};

export default RazorpayPayment;