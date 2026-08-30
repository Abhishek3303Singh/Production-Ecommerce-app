import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBanners } from '../store/addBannerSlice';
import { setHeaderThemeColor } from '../store/addBannerSlice';
import './BannerCarousel.css'

const BannerCarousel = ({ position = 'hero', autoPlay = true, interval = 5000 }) => {
  const dispatch = useDispatch();
  const { banners, status } = useSelector((state) => state.createBanner);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasFetched = useRef(false);
  const isFetching = useRef(false)

  useEffect(()=>{
    const activeBanner = banners?.[currentIndex]
    if(activeBanner?.themeColor){
      dispatch(setHeaderThemeColor(activeBanner.themeColor))
    }else{
      // fallback to default one 
      dispatch(setHeaderThemeColor('#131921'));
    }
  },[currentIndex, banners, dispatch])

  useEffect(() => {
    // returning if fetching ofr fetched 
    if(hasFetched.current || isFetching.current){
      return
    }
    // if already fetched and we have data then simply return
    if(banners && banners.length>0){
      hasFetched.current = true
      return
    }

    // if loading dont make api call 
    if(status === 'loading'){return}


// our actual fetching 
isFetching.current = true
    if (!banners || banners.length === 0) {
      dispatch(getBanners(position)).then(()=>{
        hasFetched.current = true
      }).catch(()=>{
        hasFetched.current = true
      }).finally(()=>{
        isFetching.current = false
      });
    }
  }, []);

  useEffect(() => {
    if (!autoPlay || !banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, banners, interval]);

  const handleBannerClick = useCallback(async (bannerId, ctaUrl) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/banners/${bannerId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'carousel' }),
      });
    } catch (err) {
      console.error('Click tracking failed:', err);
    }
    if (ctaUrl) window.location.href = ctaUrl;
  }, []);

  if (status === 'error') {
    return (
      <div className="banner-error" style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>Unable to load banner</p>
          <button 
            onClick={() => {
              hasFetched.current = false;
              dispatch(getBanners(position));
            }}
            style={{
              padding: '8px 16px',
              background: '#febd69',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (status === 'loading') return <div className="banner-skeleton">Loading...</div>;
  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className={`banner-carousel banner-carousel--${position}`}>
      
      {/* SLIDE - Contains image + text + arrows */}
      <div className="banner-slide">
        
        {/* Image */}
        <img 
          src={currentBanner.image || currentBanner.Image?.[0]?.url} 
          alt={currentBanner.title}
          className="banner-slide__image"
        />
        
        {/* Text Content - Positioned on image */}
        <div className="banner-slide__content">
          <h2 className="banner-slide__title">{currentBanner.title}</h2>
          <p className="banner-slide__desc">{currentBanner.description}</p>
          <button 
            className="banner-slide__cta"
            onClick={() => handleBannerClick(currentBanner._id, currentBanner.ctaUrl)}
          >
            {currentBanner.ctaText || 'Shop Now'}
          </button>
        </div>

        {/* Arrows - Inside slide, positioned absolutely */}
        {banners.length > 1 && (
          <>
            <button 
              className="banner-arrow banner-arrow--prev"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => prev === 0 ? banners.length - 1 : prev - 1);
              }}
            >
              ‹
            </button>
            <button 
              className="banner-arrow banner-arrow--next"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev + 1) % banners.length);
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Dots - Below slide */}
      {banners.length > 1 && (
        <div className="banner-dots">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`banner-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;