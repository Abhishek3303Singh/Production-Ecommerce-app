import React from 'react'
import profile from '../imageFolder/profile.png'
import './reviewCss/addReview.css'
import { useState, useEffect } from 'react'
import {AiTwotoneStar} from 'react-icons/ai'

const CustomerRevCard = ({ revw }) => {
  const [pageNo, setPageNo] = useState(0)
  const reviewPerPage = 1;
  const pageVisited = pageNo * reviewPerPage;


  return (
    <>
    <div className="rev-container">
      {
        revw.slice(pageVisited, pageVisited + reviewPerPage).map((item) => (
          <div className="review-card-container">
            <div className="rev-img-container">
              <img src={profile} alt="user" />
            </div>
            <div className="review-text-container">

              <div className='ratings'>

                {/* <ReactStars {...options}/> */}
                <p style={item.rating>2?{background:'rgb(2, 159, 57)'}:{background:'red'}}><span>{item.rating}</span> <span> <AiTwotoneStar/> </span></p>
                

                <p>{item.feedback}</p>
                <p>{item.name}</p>
              </div>
            </div>
          </div>

        ))
      }
      
      {/* <button onClick={()=>setPageNo(pageNo+1)}>{ pageVisited + reviewPerPage<revw.length?'More Reviews':'No More Reviews'}</button> */}
      {
        pageVisited + reviewPerPage < revw.length ? <button className='more-rev-btn' onClick={() => setPageNo(pageNo + 1)}>More Reviews</button> : <button className='more-rev-btn-disable' disabled>No More Reviews</button>
      }
      </div>


    </>
  )
}

export default CustomerRevCard
