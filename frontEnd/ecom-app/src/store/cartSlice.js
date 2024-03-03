// import { setStatus } from "./productDetailsSlice";

const { createSlice } = require("@reduxjs/toolkit");
export const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    // cartItems: [],
    cartItems: localStorage.getItem('cartItems')?JSON.parse(localStorage.getItem('cartItems')):[],
    shippingInfo:localStorage.getItem('ShippingInfo')?JSON.parse(localStorage.getItem('ShippingInfo')):{},
    status: STATUSES.SUCCESS,
  },

  reducers: {
    add(state, action) {
      // console.log(action.payload, "payload");
      // core redux method was
      // return [...state, action.payload]

      // buth tollkit allows us to manupulating state;

      // // check if product is already in cart
      const item = action.payload;
      const isItemExist = state.cartItems.find(
        (i) => i.product === item.product
      );
      if (isItemExist) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.product === action.payload.product ? item : i
          ),
        };
      } else {
       state.cartItems.push(item);
      }
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
  
    remove(state, action){
        return {
          cartItems:state.cartItems.filter((item)=>item.product !== action.payload.product)
        }
    },

    setShippingInfo(state, action){
      state.shippingInfo=action.payload;
    },

  
  },
});

export const { add,setStatus,remove,setShippingInfo } = cartSlice.actions;
export default cartSlice.reducer;

// Thunk

export const addToCart = (id, quantity) => {
  return async function addToCartThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    let cartProduct = await fetch(`/api/v1/product/details/${id}`);
    const data = await cartProduct.json();
    console.log(data.reqProduct, "cartData");
    dispatch(
      add({
        // cartData:{data:data.reqProduct, quantity:quantity}
        product: data.reqProduct._id,
        name: data.reqProduct.name,
        price: data.reqProduct.price,
        offerPrice:data.reqProduct.offerPrice,
        image: data.reqProduct.Image[0].url,
        stock: data.reqProduct.Stock,
        title:data.reqProduct.title,
        quantity: quantity,
      })
    );
    dispatch(setStatus(STATUSES.SUCCESS));

    localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems))
  };
};

export const removeToCart =(id)=>{
  return function removeToCartThunk(dispatch, getState){

    dispatch(setStatus(STATUSES.LOADING));;
    dispatch(
      remove({
    product:id
       
      })
    );
    dispatch(setStatus(STATUSES.SUCCESS));

    localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems))

  }
}

// Thunk For shipping Information

export const shippingDetails=(data)=>{
  return function shippingDetailsThunk(dispatch, getState){
    // console.log(data, 'Shipping Adderss')
    dispatch(setStatus(STATUSES.LOADING))
    // localStorage.setItem("ShippingInfo", JSON.stringify(data))
    dispatch(setShippingInfo(data))
    localStorage.setItem("ShippingInfo", JSON.stringify(data))
    dispatch(setStatus(STATUSES.SUCCESS))
   

  }
}