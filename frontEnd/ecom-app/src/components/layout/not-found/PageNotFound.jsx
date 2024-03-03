import React from 'react'
import { TbFaceIdError } from "react-icons/tb";
import './notfound.css'


const PageNotFound = () => {
  return (
    <>
    <div className='not-found-container'>
        <div><TbFaceIdError/></div>
        <div className='not-found'>Page Not Found</div>
    </div>
    
    </>
  )
}

export default PageNotFound