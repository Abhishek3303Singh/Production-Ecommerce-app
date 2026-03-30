const express = require("express");
const {updateProduct, allProducts, addProduct, deleteProduct, productDetails, searchItem, productReview, getAllReviews, deleteReview, adminAllProducts, searchSuggestion, recommendedProduct, trendingProducts, bestSeller, getProductsByIds} = require('../routeResponse/productResponse');
const { isAuthenticated, checkAdminAuthorize } = require("../middleware/checkAuthUser");
const relaxedLimiter = require('../middleware/relaxedLimiter')



const router = express.Router();
router.route("/products").get(relaxedLimiter, allProducts)
router.route('/admin/products').get(isAuthenticated, checkAdminAuthorize('Admin'),relaxedLimiter,  adminAllProducts)
router.route("/product/:id").put(isAuthenticated,checkAdminAuthorize('Admin'),relaxedLimiter, updateProduct)
router.route('/product/add').post(isAuthenticated, checkAdminAuthorize('Admin') ,relaxedLimiter, addProduct)
router.route("/product/delete/:id").delete(isAuthenticated,checkAdminAuthorize('Admin'),relaxedLimiter, deleteProduct)
router.route("/product/details/:id").get(relaxedLimiter, productDetails)
router.route("/product/review").post(isAuthenticated,relaxedLimiter,  productReview)
router.route("/product/review/all").get(relaxedLimiter, getAllReviews)
router.route("/product/review/delete").delete(isAuthenticated,relaxedLimiter,  deleteReview)
router.route('/search/suggestion').get(relaxedLimiter, searchSuggestion)
router.route('/products/recommended/:productId').get(relaxedLimiter, recommendedProduct)
router.route('/products/trending').get(relaxedLimiter, trendingProducts)
router.route('/products/bestseller').get(relaxedLimiter, bestSeller)
router.route('/products/by-ids').get(relaxedLimiter, getProductsByIds)
module.exports = router