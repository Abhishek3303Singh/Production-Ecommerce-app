const express = require('express');
const { isAuthenticated, checkAdminAuthorize } = require('../middleware/checkAuthUser');
const {AddBanner,getBanner} = require('../routeResponse/bannerResponse');
// const { router } = require('json-server');
const router = express.Router();
const normalLimiter = require('../middleware/normalLimiterSlidingWind')

router.route('/admin/udate/banner').post(isAuthenticated, checkAdminAuthorize('Admin'),normalLimiter, AddBanner)
router.route('/admin/get/banner').get(normalLimiter, getBanner)

module.exports = router