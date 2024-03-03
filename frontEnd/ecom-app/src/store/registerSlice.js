const { createSlice } = require("@reduxjs/toolkit");
// import axios from 'axios'
export const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const registerSlice = createSlice({
  name: "registerUser",
  initialState: {
    user: {},
    status: STATUSES.SUCCESS,
    isAuthenticated: false,
    resError:false
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      // state.productsCount = action.payload.totalProduct
      // state.responseStatus = action.payload.status
      // state.itemPerPage = action.payload.itemPerPage
      // state.filterProductcount = action.payload.filterProductcount
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setAuthention(state, action) {
      state.isAuthenticated = action.payload;
    },
    setError(state, action){
        state.resError=action.payload
    }
  },
});
export const { setUser, setStatus, setAuthention, setError } = registerSlice.actions;
export default registerSlice.reducer;

// Thunk

export function register(email, password, name, phone) {
    // console.log('form data',myForm)
  return async function registerThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setAuthention(false));
    dispatch(setError(false))
    try {
      // console.log('keywordSlice', keyword)
      // let link = `/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&raings[gte]=${ratings}`
      // if(category){
      //     link = `/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&category=${category}`
      // }
      // const config = {headers:{"Content-Type":"application/json"}}
      // const res = await fetch('/api/v1/login', {email, password}, config)

      let registerResponse = await fetch("/api/v1/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // body: myForm
        body: JSON.stringify({
            email: email.email,
            password: password.password,
            phone:phone.phone,
            name:name.name

          }),
      });
      const data = await registerResponse.json();
      console.log("register Response", data);
      

      dispatch(setUser(data));
      if(data.status=='success'){
        dispatch(setAuthention(true));
      }
      else{
        dispatch(setError(true))
      }
      dispatch(setStatus(STATUSES.SUCCESS));
    //   dispatch(setAuthention(true));
    } catch (err) {
      console.log(err);
      dispatch(setUser(null));
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setAuthention(false));
      dispatch(setError(true))
    }
  };
}
