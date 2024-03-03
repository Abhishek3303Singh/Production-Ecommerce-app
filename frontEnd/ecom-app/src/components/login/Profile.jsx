import React from 'react'
import './profile.css'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import bnr from '../../images/bnr.png'

const Profile = () => {
    const { user, isAuthenticated, status } = useSelector((state) => state.user)
    return (
        <>
            <h1 className='heading'>My Profile</h1>
            <div className='main-container'>
                <div className="left-container">
                    <h1 className='user-name'>{user.name.split('')[0]}</h1>
                    <Link className='back-btn' to='/products'>Back To Home</Link>


                </div>
                <div className="right-container">
                    <div className='inner-right1'>
                    <div>
                    <h2>Full Name</h2>
                    <h3 className='user-details'>{user.name}</h3>
                    </div>
                    <div>
                    <h2>Email</h2>
                    <h3 className='user-details'>{user.email}</h3>
                    </div>
                   
                    <div>
                    <h2>Contact</h2>
                    <h3 className='user-details'>{user.phone}</h3>
                    </div>

                    <div>
                    <h2>Joined On</h2>
                    <h3 className='user-details'>{user&&user?.createdAt?.split('T')[0]}</h3>
                    </div>
                    </div>
                    

                    <div className='inner-right2'>
                        <button className='prof-btn'><Link to='/my/orders'>Orders</Link></button>
                        <button className='prof-btn'><Link to='/changepassword'>Change Password</Link></button>
                    </div>
                    <div className='bnr-img'>
                    <img src={bnr} alt="" />
                    </div>


                </div>
            </div>

        </>
    )
}

export default Profile
