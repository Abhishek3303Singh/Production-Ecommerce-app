import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBanners, setHeaderThemeColor } from '../store/addBannerSlice';
import './BannerCarousel.css';

const BannerCarousel = ({ position = 'hero', autoPlay = true, interval = 5000 }) => {
  const dispatch = useDispatch();
  const { banners, status } = useSelector((state) => state.createBanner);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasFetched = useRef(false);
  const isFetching = useRef(false);

  // Filter banners by position + active date
  const filteredBanners = useMemo(() => {
    const now = new Date();
    return banners?.filter((b) => {
      const isPositionMatch = b.position === position;
      const isActive = new Date(b.startDate) <= now && new Date(b.endDate) >= now;
      return isPositionMatch && isActive;
    }) || [];
  }, [banners, position]);

  // Reset index when filtered list changes (prevents out-of-bounds)
  useEffect(() => {
    setCurrentIndex(0);
  }, [filteredBanners.length, position]);

  // Update header theme based on ACTIVE filtered banner
  useEffect(() => {
    if(position !== 'hero') return;
    const activeBanner = filteredBanners?.[currentIndex];
    if (activeBanner?.themeColor) {
      dispatch(setHeaderThemeColor(activeBanner.themeColor));
    } else {
      dispatch(setHeaderThemeColor('#131921'));
    }
  }, [currentIndex, filteredBanners, dispatch, position]);

  // Fetch banners (only once)
  useEffect(() => {
    if (hasFetched.current || isFetching.current) return;
    if (banners && banners.length > 0) {
      hasFetched.current = true;
      return;
    }
    if (status === 'loading') return;

    isFetching.current = true;
    dispatch(getBanners(position))
      .then(() => {
        hasFetched.current = true;
      })
      .catch(() => {
        hasFetched.current = true;
      })
      .finally(() => {
        isFetching.current = false;
      });
  }, [dispatch, position, banners, status]);

  // Auto-play using FILTERED banners
  useEffect(() => {
    if (!autoPlay || filteredBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredBanners.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, filteredBanners, interval]);

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

  // Error state FIRST
  if (status === 'error') {
    return (
      <div
        className="banner-error"
        style={{
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
        }}
      >
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
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (status === 'loading') return <div className="banner-skeleton">Loading...</div>;

  // Now safe to check filtered results
  if (!filteredBanners.length) return null;

  const currentBanner = filteredBanners[currentIndex];

  return (
    <div className={`banner-carousel banner-carousel--${position}`}>
      {/* SLIDE */}
      <div className="banner-slide">
        <img
          src={currentBanner.image || currentBanner.Image?.[0]?.url}
          alt={currentBanner.title}
          className="banner-slide__image"
        />

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

        {filteredBanners.length > 1 && (
          <>
            <button
              className="banner-arrow banner-arrow--prev"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev === 0 ? filteredBanners.length - 1 : prev - 1));
              }}
            >
              ‹
            </button>
            <button
              className="banner-arrow banner-arrow--next"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev + 1) % filteredBanners.length);
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* DOTS */}
      {filteredBanners.length > 1 && (
        <div className="banner-dots">
          {filteredBanners.map((_, index) => (
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