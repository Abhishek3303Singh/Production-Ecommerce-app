const {createSlice} = require('@reduxjs/toolkit')
export const STATUSES = Object.freeze({
    SUCCESS:"idle",
    LOADING:"loading",
    ERROR:"error"
})

const productSlide= createSlice({
    name:'product',
    initialState:{
        products:[],
        status:STATUSES.SUCCESS
    },
    reducers:{
        setProduct(state, action){
        state.products = action.payload.allProducts
        state.productsCount = action.payload.totalProduct
        state.responseStatus = action.payload.status
        state.itemPerPage = action.payload.itemPerPage
        state.filterProductcount = action.payload.filterProductcount
        },
        setStatus(state, action){
            state.status = action.payload
        }
    }

})
export const {setProduct, setStatus} =productSlide.actions;
export default productSlide.reducer

// Thunk 

export function getAllProducts(keyword='', currPage=1, price=[0, 50000], category, ratings){
   
    return async function getAllProductsThunk(dispatch, getState){
        
        dispatch(setStatus(STATUSES.LOADING))
        try{
            // console.log('keywordSlice', keyword)
            let link = `/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&raings[gte]=${ratings}`
            if(category){
                link = `/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&category=${category}`
            }
            const res = await fetch(link)
            const data = await res.json();
            // console.log("searchedData",data)
    
            dispatch(setProduct(data))
            dispatch(setStatus(STATUSES.SUCCESS))
        }
        catch(err){
            console.log(err)
            dispatch(setStatus(STATUSES.ERROR))

        }
    }
} 