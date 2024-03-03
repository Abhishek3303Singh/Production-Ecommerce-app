const { createSlice } = require("@reduxjs/toolkit");
const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const updateProductSlice = createSlice({
  name: "update",
  initialState: {
    updateProduct: {},
    status: STATUSES.SUCCESS,
    resError: false,
    isUpdated: false,
  },
  reducers: {
    setUpdateProduct(state, action) {
      state.updateProduct = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setError(state, action) {
      state.resError = action.payload;
    },
    setIsupadated(state, action) {
      state.isUpdated = action.payload;
    },
  },
});

export const { setError, setIsupadated, setStatus, setUpdateProduct } =
  updateProductSlice.actions;
export default updateProductSlice.reducer;

// Thunk Api Call

export const adminUpdateProduct = (id, formData) => {

  return async function adminUpdateProductThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    try {
      // console.log(id, 'checking api call')
      const resData = await fetch(`/api/v1/product/${id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await resData.json();
      // console.log('resData' , data)
      dispatch(setUpdateProduct(data));
      dispatch(setStatus(STATUSES.SUCCESS));
      if (data.status === "failed") {
        dispatch(setError(true));
      } else if(data.status==='success'){
        dispatch(setIsupadated(true));
      }
    } catch (e) {
      console.log(e.message);
      dispatch(setError(true));
      dispatch(setStatus(STATUSES.ERROR));
    }
  };
};

export const restIsUpdate = () => {
  return function restIsUpdateThunk(dispatch, getState) {
    dispatch(setIsupadated(false));
  };
};
export const clrErr = () => {
  return function clrErrThunk(dispatch, getState) {
    dispatch(setError(false));
    dispatch(setUpdateProduct(null));
  };
};
