const { createSlice } = require("@reduxjs/toolkit");
const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const createProductSlice = createSlice({
  name: "createproduct",
  initialState: {
    createProduct: {},
    status: STATUSES.SUCCESS,
    resError: false,
    isCreated: false
  },
  reducers: {
    setProduct(state, action) {
      state.createProduct = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setError(state, action) {
      state.resError = action.payload;
    },
    setIscreated(state, action){
      state.isCreated = action.payload
    }
  },
});

export const { setError, setProduct, setStatus, setIscreated } = createProductSlice.actions;
export default createProductSlice.reducer;

// THunk for Add product
export const createNewProduct = (formData) => {
  return async function createNewProductThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    try {
      // console.log(formData.get('Image'), 'form-Data-image')
      const resData = await fetch("/api/v1/product/add", {
        method: "POST",
        body: formData
      });
      const data = await resData.json()
      // console.log(data.get('Image'), 'Data-Add Product')
      dispatch(setProduct(data))
      dispatch(setStatus(STATUSES.SUCCESS))
      if(data.status==='failed'){
        dispatch(setError(true))
      }
      else{
        dispatch(setError(false))
        dispatch(setIscreated(true))
      }
    }

    
    catch (e) {
      console.log(e.message);
      dispatch(setStatus(STATUSES.ERROR));
      // dispatch(setError(true));
    }
  };
};

export function clearErr(){
    return function clearErrThunk(dispatch, getState){
        dispatch(setError(false))
        dispatch(setProduct(null))
    }
}
export function resetCreated(){
  return function resetCreatedThunk(dispatch, getState){
      dispatch(setIscreated(false))
      // dispatch(setProduct(null))
  }
}