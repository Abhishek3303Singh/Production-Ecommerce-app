import './homeproduct.css'
import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import ReactStars from 'react-rating-stars-component'
import 'animate.css'
import './homecss/home.css'
import { getPricing, inr, isSoldOut, getSizes } from '../../utils/productDisplay'

const HomeProducts = ({ product }) => {
    const { price, offer, off } = getPricing(product)
    const soldOut = isSoldOut(product)
    const sizes = getSizes(product)
    const shown = sizes.slice(0, 5)
    const hasVariants = product.variants?.length > 0
    const reviewed = product.reviewsCount > 0

    const options = {
        edit: false,
        color: 'rgb(20, 40, 20, 0.5)',
        activeColor: 'orange',
        size: window.innerHeight < 600 ? 10 : 25,
        value: product.ratings || 0,
        isHalf: true,
    }

    return (
        <Link className={`product-card${soldOut ? ' is-sold-out' : ''}`} to={`/product/${product._id}`}>
            {off > 0 && <p className="peroff-badge"><span>{off}%</span></p>}

            <img loading="lazy" src={product.Image?.[0]?.url} alt={product.title || product.name || 'Product'} />
            {soldOut && <span className="sold-out-tag">Sold out</span>}

            <p className="product-title">{product.title || ''}</p>
            <p className="char-limit">{product.name}</p>

            <div className="ratings">
                <div className="price-line">
                    <span className="product-price">{inr(offer)}</span>
                    {off > 0 && <span className="mrp">{inr(price)}</span>}
                </div>

                {sizes.length > 0 && (
                    <p className="card-sizes">
                        Sizes: {shown.join(' · ')}{sizes.length > shown.length && ` +${sizes.length - shown.length}`}
                    </p>
                )}

                {reviewed ? (
                    <>
                        <div className="star-ratings"><ReactStars {...options} /></div>
                        <h3><span className="review">({product.reviewsCount} Reviews)</span></h3>
                    </>
                ) : (
                    <span className="new-tag">New</span>
                )}
            </div>

            <span className="product-cart-btn">
                {soldOut ? 'Sold out' : hasVariants ? 'Select options' : 'View product'}
            </span>
        </Link>
    )
}

export default memo(HomeProducts)