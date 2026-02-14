import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './recentlyViewed.css'



const RecentlyViewedSlider = () => {
    const [products, setProducts] = useState([])
    const sliderRef = useRef()
    const navigate = useNavigate()

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("recentlyViewed"))
        setProducts(stored)
    }, [])

    const scrollLeft = () => {
        sliderRef.current.scrollBy({
            left: -300,
            behaviour: 'smooth'
        })
    }
    const scrollRight = () => {
        sliderRef.current.scrollBy({
            left: 300,
            behaviour: 'smooth'
        })
    }
    if(!products?.length){
        return null
    }
    // console.log(products[0]._id, 'recently viewed id ')
    return (
        <div className="rv-container">
          <div className="rv-header">
            <h2>Recently Viewed</h2>
            <div className="rv-buttons">
              <button className="rv-btn-left" onClick={scrollLeft}>‹</button>
              <button className='rv-btn-right' onClick={scrollRight}>›</button>
            </div>
          </div>
    
          <div className="rv-slider" ref={sliderRef}>
            {products.map((item) => (
              <div
                key={item._id}
                className="rv-card"
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <img src={item.thumbnail} alt={item.title} />
                <p>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      );
}

export default RecentlyViewedSlider