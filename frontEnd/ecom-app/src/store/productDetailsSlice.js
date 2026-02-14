const { createSlice } = require("@reduxjs/toolkit");
const apiUrl = process.env.REACT_APP_API_BASE_URL;
export const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const productDetailsSlide = createSlice({
  name: "productDetails",
  initialState: {
    product: {
      customerReview: [],
      reviewsCount: 0,
    },
    recommendedProducts:[],
    status: STATUSES.SUCCESS,
    resErr: false,
    reviewStatus:STATUSES.SUCCESS
  },
  reducers: {
    setProductDetails(state, action) {
      state.product = action.payload.reqProduct ??{
        customerReview:[],
        reviewsCount:0
      }
      state.responseStatus = action.payload.status;
      // state.images = action.payload.reqProduct.Image
    },
    addOptimisticReview(state, action) {
      state.product.customerReview.unshift(action.payload);
      state.product.reviewsCount += 1;
    },
    confirmReview(state, action) {
        const {tempId, serverReview} = action.payload
      const index = state.product.customerReview.findIndex(
        (r) => r.tempId === tempId
      );
      if (index !== -1) {
        state.product.customerReview[index] = serverReview;
      }
    },
    rollbackReview(state, action) {
      state.product.customerReview = state.product.customerReview.filter(
        (r) => r.tempId !== action.payload
      );
      state.product.reviewsCount -= 1;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setReviewStatus(state, action){
      state.reviewStatus = action.payload;
    },
    setRecommendedProd(state, action){
      state.recommendedProducts = action.payload
    },
    setError(state, action) {
      state.resErr = action.payload;
    },
  },
});
export const {
  setProductDetails,
  setStatus,
  setError,
  setReviewStatus,
  addOptimisticReview,
  confirmReview,
  rollbackReview,
  setRecommendedProd
} = productDetailsSlide.actions;
export default productDetailsSlide.reducer;

// Thunk

export function getProductDetails(id) {
  return async function getAllProductsThunk(dispatch, getState) {
    dispatch(setStatus(STATUSES.LOADING));
    try {
      // console.log('id', id)
      const res = await fetch(`${apiUrl}/api/v1/product/details/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      dispatch(setProductDetails(data));
      dispatch(setStatus(STATUSES.SUCCESS));

      if (data.status === "failed") {
        dispatch(setError(true));
      }
    } catch (err) {
      console.log(err);
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(setError(true));
    }
  };
}
const SAFE_FEEDBACK_LENGTH = 500;
export function addReview(userName, reviewData) {
  return async function addReviewThunk(dispatch) {
    const safeReviewData = {
      ...reviewData,
      feedback: reviewData.feedback
        ?.trim()
        .slice(0, SAFE_FEEDBACK_LENGTH),
    };
    const tempId = Date.now();
    const optimisticReview = {
      ...reviewData,
      tempId,
      _id: tempId,
      createdAt: new Date().toISOString(),
      user: {
        name: userName,
      },
      isPending:true
    };

    dispatch(addOptimisticReview({...optimisticReview, feedback:safeReviewData.feedback}));
    // dispatch(setStatus(STATUSES.LOADING));
    dispatch(setReviewStatus(STATUSES.LOADING))

    console.log(reviewData, 'revData')

    try {
      const res = await fetch(`${apiUrl}/api/v1/product/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(reviewData),
      });
      const data = await res.json()
      dispatch(setStatus(STATUSES.SUCCESS))
      dispatch(setReviewStatus(STATUSES.SUCCESS))
      dispatch(confirmReview({tempId, serverReview:data.review}))
    } catch (e) {
        console.log(e.message)
        dispatch(rollbackReview(tempId))
        dispatch(setError(true))
        dispatch(setStatus(STATUSES.ERROR))

    }
  };
}

export function getRecommndedProduct(productId){
  return async function getRecommndedProductThunk (dispatch){
    try{
      dispatch(setStatus(STATUSES.LOADING))
      const res = await fetch(`${apiUrl}/api/v1/products/recommended/${productId}`,{credentials:"include"})
      const data = await res.json()
      dispatch(setRecommendedProd(data))
      dispatch(setStatus(STATUSES.SUCCESS))
    }catch(e){
      console.log(e.message)
      dispatch(setStatus(STATUSES.ERROR))
    }
  }
}

export const clrError = () => {
  return function clrErrorThunk(dispatch, getState) {
    dispatch(setError(false));
    dispatch(setProductDetails(null));
  };
};
