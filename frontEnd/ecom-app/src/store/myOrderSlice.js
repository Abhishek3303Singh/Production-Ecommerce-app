import { createDispatchHook } from "react-redux";

const { createSlice } = require("@reduxjs/toolkit");
export const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});
const myOrderSlice = createSlice({
    name: "myOrders",
    initialState: {
      myOrders: [],
      status: STATUSES.SUCCESS,
      resError: false,
    },
  reducers: {
    setMyOrders(state, action) {
      state.myOrders = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setError(state, action) {
      state.resError = action.payload;
    },
  },
});

export const { setMyOrders, setStatus, setError } = myOrderSlice.actions;
export default myOrderSlice.reducer;

// My ORDER Thunk//

export const myOrdersDetails = () => {
  return async function myOrdersDetailsThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    try {
      const resData = await fetch("/api/v1/myorder");
      const data = await resData.json();
      // console.log(data, 'order-data')
      if(data.status=='failed'){
        dispatch(setError(true))

      }

      dispatch(setMyOrders(data))
      dispatch(setStatus(STATUSES.SUCCESS))
    } catch (e) {
      console.log(e);
      // dispatch(setError(true));
      dispatch(setMyOrders(null))
      dispatch(setStatus(STATUSES.ERROR));
    }
  };
};

export function clearErr(){
    return function clearErrRes(dispatch, getState){
        dispatch(setMyOrders(null))
        dispatch(setError(false))
    }
}