import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getReviews, deleteReviews, restIsdeleted } from '../../store/adminReviewsSlice'
import { useEffect, useState } from 'react'
import SideBar from '../SideBar'
import Loader from '../../components/layout/loader/Loader'
import MetaData from '../../components/routes/MetaData'
import DeleteIcon from '@mui/icons-material/Delete';
import './allreviews.css'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router-dom'


const AllReviews = () => {
    const dispatch = useDispatch()
    // const {reviews, status, resError} = useSelector((state)=>state.adminReviews)
    const { reviews, status, resError, isDeleted } = useSelector((state) => state.adminReviews)
    const [productId, setProductId] = useState('')
    const alert = useAlert()
    const navigate = useNavigate()
    console.log(reviews, 'reviews')
    useEffect(() => {
        if (resError) {
            alert.error(reviews.message)
        }
    }, [])

    const handleDelete = (id) => {
        console.log(id, 'dispatch id')
        dispatch(deleteReviews(id, productId))
        
    }
    function handleSubmit() {
        dispatch(getReviews(productId))

    }
    useEffect(()=>{
        if(isDeleted)
        {
            alert.success('Review successfully Deleted')
            dispatch(restIsdeleted())
            navigate('/admin/dashboard')
            
        }
    },[alert, isDeleted,dispatch])
    let srNo = 0

    return (
        <>
            <div className="admin-reviews-container">
                <div className="reviews-sidebar">
                    <SideBar />
                </div>

                <div className='admin-reviews'>
                    <header>
                        Product Reviews Admin Panel
                    </header>
                    <div className="product-review-input">
                        <h3>Enter Product Id</h3>
                        <div>
                            <input type="text" placeholder='Enter Product Id' onChange={(e) => setProductId(e.target.value)} />
                        </div>

                        <div className='product-review-container'>
                            <button onClick={handleSubmit}>Get Reviews</button>
                        </div>





                    </div>
                    <div className="all-reviews-container">

                        <table>
                            <thead>
                                <th>SrNo.</th>
                                <th>REVIEW ID</th>
                                <th>USER NAME</th>
                                <th>COMMENT</th>
                                <th>RATING</th>
                                <th>DELETE</th>

                            </thead>
                            {reviews && reviews?.customerReview?.map((val, key) => {
                                return (
                                    <>



                                        <tr key={key} className='reviews-table-row'>
                                            <td >{srNo += 1}</td>
                                            <td >{val._id}</td>
                                            <td >{val.name}</td>
                                            <td >{val.feedback}</td>
                                            <td style={val.rating >= 2 ? { color: 'rgba(2, 200, 90, 1)' } : { color: 'red' }}>{val.rating}</td>

                                            {/* <td> <button className='edit-admin-btn' onClick={() => handleEdit(val._id)}> <EditIcon /> Edit</button> </td> */}
                                            <td> <button className='rev-del-btn' onClick={() => handleDelete(val._id)}><DeleteIcon /> Delete</button> </td>
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

export default AllReviews
