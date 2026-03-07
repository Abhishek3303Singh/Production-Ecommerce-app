const express = require('express')
const router = express.Router();
const { isAuthenticated, checkAdminAuthorize } = require("../middleware/checkAuthUser");
const { paymentProcess, stripeKeySend, 
    createRazorpayOrder,verifyPayment,
    getPaymentDetails,
    createUPICollect,
    

} = require('../routeResponse/paymentResponse');

const {razorpayWebhook} = require('../routeResponse/webhookController')
router.route("/payment/process").post(isAuthenticated, paymentProcess)
router.route('/razorpay/order').post(isAuthenticated, createRazorpayOrder)
router.route('/razorpay/verify').post(isAuthenticated, verifyPayment)
router.route('/razorpay/payment/:paymentId').get(isAuthenticated, getPaymentDetails)
router.route('/razorpay/upi-collect').post(isAuthenticated, createUPICollect)
router.route("/stripekey").get(stripeKeySend)
router.route('/webhook/razorpay').post(express.raw({type:'application/json'}), razorpayWebhook)
module.exports = router 