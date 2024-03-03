const express = require('express')
const router = express.Router();
const { isAuthenticated, checkAdminAuthorize } = require("../middleware/checkAuthUser");
const { paymentProcess, stripeKeySend } = require('../routeResponse/paymentResponse');
router.route("/payment/process").post(isAuthenticated, paymentProcess)
router.route("/stripekey").get(stripeKeySend)
module.exports = router