const { createSlice } = require("@reduxjs/toolkit");
const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "errror",
});

const deleteProductSlice = createSlice({
  name: "delete",
  initialState: {
    deletedProduct: {},
    status: STATUSES.SUCCESS,
    resError: false,
    isDeleted: false,
  },
  reducers: {
    setdeletedProduct(state, action) {
      state.deletedProduct = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setErr(state, action) {
      state.resError = action.payload;
    },
    setIsDeleted(state, action) {
      state.isDeleted = action.payload;
    },
  },
});
export const { setIsDeleted, setErr, setStatus, setdeletedProduct } =
  deleteProductSlice.actions;
export default deleteProductSlice.reducer;

// Thunk [Api Call for Delete product]

export const deleteProductAdmin = (id) => {
  return async function deleteProductAdminThunk(dispatch, getState) {
    try {
      dispatch(setStatus(STATUSES.LOADING));
      const resData = await fetch(`/api/v1/product/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-type": "application/json; charset=UTF-8", // Indicates the content
        },
      });

      const data = await resData.json()
      dispatch(setdeletedProduct(data))
      dispatch(setStatus(STATUSES.SUCCESS))
      if(data.status==='failed'){
        dispatch(setErr(true))
        dispatch(setIsDeleted(false))
      }
      else{
        dispatch(setIsDeleted(true))
        dispatch(setErr(false))
      }

    } catch (e) {
      console.log(e.message);
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setErr(true));
    }
  };
};

export const clearError = ()=>{
    return function clearErrorThunk(dispatch, getState){
        dispatch(setdeletedProduct(null))
        dispatch(setIsDeleted(false))
        dispatch(setErr(false))
    }
}

export const resetDelete = ()=>{
    return function resetDeleteThunk(dispatch, getState){
        // dispatch(setdeletedProduct(null))
        dispatch(setIsDeleted(false))
        // dispatch(setErr(false))
    }
}

