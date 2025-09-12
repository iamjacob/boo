'use client';
import { useState, useRef } from "react";
import MinimalistMultiTimer from "./MinimalistMultiTimer";

export default function Footer() {
  // const [time, setTime] = useState(new Date());
  // const [isVisible, setIsVisible] = useState(false);
  // const [dragY, setDragY] = useState(0);
  // const [isDragging, setIsDragging] = useState(false);

  // const startYRef = useRef(null);

  // const handleTouchStart = (e) => {
  //   const touchY = e.touches[0].clientY;
  //   if (window.innerHeight - touchY < 80) { // Start drag if near bottom
  //     setIsDragging(true);
  //     startYRef.current = touchY;
  //     setDragY(0);
  //   }
  // };


  // const handleTouchMove = (e) => {
  //   if (isDragging) {
  //     const currentY = e.touches[0].clientY;
  //     const deltaY = startYRef.current - currentY; // swipe up = positive delta
  //     setDragY(deltaY);
  //     if (deltaY > 30) { // threshold for swipe up
  //       setIsVisible(true);
  //     }
  //   }
  // };

  // const handleTouchEnd = () => {
  //   if (isDragging) {
  //     if (dragY > 80) { // threshold for swipe up
  //       setIsVisible(true);
  //     } else {
  //       setIsVisible(false);
  //     }
  //     setDragY(0);
  //     setIsDragging(false);
  //     startYRef.current = null;
  //   }
  // };

  // const handleClose = () => {
  //   setIsVisible(false);
  // };

  // const handleOpen = () => {
  //   setIsVisible(true);
  // };

  return (
    <>
      {/* Drag indicator at top */}
      {/* <div
        className="absolute bottom-0 left-0 right-0 h-4 cursor-grab z-50 flex justify-center items-start pb-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={isVisible ? handleClose : handleOpen}
      >
        <div className="w-10 h-2 bg-red-600 rounded-full opacity-50"></div>
      </div> */}

      {/* Clock overlay */}
      {/* <div
        className={`fixed left-0 right-0 bottom-0 bg-black transition-all duration-300 ease-out flex flex-col justify-center items-center ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-full pointer-events-none"
        }`}
        style={{
          maxHeight: "250px",
          height: "250px",
          transform: isDragging
            ? `translateY(${Math.max(0, 250 - dragY)}px)`
            : undefined,
        }} 
      >*/}
        {/* Close button */}
        {/* <button
          onClick={handleClose}
          className="absolute top-8 right-8 text-white text-2xl font-light hover:text-gray-300 transition-colors"
        >
          ×
        </button> */}

        {/* Main clock display */}
        {/* <div className="text-center"> */}
          {/* <div className="text-white text-8xl md:text-9xl font-thin tracking-tight mb-4 font-mono"></div> */}
          {/* <div className="text-gray-400 text-2xl font-light"></div> */}
          {/* yoyo MinimalistMultiTimer */}
           {/* <MinimalistMultiTimer /> */}
{/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg> */}
{/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cast-icon lucide-cast"><path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/><path d="M2 12a9 9 0 0 1 8 8"/><path d="M2 16a5 5 0 0 1 4 4"/><line x1="2" x2="2.01" y1="20" y2="20"/></svg> */}


{/* BT */}
{/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bluetooth-icon lucide-bluetooth"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg> */}
{/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bluetooth-searching-icon lucide-bluetooth-searching"><path d="m7 7 10 10-5 5V2l5 5L7 17"/><path d="M20.83 14.83a4 4 0 0 0 0-5.66"/><path d="M18 12h.01"/></svg> */}
{/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bluetooth-off-icon lucide-bluetooth-off"><path d="m17 17-5 5V12l-5 5"/><path d="m2 2 20 20"/><path d="M14.5 9.5 17 7l-5-5v4.5"/></svg> */}
{/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bluetooth-connected-icon lucide-bluetooth-connected"><path d="m7 7 10 10-5 5V2l5 5L7 17"/><line x1="18" x2="21" y1="12" y2="12"/><line x1="3" x2="6" y1="12" y2="12"/></svg> */}
{/* remote, cast more... bluetooth, gps?,  */}

        {/* </div> */}
      {/* </div> */}

        <footer className="fixed bottom-0 flex w-full p-4 flex-wrap items-center justify-around text-xs">
        <a href="">Vision</a>|<a href="">Non-profit</a>|<a href="">Privacy</a>
      </footer>
    </>
  );
}
