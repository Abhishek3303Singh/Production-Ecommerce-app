import React from 'react'
import SideBar from '../SideBar'
import './edituser.css'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {getUserDetail, clearError,updateUserRole,resetIsUpdated} from '../../store/adminUsersSlie'
import { useParams } from 'react-router-dom'
import { useAlert } from 'react-alert'
import Loader from '../../components/layout/loader/Loader'
import { useNavigate } from 'react-router-dom'

const EditUser = () => {
    const dispatch = useDispatch()
    const alert = useAlert()
    const {id} = useParams()
    const navigate = useNavigate()
    const[role, setRole] = useState('')
    const {userDetail, status, resError, isUpdated} = useSelector((state)=>state.Allusers)
    const[userName, setUserName] = useState('')
    const[userEmali, setUserEmail] = useState('')
    const[userPhone, setUserPhone] = useState(0)


    
    console.log(role, 'role')
    useEffect(()=>{
        if(id !== userDetail?.user?._id){
            dispatch(getUserDetail(id))

        }
        else{
            setUserName(userDetail&& userDetail?.user?.name)
            setUserEmail(userDetail&& userDetail?.user?.email)
            setUserPhone(userDetail&& userDetail?.user?.phone)
        }

        if(resError){
            alert.error(userDetail.message)
            dispatch(clearError())
        }
      
    }, [dispatch, alert,id,userDetail,userDetail?.user ])

    const handleUpdate=()=>{
        dispatch(updateUserRole(id, userName, userEmali, userPhone, role))
        if(isUpdated){
            dispatch(resetIsUpdated())
            navigate('/admin/dashboard')
            alert.success('User Updated successfully')
           

        }
    }
    if(status === 'loading'){
        <Loader/>
    }
    return (
        <>
            <div className="admin-user-main-container">
                <div className="user-sidebar">
                    <SideBar/>
                </div>
                <div className="admin-user-container">
                    <header>
                        Edit User Admin Panel
                    </header>

                    <div className="admin-user-details-container">
                        <div className="user-container">
                            <div className="user-profile-container">
                                <span>{userDetail&& userDetail?.user?.name.split('')[0]}</span>
                            </div>
                            <div className='user-detail'>
                            <h3>Name</h3>
                            <p>{userDetail&& userDetail?.user?.name}</p>
                            <h3>Email</h3>
                            <p>{userDetail&& userDetail?.user?.email}</p>
                            <h3>Phone No</h3>
                            <p>{userDetail&& userDetail?.user?.phone}</p>
                            <h3>Role</h3>
                            <p>{userDetail&& userDetail?.user?.role}</p>
                            <h3>Created At</h3>
                            <p>{userDetail&& userDetail?.user?.createdAt.split('T')[0]}</p>

                            </div>
                           
                        </div>
                        <div className="update-user-container">
                            <h2>Change User Role</h2>
                            <label htmlFor="">Name</label>
                            <input type="text" value={userName} onChange={(e)=>setUserName(e.target.value)} />
                            <label htmlFor="">Email</label>

                            <input type="text" value={userEmali} onChange={(e)=>setUserEmail(e.target.value)} />
                            <label htmlFor="">Phone</label>

                            <input type="number" value={userPhone} onChange={(e)=>setUserPhone(e.target.value)} />
                            <select name="" id="" onChange={(e)=>setRole(e.target.value)}>
                                <option>Choose Role</option>
                                <option value="Admin">Admin</option>
                                <option value='User'>User</option>
                            </select>
                            <div className='update-user-btn'>
                            <button onClick={handleUpdate}>Update</button>
                            </div>

                        </div>


                    </div>

                </div>
            </div>


        </>
    )
}

export default EditUser
