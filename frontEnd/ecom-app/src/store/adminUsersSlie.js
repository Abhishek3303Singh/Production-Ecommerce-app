const {createSlice} = require('@reduxjs/toolkit')
const STATUSES = Object.freeze({
    SUCCESSS:'idle',
    LOADING:'loading',
    ERROR:'error',
})

const adminUserSlice = createSlice({
    name:'Allusers',
    initialState:{
        users :[],
        userDetail:{},
        status :STATUSES.SUCCESSS,  
        resError :false,
        isDeleted:false,
        isUpdated:false,

    }, 
    reducers:{
        setUsers(state, action){
            state.users = action.payload
        },
        setStatus(state, action){
            state.status = action.payload
        },
        setError(state, action){
            state.resError = action.payload
        },
        setIsDelete(state, action){

            state.isDeleted = action.payload
        }, 
        setUsersDetail(state, action){
            state.userDetail = action.payload
        },
        setIsUpdated(state, action){
            state.isUpdated = action.payload
        }

    }
})
export const {setError, setStatus, setUsers, setIsDelete, setUsersDetail, setIsUpdated} = adminUserSlice.actions
export default adminUserSlice.reducer

// thunk call to get all users
export const getAllUsers = ()=>{
    return async function getAllUsersThunk(dispatch, getState){
        dispatch(setStatus(STATUSES.LOADING))
        try{
            const resData = await fetch('/api/v1/admin/allusers')
            const data = await resData.json()
            dispatch(setUsers(data))
            dispatch(setStatus(STATUSES.SUCCESSS))

        }
        catch(e){
            console.log(e.messsage)
            dispatch(setStatus(STATUSES.ERROR))
            dispatch(setError(true))
        }

    }
}
export const deleteUser=(id)=>{
    return async function deleteUserThunk(dispatch, getState){
        dispatch(setStatus(STATUSES.LOADING))
        try{

            const resData = await fetch(`/api/v1/admin/user/delete/${id}`,{
                method:'DELETE'
            })
            const data = await resData.json()
            console.log(data, 'delete-user-res')
            dispatch(setStatus(STATUSES.SUCCESSS))
            if(data.status==='success'){
                dispatch(setIsDelete(true))
            }
            else{
                dispatch(setIsDelete(false))
            }
            
        }
        catch(e){
            console.log(e.messsage)
            dispatch(setStatus(STATUSES.ERROR))
        }
    }
}
export const clearError = ()=>{
    return function clearErrorThunk(dispatch, getState){
        dispatch(setError(false))
        dispatch(setUsers(null))
    }
}

export const resetIsDelete = ()=>{
    return function  resetIsDeleteThunk(dispatch, getState){
        dispatch(setIsDelete(false))
    }
}

export const getUserDetail = (id)=>{
    return async function getUserDetailThunk(dispatch, getState){
        dispatch(setStatus(STATUSES.LOADING))
        try{
            const resData = await fetch(`/api/v1/admin/user/details/${id}`)
            const data = await resData.json()
            dispatch(setUsersDetail(data))
            // console.log(data, 'userDetail-response')
            dispatch(setStatus(STATUSES.SUCCESSS))

        }
        catch(e){
            console.log(e.messsage)
            dispatch(setStatus(STATUSES.ERROR))
            dispatch(setError(true))
        }

    }
}


export const updateUserRole = (id, name,email,phone, role)=>{
    return async function updateUserRoleThunk(dispatch, getState){
        dispatch(setStatus(STATUSES.LOADING))
        console.log(id,name,email,phone, role)
        try{
            const resData = await fetch(`/api/v1/admin/user/update/${id}`,
            {
                method:'PUT',
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                // body: myForm
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    role,
          
                  }),
              }
            
            )
            const data = await resData.json()
            // dispatch(setUsersDetail(data))
            console.log(data, 'userDetail-response')
            if(data.status==='success'){
                dispatch(setIsUpdated(true))
            }
            else{
                dispatch(setIsUpdated(false))
                
            }
            dispatch(setStatus(STATUSES.SUCCESSS))

        }
        catch(e){
            console.log(e.messsage)
            dispatch(setStatus(STATUSES.ERROR))
            dispatch(setError(true))
        }

    }
}

export const resetIsUpdated = ()=>{
    return function resetIsUpdatedThunk(dispatch, getState){
        dispatch(setIsUpdated(false))
    }
}
