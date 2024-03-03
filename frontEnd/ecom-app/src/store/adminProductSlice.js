const {createSlice} = require('@reduxjs/toolkit')
const STATUSES = Object.freeze({
    SUCCESS:'idle',
    LOADING:'loading',
    ERROR:'error'
})

const adminProductSlice = createSlice({
    name:'adminProducts',
    initialState:{
        products:[],
        status:STATUSES.SUCCESS,
        resErr:false
    },
    reducers:{
        setProducts(state, action){
            state.products= action.payload
        },
        setStatus(state, action){
            state.status = action.payload
        },
        setError(state, action){
            state.resErr= action.payload
        }
    }
})

export const {setError, setProducts, setStatus} = adminProductSlice.actions
export default adminProductSlice.reducer

// Thunk For 

export function getAllProducts(){
    return async function getAllProductsTnuk(dispatch, getState){
        dispatch(setStatus(STATUSES.LOADING))
        try{
            const resData = await fetch('/api/v1/admin/products');
            const data = await resData.json()
            dispatch(setProducts(data.totalProduct))
            dispatch(setStatus(STATUSES.SUCCESS))
            if(data.status=='failed'){
                dispatch(setError(true))
            }

        }
        catch(e){
            console.log(e.message)
            dispatch(setStatus(STATUSES.ERROR))
            dispatch(setError(true))
        }
    }
}

export  function clearErr(){
    return function clearErrThunk(dispatch, getState){
        dispatch(setError(false))
        dispatch(setProducts(null))
    }

}