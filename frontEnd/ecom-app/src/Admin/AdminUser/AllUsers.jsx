import React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAlert } from 'react-alert'
import './allusers.css'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom'
import SideBar from '../SideBar'
import {getAllUsers,deleteUser, resetIsDelete, clearError} from '../../store/adminUsersSlie'
import Loader from '../../components/layout/loader/Loader';
const AllUsers = () => {
    // console.log(adminOrders, status, 'admin-orders')
    const dispatch = useDispatch()
    const alert = useAlert()
    const navigate = useNavigate()
    const {users, status, resError, isDeleted} = useSelector((state)=>state.Allusers)
    useEffect(() => {
        console.log('seEffect is running')
        dispatch(getAllUsers())
        // dispatch(getAdminOrders())
       
        
        
        if (resError) {
            alert.error(users?.message)
            dispatch(clearError())
        }
        // dispatch(getAllProducts())

    }, [dispatch, alert])
    function handleEdit(id) {
        navigate(`/admin/edit/user/${id}`)
    }
    function handleDelete(id) {
        dispatch(deleteUser(id))
    }
    useEffect(() => {
        if (isDeleted) {
            console.log(isDeleted, 'isDeleted block is running !')
            alert.success('User Deleted successfully!')
            navigate('/admin/dashboard')
            dispatch(resetIsDelete())
        }
    }, [alert, dispatch, navigate, isDeleted])
    let srNo = 0;
    if(status=='loading'){
        return(
            <Loader/>
        )
    }
    return (
        <>
            <div className="admin-product-main-container">
                <div className="admin-product-sidebar">
                    <SideBar />
                </div>


                <div className="admin-products-container">
                    <header>Users Admin Panel</header>

                    <div className="users-table-container">
                        <table>
                            <thead>
                                <th>SrNo.</th>
                                <th>USER ID</th>
                                <th>EMAIL</th>
                                {/* <th>PRODUCT ID</th> */}
                                <th>PHONE</th>
                                <th>ROLE</th>
                                <th>CREATED-AT</th>
                                <th>UPDATE</th>
                                <th>DELETE</th>

                            </thead>
                            {users && users?.users?.map((val, key) => {
                                return (
                                    <>
                                    
                                    
                                    
                                    <tr key={key} className='users-table-row'>
                                        <td >{srNo+=1}</td>
                                        <td >{val._id}</td>
                                        <td >{val.email}</td>
                                        <td >{val.phone}</td>
                                        <td style={val.role==='Admin'?{color:'rgba(2, 200, 90, 1)'}:{color:'red'}}>{val.role}</td>
                                        <td>{val.createdAt.split('T')[0]}</td>
                                       
                                        <td> <button className='edit-admin-btn' onClick={() => handleEdit(val._id)}> <EditIcon /> Edit</button> </td>
                                        <td> <button onClick={() => handleDelete(val._id)}><DeleteIcon /> Delete</button> </td>
                                    </tr>
                                    </>


                                )
                            })}

                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AllUsers
