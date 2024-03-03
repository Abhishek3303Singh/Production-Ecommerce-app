import Nav from "./components/routes/Nav";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/routes/footer/Footer";
import Signup from "./components/login/Signup";
import Login from "./components/login/Login";
import ChangePassword from "./components/login/ChangePassword";
import ForgotPassword from "./components/login/ForgotPassword";
import ResetPassword from "./components/login/ResetPassword";
// import Products from "./components/products/Products";
import PrivateComponent from "./components/PrivateComponent";
import Home from "./components/products/Home";
import Profile from "./components/login/Profile";
import ProductDetails from "./components/productDetails/ProductDetails";
// import ProdDet from "./components/productDetails/ProdDet";
import HomePage from "./LandingPage/HomePage";
import Products from "./components/products/Products";
import { getUser } from "./store/userSlice";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import Cart from "./components/cart/Cart";
import { ToastContainer, toast } from "react-toastify";
import Shipping from "./components/cart/Shipping";
import BottomNav from "./components/routes/BottomNav";
import ConfirmOrder from "./components/cart/ConfirmOrder";
import Payment from "./components/cart/Payment";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Success from "./components/cart/Success";
import MyOrder from "./components/orders/MyOrder";
import OrderDetails from "./components/orders/OrderDetails";
import AddCustomerReview from "./components/products/AddCustomerReview";
import Dashboard from "./Admin/Dashboard";
import AllProducts from "./Admin/AdminProducts/AllProducts";
import CreateProduct from "./Admin/AdminProducts/CreateProduct";
import UpdateProduct from "./Admin/AdminProducts/UpdateProduct";
import AllOrders from "./Admin/AdminOrders/AllOrders";
import UpdateOrders from "./Admin/AdminOrders/UpdateOrders";
import AllUsers from "./Admin/AdminUser/AllUsers";
import EditUser from "./Admin/AdminUser/EditUser";
import AllReviews from "./Admin/AdminReviews/AllReviews";
import Error from "./components/cart/Error";
import AddBanner from "./Admin/AdminBanner/AddBanner";
import PageNotFound from "./components/layout/not-found/PageNotFound";
const App = () => {
  const [stripeApiKey, setStripeApiKey] = useState("");
  const dispatch = useDispatch();

  async function getStripeApiKey() {
    const resData = await fetch("api/v1/stripekey");
    const data = await resData.json();
    // console.log("stripeApiKey", data);
    setStripeApiKey(data.stripeApiKey);
  }

  useEffect(() => {
    dispatch(getUser());
    getStripeApiKey();
  }, []);
  // getStripeApiKey();

  return (
    <>
      {/* <ToastContainer
          position="top-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        /> */}

      <BrowserRouter>
        <Nav />

        <Routes>
          {/* {stripeApiKey && (
            // <Elements stripe={loadStripe(stripeApiKey)}>
            //   <Route element={<PrivateComponent />}>
            //     <Route path="/process/payment" element={<Payment />}></Route>
            //   </Route>
            // </Elements>
          )} */}

          <Route element={<PrivateComponent />}>
            <Route exact path="/cart" element={<Cart />}></Route>
            <Route exact path="/profile" element={<Profile />}></Route>
            <Route
              exact
              path="/changepassword"
              element={<ChangePassword />}
            ></Route>
            <Route exact path="/shipping" element={<Shipping />}></Route>
            <Route exact path="/cart/error" element={<Error />}></Route>

            <Route
              exact
              path="/order/confirm"
              element={<ConfirmOrder />}
            ></Route>
            {/* <Route path="/process/payment" element={<Elements stripe={loadStripe(stripeApiKey)}> <Payment /> </Elements } ></Route>  */}
            {stripeApiKey && (
              <Route
                exact
                path="/process/payment"
                element={
                  <Elements stripe={loadStripe(stripeApiKey)}>
                    {" "}
                    <Payment></Payment>
                  </Elements>
                }
              ></Route>
            )}

            <Route exact path="/success" element={<Success />}></Route>

            <Route exact path="/my/orders" element={<MyOrder />}></Route>
            <Route
              exact
              path="/order/details/:id"
              element={<OrderDetails />}
            ></Route>
            <Route
              exact
              path="/admin/dashboard"
              element={<Dashboard />}
            ></Route>
            <Route
              exact
              path="/admin/products"
              element={<AllProducts />}
            ></Route>
            <Route
              exact
              path="/admin/create/product"
              element={<CreateProduct />}
            ></Route>
            <Route
              exact
              path="/admin/update/product/:id"
              element={<UpdateProduct />}
            ></Route>
            <Route exact path="/admin/orders" element={<AllOrders />}></Route>
            <Route
              exact
              path="/admin/edit/order/:id"
              element={<UpdateOrders />}
            ></Route>
            <Route exact path="/admin/users" element={<AllUsers />}></Route>
            <Route
              exact
              path="/admin/edit/user/:id"
              element={<EditUser />}
            ></Route>
            <Route exact path="/admin/reviews" element={<AllReviews />}></Route>
            <Route exact path="/admin/banner" element={<AddBanner />}></Route>
          </Route>

          <Route
            exact
            path="/fogotpassword"
            element={<ForgotPassword />}
          ></Route>
          <Route
            exact
            path="/add/review"
            element={<AddCustomerReview />}
          ></Route>
          {/* <Route path="/" element={<Home />}></Route> */}
          <Route exact path="/product/:id" element={<ProductDetails />}></Route>
          <Route exact path="/" element={<HomePage />}></Route>

          <Route exact path="/products" element={<Products />}></Route>
          <Route exact path="/products/:keyword" element={<Products />}></Route>
          <Route exact path="/signup" element={<Signup />}></Route>
          <Route exact path="/login" element={<Login />}></Route>
          {/* <Route path="/success" element={<Success/>}></Route> */}
          <Route
            exact
            path="/password/reset/:token"
            element={<ResetPassword />}
          ></Route>
          <Route path="*" element={<PageNotFound />}>
          </Route>
        </Routes>

        <Footer />
        <BottomNav />
      </BrowserRouter>
    </>
  );
};
export default App;
