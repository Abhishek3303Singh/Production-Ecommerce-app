const { createSlice } = require("@reduxjs/toolkit");
const apiUrl = process.env.REACT_APP_API_BASE_URL;
export const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "Loading",
  ERROR: "Error",
});

const newOrderSlice = createSlice({
  name: "order",
  initialState: {
    newOrder: {},
    status: STATUSES.SUCCESS,
    resError: false,
    isCreated: false,
  },
  reducers: {
    setnewOrder(state, action) {
      state.newOrder = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setError(state, action) {
      state.resError = action.payload;
    },
    setIsCreated(state, action) {
      state.isCreated = action.payload;
    },
    resetOrderState(state) {
      state.newOrder = {};
      state.status = STATUSES.SUCCESS;
      state.resError = false;
      state.isCreated = false;
    },
  },
});
export const {
  setnewOrder,
  setStatus,
  setError,
  setIsCreated,
  resetOrderState,
} = newOrderSlice.actions;
export default newOrderSlice.reducer;

// Thunk for new Order//

export function createNewOrder(order) {
  return async function createNewOrderThunk(dispatch) {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setIsCreated(false));
    try {
      // console.log(order, 'order')

      const resData = await fetch(`${apiUrl}/api/v1/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({order}),
        credentials: "include",
      });
      const data = await resData.json();
      console.log('order response', data)
      if (!resData.ok || data.status === "failed") {
        dispatch(setError(true));
        dispatch(setIsCreated(false));
        dispatch(setnewOrder(data));
        // alert.error(data.message || "Order creation failed");
      } else {
        dispatch(setnewOrder(data));
        dispatch(setError(false));
        dispatch(setIsCreated(true));
      }

      dispatch(setStatus(STATUSES.SUCCESS));

    
      
    } catch (e) {
      console.log(e);
      dispatch(setError(true));
      dispatch(setStatus(STATUSES.ERROR));
    }
  };
}

export function clearErr() {
  return function clearErrThunk(dispatch) {
    dispatch(setnewOrder(null));
    dispatch(setError(false));
    dispatch(setIsCreated(false));
  };
}
