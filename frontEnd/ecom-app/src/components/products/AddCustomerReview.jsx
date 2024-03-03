import React from 'react'
import './reviewCss/addReview.css'
import { useState } from 'react'
import Rating from "@mui/material/Rating";
const AddCustomerReview = () => {
    const [review, setReview] = useState('');
    const [ratings, setRatings] = useState(0);
    return (
        <>
            <div className="add-review-container">
                <textarea name="" id="" cols="60" rows="5" onChange={(e) => setReview(e.target.value)}></textarea>
                <h2>{review}</h2>
                <Rating
                    name="simple-controlled"
                    value={ratings}
                    onChange={(event, newValue) => {
                        setRatings(newValue);
                    }}
                />
                <h1>{ratings}</h1>
            </div>
        </>
    )
}

export default AddCustomerReview