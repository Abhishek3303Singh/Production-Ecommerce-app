const express = require('express')
const router = express.Router();
const { isAuthenticated, checkAdminAuthorize } = require("../middleware/checkAuthUser");
const { paymentProcess, stripeKeySend, 
    createRazorpayOrder,verifyPayment,
    getPaymentDetails,
    createUPICollect,
    

} = require('../routeResponse/paymentResponse');
const strictLimiter = require('../middleware/strictLimiter')

const {razorpayWebhook} = require('../routeResponse/webhookController')
router.route("/payment/process").post(isAuthenticated, strictLimiter, paymentProcess)
router.route('/razorpay/order').post(isAuthenticated, strictLimiter, createRazorpayOrder)
router.route('/razorpay/verify').post(isAuthenticated, strictLimiter, verifyPayment)
router.route('/razorpay/payment/:paymentId').get(isAuthenticated, strictLimiter, getPaymentDetails)
router.route('/razorpay/upi-collect').post(isAuthenticated, strictLimiter, createUPICollect)
router.route("/stripekey").get(strictLimiter, stripeKeySend)
router.route('/webhook/razorpay').post(express.raw({type:'application/json'}), strictLimiter, razorpayWebhook)
module.exports = router 