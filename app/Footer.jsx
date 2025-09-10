import { useState } from "react";
// import MinimalistMultiTimer from "./MinimalistMultiTimer";

export default function Footer() {
  const [time, setTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e) => {
    if (e.touches[0].clientY < -80) {
      // Only start drag from top area
      setIsDragging(true);
      setDragY(0);
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const newY = Math.min(0, e.touches[0].clientY - 50); // negative for swipe up
      setDragY(newY);
      if (newY < -30) { // easier/sensitive threshold
        setIsVisible(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      if (dragY < -80) { // easier/sensitive threshold for swipe up
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      setDragY(0);
      setIsDragging(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <>
      {/* Drag indicator at top */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4 cursor-grab z-50 flex justify-center items-start pb-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-10 h-1 bg-red-600 rounded-full opacity-50"></div>
      </div>

      {/* Clock overlay */}
      <div
        className={`fixed inset-0 bg-black transition-all duration-300 ease-out flex flex-col justify-center items-center ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
        style={{
          transform: isDragging
            ? `translateY(${dragY - window.innerHeight}px)`
            : undefined,
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-8 right-8 text-white text-2xl font-light hover:text-gray-300 transition-colors"
        >
          ×
        </button>

        {/* Main clock display */}
        <div className="text-center">
          <div className="text-white text-8xl md:text-9xl font-thin tracking-tight mb-4 font-mono"></div>
          <div className="text-gray-400 text-2xl font-light"></div>
          yoyo MinimalistMultiTimer
          {/* <MinimalistMultiTimer /> */}
        </div>
      </div>

      {/* //   <footer className="fixed bottom-0 flex w-screen p-2 gap-4 flex-wrap items-center justify-center text-xs">
      //   <a href="">Vision</a>|<a href="">Non-profit</a>|<a href="">Privacy</a>
      // </footer> */}
    </>
  );
}
