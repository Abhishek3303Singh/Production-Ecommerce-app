import React from 'react'
import './bottomNav.css'
import {BiGridAlt} from 'react-icons/bi'
import {BsCart2} from 'react-icons/bs'
import {MdPersonOutline} from 'react-icons/md'
import {RiLoginBoxLine} from 'react-icons/ri'
import {useSelector} from 'react-redux'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Dropdown from './Dropdown'
import { useState } from 'react'
import 'animate.css'
const BottomNav = () => {
    const {cartItems} = useSelector((state)=>state.cart)
    const {isAuthenticated, user} = useSelector((state)=>state.user)
    const navigate = useNavigate()
    const [showDropdown, setShowDromdown] = useState(false)
    function prod(){
        navigate('/products')
    }
    function cart(){
        navigate('/cart')
    }
    function account(){
        // navigate('/profile')
        if(isAuthenticated){
            setShowDromdown(!showDropdown)

        }
        else{
            navigate('/login')
        }
    }
    // console.log(user.name)

  return (
    <>
   
   {
     isAuthenticated && showDropdown && <div className={`animate__animated ${showDropdown?'animate__bounceInRight':'animate__fadeOutRight'} drop-container `}>
     <Dropdown/>
 
     </div>
   }
    <header className='bottom-nav-header'>
        <div className='shop' >
            <BiGridAlt onClick={prod}/>
        </div>
        <div className='bottom-cart' >
           <BsCart2 onClick={cart}/><span>{cartItems.length}</span>
        </div>
        <div className='bottom-account' onClick={account}>
            {/* {isAuthenticated?<MdPersonOutline/>:<RiLoginBoxLine  />} */}
            {isAuthenticated?<span className='bottom-user-name'>{user?.name[0]}</span>:<RiLoginBoxLine  />}

        </div>

    </header>

    </>
  )
}

export default BottomNav