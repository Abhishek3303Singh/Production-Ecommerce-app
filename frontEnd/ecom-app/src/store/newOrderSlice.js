const { createSlice} = require("@reduxjs/toolkit");
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
  },
});
export const { setnewOrder, setStatus, setError } = newOrderSlice.actions;
export default newOrderSlice.reducer;

// Thunk for new Order//

export function createNewOrder(order) {
  return async function createNewOrderThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING))
    try{
        // console.log(order, 'order')

        const resData = await fetch("/api/v1/order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              order
            }),
          });
          const data = await resData.json()
        
      
          dispatch(setnewOrder(data))

          if(data.status ==='failed'){
            dispatch(setError(true))
          }
          else{
            dispatch(setError(false))
          }
          dispatch(setStatus(STATUSES.SUCCESS))

    }
    catch(e){
        console.log(e);
        dispatch(setError(true))
        dispatch(setStatus(STATUSES.ERROR))

    }

  };
}

export function clearErr(){
    return function clearErrThunk(dispatch, getState){
        dispatch(setnewOrder(null))
        dispatch(setError(false))
    }
}