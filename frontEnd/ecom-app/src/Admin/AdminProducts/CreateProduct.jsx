import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router-dom'
import SideBar from '../SideBar'
import MetaData from '../../components/routes/MetaData'
import ProductForm from './ProductForm'
import { clearErr, createNewProduct, resetCreated } from '../../store/createProductSlice'
import './createProduct.css'

const CreateProduct = () => {
    const dispatch = useDispatch()
    const alert = useAlert()
    const navigate = useNavigate()
    const { resError, status, createProduct, isCreated } = useSelector((state) => state.createproduct)

    useEffect(() => {
        if (resError) {
            alert.error(createProduct?.message || 'Could not create the product')
            dispatch(clearErr())
        }
    }, [resError, createProduct, alert, dispatch])

    // Reacts to the store change itself, instead of checking right after dispatch
    useEffect(() => {
        if (isCreated) {
            alert.success('Product created successfully')
            dispatch(resetCreated())
            navigate('/admin/products')
        }
    }, [isCreated, alert, dispatch, navigate])

    return (
        <>
            <MetaData title="Admin-addProduct" />
            <div className="admin-create-product-main-container">
                <div className="admin-create-product-sidebar"><SideBar /></div>
                <div className="admin-add-product-container">
                    <header>Add Product Admin Panel</header>
                    <div className="admin-input-container">
                        <ProductForm
                            mode="create"
                            submitLabel="Create Product"
                            submitting={status === 'loading'}
                            onSubmit={(fd) => dispatch(createNewProduct(fd))}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateProduct