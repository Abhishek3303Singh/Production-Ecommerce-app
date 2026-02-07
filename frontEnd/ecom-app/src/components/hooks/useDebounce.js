import { useState, useEffect } from "react";
const useDebounce = (value, delay = 600) => {
  const [debounceValue, setDebounceValue] = useState(value);
  useEffect(() => {
    const timer = setInterval(() => {
      setDebounceValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, value]);

  return debounceValue;
};

export default useDebounce;
