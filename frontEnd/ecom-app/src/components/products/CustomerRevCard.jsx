import React from 'react'
import profile from '../imageFolder/profile.png'
import './reviewCss/addReview.css'
import { useState, useEffect } from 'react'
import { AiTwotoneStar } from 'react-icons/ai'
import { STATUSES } from '../../store/productDetailsSlice'

const CustomerRevCard = ({ revw, reviewStatus }) => {
  const [pageNo, setPageNo] = useState(0)
  const reviewPerPage = 2;
  const pageVisited = pageNo * reviewPerPage;

  console.log(revw, 'revwCard')


  return (
    <>
    <div>

   
      <div className="rev-container">
        {
          revw.slice(pageVisited, pageVisited + reviewPerPage).map((item, index) => (
            <div key={item?._id || item?.tempId} className="review-card-container">
              <div className="rev-img-container">
                <img src={profile} alt="user" />
              </div>
              <div className="review-text-container">

                <div className='ratings'>

                  {/* <ReactStars {...options}/> */}
                  <p style={item?.rating > 2 ? { background: 'rgb(2, 159, 57)' } : { background: 'red' }}><span>{item?.rating}</span> <span> <AiTwotoneStar /> </span></p>

                  <p className='rvw-user-name'>{item?.name}</p>
                  <p className='rev-comment'>{item?.feedback}</p>
                  
                  {item?.isPending ? (
                    <span className="pending">Posting <span className='dots'></span> </span>
                  ) : (
                    <span className="posted">Posted</span>
                  )}
                </div>
              </div>
            </div>

          ))
        }

        {/* <button onClick={()=>setPageNo(pageNo+1)}>{ pageVisited + reviewPerPage<revw.length?'More Reviews':'No More Reviews'}</button> */}
       
      </div>
      {
          pageVisited + reviewPerPage < revw?.length ? <button className='more-rev-btn' onClick={() => setPageNo(pageNo + 1)}>More Reviews</button> : <button className='more-rev-btn-disable' disabled>No More Reviews</button>
        }
      </div>

    </>
  )
}

export default CustomerRevCard
