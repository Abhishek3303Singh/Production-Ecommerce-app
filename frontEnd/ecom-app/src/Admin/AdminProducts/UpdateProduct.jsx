import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAlert } from 'react-alert'
import { useNavigate, useParams } from 'react-router-dom'
import SideBar from '../SideBar'
import MetaData from '../../components/routes/MetaData'
import ProductForm from './ProductForm'
import { adminUpdateProduct, restIsUpdate, clrErr } from '../../store/updateProductSlice'
import './createProduct.css'

const apiUrl = process.env.REACT_APP_API_BASE_URL

const UpdateProduct = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const alert = useAlert()
    const navigate = useNavigate()
    const { resError, status, updateProduct, isUpdated } = useSelector((state) => state.update)

    const [product, setProduct] = useState(null)
    const [loadError, setLoadError] = useState('')

    useEffect(() => {
        let off = false
        setProduct(null)
        setLoadError('')
        fetch(`${apiUrl}/api/v1/product/details/${id}?view=0`, { credentials: 'include' })
            .then(async (r) => ({ ok: r.ok, json: await r.json() }))
            .then(({ ok, json }) => {
                if (off) return
                if (!ok) throw new Error(json.message || 'Product not found')
                setProduct(json.reqProduct)
            })
            .catch((e) => { if (!off) setLoadError(e.message) })
        return () => { off = true }
    }, [id])

    useEffect(() => {
        if (resError) {
            alert.error(updateProduct?.message || 'Could not update the product')
            dispatch(clrErr())
        }
    }, [resError, updateProduct, alert, dispatch])

    useEffect(() => {
        if (isUpdated) {
            alert.success('Product updated successfully')
            dispatch(restIsUpdate())
            navigate('/admin/products')
        }
    }, [isUpdated, alert, dispatch, navigate])

    return (
        <>
            <MetaData title="Admin-updateProduct" />
            <div className="admin-create-product-main-container">
                <div className="admin-create-product-sidebar"><SideBar /></div>
                <div className="admin-add-product-container">
                    <header>Update Product Admin Panel</header>
                    <div className="admin-input-container">
                        {loadError && <p className="pf-note pf-error">{loadError}</p>}
                        {!product && !loadError && <p className="pf-note">Loading product…</p>}
                        {product && (
                            <ProductForm
                                key={product._id}
                                mode="edit"
                                initial={product}
                                submitLabel="Save changes"
                                submitting={status === 'loading'}
                                onSubmit={(fd) => dispatch(adminUpdateProduct(id, fd))}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default UpdateProduct