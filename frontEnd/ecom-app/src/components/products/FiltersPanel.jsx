import React, { useEffect, useState } from 'react'
import Box from "@mui/material/Box";
import Slider from '@mui/material/Slider';
import Rating from "@mui/material/Rating";
import Typography from '@material-ui/core/Typography'
import useDebounce from '../hooks/useDebounce';
const categories = [
    'Electronics',
    'Sports',
    'Fashion',
    'Home&Health',
    'GenZTrends',
    'Home&Kitchen',
    "Beauty",
    'Toys&Baby',
    'Lifestyle',
   'SmartPhone',
    'Others'

]
const FiltersPanel = ({ onFilterChange, initialFilters }) => {
    const [price, setPrice] = useState(initialFilters.price);
  const [ratings, setRatings] = useState(initialFilters.ratings);
  const [category, setCategory] = useState(initialFilters.category);
  const debouncedPrice = useDebounce(price, 600);
  const debouncedRatings = useDebounce(ratings, 600);
  const debouncedCategory = useDebounce(category, 600);

  useEffect(()=>{
    onFilterChange({
        price:debouncedPrice,
        category:debouncedCategory,
        ratings:debouncedRatings
    });

  },[debouncedCategory,debouncedPrice, debouncedRatings, onFilterChange])

    const handlePrice = (event, newPrice) => {
        setPrice(newPrice)
    }
    return (
        <>

            <div className="price-filter">
                <h4>Filter</h4>
                <div className="box-text">

                    <span>MIN:&#x20B9;{price[0]}</span>  <span>MAX:&#x20B9;{price[1]}</span>
                </div>
                {/* <span>MIN:{price[0]}</span>  <span>MAX:{price[1]}</span> */}
                <div className="box-slider">
                    <Box sx={{ width: '100%', margin: 'auto' }}>
                        <Slider
                            value={price}
                            onChange={handlePrice}
                            valueLabelDisplay="auto"
                            aria-label="Custom marks"
                            // marks={marks}
                            min={0}
                            max={10000}

                        />
                    </Box>

                </div>
            </div>
            <div className="category-box">
                <h4 className="">Categories</h4>
                <ul className="categBox">
                    {
                        categories.map((item) => (
                            <li className="categ-item" key={item} onClick={() => setCategory(item)}>
                                {item}
                            </li>
                        ))
                    }
                </ul>
                <fieldset>
                    {/* <Typography>Ratings</Typography> */}
                    <Typography component="legend">Ratings</Typography>
                    <Rating
                        name="simple-controlled"
                        value={ratings}
                        onChange={(event, newValue) => {
                            setRatings(newValue);
                        }}
                    />

                </fieldset>
            </div>




        </>
    )
}

export default React.memo(FiltersPanel)