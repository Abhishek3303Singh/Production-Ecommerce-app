import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MetaData from '../routes/MetaData';
import ChecktOut from './ChecktOut';
import './PaymentMode.css'; 


import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const PaymentMode = () => {
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState('');
    
    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const orderDetails = JSON.parse(sessionStorage.getItem('orderInfo'));

    // Checking if order details exist
    if (!orderDetails) {
        navigate('/cart');
        return null;
    }

    const paymentModes = [
        {
            id: 'razorpay',
            name: 'Razorpay (All Methods)',
            icon: <CreditCardIcon />,
            description: 'UPI, Cards, Net Banking, QR',
            available: true,
            path: '/payment/razorpay'
        },
        {
            id: 'card',
            name: 'Credit/Debit Card',
            icon: <CreditCardIcon />,
            description: 'Pay via Visa, Mastercard, RuPay, etc.',
            available: true,
            path: '/process/payment'
        },
        {
            id: 'upi',
            name: 'UPI',
            icon: <PhoneIphoneIcon />,
            description: 'Google Pay, PhonePe, Paytm, BHIM',
            available: true,
            path: '/payment/upi'
        },
        {
            id: 'qr',
            name: 'QR Code',
            icon: <QrCodeIcon />,
            description: 'Scan QR code with any UPI app',
            available: true,
            path: '/payment/qr'
        },
        {
            id: 'netbanking',
            name: 'Net Banking',
            icon: <AccountBalanceIcon />,
            description: 'All major banks supported',
            available: false, // Disable if not implemented yet
            path: '/process/payment'
        },
        {
            id: 'cod',
            name: 'Cash on Delivery',
            icon: <AccountBalanceIcon />,
            description: 'Pay when you receive your order',
            available: false, // Disable if not implemented yet
            path: '/payment/cod'
        },

    ];

    const handleProceed = () => {
        if (selectedMode) {
            const mode = paymentModes.find(m => m.id === selectedMode);
            if (mode.available) {
                navigate(mode.path);
            } else {
                alert('This payment method is coming soon!');
            }
        } else {
            alert('Please select a payment method');
        }
    };

    return (
        <>
            <MetaData title="Select Payment Method" />
            <ChecktOut activeStep={2} />
            
            <div className="payment-mode-container">
                <div className="payment-mode-header">
                    <h2>Select Payment Method</h2>
                    <div className="order-summary-mini">
                        <span>Total Amount: </span>
                        <span className="amount">₹{orderDetails?.PayableAmount?.toFixed(2)}</span>
                    </div>
                </div>

                <div className="payment-modes-grid">
                    {paymentModes.map((mode) => (
                        <div
                            key={mode.id}
                            className={`payment-mode-card ${selectedMode === mode.id ? 'selected' : ''} ${!mode.available ? 'disabled' : ''}`}
                            onClick={() => mode.available && setSelectedMode(mode.id)}
                        >
                            <div className="mode-icon">{mode.icon}</div>
                            <div className="mode-details">
                                <h3>{mode.name}</h3>
                                <p>{mode.description}</p>
                                {!mode.available && (
                                    <span className="coming-soon-badge">Coming Soon</span>
                                )}
                            </div>
                            {selectedMode === mode.id && (
                                <div className="selected-check">✓</div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="payment-mode-actions">
                    <button 
                        className="proceed-btn"
                        onClick={handleProceed}
                        disabled={!selectedMode}
                    >
                        Proceed to Pay ₹{orderDetails?.PayableAmount?.toFixed(2)}
                        <ArrowForwardIcon />
                    </button>
                </div>

                <div className="secure-payment-note">
                    <p>🔒 Your payment information is secure and encrypted</p>
                </div>
            </div>
        </>
    );
};

export default PaymentMode;