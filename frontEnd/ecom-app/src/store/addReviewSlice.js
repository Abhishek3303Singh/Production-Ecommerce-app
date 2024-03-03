const { createSlice } = require("@reduxjs/toolkit");
const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const addReviewSlice = createSlice({
  name: "addReview",

  initialState: {
    review: {},
    status: STATUSES.SUCCESS,
  },
  reducers: {
    setReview(state, action) {
      state.review = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
  },
});

const { setReview, setStatus } = addReviewSlice.actions;
export default addReviewSlice.reducer;

// Thunk for Add Review;

export const addReview = (review) => {
    
  return async function addReviewThunk (dispatch, getState) {
    
    try {
        dispatch(setStatus(STATUSES.LOADING));
      console.log(review, 'review')
      const resData = await fetch("/api/v1//product/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          review
        }),
      });

      const data = await resData.json()
      dispatch(setReview(data))
      dispatch(setStatus(STATUSES.SUCCESS))
    } catch (e) {
      console.log(e.message);
      dispatch(setStatus(STATUSES.ERROR));
    }
  };
};
