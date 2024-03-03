import React from 'react'
import './success.css';
import successImage from '../../images/success.png'
import 'animate.css'

const Success = () => {
    return (
        <>
            <div className="success-main-container">
                <div className="success-container">
                    <div className="success-img-container animate__heartBeat">
                        <img src={successImage} alt="" />
                    </div>
                    <div className="success-text-conatiner">
                        <h3>Success</h3>
                        <h4>Thank You!!</h4>
                        <p>Your Order Has been placed!!</p>
                        
                    </div>
                    <button className='success-btn'>View Products</button>
                </div>
            </div>
        </>
    )
}
export default Success;