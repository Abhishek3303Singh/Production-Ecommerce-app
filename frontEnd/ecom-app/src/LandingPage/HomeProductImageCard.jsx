import React from 'react'
import { Link } from 'react-router-dom'

const HomeProductImageCard = ({product}) => {
    if(!product) return null
  return (
    <Link to={`/product/${product._id}`}>
    <img
      loading="lazy"
      src={product?.Image?.[0]?.url}
      alt={product?.name || "product"}
    />
  </Link>
  
  )
}

export default React.memo(HomeProductImageCard)