const express = require("express");
const router = express.Router();
const {getCloudinarySignature} = require('../routeResponse/cloudinaryController')
const { isAuthenticated, checkAdminAuthorize } = require("../middleware/checkAuthUser");
const normalLimiter = require("../middleware/normalLimiterSlidingWind");

router.route('/admin/cloudinary/signature').get(isAuthenticated, checkAdminAuthorize('Admin'), normalLimiter, getCloudinarySignature)

module.exports = router;