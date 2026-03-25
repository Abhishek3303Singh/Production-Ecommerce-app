import React from 'react'
import SideBar from '../SideBar'
import './createProduct.css'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MetaData from '../../components/routes/MetaData'

import { clearErr, createNewProduct, resetCreated } from '../../store/createProductSlice'
import { useAlert } from 'react-alert'
import { useNavigate } from 'react-router-dom'
const CreateProduct = () => {
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
    const [keyword, setKeyword] = useState('');
    const [searchKeywords, setSearchKeywords] = useState([]);

    const dispatch = useDispatch();
    const alert = useAlert()
    const navigate = useNavigate()
    const { resError, status, createProduct, isCreated } = useSelector((state) => state.createproduct)

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

    useEffect(() => {
        if (resError) {
            // console.log(createProduct, 'Create-Productc response')
            alert.error(createProduct.message)
            dispatch(clearErr())
        }

        // alert.success('product created successfully')a
    }, [dispatch, alert, resError])
    // console.log(image, 'product Image')



    const handleProductImage = (e) => {
        const files = Array.from(e.target.files)
        // console.log(files, 'Files')
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

    // const handleProductImage = (e) => {
    //     setImage([...e.target.files])
    // }
    const handleAddKeyword = () => {
        if (keyword.trim() === '') {
            alert.error('Please enter a keyword')
            return
        }
        if (searchKeywords.includes(keyword.trim().toLowerCase())) {
            alert.error('Keyword already exists')
            return
        }
        setSearchKeywords([...searchKeywords, keyword.trim().toLowerCase()])
        setKeyword('')
    }
    const handleRemoveKeyword = (keywordToRemove) => {
        setSearchKeywords(searchKeywords.filter(k => k !== keywordToRemove))
    }
    const handleKeywordKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddKeyword()
        }
    }
    function addProductSubmitHandler(e) {
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
        formData.set('searchKeywords', JSON.stringify(searchKeywords))
        image.forEach((file) => {
            formData.append("Image", file)
        })

        // console.log(formData.get('image'), 'formDATa')
        dispatch(createNewProduct(formData))
        if (isCreated) {
            console.log('running')
            alert.success('product created successfully')
            dispatch(resetCreated())
            navigate('/admin/dashboard')


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
                        Add Product Admin Panel
                    </header>
                    <div className="admin-input-container">
                        <form encType='multipart/form-data' className='add-product-form' onSubmit={addProductSubmitHandler} >
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
                                    <select name="" id="" onChange={(e) => setCategory(e.target.value)}>
                                        <option value="">Choose Category</option>
                                        {categories.map((item) => (
                                            <option key={item} value={item} >{item}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Search Keywords Section */}
                            <div className="search-keywords-section">
                                <label htmlFor="search-keywords">Search Keywords</label>
                                <p className="keyword-help-text">
                                    Add keywords to help users find this product in search (e.g., "wireless", "bluetooth", "fitness", "smartwatch")
                                </p>
                                <div className="keyword-input-container">
                                    <input
                                        type="text"
                                        id="search-keywords"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        onKeyPress={handleKeywordKeyPress}
                                        placeholder="Add search keywords.."
                                    />
                                    <button type="button" className="add-keyword-btn" onClick={handleAddKeyword}>
                                        Add
                                    </button>
                                </div>

                                {/* Horizontal Keywords List */}
                                {searchKeywords.length > 0 && (
                                    <div className="keywords-list-container">
                                        <div className="keywords-list">
                                            {searchKeywords.map((kw, index) => (
                                                <div key={index} className="keyword-tag">
                                                    <span className="keyword-text">{kw}</span>
                                                    <button
                                                        type="button"
                                                        className="remove-keyword-btn"
                                                        onClick={() => handleRemoveKeyword(kw)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="keyword-count">
                                            {searchKeywords.length} keyword{searchKeywords.length !== 1 ? 's' : ''} added
                                        </div>
                                    </div>
                                )}
                            </div>


                            <div>
                                <label htmlFor="descriptions">Descriptions</label> <br />
                                <textarea name="" id="descriptions" cols="75" rows="5" onChange={(e) => setDescription(e.target.value)}></textarea>
                            </div>

                            <div className='create-product-image'>
                                <label htmlFor="product-image">Image</label> <br />
                                <input type="file" name="productImage" id="product-image" accept='image/*' multiple onChange={handleProductImage} />
                            </div>





                            <div className="product-image-preview">
                                {
                                    imagePreview.map((item, index) => (
                                        <img width={100} height={100} style={{ padding: '1vmax' }} src={item} key={index} alt="preview-image" />
                                    ))
                                }
                            </div>






                            <div className="product-submit-btn">
                                <button id='submit-btn' type='submit' >Create Product</button>
                            </div>



                        </form>


                    </div>
                </div>
            </div>

        </>
    )
}

export default CreateProduct
