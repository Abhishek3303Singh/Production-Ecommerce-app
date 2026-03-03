// import { error } from "console";

const { createSlice } = require("@reduxjs/toolkit");
// import axios from 'axios'
const apiUrl = process.env.REACT_APP_API_BASE_URL;
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
    // resError:false
    error:null
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
        state.error=action.payload
    }
  },
});
export const { setUser, setStatus, setAuthention, setError} = userSlice.actions;
export default userSlice.reducer;

// Thunk
 // Login// 
export function login({email, password}) {
  return async function loginThunk(dispatch) {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setAuthention(false));
    dispatch(setError(null))
    try {
      console.log(email, password)
      // let link = `/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&raings[gte]=${ratings}`
      // if(category){
      //     link = `/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&category=${category}`
      // }
      // const config = {headers:{"Content-Type":"application/json"}}
      // const res = await fetch('/api/v1/login', {email, password}, config)

      let loginResponse = await fetch(`${apiUrl}/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials:'include',
        // body: JSON.stringify({
        //   email:email.email,
        //   password:password.password,
        // }),

        body:JSON.stringify({email, password})
       
      });
      const data = await loginResponse.json();
      // console.log("loginResponse", data);
      if(!loginResponse.ok){
        throw new Error (data.message || "Login Failed")
      }
      

      if(data.status=='failed'){
        dispatch(setAuthention(false));
        // dispatch(setError(false))
      }
      // else{
      //   dispatch(setError(true))
      // }
      
      dispatch(setUser(data));
      dispatch(setAuthention(true))
      dispatch(setStatus(STATUSES.SUCCESS));
    //   dispatch(setAuthention(true));
    } catch (err) {
      console.log(err);
      dispatch(setUser(null));
      dispatch(setAuthention(false))
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setError(err.message));
    }
  };
}

// Google Login Thunk

export const googleLogin = (token) => async (dispatch) => {
  try {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setError(null))
    if(!token){
      dispatch(setError('Invalid Google credential'))
      dispatch(setStatus(STATUSES.ERROR))
    }

    const res = await fetch(`${apiUrl}/api/v1/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    dispatch(setUser(data.user));
    dispatch(setAuthention(true));
    dispatch(setStatus(STATUSES.SUCCESS));

  } catch (error) {
    dispatch(setAuthention(false))
    dispatch(setUser(null))
    dispatch(setError(error.message));
    dispatch(setStatus(STATUSES.ERROR));
  }
};


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

    let registerResponse = await fetch(`${apiUrl}/api/v1/signup`, {
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
        credentials:'include'
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
    dispatch(setError(null))    
  }
}

// Reload Login User //

export function getUser() {
  return async function getUserThunk(dispatch) {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setError(null));
    try {

      let loginResponse = await fetch(`${apiUrl}/api/v1/about/profile`,{credentials:'include'});
      const data = await loginResponse.json();
      // console.log("Reload user Response", data);
      if(!loginResponse.ok){
        throw new Error (data.message || "Login Failed")
      }
      

      dispatch(setUser(data));
      dispatch(setAuthention(true))
      dispatch(setStatus(STATUSES.SUCCESS));
      // if(data.status=='success'){
      //   dispatch(setAuthention(true));
      //   dispatch(setError(false))
      // }
      // else{
      //   dispatch(setError(true))
      // }
      
    //   dispatch(setAuthention(true));
    } catch (err) {
      console.log(err);
      dispatch(setUser(null));
      dispatch(setError(err.message))
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

      let logoutResponse = await fetch(`${apiUrl}/api/v1/logout`,{credentials:'include'});
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

      let resetResponse = await fetch(`${apiUrl}/api/v1/change/password`, {
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
        credentials:'include'
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
