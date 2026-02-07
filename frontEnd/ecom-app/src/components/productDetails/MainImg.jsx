import React from 'react'
import ReactImageMagnify from 'react-image-magnify';
const MainImg = ({image}) => {
    console.log('image', image)
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

export default MainImg