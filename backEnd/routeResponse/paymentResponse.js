const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`)
const Razorpay = require('razorpay');
const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
exports.paymentProcess= async(req, res, next)=>{
    try{
        // console.log(req.body, 'payment1')
        // console.log(req.body.amount, 'payment2')

        const payment = await stripe.paymentIntents.create({
            amount:req.body.amount,
            currency:'inr',
            metadata:{
                company:'FunHub'
            }
        })
        // console.log(payment, 'paymentresponse')
        
        res.status(200).json({
            status:'success',
            client_secret:payment.client_secret
        })
    }
    catch(e){
        res.status(400).json({
            status:'failed',
            message:e.message
        })

    }
} 

exports.stripeKeySend= async(req, res, next)=>{
    try{
        console.log('StripeApiKey=',process.env.STRIPE_API_KEY)
        res.status(200).json({
            status:'success',
            stripeApiKey:`${process.env.STRIPE_API_KEY}`
        })
    }
    catch(e){
        res.status(400).json({
            status:'failed',
            message:e.message
        })

    }
} 



// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR' } = req.body;

        const options = {
            amount: amount, // amount in paise
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1 // Auto capture
        };

        const order = await razorpayInstance.orders.create(options);

        res.status(200).json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Verify payment signature
exports.verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderDetails 
        } = req.body;

        // Generate signature for verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment verified - create order in your database
            // Save orderDetails along with payment info
            
            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Fetch payment details
exports.getPaymentDetails = async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        const payment = await razorpayInstance.payments.fetch(paymentId);
        
        res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        console.error('Fetch payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create UPI collect request (for saved VPA)
exports.createUPICollect = async (req, res) => {
    try {
        const { vpa, amount, currency = 'INR' } = req.body;

        const payment = await razorpayInstance.payments.create({
            amount: amount,
            currency: currency,
            method: 'upi',
            vpa: vpa,
            description: 'Order payment'
        });

        res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        console.error('UPI collect error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};