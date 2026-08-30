

const express = require("express");
const router = express.Router();

const {
  createBanner,
  updateBanner,
  deleteBanner,
  getBanners,
  trackClick,
  updateBannerPosition,
  getBannerAnalytics,
  getAllBanners,
  syncAnalyticsToDB,
} = require("../routeResponse/bannerResponse");

const { isAuthenticated, checkAdminAuthorize } = require("../middleware/checkAuthUser");
const normalLimiter = require("../middleware/normalLimiterSlidingWind");




// ================= PUBLIC =================

// One smart API
router.route("/banners").get(getBanners);

// Analytics
router.route("/banners/:id/click").post(trackClick);


// ================= ADMIN =================

// Sync analytics (manual trigger)
router.route("/admin/banner/sync-analytics").post(isAuthenticated, checkAdminAuthorize('Admin'), syncAnalyticsToDB)

// Create
router.route(
  "/admin/banners").post(
  isAuthenticated,
  checkAdminAuthorize("Admin"),
  normalLimiter,
  createBanner
);

// Update
router.route(
  "/admin/banners/:id").put(
  isAuthenticated,
  checkAdminAuthorize("Admin"),
  normalLimiter,
  updateBanner
);

// Update position (drag-drop)
router.route(
  "/admin/banners/:id/position").put(
  isAuthenticated,
  checkAdminAuthorize("Admin"),
  normalLimiter,
  updateBannerPosition
);

// Delete (soft)
router.route(
  "/admin/banners/:id").delete(
  isAuthenticated,
  checkAdminAuthorize("Admin"),
  normalLimiter,
  deleteBanner
);

// Admin list
router.route(
  "/admin/banners").get(
  isAuthenticated,
  checkAdminAuthorize("Admin"),
  getAllBanners
);

// Analytics
router.route(
  "/admin/banners/analytics").get(
  isAuthenticated,
  checkAdminAuthorize("Admin"),
  getBannerAnalytics
);

module.exports = router;

// const express = require("express");
// const router = express.Router();

// const {
//     createBanner,
//     updateBanner,
//     deleteBanner,
//     getBanners,
//     trackClick,
//     updateBannerPosition,
//     getBannerAnalytics,
//     getAllBanners,
//     syncAnalyticsToDB,
// } = require("../routeResponse/bannerResponse");

// const { isAuthenticated, checkAdminAuthorize } = require("../middleware/checkAuthUser");
// const normalLimiter = require("../middleware/normalLimiterSlidingWind");
// // const clickLimiter = require("../middleware/clickLimiter");

// // ================= PUBLIC =================
// router.route("/banners").get(getBanners);
// router.route("/banners/:id/click").post(trackClick);

// // ================= ADMIN =================
// router.route("/admin/banners").post(isAuthenticated, checkAdminAuthorize("Admin"), normalLimiter, createBanner);
// router.route("/admin/banners").get(isAuthenticated, checkAdminAuthorize("Admin"), getAllBanners);
// router.route("/admin/banners/:id").put(isAuthenticated, checkAdminAuthorize("Admin"), normalLimiter, updateBanner);
// router.route("/admin/banners/:id").delete(isAuthenticated, checkAdminAuthorize("Admin"), deleteBanner);
// router.route("/admin/banners/:id/position").put(isAuthenticated, checkAdminAuthorize("Admin"), normalLimiter, updateBannerPosition);
// router.route("/admin/banners/analytics").get(isAuthenticated, checkAdminAuthorize("Admin"), getBannerAnalytics);
// router.route("/admin/banners/sync-analytics").post(isAuthenticated, checkAdminAuthorize("Admin"), syncAnalyticsToDB);

// module.exports = router;