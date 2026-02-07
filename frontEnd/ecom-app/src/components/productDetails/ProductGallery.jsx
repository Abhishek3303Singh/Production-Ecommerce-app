import React, { useMemo} from 'react'
import ReactImageMagnify from 'react-image-magnify';

const ProductGallery = ({image}) => {
    // const activeImage = useMemo(()=>{
    //     return images[activeIndex]
    // },[images,activeIndex])
    return (
        <>
            <div className='prdDetailsCard__imgcontainer'>
                {

                    image &&
                    <ReactImageMagnify {...{
                        smallImage: {
                            alt: 'produc-image',
                            isFluidWidth: true,
                            src: image.url
                        },
                        largeImage: {
                            src: image.url,
                            width: 1200,
                            height: 1800
                        }
                    }} />
                }

            </div>
        </>
    )
}

export default React.memo(ProductGallery)