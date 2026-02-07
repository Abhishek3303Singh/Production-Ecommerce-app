import React from 'react'
import jump from '../../images/jump.png'
import watch4 from '../../images/watch4.png'

const ProductsBanner = () => {
  return (
    <>
     <div className="banner-container">
                <div className="banner-left">
                    <div className="inner-left">
                        <h2>iSmart Watch</h2>
                        <p>Wear Style. Wear Technology...</p>

                    </div>
                    <div className="inner-right">
                        {/* <div style={imageContainer}>
                        <ImageSlider slides={slides} />
                    </div> */}
                        <img style={{ width: "25vmax" }} src={jump} alt="" srcset="" />
                    </div>
                </div>
                <div className="banner-right">
                    <img src={watch4} alt="" />


                </div>
            </div>
    </>
  )
}

export default ProductsBanner