// import { setStatus } from "./productDetailsSlice";

const { createSlice } = require("@reduxjs/toolkit");
const apiUrl = process.env.REACT_APP_API_BASE_URL;
export const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});
const lineKey = (i) =>`${i.product }: ${i.variantId || ''}`

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    // cartItems: [],
    cartItems: localStorage.getItem('cartItems')?JSON.parse(localStorage.getItem('cartItems')):[],
    shippingInfo:localStorage.getItem('ShippingInfo')?JSON.parse(localStorage.getItem('ShippingInfo')):{},
    status: STATUSES.SUCCESS,
  },

  reducers: {
    // add(state, action) {
    //   // console.log(action.payload, "payload");
    //   // core redux method was
    //   // return [...state, action.payload]

    //   // buth tollkit allows us to manupulating state;

    //   // // check if product is already in cart
    //   const item = action.payload;
    //   const isItemExist = state.cartItems.find(
    //     (i) => i.product === item.product
    //   );
    //   if (isItemExist) {
    //     return {
    //       cartItems: state.cartItems.map((i) =>
    //         i.product === action.payload.product ? item : i
    //       ),
    //     };
    //   } else {
    //    state.cartItems.push(item);
    //   }
    // },


    add(state, action){
      const item = action.payload;
      const idx = state.cartItems.findIndex((index)=>lineKey(index) === lineKey(item))
      if(idx !== -1){
        state.cartItems[idx] = item;
      }
      else state.cartItems.push(item)
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
  
    remove(state, action) {
      state.cartItems = state.cartItems.filter((i) => lineKey(i) !== lineKey(action.payload));
    },
    updateQuantity(state, action){
      const {product, variantId = null, quantity} = action.payload
      const line = state.cartItems.find((item)=>lineKey(item)=== lineKey({product, variantId}))
      if(!line) return
      const cap = Math.min(Number(line.stock) || 10, 10)
      line.quantity = Math.max(1, Math.min(Number(quantity) || 1 , cap))
    },
    clearCart(state){
      state.cartItems = []
    },

    setShippingInfo(state, action){
      state.shippingInfo=action.payload;
    },
  

  
  },
});

export const { add,setStatus,remove,setShippingInfo, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;

// Thunk

// export const addToCart = (id, quantity, variantId=null) => {
//   return async function addToCartThunk(dispatch, getState) {
//     dispatch(setStatus(STATUSES.LOADING));
//     console.log('addToCart args', { id, quantity, variantId });
//     let cartProduct = await fetch(`${apiUrl}/api/v1/product/details/${id}`,{credentials:"include"});
//     const data = await cartProduct.json();
//     // console.log(data.reqProduct, "cartData");
//     const {reqProduct:prod} = data
//     const variant = variantId ? prod.variant?.find((v)=>v._id===variantId) :null
//     if(prod.variants?.length && !variant){
//       throw new Error('Please choose a size')
//     }
//     dispatch(
//       add({
//         // cartData:{data:data.reqProduct, quantity:quantity}
//         product: data.reqProduct._id,
//         variantId:variant._id || null,
//         size:variant.size || '',
//         color:variant.color || '',
//         name: data.reqProduct.name,
//         price: data.reqProduct.price,
//         offerPrice:data.reqProduct.offerPrice,
//         image: data.reqProduct.Image[0].url,
//         stock: variant ? variant.stock : prod.Stock,
//         title:data.reqProduct.title,
//         quantity: quantity,
//       })
//     );

//     localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems))
//     dispatch(setStatus(STATUSES.SUCCESS));

//   };
// };

export const addToCart = (id, quantity, variantId = null) => async (dispatch, getState) => {
  dispatch(setStatus(STATUSES.LOADING));
  try {
    const res = await fetch(`${apiUrl}/api/v1/product/details/${id}?view=0`, { credentials: 'include' });
    const data = await res.json();
    const p = data.reqProduct;
    if (!res.ok || !p) throw new Error(data.message || 'Product not available');

    const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
    const variant = hasVariants
      ? p.variants.find((v) => String(v._id) === String(variantId))
      : null;

    if (hasVariants && !variant) {
      throw new Error(variantId ? 'That option is no longer available' : 'Please choose a size');
    }

    const stock = variant ? Number(variant.stock) : Number(p.Stock);
    if (!(stock > 0)) throw new Error('Out of stock');
    const qty = Math.max(1, Math.min(Number(quantity) || 1, stock, 10));

    dispatch(add({
      product: p._id,
      variantId: variant?._id || null,
      size: variant?.size || '',
      color: variant?.color || '',
      name: p.name,
      title: p.title,
      price: p.price,
      offerPrice: p.offerPrice,
      image: p.Image?.[0]?.url,
      stock,
      quantity: qty,
    }));
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
  } finally {
    dispatch(setStatus(STATUSES.SUCCESS));
  }
};

export const removeToCart =(id, variantId=null)=>{
  return function removeToCartThunk(dispatch, getState){

   
    dispatch(remove({product:id, variantId}))

    localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems))
    dispatch(setStatus(STATUSES.SUCCESS));


  }
}
export const changeQuantity = (product, variantId, quantity)=>(dispatch, getState)=>{
  dispatch(updateQuantity({product, variantId, quantity}))
  localStorage.setItem('cartItems', JSON.stringify(getState.cart.cartItems))
}

export const clearCartItems = ()=>(dispatch)=>{
  dispatch(clearCart());
  localStorage.removeItem('cartItems')
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