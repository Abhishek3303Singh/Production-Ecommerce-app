import { useState, useEffect } from 'react';

const useIsMobileOrTablet = (breakpoint = 1024) => {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(
    window.innerWidth <= breakpoint
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth <= breakpoint);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobileOrTablet;
};
export default useIsMobileOrTablet