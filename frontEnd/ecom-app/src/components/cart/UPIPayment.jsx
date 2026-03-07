import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useAlert } from 'react-alert';
import MetaData from '../routes/MetaData';
import ChecktOut from './ChecktOut';
import axios from 'axios';
import { createNewOrder } from '../../store/newOrderSlice';
import './UPIPayment.css';

const apiUrl = process.env.REACT_APP_API_BASE_URL;

const UPIPayment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const alert = useAlert();
    
    const [upiId, setUpiId] = useState('');
    const [loading, setLoading] = useState(false);
    const [recentUpiIds, setRecentUpiIds] = useState([]);
    
    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const orderDetails = JSON.parse(sessionStorage.getItem('orderInfo'));

    // Loading recent UPI IDs from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentUpiIds');
        if (saved) {
            setRecentUpiIds(JSON.parse(saved));
        }
    }, []);

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

    const validateUpiId = (id) => {
        const upiRegex = /^[\w\.\-]+@[\w\.\-]+$/;
        return upiRegex.test(id);
    };

    const saveRecentUpiId = (id) => {
        const updated = [id, ...recentUpiIds.filter(i => i !== id)].slice(0, 5);
        setRecentUpiIds(updated);
        localStorage.setItem('recentUpiIds', JSON.stringify(updated));
    };

    const quickApps = [
        { name: 'Google Pay', id: 'okgooglepay' },
        { name: 'PhonePe', id: 'ybl' },
        { name: 'Paytm', id: 'paytmpaytm' },
        { name: 'BHIM', id: 'okbhim' }
    ];

    const handleQuickApp = (appId) => {
        setUpiId(`user@${appId}`);
    };

    // Prepare order data (same as in RazorpayPayment)
    const prepareOrderData = (paymentId) => {
        return {
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
                id: paymentId,
                status: 'succeeded'
            },
            paidAtDate: new Date(),
            orderStatus: 'In process'
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateUpiId(upiId)) {
            alert.error('Please enter a valid UPI ID (e.g., name@okhdfcbank)');
            return;
        }

        setLoading(true);
        
        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                alert.error('Failed to load payment gateway');
                setLoading(false);
                return;
            }

            // Save to recent
            saveRecentUpiId(upiId);

            // Create Razorpay order
            const { data } = await axios.post(
                `${apiUrl}/api/v1/razorpay/order`,
                {
                    amount: Math.round(orderDetails.PayableAmount * 100),
                    currency: 'INR'
                },
                { withCredentials: true }
            );

            if (!data.success) {
                throw new Error(data.message || 'Failed to create order');
            }

            // Razorpay options with UPI prefill
            const options = {
                key: data.key_id,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'F&H',
                description: `UPI Payment for ${cartItems.length} items`,
                order_id: data.order.id,
                // method:'upi',
                // upi: {
                //     flow: 'collect' // This forces UPI ID entry field to appear
                // },
                method: {
                    upi: true,
                    card: true,
                    netbanking: true,
                    wallet: true
                  },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || shippingInfo?.phoneNo || '',
                    method: 'upi',
                    vpa: upiId
                },
                theme: {
                    color: '#2874f0'
                },
                handler: async (response) => {
                    try {
                        console.log('UPI Payment success:', response);
                        
                        // Prepare complete order data
                        const completeOrderData = prepareOrderData(response.razorpay_payment_id);
                        
                        // Verify payment on backend
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

                        if (verifyRes.data.success) {
                            // Creating order in Redux
                            await dispatch(createNewOrder(completeOrderData));
                            
                            alert.success('Payment successful! Order placed.');
                            
                            // Clear cart and session
                            sessionStorage.removeItem('orderInfo');
                            localStorage.removeItem('cartItems');
                            
                            navigate('/payment/success', {
                                state: {
                                    method: 'upi',
                                    amount: orderDetails?.PayableAmount,
                                    transactionId: response.razorpay_payment_id,
                                    upiId: upiId
                                }
                            });
                        }
                    } catch (error) {
                        console.error('Verification error:', error);
                        alert.error('Payment verification failed');
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        alert.info('Payment cancelled');
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('UPI payment error:', error);
            alert.error(error.response?.data?.message || 'Payment failed');
            setLoading(false);
        }
    };

    const upiExamples = [
        { label: 'SBI', value: 'okaxis' },
        { label: 'HDFC', value: 'okhdfcbank' },
        { label: 'ICICI', value: 'icici' },
        { label: 'Paytm', value: 'paytmpaytm' }
    ];

    return (
        <>
            <MetaData title="UPI Payment" />
            <ChecktOut activeStep={2} />
            
            <div className="upi-container">
                <div className="upi-header">
                    <h2>UPI Payment</h2>
                    <div className="amount-display">
                        Payable Amount: ₹{orderDetails?.PayableAmount?.toFixed(2)}
                    </div>
                </div>

                <div className="quick-options">
                    <h3>Quick UPI Apps</h3>
                    <div className="app-icons">
                        {quickApps.map(app => (
                            <div 
                                key={app.id}
                                className="app-icon"
                                onClick={() => handleQuickApp(app.id)}
                            >
                                {app.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="upi-form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Enter UPI ID</label>
                            <input
                                type="text"
                                placeholder="username@okhdfcbank"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <div className="upi-examples">
                                {upiExamples.map(ex => (
                                    <span 
                                        key={ex.value}
                                        className="upi-example-tag"
                                        onClick={() => setUpiId(`user@${ex.value}`)}
                                    >
                                        {ex.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {recentUpiIds.length > 0 && (
                            <div className="recent-upis">
                                <h4>Recent UPI IDs</h4>
                                <div>
                                    {recentUpiIds.map(id => (
                                        <span
                                            key={id}
                                            className="recent-id"
                                            onClick={() => setUpiId(id)}
                                        >
                                            {id}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="pay-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Processing...
                                </>
                            ) : (
                                `Pay ₹${orderDetails?.PayableAmount?.toFixed(2)}`
                            )}
                        </button>
                    </form>

                    <div className="qr-option">
                        <p>📱 Or scan QR code with any UPI app</p>
                        <button 
                            className="qr-btn"
                            onClick={() => navigate('/payment/qr')}
                        >
                            Show QR Code
                        </button>
                    </div>

                    <div className="secure-note">
                        <span>🔒</span>
                        <span>Your UPI payment is secure and encrypted</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UPIPayment;