import React from 'react'
import './recommended.css'

const RecommendedProdCard = ({ product }) => {
    // console.log(product, 'recomCard')
    return (
        <>
            <div className="rec-card">
                <div className="rec-img-container">
                    <img
                        src={product?.Image?.[0]?.url}
                        alt={product?.name}
                    />
                </div>

                <div className="rec-details">
                    <h3 className="rec-title">{product?.name}</h3>

                    <div className="rec-rating">
                        <span className="rating-box">
                            {product?.ratings || 0} ★
                        </span>
                        <span className="review-count">
                            ({product?.reviewsCount || 0})
                        </span>
                    </div>

                    <div className="rec-price">
                        ₹{product?.offerPrice || product?.price}
                    </div>
                </div>
            </div>

        </>
    )
}

export default RecommendedProdCard