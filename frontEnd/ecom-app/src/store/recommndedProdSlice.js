const { createSlice } = require("@reduxjs/toolkit");
const apiUrl = process.env.REACT_APP_API_BASE_URL;
export const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const recommendedProductSlice = createSlice({
  name: "recommendedProd",
  initialState: {
    recommended: [],
    trending: [],
    bestSellers: [],
    recentlyViewed: [],
    status: STATUSES.SUCCESS,
    error: false,
  },
  reducers: {
    setProductList(state, action) {
      const { type, data } = action.payload;
      if (type === "recommended") state.recommended = data;
      if (type === "trending") state.trending = data;
      if (type === "bestseller") state.bestSellers = data;
      if (type === 'recentlyViewed') state.recentlyViewed = data;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setProductList, setError, setStatus } =
  recommendedProductSlice.actions;
export default recommendedProductSlice.reducer;

export function fetchProductLists(type, productId = "") {
  return async function fetchProductListsThunk(dispatch) {
    dispatch(setStatus(STATUSES.LOADING));
    // console.log(JSON.parse(localStorage.getItem("recentlyViewed")), 'localStorage')
    let url = "";
    switch (type) {
      case "recommended":
        url = `${apiUrl}/api/v1/products/recommended/${productId}`;

        break;
      case "trending":
        url = `${apiUrl}/api/v1/products/trending`;
        break;
      case "bestseller":
        url = `${apiUrl}/api/v1/products/bestseller`;
        break;
      case "recentlyViewed":
        let ids = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
        if (ids.length === 0) {
          dispatch(setStatus(STATUSES.SUCCESS));
          return;
        }
        url = `${apiUrl}/api/v1/products/by-ids?ids=${ids.join(",")}`;
        break;

      default:
        return;
    }
    try {
      const res = await fetch(url, { credentials: "include" });

      const data = await res.json();
      // console.log('running', data)
      if (type === "recentlyViewed") {
        const ids = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
        const orderedProduct = ids
          .map((id) => data.recentlyViewedProd.find((p) => p._id === id))
          .filter(Boolean);
        dispatch(setProductList({type, orderedProduct}));
        // console.log(orderedProduct,'orderedProduct')
      }
      else{
        dispatch(setProductList({type, data}))
      }
     
      dispatch(setStatus(STATUSES.SUCCESS));
    } catch (e) {
      console.log(e.message);
      dispatch(setError(true));
      dispatch(setStatus(STATUSES.ERROR));
    }
  };
}
