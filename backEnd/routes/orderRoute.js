const express = require('express');
const { creatNewOrder, singleOrder, myOrders, allOrders, updateProductStatus, deleteOrder } = require('../routeResponse/orderResponse');
const { isAuthenticated, checkAdminAuthorize } = require('../middleware/checkAuthUser');
const normalLimiter = require('../middleware/normalLimiterSlidingWind')
const router = express.Router()

router.route('/order').post( isAuthenticated,normalLimiter, creatNewOrder);
router.route('/order/:id').get(isAuthenticated,normalLimiter,singleOrder);
router.route('/myorder').get(isAuthenticated,normalLimiter,myOrders)
router.route('/admin/orders/all').get(isAuthenticated,checkAdminAuthorize('Admin'), normalLimiter, allOrders);
router.route('/admin/order/status/:id').put( isAuthenticated,checkAdminAuthorize('Admin'),normalLimiter, updateProductStatus);
router.route('/admin/order/delete/:id').delete(isAuthenticated, normalLimiter, checkAdminAuthorize('Admin'), deleteOrder);




module.exports = router