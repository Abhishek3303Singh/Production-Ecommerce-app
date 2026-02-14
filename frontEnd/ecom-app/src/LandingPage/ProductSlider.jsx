import HomeProductImageCard from "./HomeProductImageCard";
import React from "react";
const ProductSlider = React.memo(({ products }) => {
    console.log("Product slider rendered");

    return (
       <>
            {products&& products?.map(item => (
                <HomeProductImageCard key={item._id} product={item} />
            ))}
        </>
       
    );
});

export default ProductSlider 