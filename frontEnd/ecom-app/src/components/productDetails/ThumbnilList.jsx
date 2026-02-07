import React from 'react'


const ThumbnilList = (images, activeIndex, onChange) => {
    console.log('thumnil',images,activeIndex, onChange )
    return (
        <>

            {
                images?.map((item, i) => (
                    <img className={activeIndex==i? 'prdDetailsCard__detailsBlock1__3__image__slide':''} src={item.url}
                        loading='lazy' key={item.url} alt={`${i} slide`}

                        onMouseEnter={() => onChange(i)}
                        onClick={() => onChange(i)}
                    />
                ))
            }

        </>
    )
}

export default ThumbnilList