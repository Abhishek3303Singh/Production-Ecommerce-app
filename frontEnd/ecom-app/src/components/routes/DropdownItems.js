// import {CgProfile} from 'react-icons/cg'
// import {MdDashboard,MdOutlineLogout} from 'react-icons/md'
// import {ImSwitch} from 'react-icons/im'
// import {GrStatusCriticalSmall} from 'react-icons/gr'
// import { useSelector } from 'react-redux'
// import Dropdown from './Dropdown'

// import React from 'react'

// const DropdownItems = () => {
//     const {user, isAuthenticated, status} = useSelector((state)=>state.user)
//     console.log(user,'dropDown')
//     const dropDownItems = [
//         {
//             id:1,
//             title:"Profile",
//             path:"/account",
//             cName:"sub-menu-items",
//             icon:<CgProfile/>
    
//         },
    
//         {
//             id:3,
//             title:"Orders",
//             path:"/orders",
//             cName:"sub-menu-items",
//             icon:<GrStatusCriticalSmall/>
//         },
//         {
//             id:4,
//             title:"Logout",
//             path:"",
//             cName:"sub-menu-items",
//             icon:<ImSwitch/>
//         },
        
//     ]
    
// if(user.role ='Admin'){
//     dropDownItems.unshift({
//         id:2,
//         title:"Dashboard",
//         path:"/Dashboard",
//         cName:"sub-menu-items",
//         icon:<MdDashboard/>
//     },)
// }
//   return (
//     <div>
//         <Dropdown items={dropDownItems}/>
      
//     </div>
//   )
// }

// export default DropdownItems

 