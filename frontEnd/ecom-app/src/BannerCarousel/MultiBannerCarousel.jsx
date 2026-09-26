import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBanners } from '../store/addBannerSlice';
import './MultiBannerCarousel.css';

const MultiBannerCarousel = ({ position = 'hero2', autoPlay = true, interval = 4000, bannerLimit }) => {
  const dispatch = useDispatch();
  const { banners, status } = useSelector((state) => state.createBanner);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0); // index into the CLONED track
  const [isTransitioning, setIsTransitioning] = useState(true);

  const hasFetched = useRef(false);
  const isFetching = useRef(false);
  const touchStartX = useRef(0);

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

  const filteredBanners = useMemo(() => {
    const now = new Date();
    return banners?.filter((b) => {
      const matchPos = b.position === position;
      const isActive = new Date(b.startDate) <= now && new Date(b.endDate) >= now;
      return matchPos && isActive;
    }) || [];
  }, [banners, position]);

  const totalReal = filteredBanners.length;
  const canLoop = totalReal > itemsPerView;

  // Build a cloned track: [last N clones] + [real banners] + [first N clones]
  const trackBanners = useMemo(() => {
    if (!canLoop) return filteredBanners;
    const headClones = filteredBanners.slice(-itemsPerView);
    const tailClones = filteredBanners.slice(0, itemsPerView);
    return [...headClones, ...filteredBanners, ...tailClones];
  }, [filteredBanners, itemsPerView, canLoop]);

  // Start the view at the first REAL slide (past the head clones)
  useEffect(() => {
    setCurrentIndex(canLoop ? itemsPerView : 0);
    setIsTransitioning(false);
    const t = setTimeout(() => setIsTransitioning(true), 50);
    return () => clearTimeout(t);
  }, [itemsPerView, canLoop, totalReal]);

  useEffect(() => {
    if (hasFetched.current || isFetching.current) return;
    if (status === 'loading') return;
    isFetching.current = true;
    dispatch(getBanners(position, bannerLimit))
      .then(() => { hasFetched.current = true; })
      .catch(() => { hasFetched.current = true; })
      .finally(() => { isFetching.current = false; });
  }, [dispatch, position, banners, status, bannerLimit]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => prev - 1);
  }, []);

  // Auto-play — always moves forward, real looping handled by clones
  useEffect(() => {
    if (!autoPlay || !canLoop) return;
    const timer = setInterval(goNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, canLoop, interval, goNext]);

  // After the transition finishes, snap invisibly if we've entered clone territory
  const handleTransitionEnd = () => {
    if (!canLoop) return;

    if (currentIndex >= totalReal + itemsPerView) {
      setIsTransitioning(false);
      setCurrentIndex(itemsPerView); // snap back to real start
    } else if (currentIndex < itemsPerView) {
      setIsTransitioning(false);
      setCurrentIndex(totalReal + itemsPerView - itemsPerView); // snap to real end area
    }
  };

  // Re-enable transition on next frame after a silent snap
  useEffect(() => {
    if (!isTransitioning) {
      const t = requestAnimationFrame(() => setIsTransitioning(true));
      return () => cancelAnimationFrame(t);
    }
  }, [isTransitioning]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
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

  // Dots map back to real indices only
  const activeDot = canLoop
    ? ((currentIndex - itemsPerView) % totalReal + totalReal) % totalReal
    : 0;

  return (
    <div className={`multi-banner-carousel multi-banner-carousel--${position}`}>
      <div className="multi-banner-viewport">
        <div
          className="multi-banner-track"
          style={{
            transform: `translateX(-${translateX}%)`,
            transition: isTransitioning ? 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {trackBanners.map((b, i) => (
            <div
              key={`${b._id || i}-${i}`}
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

      {canLoop && (
        <>
          <button className="multi-banner-arrow multi-banner-arrow--prev" onClick={goPrev}>‹</button>
          <button className="multi-banner-arrow multi-banner-arrow--next" onClick={goNext}>›</button>
        </>
      )}

      {canLoop && (
        <div className="multi-banner-dots">
          {Array.from({ length: totalReal }).map((_, i) => (
            <button
              key={i}
              className={`multi-banner-dot ${i === activeDot ? 'active' : ''}`}
              onClick={() => setCurrentIndex(i + itemsPerView)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiBannerCarousel;