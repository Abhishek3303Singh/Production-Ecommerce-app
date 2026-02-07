import React from 'react'
import './Dropdown.css'
// import  { dropDownItems} from './DropdownItems'
import { useState } from 'react'
import { CgProfile } from "react-icons/cg";
import { MdDashboard, MdOutlineLogout } from "react-icons/md";
import { ImSwitch } from "react-icons/im";
import { GrStatusCriticalSmall } from "react-icons/gr";
import {BsFillSuitHeartFill} from 'react-icons/bs'
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAlert } from 'react-alert';
import { logout } from '../../store/userSlice';
import 'animate.css';

// import DropdownItems from './DropdownItems'

const Dropdown = () => {
    const { user, isAuthenticated, status } = useSelector((state) => state.user);
    const navigate = useNavigate()
    console.log(user, 'dropDown items')
    const [dropdown, setDropdown] = useState(false)
    const dispatch = useDispatch()
    const alert = useAlert()
    const dropDownItems = [
        {
            id: 1,
            title: "Profile",
            cName: "sub-menu-items",
            path:'/profile',
            icon: <CgProfile />,
            fun:profile
        },

        {
            id: 3,
            title: "Orders",
            path:'/profile',
            cName: "sub-menu-items",
            icon: <GrStatusCriticalSmall />,
            fun: orders
        },
        {
            id: 4,
            title: "Wishlist",
            path:'/cart',
            cName: "sub-menu-items",
            icon: <BsFillSuitHeartFill />,
            fun: cart
        },
        {
            id: 5,
            title: "Logout",
            path:'/profile',
            cName: "sub-menu-items",
            icon: <ImSwitch />,
            fun:logoutUser
        },
    ]

    if (user&& user?.role === "Admin") {
        dropDownItems.unshift({
            id: 2,
            title: "Dashboard",
            cName: "sub-menu-items",
            icon: <MdDashboard />,
            fun:adminDashboard
        });
    }
    function adminDashboard(){
        navigate('/admin/dashboard')
    }
    function profile(){
        navigate('/profile')
    }
    function orders(){
        navigate('/my/orders')
    }
    function logoutUser(){
        dispatch(logout())
        alert.success('Logged Out successfully')
        navigate('/')
    }
    function cart(){
        navigate('/cart')
    }
    


    return (
        <>
            <ul className={dropdown ? "drop-sub-menu-clicked " : "drop-sub-menu "} onClick={() => setDropdown(!dropdown)}>
                {dropDownItems&& dropDownItems.map(item => {
                    return (
                        <li key={item.id} onClick={item.fun}>
                            <p 
                             className={item.cName}onClick={() => setDropdown(false)}><span className='drop-icons'>{item.icon}</span><span>{item.title}</span></p>
                        </li>
                    )
                })}
            </ul>


        </>
    )
}

export default Dropdown
