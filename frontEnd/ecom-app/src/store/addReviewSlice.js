const { createSlice } = require("@reduxjs/toolkit");
const apiUrl = process.env.REACT_APP_API_BASE_URL;
const STATUSES = Object.freeze({
  SUCCESS: "idle",
  LOADING: "loading",
  ERROR: "error",
});

const addReviewSlice = createSlice({
  name: "addReview",

  initialState: {
    reviews: [],
    status: STATUSES.SUCCESS,
    error: null
  },
  reducers: {
    // setReview(state, action) {
    //   state.review = action.payload;
    // },
    //  Add optimistic review instantly
    addOptimisticReview(state, action) {
      state.reviews.unshift(action.payload)
    },

    // Replace optimistic review with server review

    confirmRewiew(state, action) {
      const index = state.reviews.findIndex((r) => {
        r.tempId === action.payload.tempId
      });
      if (index !== -1) {
        state.reviews[index] = action.payload
      }
    },

    // Rollback if API fails
    rollBackReview(state,action){
      state.reviews = state.reviews.filter((r)=>{
        r.tempId !== action.payload
      })

    },

    setError (state,action){
      state.error = action.payload
    },

    setStatus(state, action) {
      state.status = action.payload;
    },
  },
});

export const { setReview, setStatus, addOptimisticReview, confirmRewiew, rollBackReview } = addReviewSlice.actions;
export default addReviewSlice.reducer;

// Thunk for Add Review;

export const addReview = ({ productId, review}) => {

  return async function addReviewThunk(dispatch, getState) {
    const tempId = review.tempId
    try {
      dispatch(setStatus(STATUSES.LOADING));
      console.log(review, 'review')
      const resData = await fetch(`${apiUrl}/api/v1//product/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          review
        }),
        
      });

      const data = await resData.json()
      // dispatch(setReview(data))
      dispatch(confirmRewiew({...data, tempId}))
      dispatch(setStatus(STATUSES.SUCCESS))
    } catch (e) {
      console.log(e.message);
      dispatch(rollBackReview(tempId))
      dispatch(setError(e.message))
      dispatch(setStatus(STATUSES.ERROR));
    }
  };
};
