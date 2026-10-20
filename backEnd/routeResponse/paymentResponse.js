const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`)
const Razorpay = require('razorpay');
const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Order = require('../dataBase/product/order')
const {priceCart} = require('../utils/checkoutPricing')
const {makeOrderPaid} = require('../utils/markOrderPaid')
const {ORDER_STATUS} = require('../utils/orderStatus')
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
        // console.log('StripeApiKey=',process.env.STRIPE_API_KEY)
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
// exports.createRazorpayOrder = async (req, res) => {
//     try {
//         const { amount, currency = 'INR' } = req.body;

//         const options = {
//             amount: amount, // amount in paise
//             currency: currency,
//             receipt: `receipt_${Date.now()}`,
//             payment_capture: 1 // Auto capture
//         };

//         const order = await razorpayInstance.orders.create(options);

//         res.status(200).json({
//             success: true,
//             order,
//             key_id: process.env.RAZORPAY_KEY_ID
//         });
//     } catch (error) {
//         console.error('Razorpay order creation error:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// whitelist adress fields because we cant spreading whatever the client send .

const pickAddress = (a = {})=>{
    const phoneNo = String(a.phoneNo || '').replace(/\D/g, '')
    const pincode = String(a.pincode||'');
    if (!/^[6-9]\d{9}$/.test(phoneNo)) throw new Error('Enter a valid 10-digit mobile number');
    if (!/^\d{6}$/.test(pincode)) throw new Error('Enter a valid 6-digit pincode');
    for (const f of ['name', 'address', 'city', 'instate', 'landmark']) {
        if (!String(a[f] || '').trim()) throw new Error(`${f} is required`);
    }

    return {
    name :a.name,
    address:a.address,
    city:a.city,
    instate:a.instate,
    pincode:Number(a.pincode),
    landmark : a.landmark,
    country:a.country,
    phoneNo:Number(a.phoneNo),
    lat:Number(a.lat) || 0,
    lng:Number(a.lng) || 0,
    location: {type:'Point', coordinates:[Number(a.lng) || 0 , Number(a.lat) || 0]},
    }

}

exports.createRazorpayOrder =  async(req, res)=>{
    try{
        const {items, shippingAddress} = req.body
        const pricing = await priceCart(items)
        
        const rzrPayOrder = await razorpayInstance.orders.create({
            amount: Math.round(pricing.totalPrice * 100),
            currency:"INR",
            receipt:`rcpt_${Date.now()}`,
            notes:{userId:String(req.user._id)},
        })

        // A pending order exists before the customer pay.. 
        const order = Order.create({
            user:req.user._id,
            shippingAddress:pickAddress(shippingAddress),
            ...pricing,
            razorpayOrderId:rzrPayOrder.id,
            orderStatus:ORDER_STATUS.PENDING,
            paymentInformation:{status:'pending'}

        });
        res.status(200).json({
            success: true,
            order:rzrPayOrder,
            key_id : process.env.RAZORPAY_KEY_ID,
            orderId:order._id,
            totals:{
                productPrice:pricing.productPrice,
                vatPrice:pricing.vatPrice,
                shippingPrice:pricing.shippingPrice,
                totalPrice:pricing.totalPrice,
                
            }
        })


    }catch(err){
        res.status(400).json({success:false, message:err.message})
    }


}

// Verify payment signature
exports.verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
        } = req.body;
        
        // Generate signature for verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

            const a = Buffer.from(expected)
            const b = Buffer.from(String(razorpay_signature || ''))

            if(a.length !== b.length || !crypto.timingSafeEqual(a, b)){
                return res.status(400).json({
                    success:false,
                    message:'Invalid Signature'
                })
            }
            // order must belong to logged in user

            const owned = await Order.findOne({razorpayOrderId:razorpay_order_id, user:req.user._id}).select('_id');
            if(!owned) return res.status(404).json({
                success:false,
                message:'Order not found'
            })

            await makeOrderPaid(razorpay_order_id, razorpay_payment_id);

            const order = await Order.findById(owned._id).select('paymentInformation.status')
            if(order.paymentInformation.status === 'succeeded'){
                return res.status(200).json({
                    success:true,
                    orderId:owned._id,
                    paymentId:razorpay_payment_id
                })
            }
            return res.status(409).json({
                success:false,
                message:'An item went out of stock while you are paying. Payment being refunded!'
            })

       
        
    } catch (error) {
       
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