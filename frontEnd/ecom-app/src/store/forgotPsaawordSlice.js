const { createSlice } = require("@reduxjs/toolkit");
// import axios from 'axios'
export const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState: {
    passwordResponse: {},
    status: STATUSES.SUCCESS,
    isAuthenticated: false,
    resError: false,
  },
  reducers: {
    setPassword(state, action) {
      state.passwordResponse = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setAuthention(state, action) {
      state.isAuthenticated = action.payload;
    },
    setError(state, action) {
      state.resError = action.payload;
    },
  },
});
export const { setPassword, setStatus, setAuthention, setError } =
  forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;

// Thunk

export function forgotPassword(email) {
  // console.log('form data',myForm)
  return async function forgotPasswordhunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setAuthention(false));
    dispatch(setError(false));
    try {
      let resetPassResponse = await fetch("/api/v1/password/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // body: myForm
        body: JSON.stringify({
          email: email.email,
        }),
      });
      const data = await resetPassResponse.json();
      console.log("reset Response", data);

      dispatch(setPassword(data));
      //   dispatch(setPassword(data))
      if (data.status == "success") {
        dispatch(setAuthention(true));
      } 
      else {
        dispatch(setError(true));
      }
      dispatch(setStatus(STATUSES.SUCCESS));
    //   dispatch(setAuthention(true));
    } catch (err) {
      console.log(err);
      dispatch(setPassword(null));
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setAuthention(false));
      dispatch(setError(true));
    }
  };
}
export function resetPassword(token, password, confirmPassword) {
    console.log(token, 'frontEnd')
  return async function restPasswordThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setAuthention(false));
    try {
      let resetResponse = await fetch(`/api/v1/password/reset/${token}`, {
        method: "Put",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
            password : password.newPassword,
            confirmPassword:confirmPassword.confirmPassword
        }),
      });
      const data = await resetResponse.json();
      console.log("loginResponse", data);

        dispatch(setPassword(data));
      if (data.status == "success") {
        dispatch(setAuthention(true));
        dispatch(setError(false));
      } else {
        dispatch(setError(true));
      }
      dispatch(setStatus(STATUSES.SUCCESS));
      dispatch(setAuthention(true));
    } catch (err) {
      console.log(err);
        dispatch(setPassword(null));
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setAuthention(false));
    }
  };
}

export function clearErr() {
  return async function clearError(dispatch, getState) {
    dispatch(setPassword(null));
    dispatch(setError(false));
  };
}
