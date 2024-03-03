const express = require('express');
const { register,login, logout, forgotPassword, resetPassword, userDeatils, changePassword, allUsers, userDetails, updateRole, deleteUser } = require('../routeResponse/userAuth');
const { profile } = require('../routeResponse/user');
const { isAuthenticated, checkAdminAuthorize } = require('../middleware/checkAuthUser');
// const { router } = require('json-server');
const router = express.Router();

router.route('/signup').post(register)
router.route('/login').post(login)
router.route('/profile').post(profile)
router.route('/logout').get(logout)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)
router.route('/about/profile').get(isAuthenticated,userDeatils)
router.route('/change/password').put(isAuthenticated, changePassword)
router.route('/admin/allusers').get(isAuthenticated, checkAdminAuthorize('Admin'), allUsers)
router.route('/admin/user/details/:id').get(isAuthenticated, checkAdminAuthorize('Admin'), userDetails)
router.route('/admin/user/update/:id').put(isAuthenticated, checkAdminAuthorize('Admin'), updateRole)
router.route('/admin/user/delete/:id').delete(isAuthenticated, checkAdminAuthorize('Admin'), deleteUser)


module.exports = router