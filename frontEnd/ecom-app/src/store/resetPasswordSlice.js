const { createSlice } = require("@reduxjs/toolkit");
// import axios from 'axios'
export const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const resetPasswordSlice = createSlice({
  name: "resetPassword",
  initialState: {
    resetPasswordResponce: {},
    status: STATUSES.SUCCESS,
    isAuthenticated: false,
    resError: false,
  },
  reducers: {
    setNewPassword(state, action) {
      state.resetPasswordResponce = action.payload;
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
export const { setUser, setStatus, setAuthention, setError } =
  resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;

// Thunk

// Login//
export function forgotPassword(email) {
  return async function forgotPasswordThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    dispatch(setAuthention(false));
    try {
      let resetResponse = await fetch("/api/v1/password/forgot", {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.email,
        }),
      });
      const data = await resetResponse.json();
      console.log("loginResponse", data);

    //   dispatch(setNewPassword(data));
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
    //   dispatch(setNewPassword(null));
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setAuthention(false));
    }
  };
}



export function clearErr() {
  return async function clearError(dispatch, getState) {
    dispatch(setUser(null));
    dispatch(setError(false));
  };
}
