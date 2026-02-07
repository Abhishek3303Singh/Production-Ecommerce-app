const {createSlice} = require('@reduxjs/toolkit')
const apiUrl = process.env.REACT_APP_API_BASE_URL;
const STATUSES = Object.freeze({
    SUCCESS:'idle',
    LOADING:'loading',
    ERROR:'error',
})

const adminReviewsSlice  = createSlice({
    name:'adminReviews',
    initialState:{
        reviews:{},
        status:STATUSES.SUCCESS,
        resError:false,
        isDeleted:false
    },
    reducers:{
        setReviews(state, action){
            state.reviews = action.payload
        },
        setStatus(state, action){
            state.status = action.payload
        },
        setError(state, action){
            state.resError= action.payload
        },
        setIsDeleted(state, action){
            state.isDeleted=action.payload
        }
    }
})
export const {setStatus, setError, setReviews, setIsDeleted} = adminReviewsSlice.actions
export default adminReviewsSlice.reducer

// thunk for getting reviews of product
export const getReviews = (id)=>{
    return async function getReviewsThunk(dispatch, getState){
        dispatch(setStatus(STATUSES.LOADING))
        try{
            const resData = await fetch(`${apiUrl}/api/v1/product/review/all?id=${id}`, {credentials:'include'})
            const data = await resData.json()
           
            console.log(data, 'res-data')
            if(data.status=='success'){
                dispatch(setError(false))
                dispatch(setReviews(data))

            }
            // dispatch(setStatus(STATUSES.SUCCESS))

        }
        catch(e){
            console.log(e.message)
            dispatch(setStatus(STATUSES.ERROR))

        }
    } 
}

// Thunk for Delete Reviews
export const deleteReviews = (reviewId, productId)=>{
    return async function deleteReviewsThunk(dispatch, getState){
        dispatch(setStatus(STATUSES.LOADING))
        try{
            console.log(reviewId, 'review id')
            const resData = await fetch(`${apiUrl}/api/v1/product/review/delete?id=${reviewId}&productId=${productId}`,{
                method:'DELETE',
                credentials:"include"
            })
            const data = await resData.json()
           
            console.log(data, 'delete-response')
            if(data.status=='success'){
                dispatch(setError(false))
                dispatch(setIsDeleted(true))

            }
            // dispatch(setStatus(STATUSES.SUCCESS))

        }
        catch(e){
            console.log(e.message)
            dispatch(setStatus(STATUSES.ERROR))

        }
    } 
}

export function restIsdeleted(){
    return function restIsdeletedThunk(dispatch, getState){
        dispatch(setIsDeleted(false))
    }
}