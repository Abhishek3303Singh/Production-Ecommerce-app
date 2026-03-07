import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAlert } from 'react-alert';
import axios from 'axios';
import { createNewOrder } from '../../store/newOrderSlice';
import './RazorpayPayment.css';

const apiUrl = process.env.REACT_APP_API_BASE_URL;

const RazorpayPayment = ({ method = 'card' }) => {
    const dispatch = useDispatch();
    const alert = useAlert();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [vpa, setVpa] = useState('');

    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const orderDetails = JSON.parse(sessionStorage.getItem('orderInfo'));

    // Validating order details
    if (!orderDetails) {
        navigate('/cart');
        return null;
    }

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);

        try {
            // i m Loading Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                alert.error('Failed to load payment gateway. Please try again.');
                setLoading(false);
                return;
            }

            console.log('Creating Razorpay order...'); // Debug log

            // Creating order on backend
            const { data } = await axios.post(
                `${apiUrl}/api/v1/razorpay/order`,
                {
                    amount: Math.round(orderDetails.PayableAmount * 100),
                    currency: 'INR'
                },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            console.log('Razorpay order created:', data); // Debug log

            if (!data.success) {
                throw new Error(data.message || 'Failed to create order');
            }

            // Preparing order data for database
            const orderData = {
                shippingAddress: {
                    name: user?.name || 'Customer',
                    address: shippingInfo?.address || '',
                    city: shippingInfo?.city || '',
                    instate: shippingInfo?.instate || '',
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
                user: user?._id,
                productPrice: orderDetails?.subTotalAmmount || 0,
                vatPrice: orderDetails?.gst || 0,
                shippingPrice: orderDetails?.shippingCharges || 0,
                totalPrice: orderDetails?.PayableAmount || 0
            };

            // Razorpay options
            const options = {
                key: data.key_id,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'F&H',
                description: `Payment for ${orderData.orderProduct.length} items`,
                order_id: data.order.id,
                method: {
                    card: true,
                    netbanking: true,
                    wallet: true,
                    upi: true
                },
                handler: async (response) => {
                    try {
                        console.log('Payment response:', response);


                        // complete order Data info...

                        const completeOrderData = {
                            shippingAddress: {
                                name: user?.name || 'Customer',
                                address: shippingInfo?.address || '',
                                city: shippingInfo?.city || '',
                                instate: shippingInfo?.instate || '',
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
                            user: user?._id,
                            productPrice: orderDetails?.subTotalAmmount || 0,
                            vatPrice: orderDetails?.gst || 0,
                            shippingPrice: orderDetails?.shippingCharges || 0,
                            totalPrice: orderDetails?.PayableAmount || 0,
                            paymentInformation: {
                                id: response.razorpay_payment_id,
                                status: 'succeeded'
                            },
                            paidAtDate: new Date(),
                            orderStatus: 'In process'
                        };
                        console.log('📦 Complete order data prepared:', completeOrderData);
                        // Verifing the payment on my backend
                        const verifyRes = await axios.post(
                            `${apiUrl}/api/v1/razorpay/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderDetails: completeOrderData
                            },
                            { withCredentials: true }
                        );
                        console.log('✅ Verify API response:', verifyRes.data);
                        if (verifyRes.data.success) {
                            await dispatch(createNewOrder(completeOrderData))
                            console.log('✅ Order created in Redux successfully');
                            alert.success('Payment successful! Order placed.');

                            // Clear cart and session data
                            sessionStorage.removeItem('orderInfo');
                            localStorage.removeItem('cartItems');

                            // Navigating to success page
                            navigate('/payment/success', {
                                state: {
                                    method: 'razorpay',
                                    amount: orderDetails?.PayableAmount,
                                    transactionId: response.razorpay_payment_id
                                }
                            });
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Verification error:', error);
                        alert.error('Payment verification failed. Please contact support.');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || shippingInfo?.phoneNo || ''
                },
                notes: {
                    address: shippingInfo?.address || ''
                },
                theme: {
                    color: '#2874f0'
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        alert.info('Payment cancelled');
                    }
                }
            };

            // For UPI, add VPA prefill
            // if (method === 'upi' && vpa) {
            //     options.prefill.method = 'upi';
            //     options.prefill.vpa = vpa;
            // }

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Payment error details:', error);

            if (error.response) {
                alert.error(error.response.data?.message || 'Server error');
            } else if (error.request) {
                alert.error('Network error. Please check your connection.');
            } else {
                alert.error(error.message || 'Payment failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUPISubmit = (e) => {
        e.preventDefault();
        if (!vpa.includes('@')) {
            alert.error('Please enter a valid UPI ID (e.g., name@okhdfcbank)');
            return;
        }
        handlePayment();
    };

    if (method === 'upi') {
        return (
            <div className="razorpay-upi-container">
                <h3>Pay with UPI</h3>
                <form onSubmit={handleUPISubmit}>
                    <div className="form-group">
                        <label>Enter UPI ID</label>
                        <input
                            type="text"
                            placeholder="username@okhdfcbank"
                            value={vpa}
                            onChange={(e) => setVpa(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <small>Example: yourname@okhdfcbank, yourname@ybl</small>
                    </div>

                    <button
                        type="submit"
                        className="pay-btn"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : `Pay ₹${orderDetails?.PayableAmount?.toFixed(2)}`}
                    </button>
                </form>

                <div className="qr-option">
                    <p>Or scan QR code with any UPI app</p>
                    <button
                        className="qr-btn"
                        onClick={() => navigate('/payment/qr')}
                    >
                        Show QR Code
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="razorpay-container">
            <h3>Pay with Card/UPI</h3>
            <div className="amount-display">
                Total Amount: ₹{orderDetails?.PayableAmount?.toFixed(2)}
            </div>

            <button
                className="pay-now-btn"
                onClick={handlePayment}
                disabled={loading}
            >
                {loading ? 'Please wait...' : `Pay ₹${orderDetails?.PayableAmount?.toFixed(2)}`}
            </button>

            <div className="payment-methods-info">
                <p>✅ Accepts all UPI apps, Credit/Debit cards, Net Banking</p>
                <p>🔒 Secure payments powered by Razorpay</p>
            </div>
        </div>
    );
};

export default RazorpayPayment;