import React from 'react'
import SideBar from '../SideBar'
import './createProduct.css'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MetaData from '../../components/routes/MetaData'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router-dom'
import {adminUpdateProduct,restIsUpdate,clrErr} from '../../store/updateProductSlice'
import {getProductDetails, clrError as detailsErr} from '../../store/productDetailsSlice'
import { useParams } from 'react-router-dom'
const UpdateProduct = () => {
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [brand, setBrand] = useState('');
    const [price, setPrice] = useState(0);
    const [offerPrice, setOfferPrice] = useState(0);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState(0);
    const [image, setImage] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [oldImage, setOldImage] = useState([])

    const dispatch = useDispatch();
    const alert = useAlert()
    const navigate = useNavigate()
    const {id} = useParams()
    const { resError:updatError, status, updateProduct, isUpdated } = useSelector((state) => state.update)
    const {product, resErr} = useSelector((state)=>state.productDetails)

    useEffect(()=>{
        if(product && product._id !== id){
            dispatch(getProductDetails(id))
        }
       
  
        setName(product?.name)
        setTitle(product?.title)
        setBrand(product?.brand)
        setPrice(product?.price)
        setOfferPrice(product?.offerPrice)
        setCategory(product?.category)
        setDescription(product?.description)
        setStock(product?.Stock)
        setOldImage(product?.Image)
        if(resErr){
            alert.error(product?.message)
            dispatch(detailsErr())
        }

        if(updatError){
            alert.error(updateProduct?.message)
            dispatch(clrErr())
        }



    },[ id ,dispatch,resErr,alert, product, restIsUpdate, updatError])

    const categories = [
        'SmartPhones',
        'Electronics',
        'Laptop',
        'Camera',
        'Music',
        'Cricket',
        'Football',
        'Gym',
        'Yoga',
        'Top',
        'Bottom',
        'Footwear',
        'Others'
    ]

    // useEffect(() => {
    //     if (resError) {
    //         // console.log(createProduct, 'Create-Productc response')
    //         alert.error(createProduct.message)
    //         dispatch(clearErr())
    //     }

    //     // alert.success('product created successfully')a
    // }, [dispatch, alert, resError])
    // console.log(image, 'product Image')



    const handleProductImage = (e) => {
        const files = Array.from(e.target.files)
        // console.log(files, 'Files')
        setImage([])
        setImagePreview([])
        setOldImage([])
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

    // const handleProductImage = (e) => {
    //     setImage([...e.target.files])
    // }


    function updateProductSubmitHandler(e) {
        e.preventDefault()
        console.log(image, 'image')
        let formData = new FormData()
        formData.set('name', name)
        formData.set('title', title)
        formData.set('brand', brand)
        formData.set('price', price)
        formData.set('offerPrice', offerPrice)  
        formData.set('category', category)
        formData.set('description', description)
        formData.set('Stock', stock)
        image.forEach((file) => {
            formData.append("Image", file)
        })

        // console.log(formData.get('image'), 'formDATa')
        dispatch(adminUpdateProduct(id,formData))
        // if (isCreated) {
        //     console.log('running')
        //     alert.success('product created successfully')
        //     dispatch(resetCreated())
        //     navigate('/admin/dashboard')
            

        // }
        if(isUpdated){
            alert.success('Product Updated Successfully')

            navigate('/admin/dashboard')
            dispatch(restIsUpdate())
        }

    }

    return (
        <>
            <MetaData title='Admin-addProduct' />
            <div className="admin-create-product-main-container">
                <div className="admin-create-product-sidebar">
                    <SideBar />

                </div>
                <div className="admin-add-product-container">
                    <header>
                        Update Product Admin Panel
                    </header>
                    <div className="admin-input-container">
                        <form encType='multipart/form-data' className='add-product-form' onSubmit={updateProductSubmitHandler} >
                            <div>
                                <label htmlFor="product-name">Name</label> <br />
                                <input type="text" name="" value={name} id="product-name" onChange={(e) => setName(e.target.value)} />
                            </div>

                            <div className="half-input-container">
                                <div>
                                    <label htmlFor="product-title">Title</label> <br />
                                    <input type="text" value={title} id="product-title" onChange={(e) => setTitle(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="product-brand">Brand</label> <br />
                                    <input type="text" name="" value={brand} id="product-brand" onChange={(e) => setBrand(e.target.value)} />
                                </div>
                            </div>

                            <div className="half-input-container">
                                <div>
                                    <label htmlFor="product-price">Price</label> <br />
                                    <input type="number" name="" value={price} id="product-price" onChange={(e) => setPrice(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="product-offer-price">Offer Price</label> <br />
                                    <input type="number" name="" value={offerPrice} id="product-offer-price" onChange={(e) => setOfferPrice(e.target.value)} />
                                </div>
                            </div>


                            <div className="half-input-container">
                                <div>
                                    <label htmlFor="product-stock">Stock</label> <br />
                                    <input type="number" name=" " value={stock} id="product-stock" onChange={(e) => setStock(e.target.value)} />
                                </div>
                                <div>
                                    <label htmlFor="">Category</label> <br />
                                    <select value={category} name="" id="" onChange={(e) => setCategory(e.target.value)}>
                                        <option value="">Choose Category</option>
                                        {categories.map((item) => (
                                            <option key={item} value={item} >{item}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>


                            <div>
                                <label htmlFor="descriptions">Descriptions</label> <br />
                                <textarea value={description} name="" id="descriptions" cols="75" rows="5" onChange={(e) => setDescription(e.target.value)}></textarea>
                            </div>

                            <div className='create-product-image'>
                                <label htmlFor="product-image">Image</label> <br />
                                <input type="file" name="productImage" id="product-image" accept='image/*' multiple onChange={handleProductImage} />
                            </div>

                            {/* <div className='create-product-image'>
                                <label htmlFor="product-image">Image</label> <br />
                                <input type="file" name="productImage" id="product-image"  multiple onChange={(e)=>setImage(e.target.value)} />
                            </div> */}



                            <div className="product-image-preview">
                                {
                                    imagePreview.map((item, index) => (
                                        <img width={100} height={100} style={{ padding: '1vmax' }} src={item} key={index} alt="preview-image" />
                                    ))
                                }
                            </div>
                            
                            <div className="product-image-preview">
                                {
                                    oldImage?.map((item, index) => (
                                        <img width={100} height={100} style={{ padding: '1vmax' }} src={item?.url} key={index} alt="preview-image" />
                                    ))
                                }
                            </div>



                            {/* <div  className="product-image-preview">
                                {image?.map((file, index) => (
                                    <img
                                        key={index}
                                        src={URL.createObjectURL(file)}
                                        alt={`Uploaded image ${index}`}
                                        style={{ width: '200px', height: '200px', margin: '10px' }}
                                    />
                                ))}
                            </div> */}


                            <div className="product-submit-btn">
                                <button id='submit-btn' type='submit' >Update</button>
                            </div>



                        </form>


                    </div>
                </div>
            </div>

        </>
    )
}

export default UpdateProduct

