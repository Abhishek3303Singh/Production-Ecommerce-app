// store/adminBannerSlice.js
import { createSlice } from "@reduxjs/toolkit";

const apiUrl = process.env.REACT_APP_API_BASE_URL;

export const STATUSES = Object.freeze({
  IDLE: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const adminBannerSlice = createSlice({
  name: "adminBanner",
  initialState: {
    allBanners: [],      
    analytics: null,     
    status: STATUSES.IDLE,
    error: null,
    isCreated: false,
    isUpdated: false,
    isDeleted: false,
  },
  reducers: {
    setAllBanners(state, action) {
      state.allBanners = action.payload;
    },
    setAnalytics(state, action) {
      state.analytics = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setCreated(state, action) {
      state.isCreated = action.payload;
    },
    setUpdated(state, action) {
      state.isUpdated = action.payload;
    },
    setDeleted(state, action) {
      state.isDeleted = action.payload;
    },
    resetAdminBannerState(state) {
      state.isCreated = false;
      state.isUpdated = false;
      state.isDeleted = false;
      state.error = null;
    },
  },
});

export const {
  setAllBanners,
  setAnalytics,
  setStatus,
  setError,
  setCreated,
  setUpdated,
  setDeleted,
  resetAdminBannerState,
} = adminBannerSlice.actions;

export default adminBannerSlice.reducer;

// ================= ADMIN THUNKS =================

// Get all banners (admin list with pagination)
export const getAllBanners = (page = 1, limit = 10) => {
  return async (dispatch) => {
    dispatch(setStatus(STATUSES.LOADING));
    try {
      const res = await fetch(
        `${apiUrl}/api/v1/admin/banners?page=${page}&limit=${limit}`,
        { credentials: "include" }
      );
      const data = await res.json();
      dispatch(setAllBanners(data.banners)); 
      dispatch(setStatus(STATUSES.IDLE));
    } catch (err) {
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setError(err.message));
    }
  };
};

// Create banner
export const createBanner = (formData) => {
  return async (dispatch) => {
    dispatch(setStatus(STATUSES.LOADING));
    try {
      const res = await fetch(`${apiUrl}/api/v1/admin/banners`, {
        method: "POST",
        headers:{
          'Content-Type': 'application/json',
        }, 
        body :JSON.stringify(formData),
        credentials: "include",
      });
      console.log(res, 'create banner res')
      const data = await res.json();
      console.log(data, 'create banner response')
      if (!res.ok) throw new Error(data.message);
      dispatch(setCreated(true));
      dispatch(setStatus(STATUSES.IDLE));
    } catch (err) {
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setError(err.message));
    }
  };
};

// Update banner
export const updateBanner = (id, formData) => {
  return async (dispatch) => {
    dispatch(setStatus(STATUSES.LOADING));
    try {
      const res = await fetch(`${apiUrl}/api/v1/admin/banners/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      dispatch(setUpdated(true));
      dispatch(setStatus(STATUSES.IDLE));
    } catch (err) {
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setError(err.message));
    }
  };
};

// Delete banner
export const deleteBanner = (id) => {
  return async (dispatch) => {
    dispatch(setStatus(STATUSES.LOADING));
    try {
      await fetch(`${apiUrl}/api/v1/admin/banners/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      dispatch(setDeleted(true));
      dispatch(setStatus(STATUSES.IDLE));
    } catch (err) {
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setError(err.message));
    }
  };
};

// Get analytics
export const getBannerAnalytics = () => {
  return async (dispatch) => {
    dispatch(setStatus(STATUSES.LOADING));
    try {
      const res = await fetch(`${apiUrl}/api/v1/admin/banners/analytics`, {
        credentials: "include",
      });
      const data = await res.json();
      dispatch(setAnalytics(data));
      dispatch(setStatus(STATUSES.IDLE));
    } catch (err) {
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setError(err.message));
    }
  };
};