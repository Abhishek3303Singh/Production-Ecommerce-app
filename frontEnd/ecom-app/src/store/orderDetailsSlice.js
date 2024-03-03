const {createSlice} = require('@reduxjs/toolkit')
const STATUSES = Object.freeze({
    SUCCESS:'idle',
    LOADING:'loading',
    ERROR:'error'
})

const orderDetailsSlice = createSlice({
    name:'orderDetails',
    initialState:{
        order:{},
        status:STATUSES.SUCCESS,
        resError:false,
    },
    reducers:{
        setOrder(state, action){
            state.order= action.payload;
        },
        setStatus(state, action){
            state.status=action.payload
        },
        setError(state, action){
            state.resError = action.payload;
        }

    }
    

})
export const {setOrder, setStatus, setError} = orderDetailsSlice.actions;
export default orderDetailsSlice.reducer;

// Thunk to get Order Details

export const getOrderDetails = (id)=>{
    return async function getOrderDetailsThunk(dispatch, getState){
        dispatch(setStatus(STATUSES.LOADING))
        try{
           
            const resData =  await fetch(`/api/v1//order/${id}`)
            const data = await resData.json()
            dispatch(setOrder(data))
            dispatch(setStatus(STATUSES.SUCCESS))

            if(data.status=='failed'){
                dispatch(setError(true))
            }


        }
        catch(e){
            console.log(e.message)
            dispatch(setStatus.ERROR)
        }
    }
}

export const clearError = ()=>{
    return function clearErrorThunk(dispatch, getState){
        dispatch(setOrder(null))
        dispatch(setError(false))
    }
}