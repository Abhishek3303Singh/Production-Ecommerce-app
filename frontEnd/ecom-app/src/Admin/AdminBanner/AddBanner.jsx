import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createNewBanner, clearErr, resetCreated } from '../../store/addBannerSlice'
import { useEffect, useState } from 'react'
import SideBar from '../SideBar'
import Loader from '../../components/layout/loader/Loader'
import MetaData from '../../components/routes/MetaData'
import './addbanner.css'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router-dom'


const AddBanner = () => {
    const dispatch = useDispatch()
    // const {reviews, status, resError} = useSelector((state)=>state.adminReviews)
    const { createBanner, status, resError, isCreated } = useSelector((state) => state.createBanner)
    const [image, setImage] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    
    const alert = useAlert()
    const navigate = useNavigate()
    // console.log(reviews, 'reviews')
    useEffect(() => {
        if (resError) {
            alert.error(createBanner?.message)
        }
    }, [])



    function handleImage(e) {
        const files = Array.from(e.target.files)
        setImage([])
        setImagePreview([])
        files.forEach((file) => {
            const reader = new FileReader()
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagePreview((old) => [...old, reader.result])
                    setImage((old) => [...old, reader.result])
                }
            }
            reader.readAsDataURL(file)
        })
    }
    function handleSubmit() {
        let formData = new FormData()
        image.forEach((file) => {
            formData.append("Image", file)
        })
        dispatch(createNewBanner(formData))

    }

    useEffect(() => {
        if (isCreated) {
            alert.success('Banner added successfully!!')
            dispatch(resetCreated())
            navigate('/admin/dashboard')

        }
    }, [alert, isCreated, dispatch])

    return (
        <>
            <div className="admin-reviews-container">
                <div className="reviews-sidebar">
                    <SideBar />
                </div>

                <div className='admin-reviews'>
                    <header>
                        Add Banner Panel
                    </header>
                    <div className="product-review-input">
                        <h3>Add Banner Image</h3>
                        <div>
                            <input type="file" accept='image/*' multiple onChange={handleImage} />
                        </div>

                        <div className="banner-image-preview">
                            {
                                imagePreview.map((item, index) => (
                                    <img width={100} height={50} style={{ padding: '1vmax' }} src={item} key={index} alt="preview-image" />
                                ))
                            }
                        </div>

                        <div className='product-review-container'>
                            <button onClick={handleSubmit}>Add Banner</button>
                        </div>

                     

                    </div>

                </div>

            </div>



        </>
    )
}




export default AddBanner