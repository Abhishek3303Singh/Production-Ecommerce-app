import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import productDetailsReducer from "./productDetailsSlice";
import userReducer from "./userSlice";
// import registerReducer from './registerSlice'
import forgotPasswordReducer from "./forgotPsaawordSlice";
// import resetPasswordReducer from "./resetPasswordSlice";
import cartReducer from "./cartSlice"
import orderReducer from './newOrderSlice'
import myOrderReducer from './myOrderSlice'
import orderDetailsReducers from './orderDetailsSlice'
import addReviewReducers from './addReviewSlice'
import adminProductReducer from './adminProductSlice'
import createProductReducer from './createProductSlice'
import deleteProductReducer from './dropProduct'
import updateProductReducer from './updateProductSlice'
import amdinOrdersReducer from './allOrdersSlice'
import allUserAdminReducer from './adminUsersSlie'
import adminReviewsReducer from './adminReviewsSlice'
import adminBannnerReducer from './addBannerSlice'
const store = configureStore({
  reducer: {
    product: productReducer,
    productDetails: productDetailsReducer,
    user: userReducer,
    forgotPassword: forgotPasswordReducer,
    cart:cartReducer,
    order:orderReducer,
    myOrders:myOrderReducer,
    orderDetails:orderDetailsReducers,
    addReview:addReviewReducers,
    adminProducts:adminProductReducer,
    createproduct:createProductReducer,
    delete:deleteProductReducer,
    update:updateProductReducer,
    allOrders:amdinOrdersReducer,
    Allusers:allUserAdminReducer,
    adminReviews:adminReviewsReducer,
    createBanner:adminBannnerReducer
  },
});
export default store;
