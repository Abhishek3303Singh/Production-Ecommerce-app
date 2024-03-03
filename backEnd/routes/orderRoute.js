const express = require('express');
const { creatNewOrder, singleOrder, myOrders, allOrders, updateProductStatus, deleteOrder } = require('../routeResponse/orderResponse');
const { isAuthenticated, checkAdminAuthorize } = require('../middleware/checkAuthUser');
const router = express.Router()

router.route('/order').post(isAuthenticated,creatNewOrder);
router.route('/order/:id').get(isAuthenticated,singleOrder);
router.route('/myorder').get(isAuthenticated,myOrders)
router.route('/admin/orders/all').get(isAuthenticated,checkAdminAuthorize('Admin'), allOrders);
router.route('/admin/order/status/:id').put(isAuthenticated,checkAdminAuthorize('Admin'), updateProductStatus);
router.route('/admin/order/delete/:id').delete(isAuthenticated,checkAdminAuthorize('Admin'), deleteOrder);




module.exports = router