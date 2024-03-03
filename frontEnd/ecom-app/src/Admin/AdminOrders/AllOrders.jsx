import React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAlert } from 'react-alert'
import './adminOrders.css'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom'
import SideBar from '../SideBar'
// import {deleteProductAdmin, clearError, resetDelete} from '../../store/dropProduct'
import {getAdminOrders, clrErr, deleteOrder, resetIsDeleted} from '../../store/allOrdersSlice'
// import { adminAllProducts } from '../../../../../backEnd/routeResponse/productResponse'
const AllOrders = () => {
    const {adminOrders, status, resError, isDeleted} = useSelector((state)=>state.allOrders)
    

    console.log(adminOrders, status, 'admin-orders')
    const dispatch = useDispatch()
    const alert = useAlert()
    const navigate = useNavigate()
    useEffect(() => {
        dispatch(getAdminOrders())
        if (resError) {
            alert.error(adminOrders?.message)
            dispatch(clrErr())
        }
        // dispatch(getAllProducts())
 
    }, [dispatch,  alert])
    function handleEdit(id) {
        navigate(`/admin/edit/order/${id}`)
    }
    function handleDelete(id){
        dispatch(deleteOrder(id))
    }
    useEffect(()=>{
        if(isDeleted){
            console.log('isDeleted running')
            alert.success('Product Deleted successfully!')
            navigate('/admin/dashboard')
            dispatch(resetIsDeleted())
        }
    }, [alert, dispatch, navigate, isDeleted])
    return (
        <>
            <div className="admin-product-main-container">
                <div className="admin-product-sidebar">
                    <SideBar/>
                </div>
                

                <div className="admin-products-container">
                    <header>Orders Admin Panel</header>

                    <div className="order-table-container">
                        <table>
                            <thead>
                                <th>ORDER ID</th>
                                <th>STATUS</th>
                                {/* <th>PRODUCT ID</th> */}
                                <th>ITEMS QTY</th>
                                <th>AMOUNT</th>
                                <th>ORDERED DATE</th>
                                <th>UPDATE</th>
                                <th>DELETE</th>
                            </thead>
                            {adminOrders && adminOrders?.orders?.map((val, key) => {
                                return (
                  
                                    <tr key={key} className='order-table-row'>
                              
                                        <td >{val._id}</td>
                                        <td >{val.orderStatus}</td>
                                        <td >{val.orderProduct.length}</td>
                                        <td>{val.totalPrice}</td>
                                        <td>{val.deliveredDate.split('T')[0]}</td>
                                        <td> <button className='edit-admin-btn' onClick={() => handleEdit(val._id)}> <EditIcon /> Edit</button> </td>
                                        <td> <button onClick={()=>handleDelete(val._id)}><DeleteIcon /> Delete</button> </td>
                                    </tr>
                                   

                                )
                            })}

                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AllOrders
