const express = require("express");
const {updateProduct, allProducts, addProduct, deleteProduct, productDetails, searchItem, productReview, getAllReviews, deleteReview, adminAllProducts, searchSuggestion, recommendedProduct, trendingProducts, bestSeller, getProductsByIds} = require('../routeResponse/productResponse');
const { isAuthenticated, checkAdminAuthorize } = require("../middleware/checkAuthUser");



const router = express.Router();
router.route("/products").get(allProducts)
router.route('/admin/products').get(isAuthenticated, checkAdminAuthorize('Admin'), adminAllProducts)
router.route("/product/:id").put(isAuthenticated,checkAdminAuthorize('Admin'),updateProduct)
router.route('/product/add').post(isAuthenticated, checkAdminAuthorize('Admin') ,addProduct)
router.route("/product/delete/:id").delete(isAuthenticated,checkAdminAuthorize('Admin'),deleteProduct)
router.route("/product/details/:id").get(productDetails)
router.route("/product/review").post(isAuthenticated, productReview)
router.route("/product/review/all").get(getAllReviews)
router.route("/product/review/delete").delete(isAuthenticated, deleteReview)
router.route('/search/suggestion').get(searchSuggestion)
router.route('/products/recommended/:productId').get(recommendedProduct)
router.route('/products/trending').get(trendingProducts)
router.route('/products/bestseller').get(bestSeller)
router.route('/products/by-ids').get(getProductsByIds)
module.exports = router