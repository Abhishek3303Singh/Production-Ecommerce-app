import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBanners } from '../store/addBannerSlice';
import './MultiBannerCarousel.css';

const MultiBannerCarousel = ({ position = 'hero2', autoPlay = true, interval = 4000 }) => {
  const dispatch = useDispatch();
  const { banners, status } = useSelector((state) => state.createBanner);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  
  const hasFetched = useRef(false);
  const isFetching = useRef(false);
  const touchStartX = useRef(0);

  // Responsive breakpoint logic
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setItemsPerView(1);
      else if (w < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter by position + active date
  const filteredBanners = useMemo(() => {
    const now = new Date();
    return banners?.filter((b) => {
      const matchPos = b.position === position;
      const isActive = new Date(b.startDate) <= now && new Date(b.endDate) >= now;
      return matchPos && isActive;
    }) || [];
  }, [banners, position]);

  const maxIndex = Math.max(0, filteredBanners.length - itemsPerView);

  // Keep index in bounds when screen resizes
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [itemsPerView, maxIndex]);

  // Fetch
  useEffect(() => {
    if (hasFetched.current || isFetching.current) return;
    // if (banners?.length > 0) { hasFetched.current = true; return; }
    if (status === 'loading') return;

    isFetching.current = true;
    dispatch(getBanners(position))
      .then(() => { hasFetched.current = true; })
      .catch(() => { hasFetched.current = true; })
      .finally(() => { isFetching.current = false; });
  }, [dispatch, position, banners, status]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || filteredBanners.length <= itemsPerView) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, filteredBanners, itemsPerView, maxIndex, interval]);

  const handlePrev = () => setCurrentIndex((p) => (p === 0 ? maxIndex : p - 1));
  const handleNext = () => setCurrentIndex((p) => (p >= maxIndex ? 0 : p + 1));

  // Touch swipe
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? handleNext() : handlePrev();
  };

  const handleClick = useCallback(async (id, url) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/banners/${id}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'multi-carousel' }),
      });
    } catch (err) { console.error('Click tracking failed:', err); }
    if (url) window.location.href = url;
  }, []);

  if (status === 'loading') return <div className="multi-banner-skeleton">Loading...</div>;
  if (!filteredBanners.length) return null;

  const translateX = currentIndex * (100 / itemsPerView);

  return (
    <div className={`multi-banner-carousel multi-banner-carousel--${position}`}>
      <div className="multi-banner-viewport">
        <div
          className="multi-banner-track"
          style={{
            transform: `translateX(-${translateX}%)`,
            transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {filteredBanners.map((b, i) => (
            <div
              key={b._id || i}
              className="multi-banner-card"
              style={{ flex: `0 0 ${100 / itemsPerView}%` }}
              onClick={() => handleClick(b._id, b.ctaUrl)}
            >
              <div className="multi-banner-card__inner">
                <img
                  src={b.image || b.Image?.[0]?.url}
                  alt={b.title}
                  className="multi-banner-card__image"
                  loading="lazy"
                />
                <div className="multi-banner-card__content">
                  <h3 className="multi-banner-card__title">{b.title}</h3>
                  <p className="multi-banner-card__desc">{b.description}</p>
                  <span className="multi-banner-card__cta">
                    {b.ctaText || 'Shop Now'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows - hidden on mobile */}
      {filteredBanners.length > itemsPerView && (
        <>
          <button className="multi-banner-arrow multi-banner-arrow--prev" onClick={handlePrev}>‹</button>
          <button className="multi-banner-arrow multi-banner-arrow--next" onClick={handleNext}>›</button>
        </>
      )}

      {/* Dots */}
      {filteredBanners.length > itemsPerView && (
        <div className="multi-banner-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`multi-banner-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiBannerCarousel;