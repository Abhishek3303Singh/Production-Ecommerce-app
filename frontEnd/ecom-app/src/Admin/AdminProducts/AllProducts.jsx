import React from 'react'
import { useEffect } from 'react'
import { getAllProducts, clearErr } from '../../store/adminProductSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useAlert } from 'react-alert'
import './adminProducts.css'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom'
import SideBar from '../SideBar'
import {deleteProductAdmin, clearError, resetDelete} from '../../store/dropProduct'
const AllProducts = () => {
    // const productData = [{ image: 'image', name: 'laptop', id: '1233jklhjfku322432', price: 22333, stock: 10 },
    // { image: 'image', name: 'laptop', id: '1233jklhjfku322432', price: 22333, stock: 10 },
    // { image: 'image', name: 'laptop', id: '1233jklhjfku322432', price: 22333, stock: 10 },
    // { image: 'image', name: 'laptop', id: '1233jklhjfku322432', price: 22333, stock: 10 },
    // { image: 'image', name: 'laptop', id: '1233jklhjfku322432', price: 22333, stock: 10 },

    // ]
    const { resErr, products, status } = useSelector((state) => state.adminProducts)
    const {resError, deletedProduct,isDeleted} = useSelector((state)=>state.delete)
    


    const dispatch = useDispatch()
    const alert = useAlert()
    const navigate = useNavigate()
    useEffect(() => {
        if (resErr) {
            alert.error(products?.message)
            dispatch(clearErr())
        }
        dispatch(getAllProducts())
    }, dispatch, alert, resErr)
    function handleEdit(id) {
        navigate(`/admin/update/product/${id}`)
    }
    function handleDelete(id){
        dispatch(deleteProductAdmin(id))
    }
    useEffect(()=>{
        if(resError){
            alert.error(deletedProduct?.message)
            dispatch(clearError())
        }
        if(isDeleted){
            alert.success('Product Deleted successfully!')
            navigate('/admin/dashboard')
            dispatch(resetDelete())
        }
    })
    return (
        <>
            <div className="admin-product-main-container">
                <div className="admin-product-sidebar">
                    <SideBar/>
                </div>
                

                <div className="admin-products-container">
                    <header>Product Admin Panel</header>

                    <div className="product-table-container">
                        <table>
                            <thead>
                                <th>IMAGE</th>
                                <th>NAME</th>
                                <th>PRODUCT ID</th>
                                <th>PRICE</th>
                                <th>STOCK</th>
                                <th>UPDATE</th>
                                <th>DELETE</th>
                            </thead>
                            {products && products.map((val, key) => {
                                return (
                                    // <tbody key={key} className='table-row'>
                                    <tr key={key} className='table-row'>
                                        <td><img src={val.Image[0].url} alt="" /></td>
                                        <td style={val.Stock === 0 ? { color: 'red' } : { color: 'rgba(0, 0, 0, 0.59)' }}>{val.title}</td>
                                        <td style={val.Stock === 0 ? { color: 'red' } : { color: 'rgba(0, 0, 0, 0.59)' }}>{val._id}</td>
                                        <td style={val.Stock === 0 ? { color: 'red' } : { color: 'rgba(0, 0, 0, 0.59)' }}>{val.offerPrice}</td>
                                        <td style={val.Stock === 0 ? { color: 'red' } : { color: 'rgba(0, 0, 0, 0.59)' }}>{val.Stock}</td>
                                        <td> <button className='edit-admin-btn' onClick={() => handleEdit(val._id)}> <EditIcon /> Edit</button> </td>
                                        <td> <button onClick={()=>handleDelete(val._id)}><DeleteIcon /> Delete</button> </td>
                                    </tr>
                                    // </tbody>

                                )
                            })}

                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AllProducts