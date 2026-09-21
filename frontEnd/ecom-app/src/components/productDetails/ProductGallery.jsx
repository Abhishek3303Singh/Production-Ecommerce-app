import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactImageMagnify from 'react-image-magnify';
import './productGallery.css'

const ProductGallery = ({ image, images = [], onImageChange }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const intervalRef = useRef(null);

    // Keep activeIndex in sync when parent changes `image` (e.g. desktop thumbnail hover)
    useEffect(() => {
        if (!image || !images.length) return;
        const idx = images.findIndex(img => img.url === image.url);
        if (idx !== -1) setActiveIndex(idx);
    }, [image, images]);

    const goToIndex = useCallback((idx) => {
        if (!images.length) return;
        const safeIdx = (idx + images.length) % images.length;
        setActiveIndex(safeIdx);
        onImageChange && onImageChange(images[safeIdx]);
    }, [images, onImageChange]);

    const goNext = useCallback(() => goToIndex(activeIndex + 1), [activeIndex, goToIndex]);
    const goPrev = useCallback(() => goToIndex(activeIndex - 1), [activeIndex, goToIndex]);

    // Auto-slide every 3.5s, paused while user is touching/swiping
    useEffect(() => {
        if (isPaused || images.length <= 1) return;
        intervalRef.current = setInterval(goNext, 3500);
        return () => clearInterval(intervalRef.current);
    }, [isPaused, goNext, images.length]);

    const handleTouchStart = (e) => {
        setIsPaused(true);
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const delta = touchStartX.current - touchEndX.current;
        const SWIPE_THRESHOLD = 50;

        if (delta > SWIPE_THRESHOLD) {
            goNext(); // swiped left -> next image
        } else if (delta < -SWIPE_THRESHOLD) {
            goPrev(); // swiped right -> previous image
        }

        // Resume auto-slide shortly after user releases
        setTimeout(() => setIsPaused(false), 1000);
    };

    const activeMobileImage = images[activeIndex] || image;

    return (
        <div className='prdDetailsCard__imgcontainer'>

            {/* Desktop: zoom-on-hover gallery (unchanged) */}
            <div className='desktop-gallery'>
                {
                    image &&
                    <ReactImageMagnify {...{
                        smallImage: {
                            alt: 'product-image',
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

            {/* Mobile: swipeable auto-sliding gallery */}
            {images.length > 0 && (
                <div className='mobile-gallery'>
                    <div
                        className='mobile-gallery__track'
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {activeMobileImage && (
                            <img
                                className='mobile-gallery__image'
                                src={activeMobileImage.url}
                                alt='product'
                                draggable={false}
                            />
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className='mobile-gallery__dots'>
                            {images.map((_, i) => (
                                <span
                                    key={i}
                                    className={`mobile-gallery__dot ${i === activeIndex ? 'active' : ''}`}
                                    onClick={() => { goToIndex(i); setIsPaused(true); setTimeout(() => setIsPaused(false), 1000); }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default React.memo(ProductGallery)