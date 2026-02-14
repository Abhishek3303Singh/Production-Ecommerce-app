import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecommendedProdCard from "./RecommendedProdCard";
import "./recommended.css";

const RecommendationSlider = ({ products, heading }) => {
  const navigate = useNavigate();


  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Responsive items count
  useEffect(() => {
    const updateItems = () => {
      if (window.innerWidth <= 600) setItemsPerView(2);
      else if (window.innerWidth <= 900) setItemsPerView(3);
      else setItemsPerView(6);
    };

    updateItems();
    window.addEventListener("resize", updateItems);
    return () => window.removeEventListener("resize", updateItems);
  }, []);

  // Reset when products change
  useEffect(() => {
    setStartIndex(0);
  }, [products]);


  const nextSlide = () => {
    if (startIndex + itemsPerView < products?.length) {
      setStartIndex(startIndex + itemsPerView);
    }
  };

  const prevSlide = () => {
    if (startIndex - itemsPerView >= 0) {
      setStartIndex(startIndex - itemsPerView);
    }
  };

  // Touch Support
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) nextSlide();
    if (touchEndX - touchStartX > 50) prevSlide();
  };

  const visibleProducts = products?.slice(
    startIndex,
    startIndex + itemsPerView
  );

  return (
    <div className="rec-slider-container">
      <h2 className="rec-heading">{heading}</h2>

      <div
        className="rec-slider"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className="slider-btn"
          onClick={prevSlide}
          disabled={startIndex === 0}
        >
          ❮
        </button>

        <div className="rec-products">
          {visibleProducts?.map((product) => (
            <div className="rec-prod-card"
              key={product?._id}
              onClick={() => navigate(`/product/${product?._id}`)}
            >
              <RecommendedProdCard product={product} />
            </div>
          ))}
        </div>

        <button
          className="slider-btn"
          onClick={nextSlide}
          disabled={startIndex + itemsPerView >= products?.length}
        >
          ❯
        </button>
      </div>
    </div>
  );
};

export default RecommendationSlider;
