import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getBanners, setHeaderThemeColor } from '../store/addBannerSlice';
import './BannerCarousel.css';

const reducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;


const BannerCarousel = ({ position = 'hero', autoPlay = true, interval = 5000 }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { banners, status } = useSelector((state) => state.createBanner);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasFetched = useRef(false);
  const isFetching = useRef(false);
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const rafRaf = useRef(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const lastTouchedRef = useRef(0);


  // Filter banners by position + active date
  const filteredBanners = useMemo(() => {
    const now = new Date();
    return banners?.filter((b) => {
      const isPositionMatch = b.position === position;
      const isActive = new Date(b.startDate) <= now && new Date(b.endDate) >= now;
      return isPositionMatch && isActive;
    }) || [];
  }, [banners, position]);
  
  const count = filteredBanners.length
  useEffect(()=>{
    indexRef.current = indexRef
  }, [currentIndex])

  // Reset index when filtered list changes (prevents out-of-bounds)
  useEffect(() => {
    setCurrentIndex(0);
    if (trackRef.current) trackRef.current.scrollLeft = 0;
  }, [count, position]);

  // Update header theme based on ACTIVE filtered banner it will be drived by center hero;
  useEffect(() => {
    if(position !== 'hero') return;
    const activeBanner = filteredBanners?.[currentIndex];
    if (activeBanner?.themeColor) {
      dispatch(setHeaderThemeColor(activeBanner.themeColor));
    } else {
      dispatch(setHeaderThemeColor('#131921'));
    }
  }, [currentIndex, filteredBanners, dispatch, position]);

  // Fetch banners only once
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

  // scroll so slide i is centerd

  const goTo = useCallback((i)=>{
    const track = trackRef.current
    const el = slideRefs.current[i]
    if(!track || !el) return;
    const left = el.offsetLeft - (track.clientWidth - el.offsetWidth) /2;
    track.scrollTo({ left: Math.max(0, left), behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, []);

  // While scrolling, track which slide is nearest the middle

  const onScroll = useCallback(()=>{
    if(rafRaf.current) return
    rafRaf.current = requestAnimationFrame(()=>{
      rafRaf.current = null;
      const track = trackRef.current
      if(!track) return
      const mid = track.scrollLeft + track.clientWidth / 2
      let best = 0
      let bestDist = Infinity
      slideRefs.current.forEach((el, i)=>{
        if(!el) return
        const dist = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid)
        if(dist < bestDist){
          bestDist = dist;
          best = i
        }
      })
      setCurrentIndex(best)
    })
  },[])
 
useEffect(() => () => { 
  if (rafRaf.current) cancelAnimationFrame(rafRaf.current);
  
},[]);

  // Auto-play using FILTERED banners
  useEffect(() => {
    if (!autoPlay || filteredBanners.length <= 1 || reducedMotion()) return;
    const timer = setInterval(() => {
      if (pausedRef.current || document.hidden) return;
      if (Date.now() - lastTouchedRef.current < interval) return;
      goTo((indexRef.current + 1) % count);
      // setCurrentIndex((prev) => (prev + 1) % filteredBanners.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, count, interval, goTo]);
  
  const hold = ()=>{
    pausedRef.current = true;
  }

  const release = ()=>{
    pausedRef.current = false;
    lastTouchedRef.current = Date.now()
  }

  const handleBannerClick = useCallback(async (bannerId, ctaUrl) => {
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/banners/${bannerId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'carousel' }),
        keepalive:true
      });
    } catch (err) {
      console.error('Click tracking failed:', err);
    }
    if (!ctaUrl) return;
    if (/^https?:\/\//i.test(ctaUrl)) window.location.href = ctaUrl;
    else navigate(ctaUrl)
  }, [navigate]);

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
          type='button'
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

  if (status === 'loading') return <div className={`banner-skeleton banner-skeleton--${position}`} aria-hidden="true" />;

  // Now safe to check filtered results
  if (!filteredBanners.length) return null;


 return(
  <section
      className={`banner-carousel banner-carousel--${position}`}
      aria-roledescription="carousel"
      aria-label="Featured offers"
    >
      <ul
        className="banner-track"
        ref={trackRef}
        onScroll={onScroll}
        onTouchStart={hold}
        onTouchEnd={release}
        onTouchCancel={release}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') hold(); }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') release(); }}
      >
        {filteredBanners.map((b, i) => (
          <li
            key={b._id || i}
            className="banner-slide"
            ref={(el) => { slideRefs.current[i] = el; }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            onClick={() => handleBannerClick(b._id, b.ctaUrl)}
          >
            <img
              src={b.image || b.Image?.[0]?.url}
              alt={b.title || ''}
              className="banner-slide__image"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
            <div className="banner-slide__content">
              <h2 className="banner-slide__title">{b.title}</h2>
              {b.description && <p className="banner-slide__desc">{b.description}</p>}
              <button type="button" className="banner-slide__cta">{b.ctaText || 'Shop Now'}</button>
            </div>
          </li>
        ))}
      </ul>

      {count > 1 && (
        <>
          <button type="button" className="banner-arrow banner-arrow--prev" aria-label="Previous banner"
            onClick={() => goTo((currentIndex - 1 + count) % count)}>‹</button>
          <button type="button" className="banner-arrow banner-arrow--next" aria-label="Next banner"
            onClick={() => goTo((currentIndex + 1) % count)}>›</button>

          <div className="banner-dots">
            {filteredBanners.map((b, i) => (
              <button
                type="button"
                key={b._id || i}
                aria-label={`Go to banner ${i + 1}`}
                className={`banner-dot ${i === currentIndex ? 'active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
 )
};



export default BannerCarousel;