import React from 'react'
import electronicsicon from '../../images/categoryStrip/cateElec.png'
// import sports from '../../images/categoryStrip/sports1.png'
import fashion from '../../images/categoryStrip/fashion.png'
import HomeFood from '../../images/categoryStrip/homeFood.png'
import genZTrends from '../../images/categoryStrip/gnZTrend.png'
import beauty from '../../images/categoryStrip/beauty.png'
import ToysBaby from '../../images/categoryStrip/ToysBaby.png'
import HomeKitchen from '../../images/categoryStrip/HomeKitchen.png'
import sports from '../../images/categoryStrip/cateSports.png'
import allprod from '../../images/categoryStrip/allprod.png'
const CategoryStrip = ({ onCategorySelect, activeCategory  }) => {

    const categoryStripData = [
        {url:allprod, title:"All"},
                {url:sports, title:"Sports"},
                {url:electronicsicon, title:"Electronics"},
                {url:fashion, title:"Fashion"},
                {url:HomeFood, title:"Home&Health"},
                {url:genZTrends, title:"GenZ Trends"},
                {url:beauty, title:"Beauty"},
                {url:ToysBaby, title:"Toys&Baby"},
                {url:HomeKitchen, title:"Home&Kitchen"},
               
    ]
    const normalizedActive = activeCategory || 'All'

    return (
        <>
        {
            categoryStripData.map((categ)=>(
                <div key={categ.title} onClick={()=>onCategorySelect(categ.title=='All' ? '':categ.title)} className={`category-card ${normalizedActive===categ.title ? 'active-category':''}`}>
                <div  className="imgCategory">
                    <img src={categ.url} alt={categ.tit} />
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