import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAlert } from 'react-alert';
import MetaData from '../routes/MetaData';
// import { clearCart } from '../../store/cartSlice';
import Confetti from 'react-confetti';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const alert = useAlert();
    const { state } = location;
    
    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const [showConfetti, setShowConfetti] = useState(true);
    const [countdown, setCountdown] = useState(10);
    
    const { user } = useSelector((state) => state.user);

    // Get payment details from location state or localStorage
    const paymentDetails = state || JSON.parse(sessionStorage.getItem('lastPayment') || '{}');

    useEffect(() => {
        // Clear cart after successful payment
        // dispatch(clearCart());
        sessionStorage.removeItem('orderInfo');
        sessionStorage.removeItem('lastPayment');
        localStorage.removeItem('cartItems');
        
        // Show success message
        alert.success('Payment successful! Thank you for your purchase.');
        
        // Stop confetti after 5 seconds
        const confettiTimer = setTimeout(() => {
            setShowConfetti(false);
        }, 5000);
        
        // Countdown timer for redirect
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        // Auto redirect after 10 seconds
        const redirectTimer = setTimeout(() => {
            navigate('/my/orders');
        }, 10000);
        
        return () => {
            clearTimeout(confettiTimer);
            clearTimeout(redirectTimer);
            clearInterval(countdownInterval);
        };
    }, [dispatch, navigate, alert]);

    useEffect(() => {
        // Update window dimensions on resize
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const formatDate = () => {
        const date = new Date();
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentMethodIcon = () => {
        switch(paymentDetails?.method?.toLowerCase()) {
            case 'card':
            case 'razorpay':
                return '💳';
            case 'upi':
                return '📱';
            case 'qr':
                return '📲';
            default:
                return '✅';
        }
    };

    const getPaymentMethodName = () => {
        switch(paymentDetails?.method?.toLowerCase()) {
            case 'card':
                return 'Credit/Debit Card';
            case 'razorpay':
                return 'Razorpay';
            case 'upi':
                return 'UPI Payment';
            case 'qr':
                return 'QR Code Payment';
            default:
                return 'Payment';
        }
    };

    return (
        <>
            <MetaData title="Payment Successful" />
            
            {showConfetti && (
                <Confetti
                    width={windowDimensions.width}
                    height={windowDimensions.height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.2}
                />
            )}
            
            <div className="success-wrapper">
                <div className="success-card">
                    <div className="success-badge">
                        <div className="success-icon">
                            <span className="checkmark">✓</span>
                        </div>
                    </div>
                    
                    <h1 className="success-title">Payment Successful!</h1>
                    
                    <p className="success-subtitle">
                        Thank you for your purchase, <span className="user-name">{user?.name || 'Customer'}</span>!
                    </p>
                    
                    <div className="payment-summary">
                        <div className="summary-header">
                            <span className="summary-icon">💰</span>
                            <h3>Payment Summary</h3>
                        </div>
                        
                        <div className="summary-details">
                            <div className="detail-row">
                                <span className="detail-label">Amount Paid:</span>
                                <span className="detail-value amount">
                                    ₹{paymentDetails?.amount?.toFixed(2) || '0.00'}
                                </span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Payment Method:</span>
                                <span className="detail-value method">
                                    <span className="method-icon">{getPaymentMethodIcon()}</span>
                                    {getPaymentMethodName()}
                                </span>
                            </div>
                            
                            {paymentDetails?.transactionId && (
                                <div className="detail-row">
                                    <span className="detail-label">Transaction ID:</span>
                                    <span className="detail-value transaction-id">
                                        {paymentDetails.transactionId}
                                    </span>
                                </div>
                            )}
                            
                            {paymentDetails?.upiId && (
                                <div className="detail-row">
                                    <span className="detail-label">UPI ID:</span>
                                    <span className="detail-value upi-id">
                                        {paymentDetails.upiId}
                                    </span>
                                </div>
                            )}
                            
                            <div className="detail-row">
                                <span className="detail-label">Date & Time:</span>
                                <span className="detail-value date">
                                    {formatDate()}
                                </span>
                            </div>
                        </div>
                        
                        <div className="summary-footer">
                            <div className="status-badge success">
                                <span className="status-dot"></span>
                                Payment Completed
                            </div>
                        </div>
                    </div>
                    
                    <div className="order-info">
                        <p className="info-text">
                            📧 A confirmation email has been sent to <strong>{user?.email || 'your email'}</strong>
                        </p>
                        <p className="info-text">
                            📱 You will receive SMS updates on <strong>{user?.phone || 'your registered number'}</strong>
                        </p>
                    </div>
                    
                    <div className="action-buttons">
                        <button 
                            className="btn-primary"
                            onClick={() => navigate('/my/orders')}
                        >
                            <span className="btn-icon">📋</span>
                            View My Orders
                        </button>
                        
                        <button 
                            className="btn-secondary"
                            onClick={() => navigate('/products')}
                        >
                            <span className="btn-icon">🛍️</span>
                            Continue Shopping
                        </button>
                    </div>
                    
                    <div className="redirect-message">
                        <p>
                            ⏰ Redirecting to orders page in <span className="countdown">{countdown}</span> seconds
                        </p>
                        <button 
                            className="redirect-now"
                            onClick={() => navigate('/my/orders')}
                        >
                            Go now →
                        </button>
                    </div>
                    
                    <div className="help-section">
                        <p>
                            Need help? <a href="/contact">Contact Support</a>
                        </p>
                    </div>
                </div>
                
                {/* Decorative elements */}
                <div className="decoration decoration-1"></div>
                <div className="decoration decoration-2"></div>
                <div className="decoration decoration-3"></div>
            </div>
        </>
    );
};

export default PaymentSuccess;