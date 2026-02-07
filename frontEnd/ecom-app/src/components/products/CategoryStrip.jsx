import React from 'react'
import electronicsicon from '../../images/categoryStrip/electronics.png'
import sports from '../../images/categoryStrip/sports1.png'
import fashion from '../../images/categoryStrip/fashion.png'
import HomeFood from '../../images/categoryStrip/homeFood.png'
import genZTrends from '../../images/categoryStrip/gnZTrend.png'
import beauty from '../../images/categoryStrip/beauty.png'
import ToysBaby from '../../images/categoryStrip/ToysBaby.png'
import HomeKitchen from '../../images/categoryStrip/HomeKitchen.png'
const CategoryStrip = ({ onCategorySelect }) => {

    const categoryStripData = [
                {url:sports, title:"Sports"},
                {url:electronicsicon, title:"Electronics"},
                {url:fashion, title:"Fashion"},
                {url:HomeFood, title:"Home&Health"},
                {url:genZTrends, title:"GenZ Trends"},
                {url:beauty, title:"Beauty"},
                {url:ToysBaby, title:"Toys&Baby"},
                {url:HomeKitchen, title:"Home&Kitchen"},
    ]
    return (
        <>
        {
            categoryStripData.map((categ)=>(
                <div onClick={()=>onCategorySelect(categ.title)} className="category-card ">
                <div  className="imgCategory">
                    <img src={categ.url} alt="" />
                </div>
                <div className="text-category">
                    <h3>{categ.title}</h3>
                </div>
            </div>

            ))
        }
        </>
    )
}

export default CategoryStrip