const { createSlice } = require("@reduxjs/toolkit");
const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const createBannerSlice = createSlice({
  name: "createBanner",
  initialState: {
    createBanner: {},
    banners:{},
    status: STATUSES.SUCCESS,
    resError: false,
    isCreated: false
  },
  reducers: {
    setBanner(state, action) {
      state.createBanner = action.payload;
    },
    setAllBanners(state, action){
        state.banners = action.payload
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

export const { setError, setBanner, setStatus,setAllBanners, setIscreated } = createBannerSlice.actions;
export default createBannerSlice.reducer;

// THunk for Add product
export const createNewBanner = (formData) => {
  return async function createNewBannerThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    try {
      // console.log(formData.get('Image'), 'form-Data-image')
      const resData = await fetch("/api/v1/admin/udate/banner", {
        method: "POST",
        body: formData
      });
      const data = await resData.json()
      // console.log(data.get('Image'), 'Data-Add Product')
      dispatch(setBanner(data))
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
//Thunk for getAll Banners
export const getBanner = () => {
    return async function getThunk(dispatch, getState) {
      dispatch(setStatus(STATUSES.LOADING));
      try {
        // console.log(formData.get('Image'), 'form-Data-image')
        const resData = await fetch("/api/v1/admin/get/banner");
        const data = await resData.json()
        // console.log(data.get('Image'), 'Data-Add Product')
        dispatch(setAllBanners(data))
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
        dispatch(setBanner(null))
    }
}
export function resetCreated(){
  return function resetCreatedThunk(dispatch, getState){
      dispatch(setIscreated(false))
      // dispatch(setProduct(null))
  }
}