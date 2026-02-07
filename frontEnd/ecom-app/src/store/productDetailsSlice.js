const {createSlice} = require('@reduxjs/toolkit')
const apiUrl = process.env.REACT_APP_API_BASE_URL;
export const STATUSES = Object.freeze({
    SUCCESS:"idle",
    LOADING:"loading",
    ERROR:"error"
})

const productDetailsSlide= createSlice({
    name:'productDetails',
    initialState:{
        product:{},
        status:STATUSES.SUCCESS,
        resErr:false
    },
    reducers:{
        setProductDetails(state, action){
        state.product = action.payload.reqProduct
        state.responseStatus = action.payload.status
        state.images = action.payload.reqProduct.Image
        },
        setStatus(state, action){
            state.status = action.payload
        },
        setError(state, action){
            state.resErr= action.payload
        }
    }

})
export const {setProductDetails, setStatus, setError} =productDetailsSlide.actions;
export default productDetailsSlide.reducer

// Thunk 

export function getProductDetails(id){
    return async function getAllProductsThunk(dispatch, getState){
        dispatch(setStatus(STATUSES.LOADING))
        try{
            // console.log('id', id)
            const res = await fetch(`${apiUrl}/api/v1/product/details/${id}`,{credentials:'include'})
            const data = await res.json();
            dispatch(setProductDetails(data))
            dispatch(setStatus(STATUSES.SUCCESS))

            if(data.status === 'failed'){
                dispatch(setError(true))

            }
        }
        catch(err){
            console.log(err)
            dispatch(setStatus(STATUSES.ERROR))
            dispatch(setError(true))

        }
    }
} 

export const clrError = ()=>{
    return function clrErrorThunk(dispatch, getState){
        dispatch(setError(false))
        dispatch(setProductDetails(null))
    }
}