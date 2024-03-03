const express = require('express');
const { isAuthenticated, checkAdminAuthorize } = require('../middleware/checkAuthUser');
const {AddBanner,getBanner} = require('../routeResponse/bannerResponse');
// const { router } = require('json-server');
const router = express.Router();

router.route('/admin/udate/banner').post(isAuthenticated, checkAdminAuthorize('Admin'), AddBanner)
router.route('/admin/get/banner').get(getBanner)

module.exports = router