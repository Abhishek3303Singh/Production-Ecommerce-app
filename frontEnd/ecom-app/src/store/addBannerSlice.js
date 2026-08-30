import { createSlice } from "@reduxjs/toolkit";

const apiUrl = process.env.REACT_APP_API_BASE_URL;

export const STATUSES = Object.freeze({
  IDLE: "idle",
  LOADING: "loading",
  ERROR: "error",
});

// ================= SLICE =================
const bannerSlice = createSlice({
  name: "banner",
  initialState: {
    banners: [],        // ✅ array
    status: STATUSES.IDLE,
    headerThemeColor: '#131921',
    error: null,
    isCreated: false,
  },
  reducers: {
    setBanners(state, action) {
      state.banners = action.payload;
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
    resetBannerState(state) {
      state.isCreated = false;
      state.error = null;
    },
    setHeaderThemeColor(state, action){
      state.headerThemeColor = action.payload
    }
  },
});

export const {
  setBanners,
  setStatus,
  setError,
  setCreated,
  resetBannerState,
  setHeaderThemeColor
} = bannerSlice.actions;

export default bannerSlice.reducer;

export const getBanners = (position = "hero") => {
  return async (dispatch) => {
    dispatch(setStatus(STATUSES.LOADING));

    try {
      const res = await fetch(
        `${apiUrl}/api/v1/banners?position=${position}`,
        { credentials: "include" }
      );

      const data = await res.json();
      // console.log(data, 'banner-data')

      dispatch(setBanners(data.data)); // ✅ correct structure
      dispatch(setStatus(STATUSES.IDLE));


    } catch (err) {
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setError(err.message));
    }
  };
};

