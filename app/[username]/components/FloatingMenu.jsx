
'use client';
import BoooksHeart from '@/app/components/svg/BoooksHeart';
import { useRef, useState, useEffect } from 'react';

const MENU_ITEMS = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M280-160v-441q0-33 24-56t57-23h439q33 0 56.5 23.5T880-600v320L680-80H360q-33 0-56.5-23.5T280-160ZM81-710q-6-33 13-59.5t52-32.5l434-77q33-6 59.5 13t32.5 52l10 54h-82l-7-40-433 77 40 226v279q-16-9-27.5-24T158-276L81-710Zm279 110v440h280v-160h160v-280H360Zm220 220Z"/></svg>
    ),
    label: 'More',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M320-320h480v-480h-80v280l-100-60-100 60v-280H320v480Zm0 80q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm360-720h200-200Zm-200 0h480-480Z"/></svg>
    ),
    label: 'Collections',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
    ),
    label: 'Search',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M240-80q-33 0-56.5-23.5T160-160v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-80H240Zm-80-440v-280q0-33 23.5-56.5T240-880h320l240 240v120h-80v-80H520v-200H240v280h-80ZM40-360v-80h880v80H40Zm440-160Zm0 240Z"/></svg>
    ),
    label: 'Scan',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg>
    ),
    label: 'Settings',
  },

];


export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(MENU_ITEMS);
  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const swipeThreshold = 50;

  const toggleMenu = () => setIsOpen((prev) => !prev);

  // Modal logic: close on outside click, Escape, and prevent scroll
  useEffect(() => {
    if (!isOpen) return;
    // Close on click outside
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        overlayRef.current &&
        overlayRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    // Close on Escape
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Drag interaction logic (swipe to reorder)
  useEffect(() => {
    if (!isOpen) return;
    const menuContainer = menuRef.current;
    if (!menuContainer) return;

    const handlePointerDown = (e) => {
      startYRef.current = e.clientY;
      isDraggingRef.current = true;
    };

    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaY = e.clientY - startYRef.current;
      if (Math.abs(deltaY) >= swipeThreshold) {
        reorderItems(deltaY);
        startYRef.current = e.clientY;
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    menuContainer.addEventListener('pointerdown', handlePointerDown);
    menuContainer.addEventListener('pointermove', handlePointerMove);
    menuContainer.addEventListener('pointerup', handlePointerUp);

    return () => {
      menuContainer.removeEventListener('pointerdown', handlePointerDown);
      menuContainer.removeEventListener('pointermove', handlePointerMove);
      menuContainer.removeEventListener('pointerup', handlePointerUp);
    };
    // eslint-disable-next-line
  }, [items, isOpen]);

  // Reorder items in state (not DOM!)
  const reorderItems = (deltaY) => {
    const count = Math.floor(deltaY / swipeThreshold);
    let newItems = [...items];
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const last = newItems.pop();
        if (last) newItems.unshift(last);
      }
    } else if (count < 0) {
      for (let i = 0; i < Math.abs(count); i++) {
        const first = newItems.shift();
        if (first) newItems.push(first);
      }
    }
    setItems(newItems);
  };

  return (
    <>
      {/* FAB + Close Button */}
      <div className="fixed right-3 top-[50vh] flex flex-col items-center select-none z-20">
        <button
          className="rounded-full bg-white/20 hover:bg-white/40 shadow-lg p-2 transition-all"
          onClick={toggleMenu}
          aria-label="Open menu"
        >
          <BoooksHeart />
        </button>
        <a href="#/@jacobg" className="user text-xs text-white bg-black/20 hover:bg-black/80 rounded px-1 mt-1 transition-all">@JacobG</a>
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
        <div ref={overlayRef} className="fixed inset-0 z-[1000] flex items-end justify-end pointer-events-auto">
          <div
            ref={menuRef}
            className="flex flex-col items-end justify-end p-4 transition-all duration-300"
            style={{ minWidth: 220, minHeight: 220, borderRadius: 18, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)', backdropFilter: 'blur(12px)' }}
            onPointerDown={(e) => {
              startYRef.current = e.clientY;
              isDraggingRef.current = true;
            }}
            onPointerMove={(e) => {
              if (!isDraggingRef.current) return;
              const deltaY = e.clientY - startYRef.current;
              if (Math.abs(deltaY) >= swipeThreshold) {
                reorderItems(deltaY);
                startYRef.current = e.clientY;
              }
            }}
            onPointerUp={() => {
              isDraggingRef.current = false;
            }}
          >
            <div className="buttons relative gap-4 py-2" style={{ width: 'fit-content', height: 'fit-content' }}>
              {items.map((item, i) => (
                <button
                  key={i}
                  className={`menu-item w-[56px] h-[56px]  items-center justify-center text-white hover:bg-white/40 shadow-lg absolute transition-all duration-300 ease-in-out ${isOpen ? `scale-100` : 'scale-0'}`}
                  style={{
                    // Absolute positioning for banger effect
                    top: [0, 40, 80, 130, 190, 260, 340, 430, 530, 640, 760][i] || 0,
                    left: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300][i] || 0,
                    zIndex: 4,
                    fontSize: 12,
                    fontFamily: 'arial',
                    userSelect: 'none',
                  }}
                  tabIndex={isOpen ? 0 : -1}
                  aria-label={typeof item.label === 'string' ? item.label : ''}
                >
                  <span className="text-lg flex items-center justify-center">{item.icon}</span>
                  <span className="text-[11px] mt-1 font-semibold drop-shadow-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SVG filter for gooey effect (hidden) */}
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ position: 'absolute', visibility: 'hidden' }}>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
