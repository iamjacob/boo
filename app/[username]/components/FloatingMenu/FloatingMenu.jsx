
'use client';
import BoooksHeart from '@/app/components/svg/BoooksHeart';
import { useRef, useState, useEffect } from 'react';
import ThumbMenu from './ThumbMenu/ThumbMenu';

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  //const [items, setItems] = useState(MENU_ITEMS);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* FAB + Close Button */}
      <div className="absolute right-3 top-[48vh] flex flex-col items-center select-none z-20">
        <button
          className="rounded-full bg-white/20 hover:bg-white/40 shadow-lg p-2 transition-all"
          onClick={toggleMenu}
          aria-label="Open menu"
        >
          <BoooksHeart />
        </button>
        <a href="#/@jacobg" className="relative user text-xs text-white bg-black/20 hover:bg-black/80 rounded px-1 mt-1 transition-all">@JacobG</a>
        {isOpen && (
          <button
            className="closeBtn mt-2 text-white text-xl cursor-pointer rounded-full px-2 py-1 bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all"
            onClick={toggleMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Modal Overlay and Draggable Menu Items */}
      {isOpen && (
        
        <div className="absolute right-[1rem] top-[40vh]">
          <ThumbMenu/>
        </div>

      )}

      </>
  );
}
