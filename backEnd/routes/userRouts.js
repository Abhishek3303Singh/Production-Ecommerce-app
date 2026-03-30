const express = require('express');
const { register,login, logout, forgotPassword, resetPassword, userDeatils, changePassword, allUsers, userDetails, updateRole, deleteUser, googleLogin } = require('../routeResponse/userAuth');
const { profile } = require('../routeResponse/user');
const { isAuthenticated, checkAdminAuthorize } = require('../middleware/checkAuthUser');
const strictLimiter = require('../middleware/strictLimiter')
// const { router } = require('json-server');
const router = express.Router();

router.route('/signup').post(strictLimiter, register)
router.route('/login').post( strictLimiter, login)
router.route('/auth/google').post(strictLimiter, googleLogin)
router.route('/profile').post(isAuthenticated, strictLimiter, profile)
router.route('/logout').get(strictLimiter, logout)
router.route('/password/forgot').post(strictLimiter, forgotPassword)
router.route('/password/reset/:token').put(strictLimiter, resetPassword)
router.route('/about/profile').get(isAuthenticated,strictLimiter, userDeatils)
router.route('/change/password').put(isAuthenticated, strictLimiter, changePassword)
router.route('/admin/allusers').get(isAuthenticated, checkAdminAuthorize('Admin'), strictLimiter, allUsers)
router.route('/admin/user/details/:id').get(isAuthenticated, checkAdminAuthorize('Admin'),strictLimiter, userDetails)
router.route('/admin/user/update/:id').put(isAuthenticated, checkAdminAuthorize('Admin'), strictLimiter, updateRole)
router.route('/admin/user/delete/:id').delete(isAuthenticated, checkAdminAuthorize('Admin'),strictLimiter, deleteUser)



module.exports = router