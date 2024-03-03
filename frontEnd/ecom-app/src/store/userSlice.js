const { createSlice } = require("@reduxjs/toolkit");
// import axios from 'axios'
export const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const userSlice = createSlice({
  name: "user",
  initialState: {

    user: {},
    status: STATUSES.SUCCESS,
    isAuthenticated: false,
    resError:false
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
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
export const { setUser, setStatus, setAuthention, setError} = userSlice.actions;
export default userSlice.reducer;

// Thunk
 // Login// 
export function login(email, password) {
  return async function loginThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setAuthention(false));
    try {
      // console.log('keywordSlice', keyword)
      // let link = `/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&raings[gte]=${ratings}`
      // if(category){
      //     link = `/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&category=${category}`
      // }
      // const config = {headers:{"Content-Type":"application/json"}}
      // const res = await fetch('/api/v1/login', {email, password}, config)

      let loginResponse = await fetch("/api/v1/login", {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.email,
          password: password.password,
        }),
      });
      const data = await loginResponse.json();
      // console.log("loginResponse", data);
      

      dispatch(setUser(data));
      if(data.status=='success'){
        dispatch(setAuthention(true));
        dispatch(setError(false))
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
    }
  };
}

// Register//

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
export function clearErr(){
  return async function clearError(dispatch , getState){
    dispatch(setUser(null))
    dispatch(setError(false))    
  }
}

// Reload Login User //

export function getUser(email, password) {
  return async function getUserThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setAuthention(false));
    try {

      let loginResponse = await fetch("/api/v1/about/profile");
      const data = await loginResponse.json();
      // console.log("Reload user Response", data);
      

      dispatch(setUser(data));
      if(data.status=='success'){
        dispatch(setAuthention(true));
        dispatch(setError(false))
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
    }
  };
}

//logged out


export function logout() {
  return async function logoutThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setAuthention(false));
    try {

      let logoutResponse = await fetch("/api/v1/logout");
      const data = await logoutResponse.json();
      // console.log("loginResponse", data);
      

      dispatch(setUser(null));
      if(data.status=='success'){
        dispatch(setAuthention(false));
        dispatch(setError(false))
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
    }
  };
}


// Change PAssword//

export function resetPassword(oldPassword, newPassword, confirmPassword) {
  return async function resetPasswordThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setAuthention(false));
    try {
      console.log(oldPassword, newPassword, confirmPassword)

      let resetResponse = await fetch("/api/v1/change/password", {
        method: "Put",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          oldPassword: oldPassword.oldPassword,
          newPassword: newPassword.newPassword,
          confirmPassword:confirmPassword.confirmPassword
        }),
      });
      const data = await resetResponse.json();     
      console.log("ResetResponse", data);
      dispatch(setUser(data.user));
      if(data.success==true){
        dispatch(setAuthention(true));
        dispatch(setError(false))
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
    }
  };
}
