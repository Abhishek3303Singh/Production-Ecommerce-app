const {createSlice} = require('@reduxjs/toolkit')
const apiUrl = process.env.REACT_APP_API_BASE_URL;
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
        state.products = action.payload.data.allProducts
        state.productsCount = action.payload.data.totalProduct
        state.responseStatus = action.payload.status
        state.itemPerPage = action.payload.data.itemPerPage
        state.filterProductcount = action.payload.data.filterProductcount
        },
        setStatus(state, action){
            state.status = action.payload
        }
    }

})
export const {setProduct, setStatus} =productSlide.actions;
export default productSlide.reducer

// Thunk 

export function getAllProducts(keyword='', currPage=1, price=[0, 50000], category, ratings, productType, brand, attributes){
   
    return async function getAllProductsThunk(dispatch, getState){
        
        dispatch(setStatus(STATUSES.LOADING))
        try{
            // console.log('Api Called')
            // let link = `${apiUrl}/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&raings[gte]=${ratings}`
            // if(category){
            //     link = `${apiUrl}/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&category=${category}`
            // }
            // if(productType){
            //     link = `${apiUrl}/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&category=${category}&productType=${productType}`
            // }
            // if(brand){
            //     link = `${apiUrl}/api/v1/products?keyword=${keyword}&page=${currPage}&price[gte]=${price[0]}&price[lte]=${price[1]}&category=${category}&productType=${productType}&brand=${brand}`
            // }

            const params = new URLSearchParams()
            if(keyword){
                params.append('keyword', keyword)
            }
            params.append('page', currPage)
            if(category){
                params.append('category', category)
            }
            if(productType){
                params.append('productType', productType)
            }
            if(brand){
                params.append('brand', brand)
            }

            // atriutes is an obj so i can append directlyinur 
            if(attributes && typeof attributes == 'object'){
                Object.entries(attributes).forEach(([key, val])=>{
                    params.append(`attributes.${key}`, val)
                })
            }

            params.append('price[gte', price[0])
            params.append('prie[lte]', price[1])
            if(ratings>0){
                params.append('ratings', ratings)
            }
            const link = `${apiUrl}/api/v1/products?${params.toString()}`;
           
            console.log(link, 'link')
            const res = await fetch(link, {credentials:'include'})
            const data = await res.json();
            console.log("searchedData",data)
    
            dispatch(setProduct(data))
            dispatch(setStatus(STATUSES.SUCCESS))
        }
        catch(err){
            console.log(err)
            dispatch(setStatus(STATUSES.ERROR))

        }
    }
} 