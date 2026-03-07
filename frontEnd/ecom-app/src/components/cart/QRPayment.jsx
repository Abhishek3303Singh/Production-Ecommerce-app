import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAlert } from 'react-alert';
import MetaData from '../routes/MetaData';
import ChecktOut from './ChecktOut';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import { createNewOrder } from '../../store/newOrderSlice';
import './QRPayment.css';

const apiUrl = process.env.REACT_APP_API_BASE_URL;

const QRPayment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const alert = useAlert();
    
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [orderId, setOrderId] = useState(null);
    const [keyId, setKeyId] = useState(null);
    
    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const orderDetails = JSON.parse(sessionStorage.getItem('orderInfo'));

    useEffect(() => {
        if (!orderDetails) {
            navigate('/cart');
            return;
        }

        // Create Razorpay order when component loads
        createRazorpayOrder();
    }, []);

    // Timer for payment expiry
    useEffect(() => {
        if (timeLeft <= 0) {
            setPaymentStatus('expired');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const createRazorpayOrder = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post(
                `${apiUrl}/api/v1/razorpay/order`,
                {
                    amount: Math.round(orderDetails.PayableAmount * 100),
                    currency: 'INR'
                },
                { withCredentials: true }
            );

            if (data.success) {
                setOrderId(data.order.id);
                setKeyId(data.key_id);
            }
        } catch (error) {
            console.error('Failed to create order:', error);
            alert.error('Failed to initialize payment');
        } finally {
            setLoading(false);
        }
    };

    // Generate QR code data with order ID
    const getQRData = () => {
        if (!orderId) return '';
        
        // UPI QR format with order ID
        return `upi://pay?pa=your-merchant-vpa@okhdfcbank&pn=YourStore&am=${orderDetails?.PayableAmount.toFixed(2)}&cu=INR&tn=Order-${orderId}`;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const checkPaymentStatus = async () => {
        // In production, you would poll your backend to check payment status
        // For demo, we'll simulate payment receipt
        setPaymentStatus('completed');
        
        // Prepare order data
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
            totalPrice: orderDetails?.PayableAmount || 0,
            paymentInformation: {
                id: `pay_${Date.now()}`, // Simulated payment ID
                status: 'succeeded'
            },
            paidAtDate: new Date(),
            orderStatus: 'In process'
        };

        await dispatch(createNewOrder(orderData));
        
        sessionStorage.removeItem('orderInfo');
        localStorage.removeItem('cartItems');
        
        setTimeout(() => {
            navigate('/payment/success', {
                state: {
                    method: 'qr',
                    amount: orderDetails?.PayableAmount,
                    transactionId: `pay_${Date.now()}`
                }
            });
        }, 1500);
    };

    const upiApps = [
        { name: 'Google Pay', icon: '📱' },
        { name: 'PhonePe', icon: '📲' },
        { name: 'Paytm', icon: '💰' },
        { name: 'BHIM', icon: '🏦' }
    ];

    if (loading) {
        return (
            <div className="qr-container">
                <div className="loading-spinner">Loading payment QR...</div>
            </div>
        );
    }

    return (
        <>
            <MetaData title="QR Code Payment" />
            <ChecktOut activeStep={2} />
            
            <div className="qr-container">
                <div className="qr-header">
                    <h2>Scan QR Code to Pay</h2>
                    <div className="amount-badge">
                        ₹{orderDetails?.PayableAmount?.toFixed(2)}
                    </div>
                </div>

                <div className="qr-content">
                    <div className="qr-code-container">
                        {orderId && (
                            <QRCodeCanvas 
                                value={getQRData()}
                                size={250}
                                level="H"
                                includeMargin={true}
                                className="qr-code"
                                bgColor="#ffffff"
                                fgColor="#000000"
                            />
                        )}
                    </div>

                    <div className="timer-display">
                        ⏰ Time left: {formatTime(timeLeft)}
                    </div>

                    <div className="qr-instructions">
                        <h3>How to Pay:</h3>
                        <ol>
                            <li>Open any UPI app on your phone</li>
                            <li>Click on 'Scan QR Code' or 'Pay by QR'</li>
                            <li>Scan this QR code displayed on screen</li>
                            <li>Verify the amount (₹{orderDetails?.PayableAmount?.toFixed(2)})</li>
                            <li>Enter your UPI PIN to complete payment</li>
                        </ol>
                    </div>

                    <div className="upi-apps-grid">
                        {upiApps.map(app => (
                            <div key={app.name} className="upi-app-item">
                                <div>{app.icon}</div>
                                <div>{app.name}</div>
                            </div>
                        ))}
                    </div>

                    <div className="payment-status">
                        {paymentStatus === 'pending' && (
                            <p className="pending">
                                ⏳ Waiting for payment confirmation...
                            </p>
                        )}
                        {paymentStatus === 'completed' && (
                            <p className="completed">
                                ✅ Payment received! Redirecting...
                            </p>
                        )}
                        {paymentStatus === 'expired' && (
                            <p className="expired">
                                ⚠️ QR code expired. Please refresh to try again.
                            </p>
                        )}
                    </div>

                    {paymentStatus === 'pending' && (
                        <>
                            <button 
                                className="manual-check-btn"
                                onClick={checkPaymentStatus}
                                disabled={paymentStatus !== 'pending'}
                            >
                                I've Completed Payment
                            </button>

                            <div className="payment-methods-note">
                                <strong>Supported Apps:</strong>
                                <ul>
                                    <li>Google Pay (Tez)</li>
                                    <li>PhonePe</li>
                                    <li>Paytm</li>
                                    <li>BHIM UPI</li>
                                    <li>Any other UPI app</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                <div className="secure-note">
                    <span>🔒</span>
                    <span>Secure QR code payment via UPI</span>
                </div>
            </div>
        </>
    );
};

export default QRPayment;