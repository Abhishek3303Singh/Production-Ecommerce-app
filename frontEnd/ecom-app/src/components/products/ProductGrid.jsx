import React from 'react'
import HomeProducts from './HomeProducts'

const ProductGrid = React.memo(({ products }) => {
  return (
    <>
      <div className="containerProduct" id="containerProduct"  >
        {
          products && products.map((prd) => (
            <HomeProducts key={prd._id} product={prd}></HomeProducts>
          ))
        }
      </div>

    </>
  )
})

export default ProductGrid