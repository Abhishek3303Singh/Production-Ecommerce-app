const { createSlice } = require("@reduxjs/toolkit");
const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const adminOrdersSlice = createSlice({
  name: "allOrders",
  initialState: {
    adminOrders: [],
    delete:{},
    updateOrder:{},
    status: STATUSES.SUCCESS,
    resError: false,
    isDeleted: false,
    isUpdated: false,
  },
  reducers: {
    setAdminOrdes(state, action) {
      state.adminOrders = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setError(state, action) {
      state.resError = action.payload;
    },
    setDeleted(state, action) {
      state.delete = action.payload;
    },
    setIsDeleted(state, action){
      state.isDeleted = action.payload
    },
    setUpdateOrder(state, action){
      state.updateOrder = action.payload
    },
    setIsUpdated(state, action){
      state.isUpdated = action.payload
    }
  },
});

export const { setError, setStatus, setAdminOrdes, setDeleted, setIsDeleted, setIsUpdated, setUpdateOrder } = adminOrdersSlice.actions;
export default adminOrdersSlice.reducer;

// Thunk Api Call

export const getAdminOrders = () => {
  return async function getAdminOrdersThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    try {
      // console.log(id, 'checking api call')
      const resData = await fetch("/api/v1/admin/orders/all", {
        method: "get",
        // body: formData,
      });
      const data = await resData.json();
      // console.log('resData' , data)
      dispatch(setAdminOrdes(data));
      dispatch(setStatus(STATUSES.SUCCESS));
      if (data.status === "failed") {
        dispatch(setError(true));
      }
    } catch (e) {
      console.log(e.message);
      dispatch(setError(true));
      dispatch(setStatus(STATUSES.ERROR));
    }
  };
};

export const clrErr = () => {
  return function clrErrThunk(dispatch, getState) {
    dispatch(setError(false));
    dispatch(setAdminOrdes(null));
  };
};

export const deleteOrder = (id) => {
  return async function deleteOrderThunk(dispatch, getState) {
    try {

      const resData = await fetch(`/api/v1/admin/order/delete/${id}`,{
        method:'DELETE'
      });
      const data = await resData.json();

      dispatch(setDeleted(data))
      if (data.status === "success") {
        console.log(data.status, 'deletedres')
        dispatch(setIsDeleted(true));
      }
    } catch (e) {
      console.log(e.message);
      dispatch(setIsDeleted(false));
    }
  };
};

export const resetIsDeleted = () => {
  return function resetIsDeletedThunk(dispatch, getState) {
    dispatch(setIsDeleted(false));
  };
};

export const setUpdateOrderStatus=(status, id)=>{
  return async function setUpdateOrderStatusThunk(dispatch, getState){
    dispatch(setStatus(STATUSES.LOADING))
    try{
      console.log(status, 'checking orderStatus Data')
      const resData = await fetch(`/api/v1/admin/order/status/${id}`, {
        method:'PUT',
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // body: myForm
        body: JSON.stringify({
          status
  
          }),
      })
      const data = await resData.json()
      dispatch(setUpdateOrder(data))
      dispatch(setStatus(STATUSES.SUCCESS))
      if(data.status==='success'){
        dispatch(setIsUpdated(true))

      }else{
        dispatch(setError(true))
      }

    }
    catch(e){
      console.log(e.message)
      dispatch(setStatus(STATUSES.ERROR))
    }
  }
}

export const resetIsUpdate = () => {
  return function resetIsUpdateThunk(dispatch, getState) {
    dispatch(setIsUpdated(false));
  };
};
